import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { nombre, correo, telefono, interes, mensaje } = data;

    const { error: supabaseError } = await supabase
      .from('leads')
      .insert([
        {
          nombre,
          correo: correo.trim().toLowerCase(),
          telefono: telefono || null,
          interes,
          mensaje,
        }
      ]);
    if (supabaseError) {
      console.error('Error al guardar el lead en Supabase:', supabaseError);
    }

    const transporter = nodemailer.createTransport({
      host: 'horosinmobiliaria.com',
      port: 465,                     
      secure: true,                  
      auth: {
        user: 'info@horosinmobiliaria.com', 
        pass: 'Horos2026*'
      }     
    });

    const mailOptions = {
      from: `"Horos Inmobiliaria" <info@horosinmobiliaria.com>`, 
      to: 'info@horosinmobiliaria.com',                         
      replyTo: correo.trim().toLowerCase(),                     
      subject: `Nuevo Prospecto: Interesado en ${interes} — ${nombre}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
          <div style="background-color: #0f172a; padding: 24px; text-align: center;">
            <h2 style="color: #f59e0b; margin: 0; font-size: 20px; font-weight: 800; letter-spacing: -0.5px;">HOROS INMOBILIARIA</h2>
            <p style="color: #94a3b8; margin: 4px 0 0 0; font-size: 12px; font-weight: bold; text-transform: uppercase;">Alerta de Contacto Web</p>
          </div>
          
          <div style="padding: 24px; background-color: #ffffff;">
            <h3 style="color: #1e293b; margin-top: 0; margin-bottom: 16px; font-size: 16px; border-bottom: 1px solid #f1f5f9; padding-bottom: 8px;">Datos del Cliente</h3>
            
            <table style="width: 100%; border-collapse: collapse; font-size: 14px; color: #334155;">
              <tr>
                <td style="padding: 6px 0; font-weight: bold; width: 140px;">Nombre completo:</td>
                <td style="padding: 6px 0;">${nombre}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-weight: bold;">Correo:</td>
                <td style="padding: 6px 0;"><a href="mailto:${correo.trim().toLowerCase()}" style="color: #b45309; text-decoration: none;">${correo.trim().toLowerCase()}</a></td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-weight: bold;">Teléfono:</td>
                <td style="padding: 6px 0;">${telefono || 'No especificado'}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-weight: bold;">Interés / Proyecto:</td>
                <td style="padding: 6px 0;"><span style="background-color: #fef3c7; color: #92400e; padding: 2px 8px; border-radius: 4px; font-weight: bold; font-size: 12px;">${interes}</span></td>
              </tr>
            </table>

            <h3 style="color: #1e293b; margin-top: 24px; margin-bottom: 12px; font-size: 16px; border-bottom: 1px solid #f1f5f9; padding-bottom: 8px;">Mensaje o Consulta:</h3>
            <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 16px; border-radius: 6px; font-style: italic; color: #475569; font-size: 14px; line-height: 1.5; white-space: pre-line;">
              "${mensaje}"
            </div>
          </div>

          <div style="background-color: #f1f5f9; padding: 12px; text-align: center; border-top: 1px solid #e2e8f0;">
            <span style="font-size: 10px; color: #94a3b8;">Este correo fue generado de manera automática por el formulario de la página web de Horos.</span>
          </div>
        </div>
      `,
    };

    // 3. Envío asíncrono
    await transporter.sendMail(mailOptions);

    return NextResponse.json({ message: 'Correo enviado con éxito.' }, { status: 200 });

  } catch (error: any) {
    console.error('Error en Nodemailer:', error);
    return NextResponse.json({ error: 'No se pudo enviar el correo.', detalles: error.message }, { status: 500 });
  }
}