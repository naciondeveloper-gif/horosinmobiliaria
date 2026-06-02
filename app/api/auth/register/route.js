import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  try {
    const { email, password, nombre, rol } = await request.json();

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const { data, error } = await supabase
      .from('usuarios')
      .insert([{ email, password_hash, nombre, rol: rol || 'asesor' }])
      .select();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: 'El correo ya está registrado' }, { status: 400 });
      }
      throw error;
    }

    return NextResponse.json({ creado: true, user: data[0] }, { status: 201 });

  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}