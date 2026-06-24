from datetime import datetime, timedelta, timezone
import pytest
from fastapi.testclient import TestClient

def auth_headers(client, email: str, password: str) -> dict[str, str]:
    response = client.post("/api/auth/login", json={"email": email, "password": password})
    assert response.status_code == 200, response.text
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

def test_contrato_granos_lifecycle(client: TestClient):
    # Register a PyME user
    pyme_user = client.post(
        "/api/auth/register",
        json={
            "nombre": "PyME Granos",
            "email": "pyme_granos@test.com",
            "password": "Pyme123!",
            "telefono": "+5493511111111",
            "rol": "PYME",
        },
    )
    assert pyme_user.status_code == 201, pyme_user.text

    pyme_headers = auth_headers(client, "pyme_granos@test.com", "Pyme123!")

    # Complete PyME profile
    pyme_profile = client.post(
        "/api/pymes",
        headers=pyme_headers,
        json={
            "razon_social": "Pyme Granos SRL",
            "cuit": "30-11111111-1",
            "rubro": "Agro",
            "direccion": "Ruta 9 Km 400",
            "ciudad": "Oncativo",
            "provincia": "Cordoba",
        },
    )
    assert pyme_profile.status_code == 201, pyme_profile.text
    pyme_id = pyme_profile.json()["id"]

    # Register a separate PyME user to test permission boundaries
    other_pyme_user = client.post(
        "/api/auth/register",
        json={
            "nombre": "Other PyME",
            "email": "other_pyme@test.com",
            "password": "Pyme123!",
            "telefono": "+5493512222222",
            "rol": "PYME",
        },
    )
    assert other_pyme_user.status_code == 201, other_pyme_user.text

    other_pyme_headers = auth_headers(client, "other_pyme@test.com", "Pyme123!")

    other_pyme_profile = client.post(
        "/api/pymes",
        headers=other_pyme_headers,
        json={
            "razon_social": "Other PyME SRL",
            "cuit": "30-22222222-2",
            "rubro": "Logistica",
            "direccion": "Av. Colon 500",
            "ciudad": "Cordoba",
            "provincia": "Cordoba",
        },
    )
    assert other_pyme_profile.status_code == 201, other_pyme_profile.text

    # Create a load (Carga) for PyME Granos
    retiro = datetime.now(timezone.utc) + timedelta(days=1)
    entrega = retiro + timedelta(hours=8)
    carga = client.post(
        "/api/cargas",
        headers=pyme_headers,
        json={
            "titulo": "Soja a Rosario",
            "idsTiposAcoplados": [5],  # Tolva
            "descripcion": "Carga de granos de soja a puerto",
            "tipo_mercaderia": "Sojas",
            "peso_kg": "30000",
            "volumen_m3": "40",
            "origen_direccion": "Ruta 9 Km 400",
            "origen_ciudad": "Oncativo",
            "origen_provincia": "Cordoba",
            "origen_lat": "-31.916000",
            "origen_lng": "-63.683000",
            "destino_direccion": "Puerto Rosario",
            "destino_ciudad": "Rosario",
            "destino_provincia": "Santa Fe",
            "destino_lat": "-32.946000",
            "destino_lng": "-60.635000",
            "fecha_retiro_deseada": retiro.isoformat(),
            "fecha_entrega_deseada": entrega.isoformat(),
            "precio_referencia": "500000",
            "cantidadKm": 350.0,
            "idTipoTarifa": 2,  # Por Tonelada
            "nombreTipoTarifa": "Por Tonelada",
            "tarifa": 500000.0,
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

    # 1. Test Valid Contract Creation (with carga_id ownership)
    inicio_contrato = datetime.now(timezone.utc)
    fin_contrato = inicio_contrato + timedelta(days=30)
    
    contrato_payload = {
        "carga_id": carga_id,
        "numero_contrato": "CONTRATO-SOJA-2026-001",
        "fecha_inicio_contrato": inicio_contrato.isoformat(),
        "fecha_fin_contrato": fin_contrato.isoformat(),
        "productor_id": "CUIT-30-11111111-1",
        "productor_nombre": "Pyme Granos SRL",
        "exportador_id": "CUIT-30-99999999-9",
        "exportador_nombre": "Cargill S.A.",
        "tipo_grano": "Soja",
        "calidad_grano": "Camara",
        "humedad_maxima_permitida": 14.5,
        "impurezas_maximas_permitidas": 2.0,
        "planta_procedencia_ruca": "RUCA-12345",
        "planta_destino_ruca": "RUCA-67890",
        "cantidad_total_kg": 30000.0,
        "precio_por_kg": 15.2,
    }

    # Creation as owner PyME
    res = client.post("/api/contratos", headers=pyme_headers, json=contrato_payload)
    assert res.status_code == 201, res.text
    contrato_id = res.json()["id"]
    assert res.json()["numero_contrato"] == "CONTRATO-SOJA-2026-001"

    # 2. Test Unique Contract Number Constraint
    res_dup = client.post("/api/contratos", headers=pyme_headers, json=contrato_payload)
    assert res_dup.status_code == 409, res_dup.text
    assert "El número de contrato ya está registrado" in res_dup.json()["message"]

    # 3. Test Carga Ownership Boundary Check
    contrato_payload_other = contrato_payload.copy()
    contrato_payload_other["numero_contrato"] = "CONTRATO-SOJA-2026-002"
    # Try to create referencing other pyme's carga
    res_forbidden = client.post("/api/contratos", headers=other_pyme_headers, json=contrato_payload_other)
    assert res_forbidden.status_code == 403, res_forbidden.text

    # 4. Test Schema Validations (dates, positive quantity, percent bounds)
    # A. End date before start date
    payload_bad_date = contrato_payload.copy()
    payload_bad_date["numero_contrato"] = "CONTRATO-BAD-DATE"
    payload_bad_date["fecha_fin_contrato"] = (inicio_contrato - timedelta(days=1)).isoformat()
    res_bad_date = client.post("/api/contratos", headers=pyme_headers, json=payload_bad_date)
    assert res_bad_date.status_code == 422

    # B. Humidity > 100%
    payload_bad_hum = contrato_payload.copy()
    payload_bad_hum["numero_contrato"] = "CONTRATO-BAD-HUM"
    payload_bad_hum["humedad_maxima_permitida"] = 101.0
    res_bad_hum = client.post("/api/contratos", headers=pyme_headers, json=payload_bad_hum)
    assert res_bad_hum.status_code == 422

    # C. Negative quantity
    payload_bad_qty = contrato_payload.copy()
    payload_bad_qty["numero_contrato"] = "CONTRATO-BAD-QTY"
    payload_bad_qty["cantidad_total_kg"] = -10.0
    res_bad_qty = client.post("/api/contratos", headers=pyme_headers, json=payload_bad_qty)
    assert res_bad_qty.status_code == 422

    # D. Zero price
    payload_bad_price = contrato_payload.copy()
    payload_bad_price["numero_contrato"] = "CONTRATO-BAD-PRICE"
    payload_bad_price["precio_por_kg"] = 0.0
    res_bad_price = client.post("/api/contratos", headers=pyme_headers, json=payload_bad_price)
    assert res_bad_price.status_code == 422

    # 5. Test Retrieval by ID
    res_get = client.get(f"/api/contratos/{contrato_id}", headers=pyme_headers)
    assert res_get.status_code == 200, res_get.text
    assert res_get.json()["id"] == contrato_id
    assert res_get.json()["numero_contrato"] == "CONTRATO-SOJA-2026-001"

    # 6. Test Listing Endpoints
    res_list = client.get("/api/contratos", headers=pyme_headers)
    assert res_list.status_code == 200, res_list.text
    assert len(res_list.json()) >= 1
    assert any(c["id"] == contrato_id for c in res_list.json())
