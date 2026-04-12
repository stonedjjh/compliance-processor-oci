import httpx
import os
import logging
from dataclasses import dataclass

# La URL interna del BFF dentro de la red de Docker
BFF_URL = os.getenv("BFF_INTERNAL_URL", "http://bff_node_app:4000")


@dataclass
class DocumentLog:
    document_id: str
    status: str
    message: str
    filename: str | None = None


async def notify_document_processed(new_notification: DocumentLog):
    url = f"{BFF_URL}/api/v1/webhooks/processing-complete"
    payload = {
        "documentId": new_notification.document_id,
        "status": new_notification.status,
        "message": new_notification.message,
        "filename": new_notification.filename,
    }

    async with httpx.AsyncClient() as client:
        try:
            # Enviamos la notificación al BFF
            response = await client.post(url, json=payload, timeout=5.0)
            response.raise_for_status()
            logging.info(
                f"Notificación enviada al BFF para el doc {new_notification.document_id}: {response.status_code}"
            )
        except Exception as e:
            logging.error(f"Error al notificar al BFF: {e}")
