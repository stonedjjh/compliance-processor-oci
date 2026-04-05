//Archivo de tipos para la paginación

export type PaginationLimit = 5 | 10 | 50;

export interface PaginationParams {
  skip: number;
  limit: PaginationLimit;
}