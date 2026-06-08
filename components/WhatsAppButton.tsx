'use client';
import { useWhatsApp } from '@/context/WhatsAppContext';
import { FaWhatsapp } from 'react-icons/fa';

const PHONE = '51971000482';

export default function WhatsAppButton() {
  const { proyecto } = useWhatsApp();

  const mensaje = proyecto
    ? `Hola, vi el inmueble *"${proyecto.titulo}"* ubicado en *${proyecto.ubicacion}* (Ref. #${proyecto.id}) en horosinmobiliaria.com y me gustaría recibir más información. ¿Me pueden orientar?`
    : 'Hola, visité *horosinmobiliaria.com* y me gustaría recibir información sobre sus proyectos disponibles.';

  const href = `https://wa.me/${PHONE}?text=${encodeURIComponent(mensaje)}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Contactar por WhatsApp"
      className="boton-whatsapp-flotante group fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-lg shadow-green-900/30 transition-transform duration-200 hover:scale-110 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-green-400/60"
      style={{ backgroundColor: '#25D366' }}
    >
      <span
        aria-hidden="true"
        className="absolute inset-0 animate-ping rounded-full bg-green-400 opacity-20"
      />

      <FaWhatsapp className='w-8 h-8 text-white' />

      <span className="pointer-events-none absolute right-16 top-1/2 hidden -translate-y-1/2 whitespace-nowrap rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white opacity-0 shadow-md transition-opacity duration-200 group-hover:opacity-100 md:block">
        {proyecto ? `Consultar: ${proyecto.titulo}` : 'Escríbenos por WhatsApp'}
        <span
          aria-hidden="true"
          className="absolute right-0 top-1/2 h-2 w-2 -translate-y-1/2 translate-x-1/2 rotate-45 bg-slate-900"
        />
      </span>
    </a>
  );
}
