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
    DocumentoEstado,
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
    ContratoGranos,
    Documento,
)


def seed() -> None:
    # Drop all tables and recreate to start fresh
    print("Reseteando base de datos...")
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        print("Cargando tipos de tarifas...")
        tipos_tarifas = [
            TipoTarifa(id=1, nombre="Por Kilómetro", tarifa_base_ton_km=150.0),
            TipoTarifa(id=2, nombre="Por Tonelada", tarifa_base_ton_km=120.0),
            TipoTarifa(id=3, nombre="Tarifa Plana", tarifa_base_ton_km=100.0),
        ]
        db.add_all(tipos_tarifas)
        db.commit()

        print("Cargando tipos de acoplados...")
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

        # Fetch acoplados from db
        acoplados_db = db.scalars(select(TipoAcoplado).order_by(TipoAcoplado.id.asc())).all()

        print("Cargando usuarios...")
        now = datetime.now(timezone.utc)
        
        # 1. Admin
        admin = User(
            nombre="Admin LogExpress",
            email="admin@logexpress.com",
            password_hash=get_password_hash("Admin123!"),
            telefono="+5493510000000",
            rol=UserRole.ADMIN,
            estado=UserStatus.ACTIVO,
        )
        
        # 2. PyMEs
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
            User(
                nombre="Cooperativa Arroyo Cabral",
                email="pyme3@logexpress.com",
                password_hash=get_password_hash("Pyme123!"),
                telefono="+5493534123456",
                rol=UserRole.PYME,
                estado=UserStatus.ACTIVO,
            ),
        ]
        
        # 3. Transportistas
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

        print("Cargando perfiles PyME...")
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
            EmpresaPyme(
                user_id=pyme_users[2].id,
                razon_social="Cooperativa Arroyo Cabral Ltda",
                cuit="30-70000003-3",
                rubro="Cooperativa Agrícola",
                direccion="Ruta Nacional 158 Km 120",
                ciudad="Arroyo Cabral",
                provincia="Cordoba",
                verificada=True,
            ),
        ]
        db.add_all(pymes)

        print("Cargando perfiles Transportista...")
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
                reputacion_promedio=Decimal("5.00"),
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
                reputacion_promedio=Decimal("4.50"),
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
                reputacion_promedio=Decimal("4.80"),
            ),
        ]
        db.add_all(transportistas)
        db.flush()

        print("Cargando vehículos...")
        vehiculos = [
            # Juan Pereyra
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
                transportista_id=transportistas[0].id,
                patente="AE555TR",
                tipo=VehiculoTipo.SEMIRREMOLQUE,
                capacidad_kg=Decimal("28000"),
                capacidad_m3=Decimal("90"),
                refrigerado=False,
                tiene_rampa=False,
                estado=VehiculoEstado.ACTIVO,
            ),
            # Sofia Molina
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
            # Rutas Serranas
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
            Vehiculo(
                transportista_id=transportistas[2].id,
                patente="AD999TG",
                tipo=VehiculoTipo.TOLVA,
                capacidad_kg=Decimal("32000"),
                capacidad_m3=Decimal("45"),
                refrigerado=False,
                tiene_rampa=False,
                estado=VehiculoEstado.ACTIVO,
            ),
        ]
        db.add_all(vehiculos)
        db.flush()

        print("Cargando documentos de transportistas...")
        documentos = [
            Documento(
                owner_tipo="TRANSPORTISTA",
                owner_id=transportistas[0].id,
                tipo="DNI",
                nombre_archivo="dni_juan.pdf",
                estado=DocumentoEstado.APROBADO,
            ),
            Documento(
                owner_tipo="TRANSPORTISTA",
                owner_id=transportistas[0].id,
                tipo="LICENCIA",
                nombre_archivo="licencia_juan.pdf",
                estado=DocumentoEstado.APROBADO,
            ),
            Documento(
                owner_tipo="TRANSPORTISTA",
                owner_id=transportistas[0].id,
                tipo="CUIT",
                nombre_archivo="cuit_juan.pdf",
                estado=DocumentoEstado.APROBADO,
            ),
            Documento(
                owner_tipo="VEHICULO",
                owner_id=vehiculos[0].id,
                tipo="SEGURO_VEHICULO",
                nombre_archivo="seguro_chasis.pdf",
                estado=DocumentoEstado.APROBADO,
            ),
            Documento(
                owner_tipo="TRANSPORTISTA",
                owner_id=transportistas[1].id,
                tipo="DNI",
                nombre_archivo="dni_sofia.pdf",
                estado=DocumentoEstado.APROBADO,
            ),
            Documento(
                owner_tipo="TRANSPORTISTA",
                owner_id=transportistas[1].id,
                tipo="LICENCIA",
                nombre_archivo="licencia_sofia.pdf",
                estado=DocumentoEstado.PENDIENTE,
            ),
        ]
        db.add_all(documentos)
        db.flush()

        print("Cargando cargas...")
        cargas = [
            # Carga 1: Abierta / Publicada
            Carga(
                empresa_id=pymes[0].id,
                titulo="Bolsas de cemento a Alta Gracia",
                descripcion="Carga paletizada, requiere descarga con autoelevador en destino.",
                tipo_mercaderia="Construcción",
                peso_kg=Decimal("5000"),
                volumen_m3=Decimal("16"),
                origen_direccion="Av. Fuerza Aerea 1234",
                origen_ciudad="Cordoba",
                origen_provincia="Cordoba",
                origen_lat=Decimal("-31.429500"),
                origen_lng=Decimal("-64.228000"),
                destino_direccion="Ruta 5 Km 30",
                destino_ciudad="Alta Gracia",
                destino_provincia="Cordoba",
                destino_lat=Decimal("-31.652900"),
                destino_lng=Decimal("-64.428300"),
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
                estado=CargaEstado.PUBLICADA,
                tipos_acoplados=[acoplados_db[1]],
            ),
            # Carga 2: Con ofertas recibidas
            Carga(
                empresa_id=pymes[0].id,
                titulo="Ladrillos huecos a Nueva Córdoba",
                descripcion="Pallets listos para retiro en corralón norte.",
                tipo_mercaderia="Materiales de construcción",
                peso_kg=Decimal("2500"),
                volumen_m3=Decimal("12"),
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
                estado=CargaEstado.CON_OFERTAS,
                tipos_acoplados=[acoplados_db[1], acoplados_db[2]],
            ),
            # Carga 3: Viaje en Curso Normal (Juan Pereyra)
            Carga(
                empresa_id=pymes[0].id,
                titulo="Viaje Normal en Curso - Alimentos",
                descripcion="Carga general de alimentos secos no perecederos.",
                tipo_mercaderia="Alimentos",
                peso_kg=Decimal("3500"),
                volumen_m3=Decimal("18"),
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
                tipos_acoplados=[acoplados_db[2]],
            ),
            # Carga 4: Viaje en Curso con Desvío (Sofia Molina)
            Carga(
                empresa_id=pymes[0].id,
                titulo="Viaje con Alerta de Desvío - Insumos",
                descripcion="Repuestos e insumos industriales urgentes.",
                tipo_mercaderia="Insumos",
                peso_kg=Decimal("8000"),
                volumen_m3=Decimal("30"),
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
                tipos_acoplados=[acoplados_db[2]],
            ),
            # Carga 5: Histórica entregada 1 (Juan Pereyra)
            Carga(
                empresa_id=pymes[0].id,
                titulo="Pallets de cemento a Villa María",
                descripcion="Entrega en corralón distribuidor.",
                tipo_mercaderia="Construcción",
                peso_kg=Decimal("6000"),
                volumen_m3=Decimal("20"),
                origen_direccion="Av. Fuerza Aerea 1234",
                origen_ciudad="Cordoba",
                origen_provincia="Cordoba",
                origen_lat=Decimal("-31.429500"),
                origen_lng=Decimal("-64.228000"),
                destino_direccion="San Martin 1500",
                destino_ciudad="Villa Maria",
                destino_provincia="Cordoba",
                destino_lat=Decimal("-32.407500"),
                destino_lng=Decimal("-63.240200"),
                fecha_retiro_deseada=now - timedelta(days=3),
                fecha_entrega_deseada=now - timedelta(days=2),
                precio_referencia=Decimal("180000"),
                cantidadKm=145.0,
                distancia_km=145.0,
                idTipoTarifa=1,
                nombreTipoTarifa="Por Kilómetro",
                tarifa=180000.0,
                tarifa_base_ton_km=150.0,
                incluyeIVA=False,
                estado=CargaEstado.ENTREGADA,
                tipos_acoplados=[acoplados_db[1]],
            ),
            # Carga 6: Histórica entregada 2 (Sofia Molina)
            Carga(
                empresa_id=pymes[0].id,
                titulo="Ladrillos block a Carlos Paz",
                descripcion="Entrega en obra residencial.",
                tipo_mercaderia="Construcción",
                peso_kg=Decimal("4000"),
                volumen_m3=Decimal("12"),
                origen_direccion="Av. Fuerza Aerea 1234",
                origen_ciudad="Cordoba",
                origen_provincia="Cordoba",
                origen_lat=Decimal("-31.429500"),
                origen_lng=Decimal("-64.228000"),
                destino_direccion="Libertad 400",
                destino_ciudad="Carlos Paz",
                destino_provincia="Cordoba",
                destino_lat=Decimal("-31.417000"),
                destino_lng=Decimal("-64.492000"),
                fecha_retiro_deseada=now - timedelta(days=5),
                fecha_entrega_deseada=now - timedelta(days=4),
                precio_referencia=Decimal("110000"),
                cantidadKm=36.0,
                distancia_km=36.0,
                idTipoTarifa=1,
                nombreTipoTarifa="Por Kilómetro",
                tarifa=110000.0,
                tarifa_base_ton_km=150.0,
                incluyeIVA=False,
                estado=CargaEstado.ENTREGADA,
                tipos_acoplados=[acoplados_db[1]],
            ),
            # Carga 7: Carga de Grains con contrato digital vinculado (Rutas Serranas)
            Carga(
                empresa_id=pymes[2].id,
                titulo="Transporte de Trigo a Puerto Quequén",
                descripcion="Carga de trigo a granel. Tolva autodescargable.",
                tipo_mercaderia="Granos - Trigo",
                peso_kg=Decimal("30000"),
                volumen_m3=Decimal("40"),
                origen_direccion="Ruta Nacional 158 Km 120",
                origen_ciudad="Arroyo Cabral",
                origen_provincia="Cordoba",
                origen_lat=Decimal("-32.490700"),
                origen_lng=Decimal("-63.401100"),
                destino_direccion="Av. Almirante Brown 100",
                destino_ciudad="Quequen",
                destino_provincia="Buenos Aires",
                destino_lat=Decimal("-38.544200"),
                destino_lng=Decimal("-58.711000"),
                fecha_retiro_deseada=now + timedelta(days=3),
                fecha_entrega_deseada=now + timedelta(days=5),
                precio_referencia=Decimal("650000"),
                cantidadKm=720.0,
                distancia_km=720.0,
                idTipoTarifa=2,
                nombreTipoTarifa="Por Tonelada",
                tarifa=650000.0,
                tarifa_base_ton_km=120.0,
                incluyeIVA=False,
                estado=CargaEstado.ASIGNADA,
                tipos_acoplados=[acoplados_db[4]],
            ),
            # Carga 8: Carga general de distribuidora norte (Publicada)
            Carga(
                empresa_id=pymes[1].id,
                titulo="Alimentos secos a Carlos Paz",
                descripcion="Pallets de mercadería general.",
                tipo_mercaderia="Alimentos",
                peso_kg=Decimal("1200"),
                volumen_m3=Decimal("10"),
                origen_direccion="Juan B. Justo 4500",
                origen_ciudad="Cordoba",
                origen_provincia="Cordoba",
                origen_lat=Decimal("-31.378900"),
                origen_lng=Decimal("-64.195000"),
                destino_direccion="San Martin 500",
                destino_ciudad="Villa Carlos Paz",
                destino_provincia="Cordoba",
                destino_lat=Decimal("-31.417000"),
                destino_lng=Decimal("-64.492000"),
                fecha_retiro_deseada=now + timedelta(days=1),
                fecha_entrega_deseada=now + timedelta(days=2),
                precio_referencia=Decimal("75000"),
                cantidadKm=35.0,
                distancia_km=35.0,
                idTipoTarifa=1,
                nombreTipoTarifa="Por Kilómetro",
                tarifa=75000.0,
                tarifa_base_ton_km=150.0,
                incluyeIVA=False,
                estado=CargaEstado.PUBLICADA,
                tipos_acoplados=[acoplados_db[2]],
            ),
        ]
        db.add_all(cargas)
        db.flush()

        print("Cargando ofertas...")
        ofertas = [
            # Ofertas para Carga 2 (Pendientes)
            Oferta(
                carga_id=cargas[1].id,
                transportista_id=transportistas[0].id,
                vehiculo_id=vehiculos[0].id,
                monto=Decimal("95000"),
                mensaje="Retiro mañana a las 8 AM en batea o chasis.",
                estado=OfertaEstado.PENDIENTE,
            ),
            Oferta(
                carga_id=cargas[1].id,
                transportista_id=transportistas[1].id,
                vehiculo_id=vehiculos[2].id,
                monto=Decimal("99000"),
                mensaje="Chofer verificado. Disponible por la tarde.",
                estado=OfertaEstado.PENDIENTE,
            ),
            # Oferta aceptada para Carga 3 (Viaje Normal en Curso)
            Oferta(
                carga_id=cargas[2].id,
                transportista_id=transportistas[0].id,
                vehiculo_id=vehiculos[0].id,
                monto=Decimal("120000"),
                mensaje="Precio oficial de referencia.",
                estado=OfertaEstado.ACEPTADA,
            ),
            # Oferta aceptada para Carga 4 (Viaje Desvío en Curso)
            Oferta(
                carga_id=cargas[3].id,
                transportista_id=transportistas[1].id,
                vehiculo_id=vehiculos[2].id,
                monto=Decimal("190000"),
                mensaje="Urgente.",
                estado=OfertaEstado.ACEPTADA,
            ),
            # Oferta aceptada para Carga 5 (Histórico entregado 1)
            Oferta(
                carga_id=cargas[4].id,
                transportista_id=transportistas[0].id,
                vehiculo_id=vehiculos[1].id,
                monto=Decimal("180000"),
                mensaje="Viaje completado.",
                estado=OfertaEstado.ACEPTADA,
            ),
            # Oferta aceptada para Carga 6 (Histórico entregado 2)
            Oferta(
                carga_id=cargas[5].id,
                transportista_id=transportistas[1].id,
                vehiculo_id=vehiculos[2].id,
                monto=Decimal("110000"),
                mensaje="Confirmado.",
                estado=OfertaEstado.ACEPTADA,
            ),
            # Oferta aceptada para Carga 7 (Granos)
            Oferta(
                carga_id=cargas[6].id,
                transportista_id=transportistas[2].id,
                vehiculo_id=vehiculos[4].id,
                monto=Decimal("650000"),
                mensaje="Tolva disponible.",
                estado=OfertaEstado.ACEPTADA,
            ),
        ]
        db.add_all(ofertas)
        db.flush()

        print("Cargando viajes...")
        viajes = [
            # Viaje en Curso Normal (Juan Pereyra)
            Viaje(
                carga_id=cargas[2].id,
                oferta_id=ofertas[2].id,
                empresa_id=cargas[2].empresa_id,
                transportista_id=ofertas[2].transportista_id,
                vehiculo_id=ofertas[2].vehiculo_id,
                estado=ViajeEstado.EN_TRANSITO,
                fecha_asignacion=now - timedelta(hours=5),
                fecha_inicio=now - timedelta(hours=3),
            ),
            # Viaje en Curso Desvío (Sofia Molina)
            Viaje(
                carga_id=cargas[3].id,
                oferta_id=ofertas[3].id,
                empresa_id=cargas[3].empresa_id,
                transportista_id=ofertas[3].transportista_id,
                vehiculo_id=ofertas[3].vehiculo_id,
                estado=ViajeEstado.EN_TRANSITO,
                fecha_asignacion=now - timedelta(hours=5),
                fecha_inicio=now - timedelta(hours=3),
            ),
            # Viaje Entregado 1 (Juan Pereyra)
            Viaje(
                carga_id=cargas[4].id,
                oferta_id=ofertas[4].id,
                empresa_id=cargas[4].empresa_id,
                transportista_id=ofertas[4].transportista_id,
                vehiculo_id=ofertas[4].vehiculo_id,
                estado=ViajeEstado.ENTREGADO,
                fecha_asignacion=now - timedelta(days=3),
                fecha_inicio=now - timedelta(days=2, hours=6),
                fecha_entrega=now - timedelta(days=2),
                observaciones="Carga entregada en tiempo y forma. Sin daños.",
            ),
            # Viaje Entregado 2 (Sofia Molina)
            Viaje(
                carga_id=cargas[5].id,
                oferta_id=ofertas[5].id,
                empresa_id=cargas[5].empresa_id,
                transportista_id=ofertas[5].transportista_id,
                vehiculo_id=ofertas[5].vehiculo_id,
                estado=ViajeEstado.ENTREGADO,
                fecha_asignacion=now - timedelta(days=5),
                fecha_inicio=now - timedelta(days=4, hours=4),
                fecha_entrega=now - timedelta(days=4),
                observaciones="Entrega residencial completada correctamente.",
            ),
            # Viaje Grains Asignado (Rutas Serranas)
            Viaje(
                carga_id=cargas[6].id,
                oferta_id=ofertas[6].id,
                empresa_id=cargas[6].empresa_id,
                transportista_id=ofertas[6].transportista_id,
                vehiculo_id=ofertas[6].vehiculo_id,
                estado=ViajeEstado.ASIGNADO,
                fecha_asignacion=now - timedelta(hours=1),
            ),
        ]
        db.add_all(viajes)
        db.flush()

        print("Cargando posiciones de tracking...")
        positions = [
            # Posición normal para viaje 1
            TrackingPosition(
                viaje_id=viajes[0].id,
                transportista_id=viajes[0].transportista_id,
                lat=Decimal("-31.425000"),
                lng=Decimal("-64.250000"),
                velocidad=Decimal("70"),
                timestamp=now - timedelta(minutes=10),
            ),
            # Posición con alerta de desvío para viaje 2
            TrackingPosition(
                viaje_id=viajes[1].id,
                transportista_id=viajes[1].transportista_id,
                lat=Decimal("-31.350000"),
                lng=Decimal("-64.300000"),
                velocidad=Decimal("45"),
                timestamp=now - timedelta(minutes=5),
                alerta_seguridad="Desvío de ruta detectado",
            ),
        ]
        db.add_all(positions)
        db.flush()

        print("Cargando pagos...")
        pagos = [
            Pago(
                viaje_id=viajes[2].id,
                empresa_id=viajes[2].empresa_id,
                transportista_id=viajes[2].transportista_id,
                monto_total=Decimal("180000"),
                comision_plataforma=Decimal("18000"),
                monto_transportista=Decimal("162000"),
                estado=PagoEstado.LIBERADO,
                metodo=PagoMetodo.SIMULADO,
                fecha_pago=now - timedelta(days=1),
            ),
            Pago(
                viaje_id=viajes[3].id,
                empresa_id=viajes[3].empresa_id,
                transportista_id=viajes[3].transportista_id,
                monto_total=Decimal("110000"),
                comision_plataforma=Decimal("11000"),
                monto_transportista=Decimal("99000"),
                estado=PagoEstado.LIBERADO,
                metodo=PagoMetodo.SIMULADO,
                fecha_pago=now - timedelta(days=3),
            ),
        ]
        db.add_all(pagos)
        db.flush()

        print("Cargando calificaciones...")
        calificaciones = [
            Calificacion(
                viaje_id=viajes[2].id,
                autor_usuario_id=pyme_users[0].id,
                receptor_usuario_id=transportista_users[0].id,
                puntaje=5,
                comentario="Juan Pereyra excelente transportista. Muy ordenado y puntual.",
            ),
            Calificacion(
                viaje_id=viajes[3].id,
                autor_usuario_id=pyme_users[0].id,
                receptor_usuario_id=transportista_users[1].id,
                puntaje=4,
                comentario="Sofia Molina entregó correctamente. Cuidado con los horarios de descanso.",
            ),
        ]
        db.add_all(calificaciones)
        db.flush()

        print("Cargando contratos digitales de granos...")
        contratos = [
            # Contrato vinculado a Carga 7 (Arroyo Cabral -> Quequén)
            ContratoGranos(
                carga_id=cargas[6].id,
                numero_contrato="CONTRATO-TRIGO-2026-001",
                fecha_inicio_contrato=now - timedelta(days=10),
                fecha_fin_contrato=now + timedelta(days=20),
                productor_id="CUIT-30-70000003-3",
                productor_nombre="Cooperativa Arroyo Cabral Ltda",
                exportador_id="CUIT-30-50000000-9",
                exportador_nombre="Cargill S.A.",
                tipo_grano="Trigo",
                calidad_grano="Cámara",
                humedad_maxima_permitida=14.0,
                impurezas_maximas_permitidas=2.0,
                planta_procedencia_ruca="RUCA-77777",
                planta_destino_ruca="RUCA-88888",
                cantidad_total_kg=30000.0,
                precio_por_kg=250.0,
            ),
            # Contrato independiente
            ContratoGranos(
                carga_id=None,
                numero_contrato="CONTRATO-SOJA-2026-999",
                fecha_inicio_contrato=now - timedelta(days=15),
                fecha_fin_contrato=now + timedelta(days=15),
                productor_id="CUIT-30-70000003-3",
                productor_nombre="Cooperativa Arroyo Cabral Ltda",
                exportador_id="CUIT-30-99999999-9",
                exportador_nombre="Bunge Argentina S.A.",
                tipo_grano="Soja",
                calidad_grano="Condición Cámara",
                humedad_maxima_permitida=14.5,
                impurezas_maximas_permitidas=2.5,
                planta_procedencia_ruca="RUCA-12345",
                planta_destino_ruca="RUCA-99999",
                cantidad_total_kg=45000.0,
                precio_por_kg=310.0,
            ),
        ]
        db.add_all(contratos)

        db.commit()
        print("Seed cargado correctamente. Base de datos lista.")
    except Exception as e:
        db.rollback()
        print(f"Error al cargar seed: {e}")
        raise e
    finally:
        db.close()


if __name__ == "__main__":
    seed()
