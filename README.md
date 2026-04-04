# Compliance Document Platform

Plataforma de microservicios para el procesamiento y validación de documentos bajo estándares de cumplimiento, diseñada para despliegue en Oracle Cloud Infrastructure (OCI).

## Arquitectura del Proyecto

El sistema se compone de varios servicios independientes. Actualmente, el desarrollo se centra en el procesador de documentos.

- **Segmentación de Redes (DMZ):** Se han implementado dos redes virtuales aisladas. Una frontend-network (zona desmilitarizada) donde residirá el BFF, y una backend-network (privada) donde operan el núcleo y las bases de datos, manteniéndolas invisibles al tráfico externo.

- **PostgreSQL (Fuente de Verdad)**: Gestiona el estado transaccional de los documentos (Upload, Processed, Failed) garantizando consistencia ACID.

- **MongoDB (Motor de Auditoría)**: Almacena un historial inmutable de eventos. Al desacoplar los logs de la base de datos relacional, el sistema permite auditorías complejas sin penalizar el rendimiento del core de negocio.

- **Resiliencia Nativa:** Implementación de patrones de Rollback transaccional y bloques de captura de errores que aseguran que ningún fallo de infraestructura deje el sistema en un estado inconsistente.

- **Orquestación Basada en Salud (Self-Healing Design):** El arranque de la aplicación FastAPI (doc_processor_app) está orquestado mediante Healthchecks avanzados. Utiliza su propio endpoint /api/v1/health para validar la conectividad real con PostgreSQL y MongoDB antes de considerarse "sana", garantizando que los servicios dependientes nunca intenten conectar a una infraestructura no operativa.

## Service Document Processor (Python)

Este servicio es el punto de entrada para la gestión de archivos. Utiliza FastAPI para garantizar un alto rendimiento y tipado de datos estricto.

### Características Principales
- **Validación Modular (SRP):** Lógica de validación desacoplada del punto de entrada en `app/utils/validators.py`.
- **Seguridad de Infraestructura:** Aunque no formaba parte de los requerimientos iniciales, se implementó una restricción de **tamaño máximo de 10MB** por archivo para prevenir ataques de denegación de servicio (DoS) y optimizar el almacenamiento.
- **Observabilidad (Health Checks):** Endpoint dinámico /api/v1/health que monitorea en tiempo real la conectividad de PostgreSQL y MongoDB, devolviendo estados 503 ante fallos de infraestructura.
- **Control de Extensiones:** Sistema flexible basado en listas blancas que permite restringir tipos de archivos (configurado actualmente para permitir todos mediante `*`).
- **Base de Datos Aislada para Pruebas:** Configuración de `pytest` con esquemas dinámicos de PostgreSQL para garantizar que los tests no afecten los datos de desarrollo.

> [!IMPORTANT]
> Observación de Integridad: Se identificó la necesidad de un sistema de detección de duplicados de documentos (vía hash SHA-256) para optimizar el almacenamiento. Se ha priorizado la arquitectura de servicios core, dejando esta funcionalidad como una mejora incremental planificada.

### Estructura del Proyecto

```text
compliance-processor-oci/
├── service-doc-proc/
│   ├── app/
│   │   ├── internal/
│   │   │   └── mongodb.py    # Cliente NoSQL asíncrono (Motor) y auditoría
│   │   ├── main.py            # Endpoints, lógica de negocio y Health Checks
│   │   ├── database.py        # SQLAlchemy, Sesiones y Health Check SQL
│   │   ├── models.py          # Modelos relacionales (PostgreSQL)
│   │   └── utils/
│   │       └── validators.py  # Validación de archivos (SRP)
│   ├── tests/
│   │   ├── conftest.py        # Fixtures y mocks de entorno
│   │   └── test_main.py       # Pruebas unitarias e integración
│   └── docker-compose.yml     # Orquestación (App + Postgres + MongoDB)
```    

### Gestión de Errores y Estados

El servicio utiliza códigos de estado HTTP estandarizados para una integración consistente:

|Código|Razón|Acción de Auditoría|
|:---|:---|:---|
|201| Created|Carga exitosa|DOCUMENT_UPLOADED|
|200| OK|Procesamiento exitoso|DOCUMENT_PROCESSED|
|409| Conflict|Documento duplicado|DUPLICATE_UPLOAD_ATTEMPT|
|413| Entity Too Large|Excede los 10MB|Log de seguridad interno|
|503| Service Unavailable|Base de datos caída|Reportado por Health Check|

### Ejecución de Pruebas

Para garantizar la integridad del código, puedes ejecutar la suite de pruebas unitarias e integración directamente dentro del contenedor de la aplicación.

Usa el siguiente comando desde la raíz del proyecto `service-doc-proc`:

```bash
docker exec -it doc_processor_app pytest tests/test_main.py
```
<p align="center">
  <img src="./image/document_processor_text_result.png" width="800" alt="Resultado de Tests Pytest">
</p>

### Observaciones y Justificaciones de Diseño

- **Patrón Adapter**: Se ha implementado el Patrón Adapter en los clientes de base de datos (app/database.py para SQL y app/internal/mongodb.py para NoSQL). Esto permite que, si en el futuro se decide cambiar SQLAlchemy o el driver de Mongo, la lógica de negocio en main.py permanezca inalterada, modificando únicamente la implementación del adaptador.

- **Organización DDD**: Se ha considerado una estructura basada en DDD (Domain-Driven Design), pero dado el tamaño y alcance actual de este servicio único, se ha optado por una estructura modular más ligera para evitar sobreingeniería, priorizando la claridad y la rapidez de desarrollo.