from datetime import datetime, timedelta, timezone
from decimal import Decimal

from sqlalchemy import select

from app.core.database import Base, SessionLocal, engine
from app.core.security import get_password_hash
from app.models.enums import (
    CargaEstado,
    OfertaEstado,
    PagoEstado,
    PagoMetodo,
    TransportistaTipo,
    UserRole,
    UserStatus,
    VehiculoEstado,
    VehiculoTipo,
    ViajeEstado,
)
from app.models.models import (
    Calificacion,
    Carga,
    EmpresaPyme,
    Oferta,
    Pago,
    TipoTarifa,
    TrackingPosition,
    Transportista,
    User,
    Vehiculo,
    Viaje,
    TipoAcoplado,
)


def seed() -> None:
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        # Seed TipoTarifa if not present
        if not db.scalar(select(TipoTarifa)):
            tipos = [
                TipoTarifa(nombre="Por Kilómetro", tarifa_base_ton_km=150.0),
                TipoTarifa(nombre="Por Tonelada", tarifa_base_ton_km=120.0),
                TipoTarifa(nombre="Tarifa Plana", tarifa_base_ton_km=100.0),
            ]
            db.add_all(tipos)
            db.commit()

        # Seed TipoAcoplado if not present
        if not db.scalar(select(TipoAcoplado)):
            acoplados = [
                TipoAcoplado(id=1, nombre="Batea"),
                TipoAcoplado(id=2, nombre="Semirremolque"),
                TipoAcoplado(id=3, nombre="Sider"),
                TipoAcoplado(id=4, nombre="Equipo"),
                TipoAcoplado(id=5, nombre="Tolva"),
                TipoAcoplado(id=6, nombre="Bitren"),
                TipoAcoplado(id=7, nombre="Carreton"),
                TipoAcoplado(id=8, nombre="PortaCont"),
            ]
            db.add_all(acoplados)
            db.commit()

        acoplados = db.scalars(select(TipoAcoplado).order_by(TipoAcoplado.id.asc())).all()

        if db.scalar(select(User).where(User.email == "admin@logexpress.com")):
            print("Seed ya cargado.")
            return

        now = datetime.now(timezone.utc)
        admin = User(
            nombre="Admin LogExpress",
            email="admin@logexpress.com",
            password_hash=get_password_hash("Admin123!"),
            telefono="+5493510000000",
            rol=UserRole.ADMIN,
            estado=UserStatus.ACTIVO,
        )
        pyme_users = [
            User(
                nombre="Canteras Centro",
                email="pyme1@logexpress.com",
                password_hash=get_password_hash("Pyme123!"),
                telefono="+5493511111111",
                rol=UserRole.PYME,
                estado=UserStatus.ACTIVO,
            ),
            User(
                nombre="Distribuidora Norte",
                email="pyme2@logexpress.com",
                password_hash=get_password_hash("Pyme123!"),
                telefono="+5493512222222",
                rol=UserRole.PYME,
                estado=UserStatus.ACTIVO,
            ),
        ]
        transportista_users = [
            User(
                nombre="Juan Pereyra",
                email="transportista1@logexpress.com",
                password_hash=get_password_hash("Trans123!"),
                telefono="+5493513333333",
                rol=UserRole.TRANSPORTISTA,
                estado=UserStatus.ACTIVO,
            ),
            User(
                nombre="Sofia Molina",
                email="transportista2@logexpress.com",
                password_hash=get_password_hash("Trans123!"),
                telefono="+5493514444444",
                rol=UserRole.TRANSPORTISTA,
                estado=UserStatus.ACTIVO,
            ),
            User(
                nombre="Rutas Serranas",
                email="transportista3@logexpress.com",
                password_hash=get_password_hash("Trans123!"),
                telefono="+5493515555555",
                rol=UserRole.TRANSPORTISTA,
                estado=UserStatus.ACTIVO,
            ),
        ]
        db.add_all([admin, *pyme_users, *transportista_users])
        db.flush()

        pymes = [
            EmpresaPyme(
                user_id=pyme_users[0].id,
                razon_social="Canteras Centro SRL",
                cuit="30-70000001-1",
                rubro="Corralon",
                direccion="Av. Fuerza Aerea 1234",
                ciudad="Cordoba",
                provincia="Cordoba",
                verificada=True,
            ),
            EmpresaPyme(
                user_id=pyme_users[1].id,
                razon_social="Distribuidora Norte SA",
                cuit="30-70000002-2",
                rubro="Mayorista",
                direccion="Juan B. Justo 4500",
                ciudad="Cordoba",
                provincia="Cordoba",
                verificada=True,
            ),
        ]
        transportistas = [
            Transportista(
                user_id=transportista_users[0].id,
                nombre_completo="Juan Pereyra",
                dni="30111222",
                cuit_cuil="20-30111222-1",
                tipo=TransportistaTipo.AUTONOMO,
                ciudad_base="Cordoba",
                provincia_base="Cordoba",
                verificado=True,
            ),
            Transportista(
                user_id=transportista_users[1].id,
                nombre_completo="Sofia Molina",
                dni="32222333",
                cuit_cuil="27-32222333-2",
                tipo=TransportistaTipo.AUTONOMO,
                ciudad_base="Villa Allende",
                provincia_base="Cordoba",
                verificado=True,
            ),
            Transportista(
                user_id=transportista_users[2].id,
                nombre_completo="Rutas Serranas",
                dni="33333444",
                cuit_cuil="30-73333444-3",
                tipo=TransportistaTipo.FLOTA_MEDIANA,
                ciudad_base="Cordoba",
                provincia_base="Cordoba",
                verificado=True,
            ),
        ]
        db.add_all([*pymes, *transportistas])
        db.flush()

        vehiculos = [
            Vehiculo(
                transportista_id=transportistas[0].id,
                patente="AA123BB",
                tipo=VehiculoTipo.CHASIS,
                capacidad_kg=Decimal("7500"),
                capacidad_m3=Decimal("35"),
                refrigerado=False,
                tiene_rampa=True,
                estado=VehiculoEstado.ACTIVO,
            ),
            Vehiculo(
                transportista_id=transportistas[1].id,
                patente="AB456CD",
                tipo=VehiculoTipo.FURGON,
                capacidad_kg=Decimal("3500"),
                capacidad_m3=Decimal("18"),
                refrigerado=False,
                tiene_rampa=False,
                estado=VehiculoEstado.ACTIVO,
            ),
            Vehiculo(
                transportista_id=transportistas[2].id,
                patente="AC789EF",
                tipo=VehiculoTipo.SIDER,
                capacidad_kg=Decimal("12000"),
                capacidad_m3=Decimal("55"),
                refrigerado=False,
                tiene_rampa=True,
                estado=VehiculoEstado.ACTIVO,
            ),
        ]
        db.add_all(vehiculos)
        db.flush()

        cargas = [
            Carga(
                empresa_id=pymes[0].id,
                titulo="Ladrillos huecos a Nueva Cordoba",
                descripcion="Pallets listos para retiro",
                tipo_mercaderia="Materiales de construccion",
                peso_kg=2500.0,
                volumen_m3=12.0,
                origen_direccion="Av. Fuerza Aerea 1234",
                origen_ciudad="Cordoba",
                origen_provincia="Cordoba",
                origen_lat=Decimal("-31.429500"),
                origen_lng=Decimal("-64.228000"),
                destino_direccion="Ituzaingo 800",
                destino_ciudad="Cordoba",
                destino_provincia="Cordoba",
                destino_lat=Decimal("-31.424100"),
                destino_lng=Decimal("-64.184800"),
                fecha_retiro_deseada=now + timedelta(days=1),
                fecha_entrega_deseada=now + timedelta(days=2),
                precio_referencia=Decimal("98000"),
                cantidadKm=12.5,
                distancia_km=12.5,
                idTipoTarifa=1,
                nombreTipoTarifa="Por Kilómetro",
                tarifa=98000.0,
                tarifa_base_ton_km=150.0,
                incluyeIVA=False,
                hora_inicio_carga=now + timedelta(days=1, hours=8),
                hora_fin_carga=now + timedelta(days=1, hours=10),
                hora_inicio_descarga=now + timedelta(days=2, hours=14),
                hora_fin_descarga=now + timedelta(days=2, hours=16),
                requiere_balanza=True,
                ubicacion_balanza="Balanza Ruta 9 km 25",
                hora_inicio_balanza=now + timedelta(days=1, hours=12),
                hora_fin_balanza=now + timedelta(days=1, hours=13),
                estado=CargaEstado.CON_OFERTAS,
                tipos_acoplados=[acoplados[1], acoplados[2]],
            ),
            Carga(
                empresa_id=pymes[0].id,
                titulo="Bolsas de cemento a Alta Gracia",
                descripcion="Carga paletizada",
                tipo_mercaderia="Cemento",
                peso_kg=5000.0,
                volumen_m3=16.0,
                origen_direccion="Av. Fuerza Aerea 1234",
                origen_ciudad="Cordoba",
                origen_provincia="Cordoba",
                origen_lat=None,
                origen_lng=None,
                destino_direccion="Ruta 5 km 30",
                destino_ciudad="Alta Gracia",
                destino_provincia="Cordoba",
                destino_lat=None,
                destino_lng=None,
                fecha_retiro_deseada=now + timedelta(days=2),
                fecha_entrega_deseada=now + timedelta(days=3),
                precio_referencia=Decimal("145000"),
                cantidadKm=38.0,
                distancia_km=38.0,
                idTipoTarifa=1,
                nombreTipoTarifa="Por Kilómetro",
                tarifa=145000.0,
                tarifa_base_ton_km=150.0,
                incluyeIVA=False,
                hora_inicio_carga=now + timedelta(days=2, hours=9),
                hora_fin_carga=now + timedelta(days=2, hours=11),
                hora_inicio_descarga=now + timedelta(days=3, hours=10),
                hora_fin_descarga=now + timedelta(days=3, hours=12),
                requiere_balanza=False,
                ubicacion_balanza=None,
                hora_inicio_balanza=None,
                hora_fin_balanza=None,
                estado=CargaEstado.PUBLICADA,
                tipos_acoplados=[acoplados[1]],
            ),
            Carga(
                empresa_id=pymes[1].id,
                titulo="Alimentos secos a Carlos Paz",
                descripcion="No requiere frio",
                tipo_mercaderia="Alimentos secos",
                peso_kg=1200.0,
                volumen_m3=10.0,
                origen_direccion="Juan B. Justo 4500",
                origen_ciudad="Cordoba",
                origen_provincia="Cordoba",
                origen_lat=None,
                origen_lng=None,
                destino_direccion="San Martin 500",
                destino_ciudad="Villa Carlos Paz",
                destino_provincia="Cordoba",
                destino_lat=None,
                destino_lng=None,
                fecha_retiro_deseada=now + timedelta(days=1),
                fecha_entrega_deseada=now + timedelta(days=1, hours=6),
                precio_referencia=Decimal("75000"),
                cantidadKm=35.0,
                distancia_km=35.0,
                idTipoTarifa=1,
                nombreTipoTarifa="Por Kilómetro",
                tarifa=75000.0,
                tarifa_base_ton_km=150.0,
                incluyeIVA=False,
                hora_inicio_carga=now + timedelta(days=1, hours=7),
                hora_fin_carga=now + timedelta(days=1, hours=9),
                hora_inicio_descarga=now + timedelta(days=1, hours=13),
                hora_fin_descarga=now + timedelta(days=1, hours=15),
                requiere_balanza=False,
                ubicacion_balanza=None,
                hora_inicio_balanza=None,
                hora_fin_balanza=None,
                estado=CargaEstado.PUBLICADA,
                tipos_acoplados=[acoplados[2]],
            ),
            Carga(
                empresa_id=pymes[1].id,
                titulo="Repuestos a Rio Ceballos",
                descripcion="Cajas medianas",
                tipo_mercaderia="Repuestos",
                peso_kg=900.0,
                volumen_m3=7.0,
                origen_direccion="Juan B. Justo 4500",
                origen_ciudad="Cordoba",
                origen_provincia="Cordoba",
                origen_lat=None,
                origen_lng=None,
                destino_direccion="Av. San Martin 100",
                destino_ciudad="Rio Ceballos",
                destino_provincia="Cordoba",
                destino_lat=None,
                destino_lng=None,
                fecha_retiro_deseada=now + timedelta(days=3),
                fecha_entrega_deseada=now + timedelta(days=4),
                precio_referencia=Decimal("68000"),
                cantidadKm=28.5,
                distancia_km=28.5,
                idTipoTarifa=3,
                nombreTipoTarifa="Tarifa Plana",
                tarifa=68000.0,
                tarifa_base_ton_km=100.0,
                incluyeIVA=False,
                hora_inicio_carga=now + timedelta(days=3, hours=8),
                hora_fin_carga=now + timedelta(days=3, hours=10),
                hora_inicio_descarga=now + timedelta(days=4, hours=14),
                hora_fin_descarga=now + timedelta(days=4, hours=16),
                requiere_balanza=False,
                ubicacion_balanza=None,
                hora_inicio_balanza=None,
                hora_fin_balanza=None,
                estado=CargaEstado.PUBLICADA,
                tipos_acoplados=[acoplados[0]],
            ),
            Carga(
                empresa_id=pymes[0].id,
                titulo="Ceramicos a barrio Jardin",
                descripcion="Manipular con cuidado",
                tipo_mercaderia="Ceramicos",
                peso_kg=1800.0,
                volumen_m3=9.0,
                origen_direccion="Av. Fuerza Aerea 1234",
                origen_ciudad="Cordoba",
                origen_provincia="Cordoba",
                origen_lat=None,
                origen_lng=None,
                destino_direccion="Ricchieri 2500",
                destino_ciudad="Cordoba",
                destino_provincia="Cordoba",
                destino_lat=None,
                destino_lng=None,
                fecha_retiro_deseada=now + timedelta(days=2),
                fecha_entrega_deseada=now + timedelta(days=2, hours=5),
                precio_referencia=Decimal("83000"),
                cantidadKm=15.0,
                distancia_km=15.0,
                idTipoTarifa=2,
                nombreTipoTarifa="Por Tonelada",
                tarifa=83000.0,
                tarifa_base_ton_km=120.0,
                incluyeIVA=False,
                hora_inicio_carga=now + timedelta(days=2, hours=8),
                hora_fin_carga=now + timedelta(days=2, hours=11),
                hora_inicio_descarga=now + timedelta(days=2, hours=14),
                hora_fin_descarga=now + timedelta(days=2, hours=17),
                requiere_balanza=False,
                ubicacion_balanza=None,
                hora_inicio_balanza=None,
                hora_fin_balanza=None,
                estado=CargaEstado.PUBLICADA,
                tipos_acoplados=[acoplados[2]],
            ),
            Carga(
                empresa_id=pymes[0].id,
                titulo="Viaje Normal en Curso - Alimentos",
                descripcion="Carga de mercadería de primera necesidad",
                tipo_mercaderia="Alimentos",
                peso_kg=3500.0,
                volumen_m3=18.0,
                origen_direccion="Bv. Chacabuco 300",
                origen_ciudad="Cordoba",
                origen_provincia="Cordoba",
                origen_lat=Decimal("-31.422500"),
                origen_lng=Decimal("-64.186000"),
                destino_direccion="Av. San Martin 120",
                destino_ciudad="Carlos Paz",
                destino_provincia="Cordoba",
                destino_lat=Decimal("-31.417000"),
                destino_lng=Decimal("-64.492000"),
                fecha_retiro_deseada=now - timedelta(hours=4),
                fecha_entrega_deseada=now + timedelta(hours=4),
                precio_referencia=Decimal("120000"),
                cantidadKm=36.0,
                distancia_km=36.0,
                idTipoTarifa=1,
                nombreTipoTarifa="Por Kilómetro",
                tarifa=120000.0,
                tarifa_base_ton_km=150.0,
                incluyeIVA=False,
                hora_inicio_carga=now - timedelta(hours=4),
                hora_fin_carga=now - timedelta(hours=2),
                hora_inicio_descarga=now + timedelta(hours=2),
                hora_fin_descarga=now + timedelta(hours=4),
                requiere_balanza=False,
                estado=CargaEstado.EN_CURSO,
                tipos_acoplados=[acoplados[2]],
            ),
            Carga(
                empresa_id=pymes[0].id,
                titulo="Viaje con Alerta de Desvío - Insumos",
                descripcion="Entrega urgente de insumos industriales",
                tipo_mercaderia="Insumos",
                peso_kg=8000.0,
                volumen_m3=30.0,
                origen_direccion="Bv. Chacabuco 300",
                origen_ciudad="Cordoba",
                origen_provincia="Cordoba",
                origen_lat=Decimal("-31.422500"),
                origen_lng=Decimal("-64.186000"),
                destino_direccion="Av. San Martin 120",
                destino_ciudad="Carlos Paz",
                destino_provincia="Cordoba",
                destino_lat=Decimal("-31.417000"),
                destino_lng=Decimal("-64.492000"),
                fecha_retiro_deseada=now - timedelta(hours=4),
                fecha_entrega_deseada=now + timedelta(hours=4),
                precio_referencia=Decimal("190000"),
                cantidadKm=36.0,
                distancia_km=36.0,
                idTipoTarifa=1,
                nombreTipoTarifa="Por Kilómetro",
                tarifa=190000.0,
                tarifa_base_ton_km=150.0,
                incluyeIVA=False,
                hora_inicio_carga=now - timedelta(hours=4),
                hora_fin_carga=now - timedelta(hours=2),
                hora_inicio_descarga=now + timedelta(hours=2),
                hora_fin_descarga=now + timedelta(hours=4),
                requiere_balanza=False,
                estado=CargaEstado.EN_CURSO,
                tipos_acoplados=[acoplados[2]],
            ),
        ]
        db.add_all(cargas)
        db.flush()

        ofertas = [
            Oferta(
                carga_id=cargas[0].id,
                transportista_id=transportistas[0].id,
                vehiculo_id=vehiculos[0].id,
                monto=Decimal("95000"),
                mensaje="Puedo retirar mañana a primera hora.",
                estado=OfertaEstado.PENDIENTE,
            ),
            Oferta(
                carga_id=cargas[0].id,
                transportista_id=transportistas[1].id,
                vehiculo_id=vehiculos[1].id,
                monto=Decimal("99000"),
                mensaje="Disponible por la tarde.",
                estado=OfertaEstado.PENDIENTE,
            ),
        ]
        db.add_all(ofertas)
        db.flush()

        in_progress_offer = Oferta(
            carga_id=cargas[2].id,
            transportista_id=transportistas[2].id,
            vehiculo_id=vehiculos[2].id,
            monto=Decimal("74000"),
            mensaje="Viaje asignado desde seed.",
            estado=OfertaEstado.ACEPTADA,
        )
        delivered_offer = Oferta(
            carga_id=cargas[3].id,
            transportista_id=transportistas[0].id,
            vehiculo_id=vehiculos[0].id,
            monto=Decimal("67000"),
            mensaje="Viaje entregado desde seed.",
            estado=OfertaEstado.ACEPTADA,
        )
        oferta_normal = Oferta(
            carga_id=cargas[5].id,
            transportista_id=transportistas[0].id,
            vehiculo_id=vehiculos[0].id,
            monto=Decimal("120000"),
            mensaje="Viaje normal aceptado.",
            estado=OfertaEstado.ACEPTADA,
        )
        oferta_desvio = Oferta(
            carga_id=cargas[6].id,
            transportista_id=transportistas[1].id,
            vehiculo_id=vehiculos[1].id,
            monto=Decimal("190000"),
            mensaje="Viaje desvío aceptado.",
            estado=OfertaEstado.ACEPTADA,
        )
        db.add_all([in_progress_offer, delivered_offer, oferta_normal, oferta_desvio])
        db.flush()

        cargas[2].estado = CargaEstado.EN_CURSO
        cargas[3].estado = CargaEstado.ENTREGADA
        viaje_en_curso = Viaje(
            carga_id=cargas[2].id,
            oferta_id=in_progress_offer.id,
            empresa_id=cargas[2].empresa_id,
            transportista_id=in_progress_offer.transportista_id,
            vehiculo_id=in_progress_offer.vehiculo_id,
            estado=ViajeEstado.EN_TRANSITO,
            fecha_asignacion=now - timedelta(hours=5),
            fecha_inicio=now - timedelta(hours=3),
        )
        viaje_entregado = Viaje(
            carga_id=cargas[3].id,
            oferta_id=delivered_offer.id,
            empresa_id=cargas[3].empresa_id,
            transportista_id=delivered_offer.transportista_id,
            vehiculo_id=delivered_offer.vehiculo_id,
            estado=ViajeEstado.ENTREGADO,
            fecha_asignacion=now - timedelta(days=3),
            fecha_inicio=now - timedelta(days=2, hours=6),
            fecha_entrega=now - timedelta(days=2),
            observaciones="Entrega sin novedades.",
        )
        viaje_normal = Viaje(
            carga_id=cargas[5].id,
            oferta_id=oferta_normal.id,
            empresa_id=cargas[5].empresa_id,
            transportista_id=oferta_normal.transportista_id,
            vehiculo_id=oferta_normal.vehiculo_id,
            estado=ViajeEstado.EN_TRANSITO,
            fecha_asignacion=now - timedelta(hours=5),
            fecha_inicio=now - timedelta(hours=3),
        )
        viaje_desvio = Viaje(
            carga_id=cargas[6].id,
            oferta_id=oferta_desvio.id,
            empresa_id=cargas[6].empresa_id,
            transportista_id=oferta_desvio.transportista_id,
            vehiculo_id=oferta_desvio.vehiculo_id,
            estado=ViajeEstado.EN_TRANSITO,
            fecha_asignacion=now - timedelta(hours=5),
            fecha_inicio=now - timedelta(hours=3),
        )
        db.add_all([viaje_en_curso, viaje_entregado, viaje_normal, viaje_desvio])
        db.flush()

        db.add(
            TrackingPosition(
                viaje_id=viaje_en_curso.id,
                transportista_id=viaje_en_curso.transportista_id,
                lat=Decimal("-31.401000"),
                lng=Decimal("-64.190000"),
                velocidad=Decimal("54"),
                timestamp=now - timedelta(minutes=20),
            )
        )
        db.add(
            TrackingPosition(
                viaje_id=viaje_normal.id,
                transportista_id=viaje_normal.transportista_id,
                lat=Decimal("-31.425000"),
                lng=Decimal("-64.250000"),
                velocidad=Decimal("70"),
                timestamp=now - timedelta(minutes=10),
            )
        )
        db.add(
            TrackingPosition(
                viaje_id=viaje_desvio.id,
                transportista_id=viaje_desvio.transportista_id,
                lat=Decimal("-31.350000"),
                lng=Decimal("-64.300000"),
                velocidad=Decimal("45"),
                timestamp=now - timedelta(minutes=5),
                alerta_seguridad="Desvío de ruta detectado",
            )
        )
        db.add(
            Pago(
                viaje_id=viaje_entregado.id,
                empresa_id=viaje_entregado.empresa_id,
                transportista_id=viaje_entregado.transportista_id,
                monto_total=Decimal("67000"),
                comision_plataforma=Decimal("6700"),
                monto_transportista=Decimal("60300"),
                estado=PagoEstado.LIBERADO,
                metodo=PagoMetodo.SIMULADO,
                fecha_pago=now - timedelta(days=1),
            )
        )
        db.add(
            Calificacion(
                viaje_id=viaje_entregado.id,
                autor_usuario_id=pyme_users[1].id,
                receptor_usuario_id=transportista_users[0].id,
                puntaje=5,
                comentario="Entrega puntual y muy ordenada.",
            )
        )
        transportistas[0].reputacion_promedio = Decimal("5.00")

        db.commit()
        print("Seed cargado correctamente.")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
