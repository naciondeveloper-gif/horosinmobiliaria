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
  modelos?: ModeloData[];      // modelos de casas con datos estructurados
  landing_proveedor?: string;  // 'neptuno' | null — activa la sección inmersiva del proveedor
  landing_url?: string;        // URL a la que redirige el landing embebido
  landing_imagen?: string;     // URL de la imagen del landing embebido
  landing_titulo?: string;     // título del landing embebido
  ficha_tecnica_url?: string;  // URL al PDF descargable de la ficha técnica
  ficha_tecnica_label?: string; // etiqueta del PDF (ej. "Brochure", "Planos")
  ficha_tecnica_2_url?: string; // URL al segundo PDF descargable
  ficha_tecnica_2_label?: string; // etiqueta del segundo PDF (ej. "Brochure", "Planos")
}

export interface ModeloAmpliacion {
  descripcion?: string;
  area?: number;
  pisos?: number;
  imagenes: string[];
}

export interface ModeloData {
  titulo: string;
  descripcion?: string;
  precio?: number;
  area?: number;
  dormitorios?: number;
  banos?: number;
  portada?: string;
  imagenes: string[];
  ampliacion?: ModeloAmpliacion;
}
