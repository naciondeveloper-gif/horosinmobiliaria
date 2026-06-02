import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import bcrypt from 'bcryptjs';

// GET: Listar todos los usuarios asesores (ocultando el hash de la contraseña por seguridad)
export async function GET() {
  try {
    const { data: usuarios, error } = await supabase
      .from('usuarios')
      .select('id, email, nombre, rol, created_at')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json(usuarios, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: Crear un nuevo usuario / asesor con contraseña encriptada
export async function POST(request: Request) {
  try {
    const { email, password, nombre, rol } = await request.json();

    if (!email || !password || !nombre) {
      return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);
    const { data: nuevoUsuario, error } = await supabase
      .from('usuarios')
      .insert([{
        email,
        password_hash,
        nombre,
        rol: rol || 'asesor'
      }])
      .select('id, email, nombre, rol, created_at')
      .single();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: 'El correo electrónico ya está registrado' }, { status: 400 });
      }
      throw error;
    }

    return NextResponse.json({ message: 'Usuario registrado con éxito', user: nuevoUsuario }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}