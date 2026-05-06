# Registro de decisiones arquitectónicas (ADR)

## 1. Implementación de Alembic para el control de versiones de la base de datos

### Fecha

2026-04-28

### Estatus

Aceptado

### Contexto

El proyecto requiere una estructura de datos evolutiva que permita integrar tablas complejas, como la tabla de `users` (necesaria para el sistema de login y autenticación) y la tabla de `documents`. Gestionar estos cambios mediante scripts SQL manuales es propenso a errores y dificulta la sincronización entre el entorno de desarrollo local y el contenedor de Docker.

### Decisión

Se seleccionó Alembic como herramienta de gestión de migraciones para SQLAlchemy. Esto permite definir el esquema de la base de datos directamente en los modelos de Python y generar "snapshots" o revisiones automáticas que documentan cada cambio en la estructura.

### Consecuencias

- Positivas: Control total sobre el historial de la base de datos, capacidad de revertir cambios (rollback) y garantía de que cualquier desarrollador o máquina que clone el repositorio tendrá exactamente la misma estructura de tablas.
- Negativas: Requiere una configuración inicial del entorno y una disciplina estricta para generar y revisar los archivos de migración antes de aplicarlos.

## 2. Ejecución asíncrona de migraciones en el arranque del servicio

### Fecha

2026-04-29

### Estatus

Aceptado

### Contexto

Al integrar la ejecución automática de las migraciones de Alembic dentro del evento `lifespan` de FastAPI, se detectó que el proceso síncrono bloqueaba el hilo principal (Event Loop). Esto impedía que el servidor Uvicorn terminara de arrancar, causando que el sistema se reportara como no disponible y fallaran los healthchecks.

### Decisión

Se decidió encapsular la llamada de Alembic en un subproceso asíncrono utilizando `asyncio.create_subprocess_exec`. Esto permite que la aplicación inicie el proceso de migración y continúe con su propio arranque sin esperar a que la base de datos termine de responder, permitiendo la comunicación inmediata con otros servicios como el BFF.

### Consecuencias

- Positivas: El arranque del ecosistema de contenedores es fluido y no bloqueante. Se capturan y visualizan los logs de la migración en tiempo real dentro de la salida estándar de Docker.
- Negativas: Se introduce la gestión de procesos del sistema operativo dentro del código de la aplicación, lo que requiere un manejo cuidadoso de las excepciones y códigos de retorno.

## 3. Organización modular del modelo de dominio (Paquete 'models/')

### Fecha

2026-04-29

### Estatus

Aceptado

### Contexto

Inicialmente, todos los modelos de base de datos residían en un único archivo `models.py`. Con la inclusión de tablas para usuarios, documentos y futuras entidades del Proyecto Ambición, este archivo se estaba volviendo difícil de mantener y propenso a errores de importación circular al definir relaciones entre entidades.

### Decisión

Se decidió transformar `models.py` en un paquete Python (`app/models/`). Cada entidad principal tiene ahora su propio archivo (ej. `user.py`, `document.py`) y se centralizan las exportaciones en `app/models/__init__.py`.

### Consecuencias

- Positivas: Organización clara y cumplimiento del principio de Responsabilidad Única. Facilita la navegación del código y permite que el esquema de la base de datos crezca de forma ordenada.
- Negativas: Requiere un paso adicional de registro en el `__init__.py` para que SQLAlchemy y Alembic reconozcan los modelos durante el autogenerate.

## 4. Modelo de empaquetado basado en Registro de Contenedores (Registry-First) para compliance-processor

### Fecha

2026-05-01

### Estatus

Aceptado

### Contexto

El flujo tradicional de despliegue mediante la compilación de código fuente directamente en el servidor genera inconsistencias de entorno y consume recursos de cómputo innecesarios. Se requiere que el entorno de producción actúe exclusivamente como un ejecutor de artefactos inmutables.

### Decisión

Se adopta una arquitectura de empaquetado distribuido para el sistema compliance-processor:

1. Desacoplamiento de Artefactos: Cada servicio (bff-node, frontend-react, service-doc-proc) tendrá su propio Dockerfile y su propia imagen independiente.
2. Inmutabilidad: El despliegue se realizará mediante la descarga de imágenes versionadas, eliminando la directiva 'build' en producción.
3. Estrategia de Frontend: El artefacto se empaqueta como un servidor de archivos estáticos (Nginx) para eliminar procesos de desarrollo en ejecución.
4. Orquestación: Los servicios de infraestructura se consumen desde registros oficiales sin modificaciones.

### Consecuencias

- Positivas: Despliegue atómico y capacidad de rollback inmediato.
- Negativas: Aumento en la complejidad inicial de la automatización del CI/CD.

## 5. Estrategia Multi-arquitectura (x86_64 / ARM64) para OCI Ampere

### Fecha

2026-05-01

### Estatus

En revisión (Rama: feature/multi-arch-support)

### Contexto

La infraestructura de despliegue en Oracle Cloud Infrastructure (OCI) utiliza instancias Ampere basadas en arquitectura ARM64, mientras que el entorno de desarrollo y los corredores estándar de GitHub Actions operan sobre x86_64 (AMD64). Una imagen construida exclusivamente para x86_64 no es compatible con el hardware de producción.

### Decisión

Se implementa un flujo de construcción híbrido para compliance-processor utilizando Docker Buildx y QEMU:

1. Emulación de Hardware: Configuración de QEMU en el pipeline para permitir que los corredores de GitHub emulen instrucciones ARM64.
2. Manifiestos de Imagen: Generación de un manifiesto único que agrupa ambas arquitecturas bajo la misma etiqueta (tag).
3. Optimización de Despliegue: Al ejecutar docker pull en la instancia de OCI, el motor detectará la arquitectura ARM64 y descargará la capa correspondiente de forma automática.

### Consecuencias

- Positivas: Compatibilidad garantizada con el hardware de alto rendimiento de OCI y paridad absoluta entre los entornos de desarrollo y producción.
- Negativas: Incremento en los tiempos de ejecución del CI/CD debido a la sobrecarga de emulación durante el proceso de empaquetado.

## 6. Estrategia de Despliegue Continuo (CD) mediante SSH y GitHub Actions

### Fecha

2026-05-04

### Estatus

En progreso

### Contexto

Tras estabilizar la construcción de imágenes multi-arquitectura, el proceso de actualización en la instancia de OCI sigue siendo manual (requiere conexión vía PuTTY y ejecución de comandos manuales). Esto introduce latencia en la entrega y aumenta el riesgo de error humano.

### Decisión

Se implementa un pipeline de Continuous Deployment (CD) basado en el patrón "Push":

1. Autenticación: Uso de llaves OpenSSH almacenadas en GitHub Secrets para acceso seguro a la instancia de OCI.
2. Orquestación: Extensión del workflow de GitHub Actions para disparar un job de despliegue tras el éxito de la construcción.
3. Inmutabilidad: El servidor de producción solo realizará acciones de 'pull' y 'up', eliminando procesos de compilación locales.

### Consecuencias

- Positivas: Despliegue automático al hacer push, trazabilidad total y reducción del MTTR (Mean Time To Recovery).
- Negativas: Dependencia de la disponibilidad de la API de GitHub para ejecutar el despliegue.

## 7. Esquema de Autenticación mediante JWT y Hashing Directo con Bcrypt

### Fecha

2026-05-06

### Estatus

Aceptado

### Contexto

Con la arquitectura distribuida (React, BFF en Node.js y Core en Python), el sistema requiere un mecanismo de autenticación persistente y sin estado (stateless). Además, se identificó una incompatibilidad crítica entre las librerías de abstracción (Passlib) y las versiones modernas de Python/Bcrypt, lo que generaba errores de desbordamiento de memoria (72 bytes) y fallos en la detección de versiones de la librería.

### Decisión

Se implementó un flujo de identidad basado en dos pilares:

1. **Hashing de Contraseñas**: Migración de Passlib a una implementación directa de `bcrypt` en el Core de Python. Se estableció un truncado manual preventivo a 72 bytes para garantizar la integridad del algoritmo Blowfish y asegurar la compatibilidad total entre los entornos de desarrollo y producción.
2. **Tokens de Acceso**: Uso de JSON Web Tokens (JWT) para la gestión de sesiones. El BFF (Node.js) actúa como emisor y firmante de los tokens tras validar las credenciales contra el Core, permitiendo que el Frontend almacene la identidad de forma segura y la adjunte en las cabeceras de autorización de las peticiones subsiguientes.

### Consecuencias

- Positivas: Eliminación de errores de compatibilidad por dependencias de terceros (Passlib), autenticación stateless que facilita el escalado horizontal y una separación clara de responsabilidades entre el servicio de validación (Python) y el emisor de tokens (Node.js).
- Negativas: El manejo de la invalidación de tokens (logout) debe gestionarse exclusivamente en el cliente mediante la limpieza de almacenamiento local, a menos que se implemente una lista negra (blacklist) en el servidor.
