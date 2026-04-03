# Compliance Document Platform

Plataforma de microservicios para el procesamiento y validación de documentos bajo estándares de cumplimiento, diseñada para despliegue en Oracle Cloud Infrastructure (OCI).

## Arquitectura del Proyecto

El sistema se compone de varios servicios independientes. Actualmente, el desarrollo se centra en el procesador de documentos.

## Service Document Processor (Python)

Este servicio es el punto de entrada para la gestión de archivos. Utiliza FastAPI para garantizar un alto rendimiento y tipado de datos estricto.

### Características Principales
- **Validación Modular (SRP):** Lógica de validación desacoplada del punto de entrada en `app/utils/validators.py`.
- **Seguridad de Infraestructura:** Aunque no formaba parte de los requerimientos iniciales, se implementó una restricción de **tamaño máximo de 10MB** por archivo para prevenir ataques de denegación de servicio (DoS) y optimizar el almacenamiento.
- **Control de Extensiones:** Sistema flexible basado en listas blancas que permite restringir tipos de archivos (configurado actualmente para permitir todos mediante `*`).
- **Base de Datos Aislada para Pruebas:** Configuración de `pytest` con esquemas dinámicos de PostgreSQL para garantizar que los tests no afecten los datos de desarrollo.

### Estructura del Proyecto

```text
compliance-processor-oci/
├── README.md
└── service-doc-proc/
    ├── app/
    │   ├── main.py            # Endpoints y rutas del servicio
    │   ├── database.py        # Configuración de SQLAlchemy y conexión a DB
    │   └── utils/
    │       └── validators.py  # Lógica de validación de archivos (Tamaño y Tipo)
    ├── tests/
    │   ├── conftest.py        # Configuración de fixtures y aislamiento de DB
    │   └── test_main.py       # Pruebas unitarias e integración
    └── docker-compose.yml
```    

### Gestión de Errores de Carga

El servicio responde con códigos de estado HTTP estandarizados para guiar al usuario:

- `413 Request Entity Too Large`: El archivo excede los 10MB.

- `400 Bad Request`: El archivo no tiene nombre válido o la extensión no está permitida.