import type { Metadata } from 'next';
import './globals.css';
import Image from 'next/image';
import { DM_Sans, Montserrat } from 'next/font/google';
import NavBar from '@/components/NavBar';
import { WhatsAppProvider } from '@/context/WhatsAppContext';
import WhatsAppButton from '@/components/WhatsAppButton';
import {
  FaPhone, FaEnvelope, FaExternalLinkAlt,
  FaMapMarkerAlt, FaInstagram, FaFacebook,
} from 'react-icons/fa';

export const metadata: Metadata = {
  title: 'Horos Inmobiliaria | Venta y Alquiler de Inmuebles en Trujillo',
  description: 'Encuentra tu hogar ideal con Horos Inmobiliaria. Venta y alquiler de departamentos, casas y proyectos en Trujillo, Perú.',
};

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
  weight: ['400', '500', '600', '700', '800', '900'],
  style: ['normal', 'italic'],
  display: 'swap',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dmsans',
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${montserrat.variable} ${dmSans.variable}`}>
      <body className="antialiased flex flex-col min-h-screen bg-ink-50">
        <WhatsAppProvider>
        <NavBar />
      <main className="flex-1">{children}</main>

        {/* ── Footer ──────────────────────────────────── */}
        <footer className="print:hidden bg-ink-900 text-white mt-auto">

          {/* Franja superior */}
          <div className="border-b border-white/8">
            <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

              {/* Brand */}
              <div className="lg:col-span-1">
                <Image
                  src="/img/horos-inmobiliaria.png"
                  alt="Horos Inmobiliaria"
                  width={160}
                  height={44}
                  className="h-10 w-auto brightness-0 invert mb-4 opacity-90"
                />
                <p className="text-ink-300 text-sm leading-relaxed">
                  Tu aliado de confianza en la búsqueda del inmueble ideal en
                  Trujillo y La Libertad.
                </p>
              </div>

              {/* Contacto */}
              <div>
                <h4 className="text-white font-display font-semibold text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
                  <span className="w-5 h-px bg-horos-400 inline-block" />
                  Contacto
                </h4>
                <ul className="space-y-3 text-sm">
                  <li>
                    <a
                      href="tel:+51044269134"
                      className="flex items-center gap-3 text-ink-300 hover:text-horos-300 transition-colors group"
                    >
                      <span className="flex items-center justify-center w-7 h-7 rounded-full bg-white/8 group-hover:bg-horos-500/20 transition-colors shrink-0">
                        <FaPhone size={11} />
                      </span>
                      +51 (044) 269 134
                    </a>
                  </li>
                  <li>
                    <a
                      href="tel:+51971000482"
                      className="flex items-center gap-3 text-ink-300 hover:text-horos-300 transition-colors group"
                    >
                      <span className="flex items-center justify-center w-7 h-7 rounded-full bg-white/8 group-hover:bg-horos-500/20 transition-colors shrink-0">
                        <FaPhone size={11} />
                      </span>
                      +51 971 000 482
                    </a>
                  </li>
                  <li>
                    <a
                      href="mailto:info@horosinmobiliaria.com"
                      className="flex items-center gap-3 text-ink-300 hover:text-horos-300 transition-colors group"
                    >
                      <span className="flex items-center justify-center w-7 h-7 rounded-full bg-white/8 group-hover:bg-horos-500/20 transition-colors shrink-0">
                        <FaEnvelope size={11} />
                      </span>
                      info@horosinmobiliaria.com
                    </a>
                  </li>
                </ul>
              </div>

              {/* Enlaces de interés */}
              <div>
                <h4 className="text-white font-display font-semibold text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
                  <span className="w-5 h-px bg-horos-400 inline-block" />
                  Interés
                </h4>
                <ul className="space-y-2.5 text-sm">
                  {[
                    { href: 'https://www.mivivienda.com.pe/', label: 'Fondo MIVIVIENDA' },
                    { href: 'https://www.gob.pe/vivienda', label: 'Ministerio de Vivienda' },
                    { href: 'https://www.gob.pe/sunarp', label: 'SUNARP' },
                  ].map((item) => (
                    <li key={item.href}>
                      <a
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-ink-300 hover:text-horos-300 transition-colors"
                      >
                        <FaExternalLinkAlt size={10} className="shrink-0 opacity-60" />
                        {item.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Asesores */}
              <div>
                <h4 className="text-white font-display font-semibold text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
                  <span className="w-5 h-px bg-horos-400 inline-block" />
                  Asesores
                </h4>
                <p className="text-ink-400 text-sm mb-4 leading-relaxed">
                  Acceso exclusivo para asesores comerciales autorizados.
                </p>
                <a
                  href="/login"
                  className="inline-flex items-center gap-2 border border-horos-500/40 text-horos-300 hover:bg-horos-500/10 hover:border-horos-400 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200"
                >
                  Ingresar al Sistema
                </a>
              </div>
            </div>
          </div>

          {/* Barra inferior */}
          <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-ink-500">
            <p>&copy; {new Date().getFullYear()} Horos Inmobiliaria. Todos los derechos reservados.</p>
            <p>RUC: 20560049391 · HOROS INMOBILIARIA S.A.C.</p>
          </div>
        </footer>

        <WhatsAppButton />
        </WhatsAppProvider>
      </body>
    </html>
  );
}