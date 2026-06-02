'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Proyecto } from '@/types/proyecto';
import { supabase } from '@/lib/supabase';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

export default function FichaProyectoPage() {
  const params = useParams();
  const id = typeof params?.id === 'string' ? params.id : undefined;
  
  const [proyecto, setProyecto] = useState<Proyecto | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [fotoActivaIndex, setFotoActivaIndex] = useState<number>(0);

  useEffect(() => {
    if (!id) return;

    const obtenerDetalleProyecto = async () => {
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('proyectos')
          .select('*')
          .eq('id', id)
          .single();
          
        if (error) throw error;

        if (data) {
          setProyecto(data as Proyecto);
        }
      } catch (err) {
        console.error("Error al consultar el inmueble en tu BD:", err);
      } finally {
        setLoading(false);
      }
    };

    obtenerDetalleProyecto();
  }, [id]);

  if (loading) {
    return <div className="text-center py-20 font-bold text-gray-400 text-sm animate-pulse">Cargando propiedad de Horos...</div>;
  }
  if (!proyecto) {
    return <div className="text-center py-20 font-bold text-red-800 bg-red-50 max-w-md mx-auto my-10 rounded border border-red-100 text-sm">La propiedad solicitada no existe en la base de datos.</div>;
  }

  const listaFotos = Array.isArray(proyecto.imagenes) && proyecto.imagenes.length > 0 
    ? proyecto.imagenes 
    : [proyecto.imagen];

  const anteriorFoto = () => {
    setFotoActivaIndex((prev) => (prev === 0 ? listaFotos.length - 1 : prev - 1));
  };

  const siguienteFoto = () => {
    setFotoActivaIndex((prev) => (prev === listaFotos.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="max-w-6xl mx-auto py-12 px-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 flex flex-col gap-6">
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">{proyecto.titulo}</h2>
        <p className="text-amber-700 font-bold uppercase tracking-wider text-xs">
          {proyecto.tipo} — 📍 {proyecto.ubicacion}
        </p>
        <div className="flex flex-col gap-3">
          <div className="relative w-full h-112 bg-slate-100 rounded-lg overflow-hidden shadow-sm border border-slate-200 group">
            <img 
              src={listaFotos[fotoActivaIndex]} 
              alt={`${proyecto.titulo} - Vista ${fotoActivaIndex + 1}`} 
              className="w-full h-full object-cover transition-all duration-500" 
            />
            
            {listaFotos.length > 1 && (
              <>
                <button 
                  onClick={anteriorFoto} 
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 p-2 rounded-full text-slate-800 shadow-md hover:bg-white transition-colors opacity-0 group-hover:opacity-100 duration-200"
                >
                  <FiChevronLeft size={20} />
                </button>
                <button 
                  onClick={siguienteFoto} 
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 p-2 rounded-full text-slate-800 shadow-md hover:bg-white transition-colors opacity-0 group-hover:opacity-100 duration-200"
                >
                  <FiChevronRight size={20} />
                </button>
                
                <div className="absolute bottom-4 right-4 bg-slate-900/80 text-white font-medium text-xs px-2.5 py-1 rounded backdrop-blur-xs">
                  {fotoActivaIndex + 1} / {listaFotos.length}
                </div>
              </>
            )}
          </div>
          {listaFotos.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
              {listaFotos.map((foto, index) => (
                <button
                  key={index}
                  onClick={() => setFotoActivaIndex(index)}
                  className={`relative w-20 h-14 rounded overflow-hidden border-2 bg-slate-100 shrink-0 transition-all ${
                    index === fotoActivaIndex ? 'border-amber-700 opacity-100 scale-95' : 'border-transparent opacity-60 hover:opacity-90'
                  }`}
                >
                  <img src={foto} alt="Miniatura" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold mb-4 text-slate-900 border-b pb-2">Características Principales</h3>
          <div className="grid grid-cols-3 gap-4 text-center bg-slate-50 p-4 rounded-md text-slate-700 font-bold text-xs">
            <div>
              <span className="block text-xl text-amber-700 mb-0.5">📐 {proyecto.metros || '---'} m²</span> 
              <span className="text-gray-400 font-normal">Área Total</span>
            </div>
            <div>
              <span className="block text-xl text-amber-700 mb-0.5">🛏️ {proyecto.cuartos || '---'}</span> 
              <span className="text-gray-400 font-normal">Dormitorios</span>
            </div>
            <div>
              <span className="block text-xl text-amber-700 mb-0.5">🚿 {proyecto.banos || '---'}</span> 
              <span className="text-gray-400 font-normal">Baños</span>
            </div>
          </div>
        </div>
        {proyecto.descripcion && (
          <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-100">
            <h3 className="text-lg font-bold mb-3 text-slate-900 border-b pb-2">Descripción del Inmueble</h3>
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
              {proyecto.descripcion}
            </p>
          </div>
        )}
      </div>
      <div className="flex flex-col gap-6">
        <div className="bg-slate-900 text-white p-6 rounded-lg shadow-md text-center">
          <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Precio del Inmueble</p>
          <h3 className="text-3xl font-black mt-1 text-amber-500">
            S/. {proyecto.precio.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
          </h3>
          {proyecto.enlace_mas_info && (
            <a 
              href={proyecto.enlace_mas_info} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="w-full bg-amber-700 text-white text-center font-bold py-3 rounded-lg text-sm shadow-sm hover:bg-amber-800 transition-colors block"
            >
              ✨ Conocer más de este Inmueble
            </a>
          )}
        </div>
      </div>
    </div>
  );
}