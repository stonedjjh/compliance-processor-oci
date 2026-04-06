export interface Document {
  id: string;
  filename: string;
  status: 'PENDING' | 'PROCESSED' | 'FAILED';
  mime_type: string;
  storage_path: string;
  created_at: string;
}
