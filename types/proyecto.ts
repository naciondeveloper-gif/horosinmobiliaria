export interface Proyecto {
  id: number;
  titulo: string;
  tipo: string;
  precio: number;
  imagen: string;
  imagenes?: string[];
  ubicacion: string;
  descripcion?: string;
  enlace_mas_info?: string;
  metros?: number;       
  cuartos?: number;      
  banos?: number;        
  ruta: string;
}