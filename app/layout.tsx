import type { Metadata } from 'next';
import './globals.css';
import Link from 'next/link';
import Image from 'next/image';
import {Roboto} from 'next/font/google';
import { FaMailBulk, FaPhone } from 'react-icons/fa';
import {FaExternalLinkAlt} from 'react-icons/fa';

export const metadata: Metadata = {
  title: 'Horos Inmobiliaria | Venta y Alquiler',
  description: 'Venta y alquiler de inmuebles',
};

const roboto = Roboto({
  subsets: ['latin'],
  variable: '--font-roboto',
  weight: ['400', '500', '700', '900'],
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${roboto.variable}`}>
      <body className="text-slate-700 antialiased flex flex-col min-h-screen">
        <nav className="print:hidden bg-white/80 shadow-sm border-b border-slate-100 sticky top-0 z-50 py-4 px-6 flex justify-between items-center backdrop-blur-sm">
          <Link href="/" className="flex items-center gap-2">
            <img src="/img/horos-inmobiliaria.png" alt="Horos Logo" className="h-12" />
          </Link>
          <div className="hidden md:flex items-center gap-6 font-medium text-slate-600 text-sm">
            <Link href="/" className="hover:text-horosblue transition-colors">Inicio</Link>
            <Link href="/nosotros" className="hover:text-horosblue transition-colors">Nosotros</Link>
            <Link href="/contacto" className="hover:text-horosblue transition-colors">Contacto</Link>
            <Link href="/contacto" className="bg-btn-primary text-white px-4 py-2 rounded-sm text-sm font-bold hover:bg-btn-primary-hover focus:outline-none transition-all hover:animate-pulse duration-400 ">
              ¡Cotiza Ahora!
            </Link>
          </div>
        </nav>
        <main className="flex-1">{children}</main>
        <footer className="print:hidden bg-zinc-100 text-white mt-auto shadow-inner">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-20 pt-10 pb-4 px-6">
              <div>
                <Image src="/img/horos-inmobiliaria.png" alt="Horos Logo" width={240} height={40} className="mb-4 p-4" />
              </div>
              <div>
                  <div className="mb-4 border-b border-slate-300 pb-2">
                      <div className="text-xs font-bold text-horosblue uppercase tracking-wider flex items-center gap-2 mb-2">
                        <FaPhone />
                        <h3>Llámanos</h3>
                      </div>
                      <p className="text-slate-700 text-sm font-medium mb-2">+51 (044) 269134</p>
                      <p className="text-slate-700 text-sm font-medium">+51 971 000 482</p>
                  </div>
                  <div>
                      <div className="text-xs font-bold text-horosblue uppercase tracking-wider flex items-center gap-2 mb-2">
                        <FaMailBulk />
                        <h3>Escríbenos</h3>
                      </div>
                      <p className="text-slate-700 text-sm font-medium">info@horosinmobiliaria.com</p>
                  </div>
              </div>
              <div>
                  <h3 className="text-xs font-bold text-horosblue uppercase tracking-wider mb-4">Enlaces de Interés</h3>
                  <ul className="space-y-2 text-slate-700 text-sm">
                      <li><a className='flex items-center gap-2 hover:text-horosblue transition-colors' href="https://www.mivivienda.com.pe/" target="_blank"><FaExternalLinkAlt />Fondo MIVIVIENDA</a></li>
                      <li><a className='flex items-center gap-2 hover:text-horosblue transition-colors' href="https://www.gob.pe/vivienda" target="_blank"><FaExternalLinkAlt />Ministerio de Vivienda</a></li>
                      <li><a className='flex items-center gap-2 hover:text-horosblue transition-colors' href="https://www.gob.pe/sunarp" target="_blank"><FaExternalLinkAlt />Registros Públicos (SUNARP)</a></li>
                  </ul>
              </div>
              <div>
                  <h3 className="text-md font-bold text-horosblue uppercase tracking-wider mb-4">Acceso Asesores</h3>
                  <p className="text-slate-700 text-sm mb-3">Este ingreso es de uso exclusivo para asesores comerciales autorizados.</p>
                  <a href="./login" className="inline-block bg-transparent text-horosblue border border-horos-blue/30 px-4 py-1.5 rounded text-sm font-medium hover:bg-blue-400/10 transition-colors">
                    Ingresar al Sistema
                  </a>
              </div>
          </div>
          <div className="border-t border-slate-300 py-4 px-6 text-center text-xs text-slate-500 max-w-7xl mx-auto w-full flex flex-col sm:flex-row justify-between gap-2">
              <p>&copy; 2026 Horos Inmobiliaria. Todos los derechos reservados.</p>
              <p>Razón Social: HOROS INMOBILIARIA S.A.C. | RUC: 20560049391</p>
          </div>
      </footer>
      </body>
    </html>
  );
}