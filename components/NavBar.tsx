'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { FiMenu, FiX, FiPhone, FiChevronDown } from 'react-icons/fi';

const LINKS = [
  { href: '/',          label: 'Inicio' },
  { href: '/#proyectos', label: 'Proyectos' },
  { href: '/nosotros',  label: 'Nosotros' },
  { href: '/contacto',  label: 'Contacto' },
];

export default function NavBar() {
  const [scrolled, setScrolled]   = useState(false);
  const [open, setOpen]           = useState(false);
  const pathname                  = usePathname();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', handler, { passive: true });
    handler();
    return () => window.removeEventListener('scroll', handler);
  }, []);

  /* cerrar menú al cambiar ruta */
  useEffect(() => { setOpen(false); }, [pathname]);

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href.split('#')[0]) && href.split('#')[0] !== '/';
  };

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? 'bg-white/98 shadow-[0_2px_20px_rgba(7,166,201,0.1)] border-b border-ink-100'
          : 'bg-white/80 backdrop-blur-md'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between gap-6">

        {/* ── Logo ─────────────────────────────── */}
        <Link href="/" className="flex items-center shrink-0 group">
          <Image
            src="/img/horos-inmobiliaria.png"
            alt="Horos Inmobiliaria"
            width={160}
            height={44}
            className="h-11 w-auto transition-opacity duration-200 group-hover:opacity-85"
            priority
          />
        </Link>
        <nav className="hidden md:flex items-center gap-1 flex-1 justify-center">
          {LINKS.map((link) => {
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 group ${
                  active
                    ? 'text-horos-600'
                    : 'text-ink-600 hover:text-horos-600 hover:bg-horos-50'
                }`}
              >
                {link.label}
                {/* Underline animada */}
                <span
                  className={`absolute bottom-1 left-4 right-4 h-0.5 bg-horos-500 rounded-full transition-transform duration-300 origin-left ${
                    active ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                  }`}
                />
              </Link>
            );
          })}
        </nav>

        {/* ── CTA escritorio ───────────────────── */}
        <div className="hidden md:flex items-center gap-4 shrink-0">
          <a
            href="tel:+51971000482"
            className="flex items-center gap-2 text-sm font-medium text-ink-500 hover:text-horos-600 transition-colors"
          >
            <span className="flex items-center justify-center w-7 h-7 rounded-full bg-horos-50 text-horos-600">
              <FiPhone size={13} />
            </span>
            <span className="hidden lg:block">971 000 482</span>
          </a>

          <Link
            href="/contacto"
            className="btn-primary text-sm px-5 py-2.5"
          >
            ¡Cotiza Ahora!
          </Link>
        </div>

        {/* ── Hamburguesa móvil ────────────────── */}
        <button
          onClick={() => setOpen(!open)}
          aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={open}
          className={`md:hidden p-2 rounded-lg transition-colors ${
            open ? 'bg-horos-50 text-horos-600' : 'text-ink-700 hover:bg-ink-100'
          }`}
        >
          {open
            ? <FiX size={22} className="animate-scale-in" />
            : <FiMenu size={22} />
          }
        </button>
      </div>

      {/* ── Menú móvil ───────────────────────────── */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-out ${
          open ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="bg-white border-t border-ink-100 px-5 py-4 flex flex-col gap-1 shadow-lg">
          {LINKS.map((link, i) => {
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                style={{ animationDelay: `${i * 50}ms` }}
                className={`animate-slide-right py-3 px-4 text-sm font-semibold rounded-xl transition-colors ${
                  active
                    ? 'bg-horos-50 text-horos-700'
                    : 'text-ink-700 hover:bg-horos-50 hover:text-horos-600'
                }`}
              >
                {link.label}
              </Link>
            );
          })}

          <div className="pt-3 mt-1 border-t border-ink-100 flex items-center justify-between gap-3">
            <a
              href="tel:+51971000482"
              className="flex items-center gap-2 text-sm font-medium text-ink-500"
            >
              <FiPhone size={14} />
              971 000 482
            </a>
            <Link href="/contacto" className="btn-primary text-sm">
              ¡Cotiza Ahora!
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
