from datetime import datetime, timedelta, timezone


def auth_headers(client, email: str, password: str) -> dict[str, str]:
    response = client.post("/api/auth/login", json={"email": email, "password": password})
    assert response.status_code == 200, response.text
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_full_logexpress_mvp_flow(client):
    pyme_user = client.post(
        "/api/auth/register",
        json={
            "nombre": "PyME Demo",
            "email": "pyme@test.com",
            "password": "Pyme123!",
            "telefono": "+5493511111111",
            "rol": "PYME",
        },
    )
    assert pyme_user.status_code == 201, pyme_user.text
    pyme_user_id = pyme_user.json()["id"]

    transportista_user = client.post(
        "/api/auth/register",
        json={
            "nombre": "Transportista Demo",
            "email": "transportista@test.com",
            "password": "Trans123!",
            "telefono": "+5493512222222",
            "rol": "TRANSPORTISTA",
        },
    )
    assert transportista_user.status_code == 201, transportista_user.text
    transportista_user_id = transportista_user.json()["id"]

    pyme_headers = auth_headers(client, "pyme@test.com", "Pyme123!")
    transportista_headers = auth_headers(client, "transportista@test.com", "Trans123!")
    admin_headers = auth_headers(client, "admin@test.com", "Admin123!")

    pyme_profile = client.post(
        "/api/pymes",
        headers=pyme_headers,
        json={
            "razon_social": "PyME Demo SRL",
            "cuit": "30-99999999-1",
            "rubro": "Corralon",
            "direccion": "Av. Siempre Viva 123",
            "ciudad": "Cordoba",
            "provincia": "Cordoba",
        },
    )
    assert pyme_profile.status_code == 201, pyme_profile.text

    transportista_profile = client.post(
        "/api/transportistas",
        headers=transportista_headers,
        json={
            "nombre_completo": "Transportista Demo",
            "dni": "40111222",
            "cuit_cuil": "20-40111222-1",
            "tipo": "AUTONOMO",
            "ciudad_base": "Cordoba",
            "provincia_base": "Cordoba",
        },
    )
    assert transportista_profile.status_code == 201, transportista_profile.text
    transportista_id = transportista_profile.json()["id"]

    vehiculo = client.post(
        "/api/vehiculos",
        headers=transportista_headers,
        json={
            "patente": "AA111AA",
            "tipo": "CHASIS",
            "capacidad_kg": "5000",
            "capacidad_m3": "25",
            "refrigerado": False,
            "tiene_rampa": True,
        },
    )
    assert vehiculo.status_code == 201, vehiculo.text
    vehiculo_id = vehiculo.json()["id"]

    verify_transportista = client.patch(
        f"/api/transportistas/{transportista_id}/verificar",
        headers=admin_headers,
    )
    assert verify_transportista.status_code == 200, verify_transportista.text

    activate_vehicle = client.patch(
        f"/api/vehiculos/{vehiculo_id}/estado",
        headers=admin_headers,
        json={"estado": "ACTIVO"},
    )
    assert activate_vehicle.status_code == 200, activate_vehicle.text

    retiro = datetime.now(timezone.utc) + timedelta(days=1)
    entrega = retiro + timedelta(hours=8)
    carga = client.post(
        "/api/cargas",
        headers=pyme_headers,
        json={
            "titulo": "Pallets de ladrillos",
            "descripcion": "Carga paletizada",
            "tipo_mercaderia": "Construccion",
            "peso_kg": "2000",
            "volumen_m3": "12",
            "requiere_refrigeracion": False,
            "requiere_rampa": True,
            "requiere_mantas": False,
            "origen_direccion": "Av. Colon 1000",
            "origen_ciudad": "Cordoba",
            "origen_provincia": "Cordoba",
            "origen_lat": "-31.416000",
            "origen_lng": "-64.183000",
            "destino_direccion": "San Martin 500",
            "destino_ciudad": "Villa Allende",
            "destino_provincia": "Cordoba",
            "destino_lat": "-31.294000",
            "destino_lng": "-64.295000",
            "fecha_retiro_deseada": retiro.isoformat(),
            "fecha_entrega_deseada": entrega.isoformat(),
            "precio_referencia": "100000",
            "cantidadKm": 15.5,
            "idTipoTarifa": 1,
            "nombreTipoTarifa": "Por Kilómetro",
            "tarifa": 100000.0,
            "incluyeIVA": False,
            "hora_inicio_carga": retiro.isoformat(),
            "hora_fin_carga": (retiro + timedelta(hours=2)).isoformat(),
            "hora_inicio_descarga": entrega.isoformat(),
            "hora_fin_descarga": (entrega + timedelta(hours=2)).isoformat(),
            "requiere_balanza": False,
        },
    )
    assert carga.status_code == 201, carga.text
    carga_id = carga.json()["id"]

    disponibles = client.get("/api/cargas/disponibles", headers=transportista_headers)
    assert disponibles.status_code == 200, disponibles.text
    assert any(item["id"] == carga_id for item in disponibles.json())

    oferta = client.post(
        f"/api/cargas/{carga_id}/ofertas",
        headers=transportista_headers,
        json={"vehiculo_id": vehiculo_id, "monto": "95000", "mensaje": "Disponible mañana"},
    )
    assert oferta.status_code == 201, oferta.text
    oferta_id = oferta.json()["id"]

    accept = client.patch(f"/api/ofertas/{oferta_id}/aceptar", headers=pyme_headers)
    assert accept.status_code == 200, accept.text
    assert accept.json()["estado"] == "ACEPTADA"

    viajes = client.get("/api/viajes/mis-viajes", headers=pyme_headers)
    assert viajes.status_code == 200, viajes.text
    viaje = next(item for item in viajes.json() if item["carga_id"] == carga_id)
    viaje_id = viaje["id"]
    assert viaje["estado"] == "ASIGNADO"

    for estado in ["EN_CAMINO_RETIRO", "CARGA_RETIRADA", "EN_TRANSITO"]:
        response = client.patch(
            f"/api/viajes/{viaje_id}/estado",
            headers=transportista_headers,
            json={"estado": estado},
        )
        assert response.status_code == 200, response.text
        assert response.json()["estado"] == estado

    tracking = client.post(
        f"/api/viajes/{viaje_id}/tracking",
        headers=transportista_headers,
        json={"lat": "-31.350000", "lng": "-64.240000", "velocidad": "48"},
    )
    assert tracking.status_code == 201, tracking.text

    tracking_history = client.get(f"/api/viajes/{viaje_id}/tracking", headers=pyme_headers)
    assert tracking_history.status_code == 200, tracking_history.text
    assert len(tracking_history.json()) == 1

    finalizar = client.patch(
        f"/api/viajes/{viaje_id}/finalizar",
        headers=transportista_headers,
        json={"observaciones": "Entrega completa"},
    )
    assert finalizar.status_code == 200, finalizar.text
    assert finalizar.json()["estado"] == "ENTREGADO"

    pago = client.post(
        f"/api/viajes/{viaje_id}/pago/simular",
        headers=pyme_headers,
        json={"comision_porcentaje": "10"},
    )
    assert pago.status_code == 201, pago.text
    assert pago.json()["estado"] == "RETENIDO"
    assert pago.json()["comision_plataforma"] == "9500.00"

    pyme_calificacion = client.post(
        f"/api/viajes/{viaje_id}/calificaciones",
        headers=pyme_headers,
        json={"puntaje": 5, "comentario": "Excelente servicio"},
    )
    assert pyme_calificacion.status_code == 201, pyme_calificacion.text
    assert pyme_calificacion.json()["receptor_usuario_id"] == transportista_user_id

    transportista_calificacion = client.post(
        f"/api/viajes/{viaje_id}/calificaciones",
        headers=transportista_headers,
        json={"puntaje": 5, "comentario": "Carga lista y documentacion ordenada"},
    )
    assert transportista_calificacion.status_code == 201, transportista_calificacion.text
    assert transportista_calificacion.json()["receptor_usuario_id"] == pyme_user_id
