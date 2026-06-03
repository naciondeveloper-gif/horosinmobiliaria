import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const slugify = (text: string) => {
  return text
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();

    const { data: proyectoActualizado, error } = await supabase
      .from('proyectos')
      .update({
        titulo: body.titulo,
        tipo: body.tipo,
        ruta: body.ruta ? slugify(body.ruta) : slugify(body.titulo),
        precio: parseFloat(body.precio),
        imagen: body.imagen,
        imagenes: body.imagenes,
        ubicacion: body.ubicacion,
        descripcion: body.descripcion,
        enlace_mas_info: body.enlace_mas_info,
        metros: body.metros ? parseFloat(body.metros) : null,
        cuartos: body.cuartos ? parseInt(body.cuartos) : null,
        banos: body.banos ? parseInt(body.banos) : null,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ message: 'Proyecto actualizado', proyecto: proyectoActualizado }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const { error } = await supabase
      .from('proyectos')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ message: 'Proyecto eliminado correctamente' }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}