'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Proyecto } from '@/types/proyecto';
import { supabase } from '@/lib/supabase';
import {
  FiChevronLeft, FiChevronRight, FiMapPin, FiArrowLeft,
  FiExternalLink, FiPhone, FiMaximize2,
} from 'react-icons/fi';
import { FaBed, FaBath, FaBuilding } from 'react-icons/fa';

export default function FichaProyectoPage() {
  const params = useParams();
  const ruta = typeof params?.ruta === 'string' ? params.ruta : undefined;

  const [proyecto, setProyecto] = useState<Proyecto | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [fotoActivaIndex, setFotoActivaIndex] = useState<number>(0);

  const slugify = (text: string) =>
    text
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

  useEffect(() => {
    if (!ruta) return;
    const obtenerDetalleProyecto = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('proyectos')
          .select('*')
          .eq('ruta', ruta)
          .maybeSingle();
        if (!error && data) { setProyecto(data as Proyecto); return; }

        const { data: lista, error: listaError } = await supabase.from('proyectos').select('*');
        if (listaError) throw listaError;
        const encontrado = Array.isArray(lista)
          ? lista.find((p: any) =>
              (p.ruta && p.ruta.toLowerCase() === ruta.toLowerCase()) ||
              slugify(p.titulo) === ruta
            )
          : null;
        if (encontrado) setProyecto(encontrado as Proyecto);
      } catch (err) {
        console.error('Error al consultar el inmueble:', err);
      } finally {
        setLoading(false);
      }
    };
    obtenerDetalleProyecto();
  }, [ruta]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-ink-50 animate-fade-in">
        <div className="flex flex-col items-center gap-5">
          <div className="spinner-brand" />
          <div className="text-center">
            <p className="text-ink-700 font-semibold text-sm">Cargando propiedad</p>
            <p className="text-ink-400 text-xs mt-0.5">Un momento por favor...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!proyecto) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-ink-50 animate-fade-in">
        <div className="bg-white border border-ink-100 rounded-2xl p-10 max-w-sm text-center shadow-sm">
          <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4 text-red-400 text-2xl">✕</div>
          <p className="text-ink-900 font-semibold font-display text-lg mb-2">Propiedad no encontrada</p>
          <p className="text-ink-400 text-sm mb-5">La URL solicitada no existe o fue eliminada.</p>
          <Link href="/" className="btn-primary inline-flex text-sm">Volver al catálogo</Link>
        </div>
      </div>
    );
  }

  const listaFotos =
    Array.isArray(proyecto.imagenes) && proyecto.imagenes.length > 0
      ? proyecto.imagenes
      : [proyecto.imagen];

  const anteriorFoto = () =>
    setFotoActivaIndex((p) => (p === 0 ? listaFotos.length - 1 : p - 1));
  const siguienteFoto = () =>
    setFotoActivaIndex((p) => (p === listaFotos.length - 1 ? 0 : p + 1));

  const mapaUrl = `https://maps.google.com/maps?q=${encodeURIComponent(
    proyecto.ubicacion + ', Perú'
  )}&output=embed`;

  return (
    <div className="bg-slate-50 min-h-screen">

      <section className="relative h-[72vh] min-h-130 w-full overflow-hidden bg-slate-900">
        <img
          src={listaFotos[fotoActivaIndex]}
          alt={proyecto.titulo}
          className="w-full h-full object-cover opacity-85 transition-all duration-700"
        />
        <div className="absolute inset-0 bg-linear-to-t from-slate-950 via-slate-950/20 to-transparent" />

        {/* Back */}
        <Link
          href="/"
          className="absolute top-6 left-6 z-10 flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white border border-white/20 px-4 py-2 rounded-full text-sm font-semibold hover:bg-white/20 transition-all"
        >
          <FiArrowLeft />
          Catálogo
        </Link>

        {/* Arrows */}
        {listaFotos.length > 1 && (
          <>
            <button
              onClick={anteriorFoto}
              className="absolute left-6 top-1/2 -translate-y-1/2 bg-white/10 backdrop-blur-sm p-3 rounded-full text-white border border-white/20 hover:bg-white/25 transition-all"
            >
              <FiChevronLeft size={22} />
            </button>
            <button
              onClick={siguienteFoto}
              className="absolute right-6 top-1/2 -translate-y-1/2 bg-white/10 backdrop-blur-sm p-3 rounded-full text-white border border-white/20 hover:bg-white/25 transition-all"
            >
              <FiChevronRight size={22} />
            </button>
            <div className="absolute top-6 right-6 bg-black/50 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-full">
              {fotoActivaIndex + 1} / {listaFotos.length}
            </div>
          </>
        )}

        {/* Title */}
        <div className="absolute bottom-0 left-0 right-0 max-w-7xl mx-auto w-full px-8 pb-10">
          <span className="inline-block bg-amber-600 text-white text-[11px] font-black uppercase tracking-widest px-3 py-1.5 rounded-sm mb-3">
            {proyecto.tipo}
          </span>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight mb-2 drop-shadow-lg">
            {proyecto.titulo}
          </h1>
          <p className="flex items-center gap-2 text-white/70 text-sm font-medium">
            <FiMapPin className="text-amber-400 shrink-0" />
            {proyecto.ubicacion}
          </p>
        </div>
      </section>

      {/* ── Stats bar ──────────────────────────────────────────── */}
      <div className="bg-slate-900 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-8 py-4 flex flex-wrap justify-between items-center gap-4">
          <div className="flex flex-wrap gap-6 text-sm font-semibold">
            {proyecto.metros && (
              <span className="flex items-center gap-2 text-slate-300">
                <FiMaximize2 className="text-amber-400" />
                {proyecto.metros} m²
              </span>
            )}
            {proyecto.cuartos && (
              <span className="flex items-center gap-2 text-slate-300">
                <FaBed className="text-amber-400" />
                {proyecto.cuartos} Dormitorios
              </span>
            )}
            {proyecto.banos && (
              <span className="flex items-center gap-2 text-slate-300">
                <FaBath className="text-amber-400" />
                {proyecto.banos} Baños
              </span>
            )}
          </div>
          <div className="text-right">
            <p className="text-slate-500 text-[10px] uppercase tracking-widest font-bold">Precio</p>
            <p className="text-2xl font-black text-amber-400">
              S/. {proyecto.precio.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      </div>

      {/* ── Thumbnail strip ────────────────────────────────────── */}
      {listaFotos.length > 1 && (
        <div className="bg-slate-800 px-8 py-3">
          <div className="max-w-7xl mx-auto flex gap-2 overflow-x-auto">
            {listaFotos.map((foto, i) => (
              <button
                key={i}
                onClick={() => setFotoActivaIndex(i)}
                className={`shrink-0 w-24 h-16 rounded overflow-hidden border-2 transition-all ${
                  i === fotoActivaIndex
                    ? 'border-amber-500 opacity-100'
                    : 'border-transparent opacity-40 hover:opacity-70'
                }`}
              >
                <img src={foto} alt={`Vista ${i + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Main content ───────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-3 gap-10">

        {/* Left column */}
        <div className="lg:col-span-2 flex flex-col gap-8">

          {/* Características */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h3 className="text-slate-900 font-black text-lg mb-5 flex items-center gap-2">
              <FaBuilding className="text-amber-600" />
              Características del Inmueble
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-slate-50 rounded-xl p-5 text-center border border-slate-100">
                <FiMaximize2 className="text-amber-600 mx-auto mb-2" size={22} />
                <p className="text-3xl font-black text-slate-900">{proyecto.metros ?? '—'}</p>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wide mt-1">m² totales</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-5 text-center border border-slate-100">
                <FaBed className="text-amber-600 mx-auto mb-2" size={22} />
                <p className="text-3xl font-black text-slate-900">{proyecto.cuartos ?? '—'}</p>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wide mt-1">Dormitorios</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-5 text-center border border-slate-100">
                <FaBath className="text-amber-600 mx-auto mb-2" size={22} />
                <p className="text-3xl font-black text-slate-900">{proyecto.banos ?? '—'}</p>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wide mt-1">Baños</p>
              </div>
            </div>
          </div>

          {/* Descripción */}
          {proyecto.descripcion && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <h3 className="text-slate-900 font-black text-lg mb-4">Descripción del Inmueble</h3>
              <p className="text-slate-600 leading-relaxed text-sm whitespace-pre-line">
                {proyecto.descripcion}
              </p>
            </div>
          )}

          {/* Mapa */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex items-start gap-3">
              <FiMapPin className="text-amber-600 mt-0.5 shrink-0" size={18} />
              <div>
                <h3 className="text-slate-900 font-black text-lg leading-tight">Localización</h3>
                <p className="text-slate-400 text-sm mt-0.5">{proyecto.ubicacion}</p>
              </div>
            </div>
            <div className="h-96">
              <iframe
                src={mapaUrl}
                width="100%"
                height="100%"
                className="border-0 w-full h-full"
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title={`Ubicación de ${proyecto.titulo}`}
              />
            </div>
            <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex justify-end">
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(proyecto.ubicacion + ', Perú')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs font-bold text-horosblue hover:underline"
              >
                <FiExternalLink size={12} />
                Abrir en Google Maps
              </a>
            </div>
          </div>
        </div>

        {/* Right sidebar */}
        <div className="flex flex-col gap-6">

          {/* Precio + CTA */}
          <div className="bg-slate-900 text-white rounded-2xl shadow-lg p-6 sticky top-24">
            <p className="text-slate-400 text-[10px] uppercase tracking-widest font-bold mb-1">Precio del Inmueble</p>
            <p className="text-3xl font-black text-amber-400 mb-5">
              S/. {proyecto.precio.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
            </p>
            {proyecto.enlace_mas_info && (
              <a
                href={proyecto.enlace_mas_info}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-amber-600 hover:bg-amber-500 text-white font-black py-3 px-4 rounded-xl text-sm flex items-center justify-center gap-2 transition-colors mb-3"
              >
                <FiExternalLink size={14} />
                Más información
              </a>
            )}
            <Link
              href="/contacto"
              className="w-full bg-white/10 border border-white/15 hover:bg-white/15 text-white font-bold py-3 px-4 rounded-xl text-sm flex items-center justify-center gap-2 transition-colors"
            >
              <FiPhone size={14} />
              Contactar Asesor
            </Link>
          </div>

          {/* Consorcio Neptuno mini landing */}
          <div className="relative overflow-hidden rounded-2xl shadow-lg border border-cyan-800/40">
            {/* Background */}
            <div className="absolute inset-0 bg-linear-to-br from-[#032d3e] via-[#064a63] to-[#032d3e]" />
            <div
              className="absolute inset-0 opacity-5"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='52' height='26' viewBox='0 0 52 26' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2307A6C9' fill-opacity='1'%3E%3Cpath d='M10 10c0-2.21-1.79-4-4-4-3.314 0-6-2.686-6-6h2c0 2.21 1.79 4 4 4 3.314 0 6 2.686 6 6 0 2.21 1.79 4 4 4 3.314 0 6 2.686 6 6 0 2.21 1.79 4 4 4v2c-3.314 0-6-2.686-6-6 0-2.21-1.79-4-4-4-3.314 0-6-2.686-6-6zm25.464-1.95l8.486 8.486-1.414 1.414-8.486-8.486 1.414-1.414z' /%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              }}
            />

            {/* Wave top decoration */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-cyan-500 via-horosblue to-cyan-500 opacity-80" />

            <div className="relative p-6">
              {/* Label */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex-1 h-px bg-cyan-500/30" />
                <span className="text-cyan-400 text-[10px] font-black uppercase tracking-[0.2em]">
                  Proyecto Exclusivo
                </span>
                <div className="flex-1 h-px bg-cyan-500/30" />
              </div>

              {/* Brand name */}
              <h4 className="text-2xl font-black text-white tracking-tight mb-1">
                Consorcio <span className="text-cyan-400">Neptuno</span>
              </h4>
              <p className="text-cyan-100/50 text-xs mb-4 leading-relaxed">
                Proyecto inmobiliario de primer nivel. Conoce disponibilidad,
                avances y condiciones directamente en su portal oficial.
              </p>

              {/* Mini mapa */}
              <div className="rounded-lg overflow-hidden border border-cyan-800/50 mb-4 h-36">
                <iframe
                  src={mapaUrl}
                  width="100%"
                  height="100%"
                  className="border-0 w-full h-full grayscale"
                  loading="lazy"
                  title="Mini mapa Consorcio Neptuno"
                />
              </div>

              {/* CTA */}
              <a
                href="https://www.consorcioneptuno.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-black text-sm py-3 rounded-xl transition-colors"
              >
                <FiExternalLink size={14} />
                Visitar consorcioneptuno.com
              </a>

              <p className="text-center text-white/20 text-[10px] mt-3 tracking-wider">
                www.consorcioneptuno.com
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
