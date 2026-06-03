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

export async function GET() {
  try {
    const { data: proyectos, error } = await supabase
      .from('proyectos')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json(proyectos, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { titulo, tipo, precio, imagen, imagenes, ubicacion, descripcion, metros, cuartos, banos, autor_id, enlace_mas_info, ruta } = body;

    if (!titulo || !precio || !ubicacion) {
      return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 });
    }

    const { data: nuevoProyecto, error } = await supabase
      .from('proyectos')
      .insert([{
        titulo,
        tipo,
        ruta: ruta ? slugify(ruta) : slugify(titulo),
        precio: parseFloat(precio),
        imagen,
        imagenes,
        ubicacion,
        descripcion,
        enlace_mas_info,
        metros: metros ? parseFloat(metros) : null,
        cuartos: cuartos ? parseInt(cuartos) : null,
        banos: banos ? parseInt(banos) : null,
        autor_id
      }])
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ message: 'Proyecto creado', proyecto: nuevoProyecto }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}