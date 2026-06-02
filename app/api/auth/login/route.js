import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    const { data: usuario, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !usuario) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 401 });
    }

    const passwordCorrecto = await bcrypt.compare(password, usuario.password_hash);

    if (!passwordCorrecto) {
      return NextResponse.json({ error: 'Contraseña incorrecta' }, { status: 401 });
    }

    const { password_hash, ...datosSeguros } = usuario;
    return NextResponse.json({ user: datosSeguros }, { status: 200 });

  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}