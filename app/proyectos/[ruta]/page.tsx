'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Proyecto } from '@/types/proyecto';
import { supabase } from '@/lib/supabase';
import {
  FiChevronLeft, FiChevronRight, FiMapPin, FiArrowLeft,
  FiExternalLink, FiPhone, FiMaximize2, FiCalendar, FiLayers, FiHome,
  FiDownload, FiX,
} from 'react-icons/fi';
import {
  FaBed, FaBath, FaBuilding, FaCar, FaWhatsapp, FaCheck,
} from 'react-icons/fa';
import WhatsAppProjectSync from '@/components/WhatsAppProjectSync';
import { generarFichaPDF } from '@/lib/generarFichaPDF';

type Estado = 'disponible' | 'reservado' | 'vendido';

const ESTADO_BADGE: Record<Estado, { label: string; cls: string }> = {
  disponible: { label: 'Disponible', cls: 'bg-emerald-100 text-emerald-700 border border-emerald-200' },
  reservado:  { label: 'Reservado',  cls: 'bg-amber-100  text-amber-700  border border-amber-200'  },
  vendido:    { label: 'Vendido',    cls: 'bg-ink-100    text-ink-500    border border-ink-200'    },
};

const HOROS_PHONE = '51971000482';

function slugify(text: string) {
  return text
    .toLowerCase().trim()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function toYoutubeEmbed(url: string): string {
  const match = url.match(/(?:v=|youtu\.be\/)([A-Za-z0-9_-]{11})/);
  return match ? `https://www.youtube.com/embed/${match[1]}` : url;
}

function fmt(n: number) {
  return n.toLocaleString('es-PE', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

// ── Landing embebido: Consorcio Neptuno — paleta horos ────────────────
function LandingNeptuno({ proyecto, areaEfectiva, esLote }: {
  proyecto: Proyecto;
  areaEfectiva: number | undefined;
  esLote: boolean;
}) {
  const NEPTUNO_PHONE = '51924888889';
  const landingUrl    = proyecto.landing_url || 'https://www.consorcioneptuno.com';
  const landingHost   = (() => { try { return new URL(landingUrl).hostname.replace('www.', ''); } catch { return landingUrl; } })();

  const wpMsg  = `Hola, me interesa el proyecto *"${proyecto.titulo}"* que vi en horosinmobiliaria.com. ¿Me pueden brindar información sobre disponibilidad y condiciones?`;
  const wpHref = `https://wa.me/${NEPTUNO_PHONE}?text=${encodeURIComponent(wpMsg)}`;

  const stats = [
    proyecto.metros     && { val: `${proyecto.metros} m²`,    label: esLote ? 'Área terreno' : 'Área total' },
    areaEfectiva        && { val: `${areaEfectiva} m²`,        label: 'Área construida' },
    proyecto.pisos_proyectados && {
      val: `${proyecto.pisos_proyectados} piso${proyecto.pisos_proyectados !== 1 ? 's' : ''}`,
      label: 'Proyectados',
    },
    proyecto.cuartos && { val: String(proyecto.cuartos), label: 'Dormitorios' },
    proyecto.banos   && { val: String(proyecto.banos),   label: 'Baños'       },
    proyecto.garajes && { val: String(proyecto.garajes), label: 'Garajes'     },
  ].filter(Boolean) as { val: string; label: string }[];

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(135deg,#02303C_0%,#044A5C_50%,#056580_100%)]" />
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='52' height='26' viewBox='0 0 52 26' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2307A6C9' fill-opacity='1'%3E%3Cpath d='M10 10c0-2.21-1.79-4-4-4-3.314 0-6-2.686-6-6h2c0 2.21 1.79 4 4 4 3.314 0 6 2.686 6 6 0 2.21 1.79 4 4 4 3.314 0 6 2.686 6 6 0 2.21 1.79 4 4 4v2c-3.314 0-6-2.686-6-6 0-2.21-1.79-4-4-4-3.314 0-6-2.686-6-6zm25.464-1.95l8.486 8.486-1.414 1.414-8.486-8.486 1.414-1.414z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-linear-to-r from-transparent via-horos-400 to-transparent" />

      <div className="relative max-w-7xl mx-auto px-6 py-14">
        <div className="flex flex-wrap items-center gap-3 mb-10">
          <div className="flex-1 h-px bg-horos-500/30 min-w-5" />
          <span className="text-horos-300 text-[11px] font-black uppercase tracking-[0.2em] shrink-0">
            Proyecto Exclusivo
          </span>
          <div className="flex-1 h-px bg-horos-500/30 min-w-5" />
          <div className="flex items-center gap-2 shrink-0">
            <span className="px-3 py-1 text-[11px] font-black text-amber-300 border border-amber-400/30 rounded-full bg-amber-400/10 uppercase tracking-wide">
              FOVIME
            </span>
            <span className="px-3 py-1 text-[11px] font-black text-horos-200 border border-horos-400/30 rounded-full bg-horos-400/10 uppercase tracking-wide">
              CONSORCIO NEPTUNO
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
          <div className="lg:col-span-2">
            <h2 className="text-3xl md:text-4xl font-black text-white leading-tight mb-2">
              {proyecto.titulo}
            </h2>
            <p className="text-horos-200 text-base font-medium mb-8 flex items-center gap-2">
              {proyecto.financiamiento_tipo === 'FOVIME'
                ? <>Para la familia militar <span aria-label="Perú">🇵🇪</span></>
                : 'Tu nuevo hogar te espera'}
            </p>

            {stats.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
                {stats.map((s, i) => (
                  <div key={i} className="bg-white/5 border border-horos-400/20 rounded-xl p-4 text-center">
                    <p className="text-2xl font-black text-white">{s.val}</p>
                    <p className="text-[11px] text-horos-200/70 font-bold uppercase tracking-wide mt-1">{s.label}</p>
                  </div>
                ))}
              </div>
            )}

            {Array.isArray(proyecto.caracteristicas) && proyecto.caracteristicas.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {proyecto.caracteristicas.map((item, i) => (
                  <span key={i} className="flex items-center gap-1.5 text-xs font-semibold text-horos-100 bg-horos-500/15 border border-horos-400/25 px-3 py-1.5 rounded-full">
                    <FaCheck size={9} className="text-horos-300 shrink-0" />
                    {item}
                  </span>
                ))}
              </div>
            )}

            <div className="mt-8 pt-6 border-t border-horos-500/20 flex items-center gap-2 text-sm text-horos-200/60">
              <FiMapPin size={13} className="text-horos-400 shrink-0" />
              {proyecto.ubicacion}
            </div>
          </div>

          <div className="bg-white/6 border border-horos-400/20 rounded-2xl p-6">
            <p className="text-horos-300/60 text-[10px] uppercase tracking-widest font-bold mb-1">
              {proyecto.precio_desde ? 'Precio desde' : 'Precio'}
            </p>
            <p className="text-3xl font-black text-white mb-2 leading-none">
              {proyecto.precio_desde && <span className="text-base font-semibold text-horos-300 mr-1">Desde</span>}
              S/. {fmt(proyecto.precio)}
            </p>

            <div className="flex flex-wrap gap-2 mb-5">
              {proyecto.financiamiento && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-300 bg-emerald-500/10 border border-emerald-500/25 px-2.5 py-1 rounded-full">
                  <FaCheck size={9} />
                  {proyecto.financiamiento_tipo ?? 'Financiable'}
                </span>
              )}
              {proyecto.entrega && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-horos-200 bg-white/5 border border-white/10 px-2.5 py-1 rounded-full">
                  <FiCalendar size={10} />
                  Entrega {proyecto.entrega}
                </span>
              )}
            </div>

            <div className="flex flex-col gap-3">
              <a href={wpHref} target="_blank" rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1fb055] text-white font-black py-3 px-4 rounded-xl text-sm transition-colors">
                <FaWhatsapp size={16} /> Consultar por WhatsApp
              </a>
              <a href="tel:+51924888889"
                className="w-full flex items-center justify-center gap-2 bg-white/10 border border-white/15 hover:bg-white/15 text-white font-bold py-3 px-4 rounded-xl text-sm transition-colors">
                <FiPhone size={14} /> 924 888 889
              </a>
              <a href={landingUrl} target="_blank" rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 bg-horos-500 hover:bg-horos-400 text-white font-black py-3 px-4 rounded-xl text-sm transition-colors">
                <FiExternalLink size={14} /> {landingHost}
              </a>
            </div>

            <p className="text-center text-white/20 text-[10px] mt-4 tracking-wider">
              informes@consorcioneptuno.com
            </p>
          </div>
        </div>

        {proyecto.landing_imagen && (
          <a href={landingUrl} target="_blank" rel="noopener noreferrer"
            className="block mt-8 rounded-2xl overflow-hidden border border-horos-400/20 hover:border-horos-300/40 transition-all group">
            <img src={proyecto.landing_imagen} alt={proyecto.titulo}
              className="w-full h-auto object-cover group-hover:scale-[1.02] transition-transform duration-500" />
          </a>
        )}
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-linear-to-r from-transparent via-horos-400/50 to-transparent" />
    </section>
  );
}

// ── Página principal ─────────────────────────────────────────────────
export default function FichaProyectoPage() {
  const params = useParams();
  const ruta = typeof params?.ruta === 'string' ? params.ruta : undefined;

  const [proyecto, setProyecto] = useState<Proyecto | null>(null);
  const [loading, setLoading] = useState(true);
  const [fotoIndex, setFotoIndex] = useState(0);
  const [imgErrors, setImgErrors] = useState<Record<number, boolean>>({});
  const [modalFoto, setModalFoto] = useState<number | null>(null);
  const [modalModelo, setModalModelo] = useState<{ mi: number; ii: number } | null>(null);
  const [modalAmpliacion, setModalAmpliacion] = useState<{ mi: number; ai: number } | null>(null);
  const [modeloFotoIdx, setModeloFotoIdx] = useState<Record<number, number>>({});
  const [ampliacionFotoIdx, setAmpliacionFotoIdx] = useState<Record<number, number>>({});

  useEffect(() => {
    if (!ruta) return;
    const cargar = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('proyectos').select('*').eq('ruta', ruta).maybeSingle();
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
    cargar();
  }, [ruta]);

  // Keyboard navigation for modal
  useEffect(() => {
    if (modalFoto === null) return;
    const len = Array.isArray(proyecto?.imagenes) && (proyecto?.imagenes?.length ?? 0) > 0
      ? proyecto!.imagenes!.length : 1;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setModalFoto(null);
      if (e.key === 'ArrowLeft') setModalFoto(p => p === null ? null : p === 0 ? len - 1 : p - 1);
      if (e.key === 'ArrowRight') setModalFoto(p => p === null ? null : p === len - 1 ? 0 : p + 1);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [modalFoto, proyecto]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-ink-50 animate-fade-in">
        <div className="flex flex-col items-center gap-5">
          <div className="spinner-brand" />
          <div className="text-center">
            <p className="text-ink-700 font-semibold text-sm">Cargando propiedad</p>
            <p className="text-ink-400 text-xs mt-0.5">Un momento por favor…</p>
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
          <Link href="/proyectos" className="btn-primary inline-flex text-sm">Ver catálogo</Link>
        </div>
      </div>
    );
  }

  const galeriaFotos =
    Array.isArray(proyecto.imagenes) && proyecto.imagenes.length > 0
      ? proyecto.imagenes
      : [proyecto.imagen];

  const listaModelos = Array.isArray(proyecto.modelos) ? (proyecto.modelos as any[]) : [];
  const listaFotos = [...galeriaFotos];
  const modeloStartIndex = galeriaFotos.length;

  const modalAnterior = () =>
    setModalFoto(p => p === null ? null : (p === 0 ? listaFotos.length - 1 : p - 1));
  const modalSiguiente = () =>
    setModalFoto(p => p === null ? null : (p === listaFotos.length - 1 ? 0 : p + 1));

  const mapaUrl = `https://maps.google.com/maps?q=${encodeURIComponent(
    proyecto.ubicacion + ', Perú'
  )}&t=m&z=15&output=embed&iwloc=near`;

  const estado = (proyecto.estado ?? 'disponible') as Estado;
  const badge  = ESTADO_BADGE[estado] ?? ESTADO_BADGE.disponible;

  const whatsappMsg  = `Hola, vi el inmueble *"${proyecto.titulo}"* en *${proyecto.ubicacion}* (Ref. #${proyecto.id}) en horosinmobiliaria.com y me gustaría recibir más información. ¿Me pueden orientar?`;
  const whatsappHref = `https://wa.me/${HOROS_PHONE}?text=${encodeURIComponent(whatsappMsg)}`;

  const fotoSrc = imgErrors[fotoIndex] ? proyecto.imagen : listaFotos[fotoIndex];
  const esLote  = /lote|terreno|conjunto/i.test(proyecto.tipo);
  const esConjunto = /conjunto/i.test(proyecto.tipo);

  const areaEfectiva = proyecto.area_techada ?? proyecto.area_construida;

  const statItems = [
    proyecto.metros && {
      icon: <FiMaximize2 className="text-horos-500" />,
      val: `${proyecto.metros} m²`,
      label: esLote ? 'Lote' : 'Área total',
    },
    areaEfectiva && {
      icon: <FiMaximize2 className="text-horos-500" />,
      val: `${areaEfectiva} m²`,
      label: esLote ? 'Casa' : 'Área techada',
    },
    proyecto.pisos_proyectados && {
      icon: <FiLayers className="text-horos-500" />,
      val: `${proyecto.pisos_proyectados} piso${proyecto.pisos_proyectados !== 1 ? 's' : ''}`,
      label: esLote ? 'Pisos proy.' : 'Pisos',
    },
    proyecto.cuartos && {
      icon: <FaBed className="text-horos-500" />,
      val: `${proyecto.cuartos}`,
      label: proyecto.cuartos === 1 ? 'Dormitorio' : 'Dormitorios',
    },
    proyecto.banos && {
      icon: <FaBath className="text-horos-500" />,
      val: `${proyecto.banos}`,
      label: proyecto.banos === 1 ? 'Baño' : 'Baños',
    },
    proyecto.garajes && {
      icon: <FaCar className="text-horos-500" />,
      val: `${proyecto.garajes}`,
      label: proyecto.garajes === 1 ? 'Garaje' : 'Garajes',
    },
    proyecto.piso && {
      icon: <FiLayers className="text-horos-500" />,
      val: `Piso ${proyecto.piso}${proyecto.total_pisos ? ` / ${proyecto.total_pisos}` : ''}`,
      label: 'Nivel',
    },
  ].filter(Boolean) as { icon: React.ReactNode; val: string; label: string }[];

  return (
    <div className="bg-ink-50 min-h-screen">
      <WhatsAppProjectSync proyecto={proyecto} />

      {/* ── Hero portada ──────────────────────────────────────── */}
      <section className="relative w-full overflow-hidden bg-ink-900">
        {/* Portada principal */}
        <div className="relative h-[70vh] min-h-[480px] lg:h-[75vh]">
          <Image
            src={fotoSrc}
            alt={proyecto.titulo}
            fill
            className={`object-cover transition-all duration-700 ${estado === 'vendido' ? 'opacity-50 grayscale-[40%]' : ''}`}
            onError={() => setImgErrors(prev => ({ ...prev, [fotoIndex]: true }))}
            priority={fotoIndex === 0}
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,48,60,0.15)_0%,rgba(2,48,60,0.05)_30%,rgba(7,12,20,0.55)_70%,rgba(7,12,20,0.95)_100%)]" />

          <Link
            href="/proyectos"
            className="absolute top-5 left-5 z-10 flex items-center gap-2 bg-black/30 backdrop-blur-md text-white/90 px-4 py-2 rounded-full text-xs font-bold hover:bg-black/50 transition-all"
          >
            <FiArrowLeft size={14} />
            Catálogo
          </Link>

          <span className={`absolute top-5 right-5 z-10 text-[11px] font-black uppercase tracking-wider px-3.5 py-1.5 rounded-full backdrop-blur-md ${badge.cls}`}>
            {badge.label}
          </span>

          {/* Info sobre portada */}
          <div className="absolute bottom-0 left-0 right-0 px-6 pb-8 lg:px-10 lg:pb-10">
            <div className="max-w-7xl mx-auto flex flex-col gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="bg-horos-500 text-white text-[10px] font-black uppercase tracking-[0.15em] px-3 py-1.5 rounded-md">
                  {proyecto.tipo}
                </span>
                {esConjunto && proyecto.total_unidades && (
                  <span className="bg-white/15 backdrop-blur-sm text-white text-[10px] font-bold px-3 py-1.5 rounded-md border border-white/20">
                    <FiHome size={10} className="inline mr-1" />
                    {proyecto.total_unidades} lotes
                  </span>
                )}
              </div>
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-white leading-[1.1] tracking-tight drop-shadow-lg">
                {proyecto.titulo}
              </h1>
              <p className="flex items-center gap-2 text-white/70 text-sm font-medium">
                <FiMapPin className="text-horos-300 shrink-0" size={14} />
                {proyecto.ubicacion}
              </p>

              {/* Stats inline sobre la portada */}
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-1">
                {statItems.slice(0, 4).map((item, i) => (
                  <span key={i} className="flex items-center gap-1.5 text-white/90 text-sm">
                    <span className="text-horos-300">{item.icon}</span>
                    <span className="font-black">{item.val}</span>
                    <span className="text-white/50 text-xs hidden sm:inline">{item.label}</span>
                  </span>
                ))}
                <span className="flex items-baseline gap-1.5 ml-auto">
                  {proyecto.precio_desde && <span className="text-horos-300 text-sm font-semibold">Desde</span>}
                  <span className="text-2xl md:text-3xl font-black text-white drop-shadow-lg">S/. {fmt(proyecto.precio)}</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Galería carrusel */}
        {listaFotos.length > 1 && (
          <div className="bg-ink-900/95 backdrop-blur-sm">
            <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-2">
              <div className="flex gap-1.5 overflow-x-auto scrollbar-none flex-1 py-1">
                {listaFotos.map((foto, i) => {
                  const isModelo = i >= modeloStartIndex;
                  return (
                    <button
                      key={i}
                      onClick={() => { setFotoIndex(i); }}
                      className={`group relative shrink-0 rounded-lg overflow-hidden transition-all duration-200 ${
                        i === fotoIndex
                          ? 'ring-2 ring-horos-400 ring-offset-2 ring-offset-ink-900 w-24 h-16'
                          : 'opacity-50 hover:opacity-90 w-20 h-14'
                      }`}
                    >
                      <Image
                        src={imgErrors[i] ? proyecto.imagen : foto}
                        alt={isModelo ? `Modelo ${i - modeloStartIndex + 1}` : `Foto ${i + 1}`}
                        fill
                        className="object-cover"
                        sizes="96px"
                        onError={() => setImgErrors(prev => ({ ...prev, [i]: true }))}
                      />
                      {isModelo && (
                        <div className="absolute bottom-0 inset-x-0 bg-emerald-600/90 text-white text-[7px] font-black text-center py-px uppercase tracking-wider">
                          Modelo
                        </div>
                      )}
                      {i === 0 && (
                        <div className="absolute top-0 left-0 bg-horos-500/90 text-white text-[7px] font-black px-1.5 py-px uppercase tracking-wider rounded-br-md">
                          Portada
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
              <button
                onClick={() => setModalFoto(fotoIndex)}
                className="shrink-0 flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-3 py-2 rounded-lg transition-colors border border-white/10"
              >
                <FiMaximize2 size={13} />
                <span className="hidden sm:inline">Ampliar</span>
              </button>
            </div>
          </div>
        )}
      </section>

      {/* ── Main content ────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-3 gap-10">

        {/* ── Left column ─────────────────────────────────────── */}
        <div className="lg:col-span-2 flex flex-col gap-7">

          {statItems.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-ink-100 overflow-hidden">
              <div className="px-6 pt-5 pb-4 border-b border-ink-50 flex items-center gap-2">
                <span className="w-1 h-5 bg-horos-500 rounded-full inline-block" />
                <h3 className="text-ink-900 font-black text-base">Características del Inmueble</h3>
              </div>
              <div className="p-5 grid grid-cols-2 sm:grid-cols-3 gap-3">
                {statItems.map((item, i) => (
                  <div key={i} className="bg-ink-50 rounded-xl p-4 flex flex-col items-center gap-1.5 border border-ink-100 hover:border-horos-200 transition-colors">
                    <div className="text-horos-500 text-xl">{item.icon}</div>
                    <p className="text-xl font-black text-ink-900">{item.val}</p>
                    <p className="text-[11px] text-ink-400 font-semibold uppercase tracking-wide text-center">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(proyecto.entrega || proyecto.financiamiento || proyecto.amoblado) && (
            <div className="bg-white rounded-2xl shadow-sm border border-ink-100 overflow-hidden">
              <div className="px-6 pt-5 pb-4 border-b border-ink-50 flex items-center gap-2">
                <span className="w-1 h-5 bg-horos-500 rounded-full inline-block" />
                <h3 className="text-ink-900 font-black text-base">Condiciones del proyecto</h3>
              </div>
              <ul className="p-5 flex flex-col gap-3">
                {proyecto.entrega && (
                  <li className="flex items-center gap-3 text-sm text-ink-600">
                    <div className="w-7 h-7 rounded-full bg-horos-50 flex items-center justify-center shrink-0">
                      <FiCalendar className="text-horos-600" size={14} />
                    </div>
                    <span><strong className="text-ink-800">Entrega estimada:</strong> {proyecto.entrega}</span>
                  </li>
                )}
                {proyecto.financiamiento && (
                  <li className="flex items-center gap-3 text-sm text-ink-600">
                    <div className="w-7 h-7 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                      <FaCheck className="text-emerald-500" size={12} />
                    </div>
                    <span>
                      Acepta <strong className="text-ink-800">financiamiento</strong>
                      {proyecto.financiamiento_tipo ? ` — ${proyecto.financiamiento_tipo}` : ' bancario y MIVIVIENDA'}
                    </span>
                  </li>
                )}
                {proyecto.amoblado && (
                  <li className="flex items-center gap-3 text-sm text-ink-600">
                    <div className="w-7 h-7 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                      <FaCheck className="text-emerald-500" size={12} />
                    </div>
                    <span>Se entrega <strong className="text-ink-800">amoblado</strong></span>
                  </li>
                )}
              </ul>
            </div>
          )}

          {listaModelos.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-ink-100 overflow-hidden">
              <div className="px-6 pt-5 pb-4 border-b border-ink-50 flex items-center gap-2">
                <span className="w-1 h-5 bg-emerald-500 rounded-full inline-block" />
                <h3 className="text-ink-900 font-black text-base">Modelos de casas</h3>
              </div>
              <div className="p-5 flex flex-col gap-6">
                {listaModelos.map((m: any, mi: number) => {
                  const curIdx = modeloFotoIdx[mi] ?? 0;
                  const imgs: string[] = Array.isArray(m.imagenes) ? m.imagenes : [];
                  return (
                    <div key={mi} className="border border-emerald-200 rounded-xl overflow-hidden bg-white">
                      {/* Carrusel principal */}
                      {imgs.length > 0 && (
                        <div className="relative w-full aspect-[16/9] md:aspect-[21/9] bg-ink-900">
                          <Image src={imgs[curIdx]} alt={`${m.titulo} — imagen ${curIdx + 1}`}
                            fill className="object-cover" sizes="(max-width: 768px) 100vw, 800px" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                          <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
                            <h4 className="text-white font-black text-lg md:text-xl drop-shadow-lg leading-tight">
                              {m.titulo || `Modelo ${mi + 1}`}
                            </h4>
                            {m.precio && (
                              <span className="text-white font-black text-base md:text-lg drop-shadow-lg shrink-0 ml-2">
                                S/. {fmt(m.precio)}
                              </span>
                            )}
                          </div>
                          {/* Flechas */}
                          {imgs.length > 1 && (
                            <>
                              <button onClick={(e) => { e.stopPropagation(); setModeloFotoIdx(p => ({ ...p, [mi]: curIdx === 0 ? imgs.length - 1 : curIdx - 1 })); }}
                                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white rounded-full w-9 h-9 flex items-center justify-center text-lg font-black transition-all backdrop-blur-sm">
                                ‹
                              </button>
                              <button onClick={(e) => { e.stopPropagation(); setModeloFotoIdx(p => ({ ...p, [mi]: curIdx === imgs.length - 1 ? 0 : curIdx + 1 })); }}
                                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white rounded-full w-9 h-9 flex items-center justify-center text-lg font-black transition-all backdrop-blur-sm">
                                ›
                              </button>
                            </>
                          )}
                          {/* Contador */}
                          <div className="absolute top-3 right-3 bg-black/50 text-white text-[10px] font-bold px-2 py-1 rounded-full backdrop-blur-sm">
                            {curIdx + 1} / {imgs.length}
                          </div>
                          {/* Badge ampliar */}
                          <button onClick={() => setModalModelo({ mi, ii: curIdx })}
                            className="absolute top-3 left-3 bg-white/20 hover:bg-white/40 text-white text-[10px] font-bold px-2.5 py-1 rounded-full backdrop-blur-sm transition-all flex items-center gap-1">
                            <FiMaximize2 size={11} /> Ampliar
                          </button>
                        </div>
                      )}

                      {/* Miniaturas */}
                      {imgs.length > 1 && (
                        <div className="flex gap-1.5 px-4 py-2.5 overflow-x-auto scrollbar-none bg-ink-50 border-b border-ink-100">
                          {imgs.map((img: string, ii: number) => (
                            <button key={ii} onClick={() => setModeloFotoIdx(p => ({ ...p, [mi]: ii }))}
                              className={`relative shrink-0 w-14 h-10 rounded-lg overflow-hidden border-2 transition-all ${
                                ii === curIdx ? 'border-emerald-500 ring-2 ring-emerald-300 opacity-100' : 'border-transparent opacity-50 hover:opacity-80'
                              }`}>
                              <Image src={img} alt="" fill className="object-cover" sizes="56px" />
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Datos + descripción */}
                      <div className="p-4 flex flex-col gap-3">
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                          {m.area && (
                            <span className="flex items-center gap-1 font-semibold text-ink-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                              <FiMaximize2 size={12} className="text-emerald-600" /> {m.area} m²
                            </span>
                          )}
                          {m.dormitorios && (
                            <span className="flex items-center gap-1 text-ink-600">
                              <FaBed size={12} className="text-ink-400" /> {m.dormitorios} dorm.
                            </span>
                          )}
                          {m.banos && (
                            <span className="flex items-center gap-1 text-ink-600">
                              <FaBath size={12} className="text-ink-400" /> {m.banos} baños
                            </span>
                          )}
                        </div>
                        {m.descripcion && (
                          <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
                            <p className="text-amber-900 text-sm leading-relaxed font-medium">
                              <span className="text-amber-700 font-black text-[10px] uppercase tracking-wider block mb-1">Descripción del modelo</span>
                              {m.descripcion}
                            </p>
                          </div>
                        )}
                        {m.ampliacion && (m.ampliacion.descripcion || m.ampliacion.area || m.ampliacion.pisos || (Array.isArray(m.ampliacion.imagenes) && m.ampliacion.imagenes.length > 0)) && (
                          <div className="border-t border-slate-100 pt-4 mt-2">
                            <div className="flex items-center gap-2 mb-3">
                              <div className="w-5 h-5 rounded-md bg-slate-800 flex items-center justify-center text-[9px] font-black text-white shrink-0">+</div>
                              <span className="text-slate-700 font-black text-[11px] uppercase tracking-wider">Ampliación de casa</span>
                            </div>
                            {(() => {
                              const ampImgs: string[] = Array.isArray(m.ampliacion.imagenes) ? m.ampliacion.imagenes : [];
                              const ampCur = ampliacionFotoIdx[mi] ?? 0;
                              return (
                                <>
                                  {ampImgs.length > 0 && (
                                    <div className="relative w-full aspect-[16/9] bg-ink-900 rounded-lg overflow-hidden">
                                      <img src={ampImgs[ampCur]} alt="Ampliación"
                                        className="absolute inset-0 w-full h-full object-cover" />
                                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                                      {ampImgs.length > 1 && (
                                        <>
                                          <button onClick={(e) => { e.stopPropagation(); setAmpliacionFotoIdx(p => ({ ...p, [mi]: ampCur === 0 ? ampImgs.length - 1 : ampCur - 1 })); }}
                                            className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white rounded-full w-8 h-8 flex items-center justify-center text-base font-black transition-all backdrop-blur-sm">‹</button>
                                          <button onClick={(e) => { e.stopPropagation(); setAmpliacionFotoIdx(p => ({ ...p, [mi]: ampCur === ampImgs.length - 1 ? 0 : ampCur + 1 })); }}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white rounded-full w-8 h-8 flex items-center justify-center text-base font-black transition-all backdrop-blur-sm">›</button>
                                        </>
                                      )}
                                      <div className="absolute top-3 right-3 bg-black/50 text-white text-[10px] font-bold px-2 py-1 rounded-full backdrop-blur-sm">
                                        {ampCur + 1} / {ampImgs.length}
                                      </div>
                                      <button onClick={() => setModalAmpliacion({ mi, ai: ampCur })}
                                        className="absolute top-3 left-3 bg-white/20 hover:bg-white/40 text-white text-[10px] font-bold px-2.5 py-1 rounded-full backdrop-blur-sm transition-all flex items-center gap-1">
                                        <FiMaximize2 size={11} /> Ampliar
                                      </button>
                                    </div>
                                  )}
                                  {ampImgs.length > 1 && (
                                    <div className="flex gap-1.5 mt-2 overflow-x-auto scrollbar-none">
                                      {ampImgs.map((img: string, ai: number) => (
                                        <button key={ai} onClick={() => setAmpliacionFotoIdx(p => ({ ...p, [mi]: ai }))}
                                          className={`relative shrink-0 w-14 h-10 rounded-lg overflow-hidden border-2 transition-all ${
                                            ai === ampCur ? 'border-slate-700 ring-2 ring-slate-300 opacity-100' : 'border-transparent opacity-50 hover:opacity-80'
                                          }`}>
                                          <img src={img} alt="" className="absolute inset-0 w-full h-full object-cover" />
                                        </button>
                                      ))}
                                    </div>
                                  )}
                                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm mt-2">
                                    {m.ampliacion.area && (
                                      <span className="flex items-center gap-1 font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
                                        <FiMaximize2 size={12} /> {m.ampliacion.area} m²
                                      </span>
                                    )}
                                    {m.ampliacion.pisos && (
                                      <span className="flex items-center gap-1 text-slate-600 font-semibold">
                                        <FiLayers size={12} /> {m.ampliacion.pisos} pisos
                                      </span>
                                    )}
                                  </div>
                                  {m.ampliacion.descripcion && (
                                    <p className="text-slate-700 text-sm leading-relaxed mt-1">{m.ampliacion.descripcion}</p>
                                  )}
                                </>
                              );
                            })()}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {Array.isArray(proyecto.caracteristicas) && proyecto.caracteristicas.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-ink-100 overflow-hidden">
              <div className="px-6 pt-5 pb-4 border-b border-ink-50 flex items-center gap-2">
                <span className="w-1 h-5 bg-horos-500 rounded-full inline-block" />
                <h3 className="text-ink-900 font-black text-base">Amenidades y servicios</h3>
              </div>
              <div className="p-5 flex flex-wrap gap-2">
                {proyecto.caracteristicas.map((item, i) => (
                  <span key={i} className="flex items-center gap-1.5 text-xs font-semibold text-horos-700 bg-horos-50 border border-horos-100 px-3 py-2 rounded-full hover:bg-horos-100 transition-colors">
                    <FaCheck size={9} className="text-horos-500" />
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}

          {proyecto.descripcion && (
            <div className="bg-white rounded-2xl shadow-sm border border-ink-100 overflow-hidden">
              <div className="px-6 pt-5 pb-4 border-b border-ink-50 flex items-center gap-2">
                <span className="w-1 h-5 bg-horos-500 rounded-full inline-block" />
                <h3 className="text-ink-900 font-black text-base">Descripción</h3>
              </div>
              <p className="p-5 text-ink-600 leading-relaxed text-sm whitespace-pre-line">
                {proyecto.descripcion}
              </p>
            </div>
          )}

          {proyecto.video_url && (
            <div className="bg-white rounded-2xl shadow-sm border border-ink-100 overflow-hidden">
              <div className="px-6 pt-5 pb-4 border-b border-ink-50 flex items-center gap-2">
                <span className="w-1 h-5 bg-horos-500 rounded-full inline-block" />
                <h3 className="text-ink-900 font-black text-base">Tour virtual</h3>
              </div>
              <div className="relative aspect-video w-full">
                <iframe
                  src={toYoutubeEmbed(proyecto.video_url)}
                  title="Tour virtual del inmueble"
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          )}

          <div className="bg-white rounded-2xl shadow-sm border border-ink-100 overflow-hidden">
            <div className="px-6 pt-5 pb-4 border-b border-ink-50 flex items-center gap-2">
              <span className="w-1 h-5 bg-horos-500 rounded-full inline-block" />
              <div>
                <h3 className="text-ink-900 font-black text-base leading-tight">Localización</h3>
                <p className="text-ink-400 text-xs mt-0.5">{proyecto.ubicacion}</p>
              </div>
            </div>

            <div className="px-6 pt-2 pb-2 flex items-center gap-1.5">
              <FiMapPin size={12} className="text-horos-500" />
              <span className="text-xs font-bold text-ink-500 uppercase tracking-wide">Ubicación en Google Maps</span>
            </div>
            <div className="h-80">
              <iframe src={proyecto.mapa_embed_src ?? mapaUrl} width="100%" height="100%"
                className="border-0 w-full h-full" allowFullScreen loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title={`Ubicación de ${proyecto.titulo}`} />
            </div>

            <div className="px-6 py-3 bg-ink-50 border-t border-ink-100 flex items-center justify-end">
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(proyecto.ubicacion + ', Perú')}`}
                target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs font-bold text-horos-600 hover:text-horos-700 hover:underline transition-colors">
                <FiExternalLink size={12} /> Abrir en Google Maps
              </a>
            </div>
          </div>
        </div>

        {/* ── Right sidebar ────────────────────────────────────── */}
        <div className="flex flex-col gap-5">

          <div className="bg-horos-950 text-white rounded-2xl shadow-lg p-6"
            style={{ background: 'linear-gradient(160deg, #02303C 0%, #044A5C 100%)' }}>

            <span className={`inline-flex items-center text-xs font-black uppercase tracking-wider px-2.5 py-1 rounded-full border mb-3 ${badge.cls}`}>
              {badge.label}
            </span>

            <p className="text-horos-300/60 text-[10px] uppercase tracking-widest font-bold mb-1">
              {proyecto.precio_desde ? 'Precio desde' : 'Precio del Inmueble'}
            </p>
            <p className="text-3xl font-black text-accent-400 mb-1 leading-none">
              {proyecto.precio_desde && <span className="text-base font-semibold text-accent-300 mr-1">Desde</span>}
              S/. {fmt(proyecto.precio)}
            </p>

            <div className="flex flex-wrap gap-2 mb-5 mt-2">
              {proyecto.entrega && (
                <span className="flex items-center gap-1 text-[11px] font-semibold text-horos-200 bg-white/8 px-2.5 py-1 rounded-full">
                  <FiCalendar size={10} /> Entrega {proyecto.entrega}
                </span>
              )}
              {proyecto.financiamiento && (
                <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                  <FaCheck size={9} /> {proyecto.financiamiento_tipo ?? 'Financiable'}
                </span>
              )}
            </div>

            <div className="flex flex-col gap-3">
              <a href={whatsappHref} target="_blank" rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20b858] text-white font-black py-3 px-4 rounded-xl text-sm transition-colors">
                <FaWhatsapp size={16} /> Consultar por WhatsApp
              </a>
              <a href="tel:+51971000482"
                className="w-full flex items-center justify-center gap-2 bg-white/10 border border-white/15 hover:bg-white/15 text-white font-bold py-3 px-4 rounded-xl text-sm transition-colors">
                <FiPhone size={14} /> Llamar: 971 000 482
              </a>
              <Link href="/contacto"
                className="w-full flex items-center justify-center gap-2 bg-accent-500 hover:bg-accent-400 text-white font-black py-3 px-4 rounded-xl text-sm transition-colors">
                Solicitar cotización
              </Link>
            </div>

            {proyecto.enlace_mas_info && (
              <a href={proyecto.enlace_mas_info} target="_blank" rel="noopener noreferrer"
                className="mt-4 w-full flex items-center justify-center gap-2 border border-horos-400/40 text-horos-300 hover:bg-horos-500/10 hover:border-horos-400 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all">
                <FiExternalLink size={13} /> Ver más información oficial
              </a>
            )}
          </div>

          {/* Landing embebido */}
          {(proyecto.landing_imagen || proyecto.landing_url) && (
            <div className="rounded-2xl overflow-hidden border border-ink-100 shadow-sm">
              {proyecto.landing_titulo && (
                <div className="px-4 pt-3 pb-1 bg-white border-b border-ink-50">
                  <p className="text-[10px] font-black text-ink-500 uppercase tracking-widest">{proyecto.landing_titulo}</p>
                </div>
              )}
              {proyecto.landing_imagen && proyecto.landing_url ? (
                <a href={proyecto.landing_url} target="_blank" rel="noopener noreferrer"
                  className="block bg-white hover:opacity-90 transition-opacity">
                  <img src={proyecto.landing_imagen} alt={proyecto.landing_titulo || proyecto.titulo}
                    className="w-full h-auto object-cover" />
                </a>
              ) : proyecto.landing_url ? (
                <a href={proyecto.landing_url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 p-4 bg-white text-horos-600 font-bold text-sm hover:text-horos-700 transition-colors">
                  <FiExternalLink size={14} /> {proyecto.landing_url.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                </a>
              ) : null}
            </div>
          )}

          {/* Ficha técnica */}
          <div className="bg-white rounded-2xl shadow-sm border border-ink-100 p-5">
            <p className="text-horos-600 text-[10px] font-black uppercase tracking-widest mb-3 flex items-center gap-1.5">
              <FaBuilding size={10} /> Ficha técnica
            </p>

            <div className="flex flex-col gap-2">
              <button onClick={() => generarFichaPDF(proyecto)}
                className="w-full flex items-center justify-center gap-2 text-sm font-bold text-white bg-horos-600 hover:bg-horos-500 active:scale-95 py-2.5 px-4 rounded-xl transition-all">
                <FiDownload size={14} /> Ficha técnica
              </button>

              {proyecto.ficha_tecnica_url && (
                <a href={proyecto.ficha_tecnica_url} target="_blank" rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 text-sm font-semibold text-horos-700 bg-horos-50 border border-horos-200 hover:bg-horos-100 py-2.5 px-4 rounded-xl transition-all">
                  <FiDownload size={13} /> {proyecto.ficha_tecnica_label || 'Ficha técnica'}
                </a>
              )}
              {proyecto.ficha_tecnica_2_url && (
                <a href={proyecto.ficha_tecnica_2_url} target="_blank" rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 text-sm font-semibold text-horos-700 bg-horos-50 border border-horos-200 hover:bg-horos-100 py-2.5 px-4 rounded-xl transition-all">
                  <FiDownload size={13} /> {proyecto.ficha_tecnica_2_label || 'Brochure'}
                </a>
              )}
            </div>

            <ul className="space-y-2.5 text-sm divide-y divide-ink-50">
              <li className="flex justify-between items-center py-1.5">
                <span className="text-ink-500">Tipo</span>
                <span className="font-semibold text-ink-800">{proyecto.tipo}</span>
              </li>
              <li className="flex justify-between items-center py-1.5">
                <span className="text-ink-500">Ubicación</span>
                <span className="font-semibold text-ink-800 text-right max-w-[60%] text-xs">{proyecto.ubicacion}</span>
              </li>
              {esConjunto && proyecto.total_unidades && (
                <li className="flex justify-between items-center py-1.5">
                  <span className="text-ink-500">Nº de lotes</span>
                  <span className="font-semibold text-ink-800">{proyecto.total_unidades} unidades</span>
                </li>
              )}
              {proyecto.metros && (
                <li className="flex justify-between items-center py-1.5">
                  <span className="text-ink-500">{esLote ? 'Área terreno' : 'Área total'}</span>
                  <span className="font-semibold text-ink-800">{proyecto.metros} m²</span>
                </li>
              )}
              {areaEfectiva && (
                <li className="flex justify-between items-center py-1.5">
                  <span className="text-ink-500">Área construida</span>
                  <span className="font-semibold text-ink-800">{areaEfectiva} m²</span>
                </li>
              )}
              {proyecto.pisos_proyectados && (
                <li className="flex justify-between items-center py-1.5">
                  <span className="text-ink-500">{esLote ? 'Pisos proy.' : 'Pisos'}</span>
                  <span className="font-semibold text-ink-800">{proyecto.pisos_proyectados}</span>
                </li>
              )}
              {proyecto.total_pisos && (
                <li className="flex justify-between items-center py-1.5">
                  <span className="text-ink-500">Pisos edificio</span>
                  <span className="font-semibold text-ink-800">{proyecto.total_pisos}</span>
                </li>
              )}
              {proyecto.antiguedad !== undefined && (
                <li className="flex justify-between items-center py-1.5">
                  <span className="text-ink-500">Antigüedad</span>
                  <span className="font-semibold text-ink-800">
                    {proyecto.antiguedad == 0 || proyecto.antiguedad == null ? 'Obra nueva' : `${proyecto.antiguedad} año${proyecto.antiguedad !== 1 ? 's' : ''}`}
                  </span>
                </li>
              )}
              <li className="flex justify-between items-center py-1.5">
                <span className="text-ink-500">Ref.</span>
                <span className="font-mono text-xs font-semibold text-ink-600">#{proyecto.id.toString().slice(0, 8)}</span>
              </li>
            </ul>
          </div>

        </div>
      </div>

      {/* ── Modal lightbox ──────────────────────────────────────── */}
      {modalFoto !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          onClick={() => setModalFoto(null)}
        >
          {/* Cerrar */}
          <button
            className="absolute top-5 right-5 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-2.5 rounded-full transition-all z-10"
            onClick={() => setModalFoto(null)}
            aria-label="Cerrar"
          >
            <FiX size={20} />
          </button>

          {/* Contador */}
          <div className="absolute top-5 left-1/2 -translate-x-1/2 bg-black/60 text-white text-xs font-bold px-3 py-1.5 rounded-full z-10 select-none">
            {modalFoto + 1} / {listaFotos.length}
          </div>

          {/* Anterior */}
          {listaFotos.length > 1 && (
            <button
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white bg-white/10 hover:bg-white/25 p-3 rounded-full transition-all z-10"
              onClick={(e) => { e.stopPropagation(); modalAnterior(); }}
              aria-label="Foto anterior"
            >
              <FiChevronLeft size={26} />
            </button>
          )}

          {/* Imagen */}
          <div
            className="relative w-full max-w-5xl h-[85vh] px-16"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={imgErrors[modalFoto] ? proyecto.imagen : listaFotos[modalFoto]}
              alt={`${proyecto.titulo} — foto ${modalFoto + 1}`}
              fill
              className="object-contain"
              sizes="(max-width: 1280px) 100vw, 1280px"
              onError={() => setImgErrors(prev => ({ ...prev, [modalFoto!]: true }))}
            />
          </div>

          {/* Siguiente */}
          {listaFotos.length > 1 && (
            <button
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white bg-white/10 hover:bg-white/25 p-3 rounded-full transition-all z-10"
              onClick={(e) => { e.stopPropagation(); modalSiguiente(); }}
              aria-label="Foto siguiente"
            >
              <FiChevronRight size={26} />
            </button>
          )}

          {/* Miniaturas en el modal */}
          {listaFotos.length > 1 && (
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2 z-10 max-w-[90vw] overflow-x-auto scrollbar-none px-2">
              {listaFotos.map((foto, i) => {
                const isModelo = i >= modeloStartIndex;
                return (
                  <button
                    key={i}
                    onClick={(e) => { e.stopPropagation(); setModalFoto(i); }}
                    className={`relative shrink-0 w-14 h-10 rounded-lg overflow-hidden border-2 transition-all ${
                      i === modalFoto ? 'border-white opacity-100 scale-110' : 'border-white/20 opacity-40 hover:opacity-75'
                    }`}
                  >
                    <Image
                      src={imgErrors[i] ? proyecto.imagen : foto}
                      alt={isModelo ? `Modelo ${i - modeloStartIndex + 1}` : `Vista ${i + 1}`}
                      fill
                      className="object-cover"
                      sizes="56px"
                    />
                    {isModelo && (
                      <div className="absolute bottom-0 inset-x-0 bg-emerald-600/90 text-white text-[6px] font-black text-center uppercase">
                        Modelo
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Modal lightbox de modelo ──────────────────────────── */}
      {modalModelo !== null && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          onClick={() => setModalModelo(null)}>
          <button className="absolute top-5 right-5 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-2.5 rounded-full transition-all z-10"
            onClick={() => setModalModelo(null)}>
            <FiX size={20} />
          </button>
          <div className="absolute top-5 left-1/2 -translate-x-1/2 bg-black/60 text-white text-xs font-bold px-3 py-1.5 rounded-full z-10 select-none">
            {listaModelos[modalModelo.mi]?.titulo || 'Modelo'} · {modalModelo.ii + 1} / {listaModelos[modalModelo.mi]?.imagenes?.length}
          </div>
          {listaModelos[modalModelo.mi]?.imagenes?.length > 1 && (
            <>
              <button className="absolute left-4 top-1/2 -translate-y-1/2 text-white bg-white/10 hover:bg-white/25 p-3 rounded-full transition-all z-10"
                onClick={(e) => { e.stopPropagation(); setModalModelo(p => p ? { ...p, ii: p.ii === 0 ? listaModelos[p.mi].imagenes.length - 1 : p.ii - 1 } : null); }}>
                <FiChevronLeft size={26} />
              </button>
              <button className="absolute right-4 top-1/2 -translate-y-1/2 text-white bg-white/10 hover:bg-white/25 p-3 rounded-full transition-all z-10"
                onClick={(e) => { e.stopPropagation(); setModalModelo(p => p ? { ...p, ii: p.ii === listaModelos[p.mi].imagenes.length - 1 ? 0 : p.ii + 1 } : null); }}>
                <FiChevronRight size={26} />
              </button>
            </>
          )}
          <div className="relative w-full max-w-5xl h-[85vh] px-16" onClick={e => e.stopPropagation()}>
            <Image
              src={listaModelos[modalModelo.mi]?.imagenes[modalModelo.ii]}
              alt={`${listaModelos[modalModelo.mi]?.titulo} ${modalModelo.ii + 1}`}
              fill className="object-contain" sizes="(max-width: 1280px) 100vw, 1280px" />
          </div>
        </div>
      )}

      {modalAmpliacion !== null && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          onClick={() => setModalAmpliacion(null)}>
          <button className="absolute top-5 right-5 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-2.5 rounded-full transition-all z-10"
            onClick={() => setModalAmpliacion(null)}>
            <FiX size={20} />
          </button>
          <div className="absolute top-5 left-1/2 -translate-x-1/2 bg-black/60 text-amber-300 text-xs font-bold px-3 py-1.5 rounded-full z-10 select-none flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded bg-amber-500/30 flex items-center justify-center text-[8px] font-black text-amber-300">+</span>
            Ampliación de casa · {modalAmpliacion.ai + 1} / {(listaModelos[modalAmpliacion.mi] as any)?.ampliacion?.imagenes?.length}
          </div>
          {(listaModelos[modalAmpliacion.mi] as any)?.ampliacion?.imagenes?.length > 1 && (
            <>
              <button className="absolute left-4 top-1/2 -translate-y-1/2 text-white bg-white/10 hover:bg-white/25 p-3 rounded-full transition-all z-10"
                onClick={(e) => {
                  e.stopPropagation();
                  const imgs = (listaModelos[modalAmpliacion.mi] as any)?.ampliacion?.imagenes || [];
                  setModalAmpliacion(p => p ? { ...p, ai: p.ai === 0 ? imgs.length - 1 : p.ai - 1 } : null);
                }}>
                <FiChevronLeft size={26} />
              </button>
              <button className="absolute right-4 top-1/2 -translate-y-1/2 text-white bg-white/10 hover:bg-white/25 p-3 rounded-full transition-all z-10"
                onClick={(e) => {
                  e.stopPropagation();
                  const imgs = (listaModelos[modalAmpliacion.mi] as any)?.ampliacion?.imagenes || [];
                  setModalAmpliacion(p => p ? { ...p, ai: p.ai === imgs.length - 1 ? 0 : p.ai + 1 } : null);
                }}>
                <FiChevronRight size={26} />
              </button>
            </>
          )}
          <div className="relative w-full max-w-5xl h-[85vh] px-16" onClick={e => e.stopPropagation()}>
            <Image
              src={(listaModelos[modalAmpliacion.mi] as any)?.ampliacion?.imagenes[modalAmpliacion.ai]}
              alt="Ampliación de casa"
              fill className="object-contain" sizes="(max-width: 1280px) 100vw, 1280px" />
          </div>
        </div>
      )}
    </div>
  );
}
