import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const slugify = (text: string) =>
  text.toLowerCase().trim()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

const num  = (v: any) => v !== null && v !== undefined && v !== '' ? parseFloat(v)  : null;
const int  = (v: any) => v !== null && v !== undefined && v !== '' ? parseInt(v)    : null;
const bool = (v: any) => v !== null && v !== undefined             ? Boolean(v)     : false;
const str  = (v: any) => v || null;
const arr  = (v: any) => Array.isArray(v) && v.length > 0         ? v              : null;

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('proyectos')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const b = await request.json();

    if (!b.titulo || !b.precio || !b.ubicacion) {
      return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('proyectos')
      .insert([{
        titulo:               b.titulo,
        tipo:                 b.tipo,
        ruta:                 b.ruta ? slugify(b.ruta) : slugify(b.titulo),
        precio:               int(b.precio),
        imagen:               str(b.imagen),
        imagenes:             arr(b.imagenes),
        ubicacion:            b.ubicacion,
        descripcion:          str(b.descripcion),
        enlace_mas_info:      str(b.enlace_mas_info),
        metros:               num(b.metros),
        cuartos:              int(b.cuartos),
        banos:                int(b.banos),
        autor_id:             b.autor_id,
        // Campos adicionales
        estado:               b.estado               ?? 'disponible',
        precio_desde:         bool(b.precio_desde),
        area_techada:         num(b.area_techada),
        total_unidades:       int(b.total_unidades),
        garajes:              int(b.garajes),
        pisos_proyectados:    int(b.pisos_proyectados),
        piso:                 int(b.piso),
        total_pisos:          int(b.total_pisos),
        antiguedad:           int(b.antiguedad),
        entrega:              str(b.entrega),
        financiamiento:       bool(b.financiamiento),
        financiamiento_tipo:  str(b.financiamiento_tipo),
        amoblado:             bool(b.amoblado),
        caracteristicas:      arr(b.caracteristicas),
        video_url:            str(b.video_url),
        imagen_mapa:          str(b.imagen_mapa),
        mapa_embed_src:       str(b.mapa_embed_src),
        modelos:              arr(b.modelos),
        landing_proveedor:    str(b.landing_proveedor),
        landing_url:          str(b.landing_url),
        landing_imagen:       str(b.landing_imagen),
        landing_titulo:       str(b.landing_titulo),
        ficha_tecnica_url:     str(b.ficha_tecnica_url),
        ficha_tecnica_label:   str(b.ficha_tecnica_label),
        ficha_tecnica_2_url:   str(b.ficha_tecnica_2_url),
        ficha_tecnica_2_label: str(b.ficha_tecnica_2_label),
      }])
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ message: 'Proyecto creado', proyecto: data }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
