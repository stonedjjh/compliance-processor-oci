import { Request, Response } from 'express';
import { DocumentAdapter } from '../adapters/document.adapter';
import { PaginationLimit } from '../types/pagination.types';

const docAdapter = new DocumentAdapter();

export const uploadDocument = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se detectó ningún archivo' });
    }

    const result = await docAdapter.uploadDocument(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype
    );

    res.status(201).json(result);
  } catch (error: any) {
    res.status(500).json({ 
      error: 'Error en el orquestador BFF',
      details: error.message 
    });
  }
};

export const getAllDocuments = async (req: Request, res: Response) => {
  try {
    
    const page = parseInt(req.query.page as string) || 1;
    const limitInput = parseInt(req.query.limit as string) || 10;

   
    let limit: PaginationLimit = 10;
    if ([5, 10, 50].includes(limitInput)) {
      limit = limitInput as PaginationLimit;
    }

    
    const data = await docAdapter.getDocuments(page, limit);

    
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ 
      error: 'Error al recuperar la lista de documentos',
      details: error.message 
    });
  }
};


export const getOneDocument = async (req: Request, res: Response) => {
  try {
  
    const  id  = req.params.id as string;;
  
    if (!id) {
      return res.status(400).json({ error: 'El ID del documento es obligatorio' });
    }
    
    const data = await docAdapter.getDocumentById(id);

    res.json(data);
  } catch (error: any) {
    // Si el adapter lanza error (ej: 404), lo capturamos aquí
    res.status(404).json({ 
      error: 'No se encontró el documento o hubo un error en la búsqueda',
      details: error.message 
    });
  }
};

export const processDocument = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;

    if (!id) {
      return res.status(400).json({ error: 'ID requerido para procesar' });
    }

    const data = await docAdapter.processDocument(id);
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};