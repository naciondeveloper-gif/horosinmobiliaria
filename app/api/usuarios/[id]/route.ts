import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import bcrypt from 'bcryptjs';

// PUT: Actualizar datos del usuario
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { email, nombre, rol, password } = body;

    const datosActualizar: any = {
      email,
      nombre,
      rol
    };

    if (password && password.trim() !== '') {
      const salt = await bcrypt.genSalt(10);
      datosActualizar.password_hash = await bcrypt.hash(password, salt);
    }

    const { data: usuarioActualizado, error } = await supabase
      .from('usuarios')
      .update(datosActualizar)
      .eq('id', id)
      .select('id, email, nombre, rol, created_at')
      .single();

    if (error) throw error;

    return NextResponse.json({ message: 'Usuario actualizado correctamente', user: usuarioActualizado }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const { error } = await supabase
      .from('usuarios')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ message: 'Usuario eliminado de la base de datos' }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}