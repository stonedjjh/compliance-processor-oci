# Compliance Document Platform

Plataforma de microservicios para el procesamiento y validación de documentos bajo estándares de cumplimiento, diseñada para despliegue en Oracle Cloud Infrastructure (OCI).

## Arquitectura del Proyecto

El sistema se compone de varios servicios independientes. Actualmente, el desarrollo se centra en el procesador de documentos.

## Service Document Processor (Python)

Este servicio es el punto de entrada para la gestión de archivos. Utiliza FastAPI para garantizar un alto rendimiento y tipado de datos estricto.

## Estructura Actual del Proyecto

compliance-processor-oci/
├── README.md
└── service-doc-proc/
    └── main.py

