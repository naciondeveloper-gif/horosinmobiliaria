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

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const b = await request.json();

    const { data, error } = await supabase
      .from('proyectos')
      .update({
        titulo:               b.titulo,
        tipo:                 b.tipo,
        ruta:                 b.ruta ? slugify(b.ruta) : slugify(b.titulo),
        precio:               num(b.precio),
        imagen:               b.imagen  ?? undefined,
        imagenes:             b.imagenes ?? undefined,
        ubicacion:            b.ubicacion,
        descripcion:          str(b.descripcion),
        enlace_mas_info:      str(b.enlace_mas_info),
        metros:               num(b.metros),
        cuartos:              int(b.cuartos),
        banos:                int(b.banos),
        // Campos adicionales
        estado:               b.estado               ?? 'disponible',
        precio_desde:         bool(b.precio_desde),
        area_techada:         int(b.area_techada),
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
        landing_proveedor:    str(b.landing_proveedor),
        ficha_tecnica_url:    str(b.ficha_tecnica_url),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ message: 'Proyecto actualizado', proyecto: data }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { error } = await supabase.from('proyectos').delete().eq('id', id);
    if (error) throw error;
    return NextResponse.json({ message: 'Proyecto eliminado correctamente' }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
