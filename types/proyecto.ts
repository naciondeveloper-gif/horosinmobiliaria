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

  // Datos adicionales inmobiliarios
  estado?: 'disponible' | 'reservado' | 'vendido';
  precio_desde?: boolean;       // true → muestra "Desde S/. X"
  area_techada?: number;        // m² construidos / área techada
  area_construida?: number;     // columna legacy — se usa como fallback de area_techada
  total_unidades?: number;      // nº total de lotes/unidades en el conjunto
  garajes?: number;
  pisos_proyectados?: number;   // pisos actuales o proyectados (lotes/casas nuevas)
  piso?: number;                // número de piso (departamentos)
  total_pisos?: number;         // total de pisos del edificio (departamentos)
  antiguedad?: number;          // años (0 = obra nueva) — relevante para reventa
  entrega?: string;
  financiamiento?: boolean;
  financiamiento_tipo?: string; // ej. "FOVIME", "MIVIVIENDA", "Banco"
  amoblado?: boolean;
  caracteristicas?: string[];
  video_url?: string;
  imagen_mapa?: string;        // URL de imagen estática del mapa/plano de ubicación
  mapa_embed_src?: string;     // src del iframe de Google Maps personalizado
  landing_proveedor?: string;  // 'neptuno' | null — activa la sección inmersiva del proveedor
  ficha_tecnica_url?: string;  // URL al PDF descargable de la ficha técnica
}
