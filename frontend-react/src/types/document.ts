export interface Document {
  id: string;
  filename: string;
  status: 'Recibido' | 'PROCESSED' | 'Error' | 'FAILED'
  mime_type?: string;
  storage_path?: string;
  created_at: string;
  
}
