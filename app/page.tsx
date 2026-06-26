'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Proyecto } from '@/types/proyecto';
import { supabase } from '@/lib/supabase';
import { FiPrinter } from 'react-icons/fi';

export default function CatalogoPage() {
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  const [ubicacion, setUbicacion] = useState('todos');
  const [cuartos, setCuartos] = useState('todos');
  const [banos, setBanos] = useState('todos');

  const [hoveredImages, setHoveredImages] = useState<{ [key: string]: number }>({});

  const [calcPrecio, setCalcPrecio] = useState(300000);
  const [calcInicial, setCalcInicial] = useState(60000);
  const [calcTasa, setCalcTasa] = useState(5.0);
  const [calcPlazo, setCalcPlazo] = useState(30);
  const [cuotaFinal, setCuotaFinal] = useState('S/. 0.00');
  const [montoFinanciarStr, setMontoFinanciarStr] = useState('S/. 0.00');

  useEffect(() => {
    const obtenerProyectos = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('proyectos')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;

        if (data) {
          setProyectos(data as Proyecto[]);
        }
      } catch (err) {
        console.error("Error cargando catálogo desde tu BD:", err);
      } finally {
        setLoading(false);
      }
    };

    obtenerProyectos();
  }, []);

  useEffect(() => {
    calcularCuota();
  }, [proyectos]);

  const opcionesUbicacion = useMemo(() => {
    const listas = proyectos.map(p => p.ubicacion).filter(Boolean);
    return Array.from(new Set(listas)).sort();
  }, [proyectos]);

  const opcionesCuartos = useMemo(() => {
    const listas = proyectos.map(p => p.cuartos).filter(c => c !== null && c !== undefined);
    return Array.from(new Set(listas)).sort((a, b) => a - b);
  }, [proyectos]);

  const opcionesBanos = useMemo(() => {
    const listas = proyectos.map(p => p.banos).filter(b => b !== null && b !== undefined);
    return Array.from(new Set(listas)).sort((a, b) => a - b);
  }, [proyectos]);

  const slugify = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const calcularCuota = () => {
    const montoFinanciar = calcPrecio - calcInicial;
    const tasaMensual = (calcTasa / 100) / 12;
    const nMeses = calcPlazo * 12;

    if (montoFinanciar <= 0 || nMeses <= 0) {
      setCuotaFinal('S/. 0.00');
      setMontoFinanciarStr('S/. 0.00');
      return;
    }

    const cuota = tasaMensual > 0 
      ? (montoFinanciar * tasaMensual) / (1 - Math.pow(1 + tasaMensual, -nMeses))
      : montoFinanciar / nMeses;

    setMontoFinanciarStr(`S/. ${montoFinanciar.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`);
    setCuotaFinal(`S/. ${cuota.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
  };

  const handleImprimir = () => {
    window.print();
  };

  const proyectosFiltrados = proyectos.filter(p => {
    const cUbi = ubicacion === 'todos' || p.ubicacion === ubicacion;
    const pCuartos = p.cuartos || 0;
    const pBanos = p.banos || 0;

    const cCua = cuartos === 'todos' || pCuartos === parseInt(cuartos);
    const cBan = banos === 'todos' || pBanos === parseInt(banos);
    return cUbi && cCua && cBan;
  });

  return (
    <div className="max-w-7xl mx-auto py-12 px-6 print:py-0 print:px-0">
      <h1 className="text-4xl font-black text-slate-900 text-center mb-2 print:hidden">Nuestros Proyectos</h1>
      <div className="w-16 h-1 bg-amber-700 mx-auto mb-12 print:hidden"></div>
      <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-100 flex flex-wrap gap-4 mb-8 items-center print:hidden">
        <select value={ubicacion} onChange={(e) => setUbicacion(e.target.value)} className="border border-slate-200 rounded p-2 text-sm bg-slate-50 cursor-pointer outline-none focus:border-amber-700">
          <option value="todos">Todas las ubicaciones ({opcionesUbicacion.length})</option>
          {opcionesUbicacion.map(ubi => (
            <option key={ubi} value={ubi}>{ubi}</option>
          ))}
        </select>

        <select value={cuartos} onChange={(e) => setCuartos(e.target.value)} className="border border-slate-200 rounded p-2 text-sm bg-slate-50 cursor-pointer outline-none focus:border-amber-700">
          <option value="todos">Cualquier n° cuartos</option>
          {opcionesCuartos.map(num => (
            <option key={num} value={num}>{num} Dorms</option>
          ))}
        </select>

        <select value={banos} onChange={(e) => setBanos(e.target.value)} className="border border-slate-200 rounded p-2 text-sm bg-slate-50 cursor-pointer outline-none focus:border-amber-700">
          <option value="todos">Cualquier n° baños</option>
          {opcionesBanos.map(num => (
            <option key={num} value={num}>{num} {num === 1 ? 'Baño' : 'Baños'}</option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 print:hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-5 animate-fade-in">
              <div className="spinner-brand" />
              <div className="text-center">
                <p className="text-ink-700 font-semibold text-sm">Cargando propiedades</p>
                <p className="text-ink-400 text-xs mt-0.5">Un momento por favor...</p>
              </div>
              {/* Skeleton cards */}
              <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                {[1,2,3,4].map(n => (
                  <div key={n} className="rounded-xl overflow-hidden border border-ink-100 bg-white" style={{animationDelay: `${n * 80}ms`}}>
                    <div className="skeleton h-48 w-full" />
                    <div className="p-4 flex flex-col gap-2">
                      <div className="skeleton h-4 w-3/4 rounded-full" />
                      <div className="skeleton h-3 w-1/2 rounded-full" />
                      <div className="skeleton h-3 w-full rounded-full mt-2" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : proyectosFiltrados.length === 0 ? (
            <div className="text-center py-20 text-ink-400 text-sm bg-white rounded-2xl border border-dashed border-ink-200 animate-fade-in">
              <div className="text-3xl mb-3 opacity-30">🏠</div>
              <p className="font-semibold text-ink-600">Sin resultados</p>
              <p className="text-xs mt-1">No hay proyectos con los filtros seleccionados.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {proyectosFiltrados.map(p => {
                const listaFotos = Array.isArray(p.imagenes) ? p.imagenes : [];
                const tieneSegundaFoto = listaFotos.length > 1;
                
                const indexImagenActual = hoveredImages[p.id] !== undefined ? hoveredImages[p.id] : 0;
                const imagenAMostrar = indexImagenActual === 1 && tieneSegundaFoto ? listaFotos[1] : p.imagen;

                return (
                  <div 
                    key={p.id} 
                    className="bg-white shadow-sm border border-slate-100 rounded-lg overflow-hidden flex flex-col justify-between transition-all hover:shadow-md"
                    onMouseEnter={() => tieneSegundaFoto && setHoveredImages(prev => ({ ...prev, [p.id]: 1 }))}
                    onMouseLeave={() => setHoveredImages(prev => ({ ...prev, [p.id]: 0 }))}
                  >
                    <div className="relative h-52 w-full bg-slate-200 overflow-hidden">
                      <img 
                        src={imagenAMostrar} 
                        alt={p.titulo} 
                        className="w-full h-full object-cover transition-transform duration-700 ease-out scale-100 hover:scale-105" 
                      />
                      {tieneSegundaFoto && (
                        <div className="absolute top-3 right-3 bg-black/40 text-[10px] text-white px-2 py-0.5 rounded-full backdrop-blur-xs">
                          +{listaFotos.length} fotos
                        </div>
                      )}
                    </div>
                    
                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div className="mb-4">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{p.tipo}</p>
                        <h4 className="text-lg font-bold text-slate-900 hover:text-amber-700">
                          <Link href={`/proyectos/${p.ruta || slugify(p.titulo)}`}>{p.titulo}</Link>
                        </h4>
                        <span className="text-xs text-gray-500 block mt-1">📍 {p.ubicacion}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs text-gray-600 font-semibold border-t border-slate-100 pt-3">
                        {p.metros && <span>📐 Lote: {p.metros} m²</span>}
                        {(p.area_techada ?? p.area_construida) && (
                          <span>🏠 Casa: {p.area_techada ?? p.area_construida} m²</span>
                        )}
                        <span>🛏️ {p.cuartos || '---'} Dorms</span>
                        <span>🚿 {p.banos || '---'} Baños</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-100 h-fit flex flex-col gap-4 print:col-span-3 print:border-none print:shadow-none print:p-0">
        
          <div className="hidden print:block text-center border-b pb-4 mb-4">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">HOROS INMOBILIARIA</h2>
            <p className="text-xs font-bold text-amber-700 uppercase tracking-widest mt-0.5">Cotización de Crédito Hipotecario Referencial</p>
          </div>

          <div className="flex justify-between items-center border-b border-slate-100 pb-2 print:border-none">
            <h3 className="text-lg font-bold text-slate-900 print:text-xl">Calculadora de cuotas</h3>
            <button 
              onClick={handleImprimir}
              className="print:hidden flex items-center gap-1.5 bg-slate-900 text-white text-xs font-bold px-3 py-1.5 rounded hover:bg-slate-800 transition-colors shadow-sm"
              title="Imprimir esta simulación"
            >
              <FiPrinter className="text-sm" /> Imprimir
            </button>
          </div>
          <div className="flex flex-col gap-4 print:hidden">
            <div>
              <label className="text-xs font-bold text-gray-500 block mb-1">Precio Total (S/.)</label>
              <input type="number" value={calcPrecio} onChange={(e) => setCalcPrecio(parseFloat(e.target.value) || 0)} className="w-full border border-gray-200 p-2 rounded text-sm outline-none focus:ring-1 focus:ring-amber-700"/>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 block mb-1">Cuota Inicial (S/.)</label>
              <input type="number" value={calcInicial} onChange={(e) => setCalcInicial(parseFloat(e.target.value) || 0)} className="w-full border border-gray-200 p-2 rounded text-sm outline-none focus:ring-1 focus:ring-amber-700"/>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-500 block mb-1">Tasa Interés (%)</label>
                <input type="number" value={calcTasa} onChange={(e) => setCalcTasa(parseFloat(e.target.value) || 0)} className="w-full border border-gray-200 p-2 rounded text-sm outline-none focus:ring-1 focus:ring-amber-700"/>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 block mb-1">Plazo (años)</label>
                <input type="number" value={calcPlazo} onChange={(e) => setCalcPlazo(parseInt(e.target.value) || 0)} className="w-full border border-gray-200 p-2 rounded text-sm outline-none focus:ring-1 focus:ring-amber-700"/>
              </div>
            </div>
            <button onClick={calcularCuota} className="w-full bg-amber-700 text-white font-bold py-2.5 rounded text-sm hover:bg-amber-800 transition-colors">Calcular</button>
          </div>
          <div className="hidden print:block my-4">
            <table className="w-full text-left text-sm border-collapse border border-slate-300">
              <tbody>
                <tr className="border-b border-slate-300">
                  <td className="p-3 font-bold bg-slate-50 w-1/2">Precio del Inmueble evaluado:</td>
                  <td className="p-3 text-slate-800">S/. {calcPrecio.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</td>
                </tr>
                <tr className="border-b border-slate-300">
                  <td className="p-3 font-bold bg-slate-50">Cuota Inicial Aportada:</td>
                  <td className="p-3 text-slate-800">S/. {calcInicial.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</td>
                </tr>
                <tr className="border-b border-slate-300">
                  <td className="p-3 font-bold bg-slate-50">Monto Neto Financiado por el banco:</td>
                  <td className="p-3 font-semibold text-slate-800">{montoFinanciarStr}</td>
                </tr>
                <tr className="border-b border-slate-300">
                  <td className="p-3 font-bold bg-slate-50">Tasa de Interés Nominal Efectiva:</td>
                  <td className="p-3 text-slate-800">{calcTasa}% TEA</td>
                </tr>
                <tr>
                  <td className="p-3 font-bold bg-slate-50">Plazo de amortización acordado:</td>
                  <td className="p-3 text-slate-800">{calcPlazo} años ({calcPlazo * 12} cuotas mensuales)</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="bg-slate-50 p-4 rounded text-center border mt-2 print:bg-white print:border-slate-400 print:mt-6 print:p-6">
            <span className="text-xs text-slate-500 block mb-1 print:text-sm print:text-slate-700">
              Para una hipoteca de <span className="font-bold text-slate-800">{montoFinanciarStr}</span> amortizado en {calcPlazo} años, su pago mensual estimado es de:
            </span>
            <span className="text-2xl font-black text-slate-900 print:text-4xl print:mt-2 print:block">
              {cuotaFinal} <span className="text-xs font-normal text-gray-400 print:text-sm print:text-slate-500">/ mes</span>
            </span>
          </div>

          <div className="hidden print:block mt-20 border-t border-slate-300 pt-4 text-center">
            <p className="text-[10px] text-slate-400">Simulación generada digitalmente en el portal web horosinmobiliaria.com.</p>
            <p className="text-[9px] text-slate-400 italic mt-1 max-w-xl mx-auto">
              *Nota: Los valores expuestos en este documento son estrictamente referenciales e informativos. Las tasas, primas de seguros desgravamen, gastos notariales y condiciones finales están sujetos a la evaluación crediticia formal de la entidad bancaria regulada por la SBS de su preferencia.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}