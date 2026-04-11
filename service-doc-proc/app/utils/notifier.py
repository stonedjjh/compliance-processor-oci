import httpx
import os
import logging

# La URL interna del BFF dentro de la red de Docker
BFF_URL = os.getenv("BFF_INTERNAL_URL", "http://bff_node_app:4000")


async def notify_document_processed(document_id: str, status: str, message: str, filename: str = "Nuevo Archivo"):
    url = f"{BFF_URL}/api/v1/webhooks/processing-complete"
    payload = {"documentId": document_id, "status": status, "message": message, "filename":filename}

    async with httpx.AsyncClient() as client:
        try:
            # Enviamos la notificación al BFF
            response = await client.post(url, json=payload, timeout=5.0)
            response.raise_for_status()
            logging.info(f"Notificación enviada al BFF para el doc {document_id}")
        except Exception as e:
            logging.error(f"Error al notificar al BFF: {e}")
