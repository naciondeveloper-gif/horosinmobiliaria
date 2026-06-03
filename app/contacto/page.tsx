'use client';

import { useState } from 'react';
import { FaClock, FaPhoneAlt } from "react-icons/fa";
import { ImLocation2 } from "react-icons/im";
import { RiMailSendLine } from "react-icons/ri";
import { FiMail } from "react-icons/fi";

export default function Contacto() {
  const [formData, setFormData] = useState({
    nombre: '',
    correo: '',
    telefono: '',
    interes: 'General',
    mensaje: ''
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'success' | 'error' | null>(null);

const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
  setFormData({
    ...formData,
    [e.target.name]: e.target.value
  });
};

const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  setLoading(true);
  setStatus(null);

    try {
      const response = await fetch('/api/contacto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setStatus('success');
        setFormData({ nombre: '', correo: '', telefono: '', interes: 'General', mensaje: '' });
      } else {
        setStatus('error');
      }
    } catch (error) {
      setStatus('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-6xl mx-auto py-12 px-6 w-full flex-1 grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="flex flex-col gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-100">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Contáctanos</h2>
          <p className="text-sm text-gray-500 mb-6">¿Interesado en algún proyecto? Nuestro equipo te responderá de inmediato.</p>
          
          <div className="flex flex-col gap-5">
            <div className="flex gap-3 items-center">
              <div className="text-xl text-horosblue mt-0.5"><ImLocation2 /></div>
              <div>
                <h4 className="font-bold text-sm text-slate-900">Oficina Principal</h4>
                <p className="text-xs text-gray-600 mb-1"> <strong>Calle Santa María 342 </strong> Urb. La Merced, Trujillo</p>
                <p className="text-xs text-gray-600"> <strong>Calle Piura 360 </strong> Urb. Surquillo, Miraflores</p>
              </div>
            </div>
            <div className="flex gap-3 items-center">
              <div className="text-xl text-horosblue mt-0.5"><FaPhoneAlt /></div>
              <div>
                <h4 className="font-bold text-sm text-slate-900">Teléfonos de Atención</h4>
                <p className="text-xs text-gray-600">+51 (044) 269134 / +51 971 000 482</p>
              </div>
            </div>
            <div className="flex gap-3 items-center">
              <div className="text-xl text-horosblue mt-0.5"><RiMailSendLine /></div>
              <div>
                <h4 className="font-bold text-sm text-slate-900">Correo Electrónico</h4>
                <p className="text-xs text-gray-600">info@horosinmobiliaria.com</p>
              </div>
            </div>
          </div>
        </div>
        <div className="z-0 relative text-white bg-[#C9B606] font-bold p-6 rounded-lg shadow-md  flex flex-col gap-2 hover:scale-105 transition-transform">
          <FaClock className='w-full h-full absolute top-0 left-0 -z-20 text-gray-100/20'></FaClock>
          <h4 className="font-bold text-sm text-[#2A6874] flex gap-2 items-center"> Horario de Atención</h4>
          <p className="text-xs">Lunes a Viernes: 9:00 AM - 5:30 PM</p>
          <p className="text-xs">Sábados: 9:00 AM - 1:00 PM</p>
        </div>
      </div>
      <div className="bg-white p-8 rounded-lg shadow-sm border border-slate-100 lg:col-span-2 flex flex-col justify-between">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <h3 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-3 mb-2 flex gap-2 items-center"><FiMail className='text-3xl' /> Déjanos un mensaje para contactarnos contigo</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-600">Nombre completo</label>
              <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} required placeholder="Juan Pérez"
                className="border border-gray-300 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-600" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-600">Correo Electrónico</label>
              <input type="email" name="correo" value={formData.correo} onChange={handleChange} required placeholder="juan@gmail.com"
                className="border border-gray-300 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-600" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-600">Teléfono / WhatsApp</label>
              <input type="tel" name="telefono" value={formData.telefono} onChange={handleChange} placeholder="945837261"
                className="border border-gray-300 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-600" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-600">Proyecto de Interés</label>
              <select name="interes" value={formData.interes} onChange={handleChange} className="border border-gray-300 rounded-md py-2 px-3 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-600 cursor-pointer">
                <option value="General">Consulta General</option>
                {}
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-600">Mensaje</label>
            <textarea name="mensaje" value={formData.mensaje} onChange={handleChange} rows={4} placeholder="Escribe aquí tus dudas..."
              className="border border-gray-300 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-600 resize-none"></textarea>
          </div>
          <div className="flex justify-center">
            <button type="submit" disabled={loading} className="relative bg-horosblue text-white font-bold py-2.5 rounded-md shadow-sm flex justify-center items-center gap-2 text-sm mt-1 disabled:opacity-50 hover:bg-horosblue/80 transition-colors w-30 text-center px-4">
              {loading ? 'Enviando...' : 'Enviar'}
            </button>
          </div>
        </form>
        {status === 'success' && (
          <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-center rounded-md text-sm font-medium">
            ¡Gracias por comunicarte con nosotros!
          </div>
        )}

        {status === 'error' && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-800 text-center rounded-md text-sm font-medium">
            Hubo un problema al procesar el envío. Por favor, inténtalo más tarde.
          </div>
        )}
      </div>

      <section className="col-span-full h-80 bg-slate-200 border-t border-slate-200 relative mt-4 rounded-lg overflow-hidden">
        <iframe 
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d246.85878095733!2d-79.03732003678503!3d-8.127881356018438!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x91ad3d6deea5c315%3A0xba29db27245fd5e2!2sHoros%20Inmobiliaria!5e0!3m2!1ses-419!2spe!4v1780420230826!5m2!1ses-419!2spe" 
          className="w-full h-full border-0" 
          allowFullScreen={true} 
          loading="lazy" 
          referrerPolicy="no-referrer-when-downgrade">
        </iframe>
      </section>
    </main>
  );
}