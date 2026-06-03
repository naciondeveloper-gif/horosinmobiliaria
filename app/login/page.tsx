'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  FiMail, FiUserPlus, FiLogOut, FiBriefcase,
  FiUser, FiCalendar, FiUploadCloud, FiTrash2, FiEdit2, FiX,
  FiMapPin, FiPhone, FiMaximize2, FiLink, FiImage,
  FiEye, FiShield, FiAlertCircle, FiCheckCircle, FiInfo,
  FiHash,
} from 'react-icons/fi';
import { FaBed, FaBath } from 'react-icons/fa';
import { Proyecto } from '@/types/proyecto';

const MAX_IMAGENES = 8;

interface UsuarioAdmin {
  id: string;
  nombre: string;
  email: string;
  rol: string;
  created_at: string;
}

export default function PanelAsesores() {
  const [user, setUser] = useState<any>(null);
  const [authForm, setAuthForm] = useState({ email: '', password: '' });
  const [activeTab, setActiveTab] = useState('leads');
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });

  const [leads, setLeads] = useState<any[]>([]);
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [usuarios, setUsuarios] = useState<UsuarioAdmin[]>([]);

  const [editandoProyectoId, setEditandoProyectoId] = useState<number | null>(null);
  const [nuevoProyecto, setNuevoProyecto] = useState({
    titulo: '', tipo: 'Venta', ubicacion: '', precio: '',
    ruta: '', descripcion: '', metros: '', cuartos: '', banos: '',
    enlace_mas_info: '',
  });
  const [archivosImagenes, setArchivosImagenes] = useState<FileList | null>(null);
  const [imagenesPreview, setImagenesPreview] = useState<string[]>([]);
  const [mostrarMapaPreview, setMostrarMapaPreview] = useState(false);

  const [editandoUsuarioId, setEditandoUsuarioId] = useState<string | null>(null);
  const [nuevoUsuario, setNuevoUsuario] = useState({ email: '', password: '', nombre: '', rol: 'asesor' });

  const handleLogout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('horos_session');
    setStatusMsg({ type: 'success', text: 'Sesión cerrada correctamente.' });
  }, []);

  useEffect(() => {
    if (!user) return;
    const tiempoLimite = 15 * 60 * 1000;
    let temporizador: NodeJS.Timeout | undefined;
    const reiniciar = () => {
      clearTimeout(temporizador);
      temporizador = setTimeout(handleLogout, tiempoLimite);
    };
    const eventos = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    eventos.forEach((ev) => document.addEventListener(ev, reiniciar));
    reiniciar();
    return () => {
      clearTimeout(temporizador);
      eventos.forEach((ev) => document.removeEventListener(ev, reiniciar));
    };
  }, [user, handleLogout]);

  useEffect(() => {
    const sesion = localStorage.getItem('horos_session');
    if (sesion) setUser(JSON.parse(sesion));
  }, []);

  useEffect(() => {
    if (user) { cargarLeads(); cargarProyectos(); cargarUsuarios(); }
  }, [user]);

  const cargarLeads = async () => {
    const { supabase } = await import('@/lib/supabase');
    const { data } = await supabase.from('leads').select('*').order('created_at', { ascending: false });
    if (data) setLeads(data);
  };

  const cargarProyectos = async () => {
    const res = await fetch('/api/proyectos');
    if (res.ok) setProyectos(await res.json());
  };

  const cargarUsuarios = async () => {
    const res = await fetch('/api/usuarios');
    if (res.ok) setUsuarios(await res.json());
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setStatusMsg({ type: '', text: '' });
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(authForm),
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data.user);
        localStorage.setItem('horos_session', JSON.stringify(data.user));
      } else {
        setStatusMsg({ type: 'error', text: data.error || 'Credenciales inválidas.' });
      }
    } catch {
      setStatusMsg({ type: 'error', text: 'Error de conexión con el servidor.' });
    } finally {
      setLoading(false);
    }
  };

  const subirImagenesAlStorage = async (files: FileList): Promise<string[]> => {
    const { supabase } = await import('@/lib/supabase');
    const urls: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const ext = file.name.split('.').pop();
      const nombre = `${Date.now()}_${i}.${ext}`;
      const { data, error } = await supabase.storage
        .from('proyectos-imagenes')
        .upload(nombre, file, { cacheControl: '3600', upsert: false });
      if (error) throw new Error(`Error subiendo ${file.name}: ${error.message}`);
      if (data) {
        const { data: urlData } = supabase.storage.from('proyectos-imagenes').getPublicUrl(nombre);
        urls.push(urlData.publicUrl);
      }
    }
    return urls;
  };

  const slugify = (text: string) =>
    text.toLowerCase().trim()
      .normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const handleImagenesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) {
      setArchivosImagenes(null);
      setImagenesPreview([]);
      return;
    }
    if (files.length > MAX_IMAGENES) {
      setStatusMsg({ type: 'error', text: `Máximo ${MAX_IMAGENES} imágenes permitidas. Seleccionaste ${files.length}.` });
      e.target.value = '';
      return;
    }
    setArchivosImagenes(files);
    setImagenesPreview(Array.from(files).map((f) => URL.createObjectURL(f)));
  };

  const cancelarEdicionProyecto = () => {
    setEditandoProyectoId(null);
    setNuevoProyecto({ titulo: '', tipo: 'Venta', ubicacion: '', precio: '', ruta: '', descripcion: '', metros: '', cuartos: '', banos: '', enlace_mas_info: '' });
    setArchivosImagenes(null);
    setImagenesPreview([]);
    setMostrarMapaPreview(false);
    const input = document.getElementById('file-selector') as HTMLInputElement;
    if (input) input.value = '';
  };

  const handleGuardarProyecto = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setStatusMsg({ type: '', text: '' });
    try {
      if (!editandoProyectoId && (!archivosImagenes || archivosImagenes.length < 1)) {
        throw new Error('Selecciona al menos 1 imagen para el inmueble.');
      }

      let urlsImagenes: string[] = [];
      if (archivosImagenes && archivosImagenes.length > 0) {
        setStatusMsg({ type: 'info', text: 'Subiendo imágenes a Supabase Storage...' });
        urlsImagenes = await subirImagenesAlStorage(archivosImagenes);
      }

      const datos: any = {
        titulo: nuevoProyecto.titulo,
        tipo: nuevoProyecto.tipo,
        ubicacion: nuevoProyecto.ubicacion,
        ruta: nuevoProyecto.ruta ? slugify(nuevoProyecto.ruta) : (slugify(nuevoProyecto.titulo) || `proyecto-${Date.now()}`),
        precio: parseFloat(nuevoProyecto.precio),
        descripcion: nuevoProyecto.descripcion,
        metros: nuevoProyecto.metros ? parseFloat(nuevoProyecto.metros) : null,
        cuartos: nuevoProyecto.cuartos ? parseInt(nuevoProyecto.cuartos) : null,
        banos: nuevoProyecto.banos ? parseInt(nuevoProyecto.banos) : null,
        enlace_mas_info: nuevoProyecto.enlace_mas_info,
      };
      if (urlsImagenes.length > 0) {
        datos.imagen = urlsImagenes[0];
        datos.imagenes = urlsImagenes;
      }

      const url = editandoProyectoId ? `/api/proyectos/${editandoProyectoId}` : '/api/proyectos';
      const method = editandoProyectoId ? 'PUT' : 'POST';
      if (!editandoProyectoId) datos.autor_id = user.id;

      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(datos) });
      if (!res.ok) { const err = await res.json(); throw new Error(err.error); }

      setStatusMsg({ type: 'success', text: editandoProyectoId ? '¡Inmueble actualizado con éxito!' : '¡Nuevo inmueble publicado con éxito!' });
      cancelarEdicionProyecto();
      cargarProyectos();
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleEliminarProyecto = async (id: number) => {
    if (!confirm('¿Seguro que deseas eliminar este inmueble? Esta acción es irreversible.')) return;
    try {
      const res = await fetch(`/api/proyectos/${id}`, { method: 'DELETE' });
      if (res.ok) { setStatusMsg({ type: 'success', text: 'Inmueble eliminado.' }); cargarProyectos(); }
    } catch (err) { console.error(err); }
  };

  const iniciarEdicionProyecto = (p: Proyecto) => {
    setEditandoProyectoId(p.id);
    setNuevoProyecto({
      titulo: p.titulo, tipo: p.tipo, ubicacion: p.ubicacion,
      ruta: p.ruta || '', precio: p.precio.toString(),
      descripcion: p.descripcion || '',
      metros: p.metros?.toString() || '', cuartos: p.cuartos?.toString() || '',
      banos: p.banos?.toString() || '', enlace_mas_info: p.enlace_mas_info || '',
    });
    setImagenesPreview([]);
    setMostrarMapaPreview(false);
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  const handleGuardarUsuario = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setStatusMsg({ type: '', text: '' });
    try {
      const url = editandoUsuarioId ? `/api/usuarios/${editandoUsuarioId}` : '/api/usuarios';
      const method = editandoUsuarioId ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(nuevoUsuario) });
      if (!res.ok) { const err = await res.json(); throw new Error(err.error); }
      setStatusMsg({ type: 'success', text: editandoUsuarioId ? 'Perfil de asesor actualizado.' : 'Nuevo asesor creado.' });
      setNuevoUsuario({ email: '', password: '', nombre: '', rol: 'asesor' });
      setEditandoUsuarioId(null);
      cargarUsuarios();
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleEliminarUsuario = async (id: string) => {
    if (id === user.id) { alert('No puedes eliminar tu propia cuenta activa.'); return; }
    if (!confirm('¿Revocar acceso y eliminar a este asesor permanentemente?')) return;
    try {
      const res = await fetch(`/api/usuarios/${id}`, { method: 'DELETE' });
      if (res.ok) { setStatusMsg({ type: 'success', text: 'Asesor removido del sistema.' }); cargarUsuarios(); }
    } catch (err) { console.error(err); }
  };

  const iniciarEdicionUsuario = (u: UsuarioAdmin) => {
    setEditandoUsuarioId(u.id);
    setNuevoUsuario({ nombre: u.nombre, email: u.email, rol: u.rol, password: '' });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
          <div className="bg-slate-900 px-8 py-7 text-center">
            <img src="/img/horos-inmobiliaria.png" alt="Horos" className="h-10 mx-auto mb-3 brightness-0 invert" />
            <p className="text-slate-400 text-xs tracking-widest uppercase font-bold">Acceso Administrativo</p>
          </div>
          <div className="px-8 py-7">
            {statusMsg.text && (
              <div className={`flex items-center gap-2 p-3 rounded-lg text-sm mb-5 ${statusMsg.type === 'error' ? 'bg-red-50 text-red-800 border border-red-100' : 'bg-emerald-50 text-emerald-800 border border-emerald-100'}`}>
                {statusMsg.type === 'error' ? <FiAlertCircle className="shrink-0" /> : <FiCheckCircle className="shrink-0" />}
                {statusMsg.text}
              </div>
            )}
            <form onSubmit={handleLogin} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-600 flex items-center gap-1.5"><FiMail size={12} /> Correo Electrónico</label>
                <input type="email" required placeholder="asesor@horos.pe"
                  className="border border-slate-200 rounded-xl py-2.5 px-4 text-sm focus:ring-2 focus:ring-amber-600 outline-none bg-slate-50"
                  value={authForm.email} onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-600 flex items-center gap-1.5"><FiShield size={12} /> Contraseña</label>
                <input type="password" required placeholder="••••••••"
                  className="border border-slate-200 rounded-xl py-2.5 px-4 text-sm focus:ring-2 focus:ring-amber-600 outline-none bg-slate-50"
                  value={authForm.password} onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })} />
              </div>
              <button type="submit" disabled={loading}
                className="bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-slate-800 transition-colors text-sm disabled:opacity-50 mt-1">
                {loading ? 'Verificando...' : 'Iniciar Sesión'}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  const mapaPreviewUrl = nuevoProyecto.ubicacion
    ? `https://maps.google.com/maps?q=${encodeURIComponent(nuevoProyecto.ubicacion + ', Perú')}&output=embed`
    : '';

  // ── Panel ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-100">

      {/* Top bar */}
      <div className="bg-slate-900 text-white px-6 py-3 flex justify-between items-center shadow-md">
        <div className="flex items-center gap-3">
          <img src="/img/horos-inmobiliaria.png" alt="Horos" className="h-8 brightness-0 invert" />
          <div className="h-5 w-px bg-white/20" />
          <span className="text-xs text-slate-400 font-medium hidden sm:block">Panel de Administración</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs text-slate-400 hidden md:flex items-center gap-1.5">
            <FiUser size={12} />
            <span className="text-white font-semibold">{user.nombre}</span>
            <span className="text-slate-500">·</span>
            <span>{user.email}</span>
          </span>
          <button onClick={handleLogout}
            className="flex items-center gap-2 bg-red-500/10 text-red-400 border border-red-500/20 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-red-500/20 transition-colors">
            <FiLogOut size={13} /> Salir
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* Stat cards */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Prospectos', value: leads.length, icon: <FiMail />, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Inmuebles', value: proyectos.length, icon: <FiBriefcase />, color: 'text-amber-600', bg: 'bg-amber-50' },
            { label: 'Asesores', value: usuarios.length, icon: <FiUser />, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 flex items-center gap-4">
              <div className={`${s.bg} ${s.color} p-3 rounded-lg text-lg`}>{s.icon}</div>
              <div>
                <p className="text-2xl font-black text-slate-900">{s.value}</p>
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Status message */}
        {statusMsg.text && (
          <div className={`flex items-center gap-2 p-4 rounded-xl text-sm mb-6 border ${
            statusMsg.type === 'error' ? 'bg-red-50 text-red-800 border-red-100'
            : statusMsg.type === 'info' ? 'bg-blue-50 text-blue-800 border-blue-100'
            : 'bg-emerald-50 text-emerald-800 border-emerald-100'
          }`}>
            {statusMsg.type === 'error' ? <FiAlertCircle className="shrink-0" />
              : statusMsg.type === 'info' ? <FiInfo className="shrink-0" />
              : <FiCheckCircle className="shrink-0" />}
            {statusMsg.text}
            <button onClick={() => setStatusMsg({ type: '', text: '' })} className="ml-auto opacity-50 hover:opacity-100">
              <FiX size={14} />
            </button>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="flex border-b border-slate-100 overflow-x-auto">
            {[
              { key: 'leads', label: 'Prospectos', icon: <FiMail />, count: leads.length },
              { key: 'gestion-proyectos', label: 'Gestión de Inmuebles', icon: <FiBriefcase />, count: proyectos.length },
              { key: 'gestion-usuarios', label: 'Control de Asesores', icon: <FiUserPlus />, count: usuarios.length },
            ].map((tab) => (
              <button key={tab.key}
                onClick={() => { setActiveTab(tab.key); setStatusMsg({ type: '', text: '' }); }}
                className={`flex items-center gap-2 px-5 py-4 border-b-2 font-bold text-sm transition-colors whitespace-nowrap ${
                  activeTab === tab.key
                    ? 'border-amber-600 text-amber-700 bg-amber-50/50'
                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                }`}>
                {tab.icon}
                {tab.label}
                <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${activeTab === tab.key ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'}`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          <div className="p-6">

            {/* ── LEADS ──────────────────────────────────────────── */}
            {activeTab === 'leads' && (
              <div>
                <h3 className="text-base font-black text-slate-900 mb-5 flex items-center gap-2">
                  <FiMail className="text-amber-600" /> Bandeja de Prospectos
                </h3>
                {leads.length === 0 ? (
                  <div className="text-center py-12 text-slate-400">
                    <FiMail size={32} className="mx-auto mb-3 opacity-30" />
                    <p className="text-sm font-medium">No hay mensajes de clientes aún.</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {leads.map((lead) => (
                      <div key={lead.id} className="border border-slate-100 rounded-xl p-4 bg-slate-50 flex flex-col md:flex-row justify-between gap-4 hover:border-slate-200 transition-colors">
                        <div className="flex flex-col gap-2 max-w-2xl">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-black text-slate-900 text-sm">{lead.nombre}</span>
                            <span className="bg-amber-100 text-amber-800 font-bold text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wide">
                              {lead.interes}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-4 text-xs text-slate-500 font-medium">
                            <span className="flex items-center gap-1.5"><FiMail size={11} className="text-slate-400" />{lead.correo}</span>
                            {lead.telefono && <span className="flex items-center gap-1.5"><FiPhone size={11} className="text-slate-400" />{lead.telefono}</span>}
                          </div>
                          <p className="text-sm text-slate-700 bg-white p-3 rounded-lg border border-slate-100 italic leading-relaxed">
                            "{lead.mensaje}"
                          </p>
                        </div>
                        <span className="text-[10px] text-slate-400 flex items-center gap-1.5 h-fit whitespace-nowrap">
                          <FiCalendar size={11} />
                          {new Date(lead.created_at).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── GESTIÓN PROYECTOS ────────────────────────────── */}
            {activeTab === 'gestion-proyectos' && (
              <div className="flex flex-col gap-10">

                {/* Formulario */}
                <form onSubmit={handleGuardarProyecto} className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden">
                  <div className={`px-6 py-4 border-b border-slate-200 flex justify-between items-center ${editandoProyectoId ? 'bg-amber-50 border-amber-200' : ''}`}>
                    <h3 className="font-black text-slate-900 flex items-center gap-2 text-sm">
                      <FiBriefcase className={editandoProyectoId ? 'text-amber-600' : 'text-slate-500'} />
                      {editandoProyectoId ? `Editando Inmueble #${editandoProyectoId}` : 'Publicar Nuevo Inmueble'}
                    </h3>
                    {editandoProyectoId && (
                      <button type="button" onClick={cancelarEdicionProyecto}
                        className="text-xs font-bold text-red-600 flex items-center gap-1 hover:text-red-800">
                        <FiX /> Cancelar edición
                      </button>
                    )}
                  </div>

                  <div className="p-6 flex flex-col gap-5">
                    {/* Fila 1: Título, Ruta, Modalidad */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-slate-600">Título / Nombre</label>
                        <input type="text" required placeholder="Residencial Neptuno"
                          className="border border-slate-200 rounded-lg py-2 px-3 text-sm outline-none bg-white focus:ring-2 focus:ring-amber-600"
                          value={nuevoProyecto.titulo}
                          onChange={(e) => setNuevoProyecto({ ...nuevoProyecto, titulo: e.target.value })} />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-slate-600 flex items-center gap-1"><FiHash size={11} />Ruta URL</label>
                        <input type="text" placeholder="residencial-neptuno (auto si vacío)"
                          className="border border-slate-200 rounded-lg py-2 px-3 text-sm outline-none bg-white focus:ring-2 focus:ring-amber-600 font-mono"
                          value={nuevoProyecto.ruta}
                          onChange={(e) => setNuevoProyecto({ ...nuevoProyecto, ruta: e.target.value })} />
                        <p className="text-[10px] text-slate-400">URL: /proyectos/<em>mi-ruta</em></p>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-slate-600">Modalidad</label>
                        <select className="border border-slate-200 rounded-lg py-2 px-3 text-sm bg-white outline-none cursor-pointer focus:ring-2 focus:ring-amber-600"
                          value={nuevoProyecto.tipo}
                          onChange={(e) => setNuevoProyecto({ ...nuevoProyecto, tipo: e.target.value })}>
                          <option value="Venta">Venta</option>
                          <option value="Alquiler">Alquiler</option>
                        </select>
                      </div>
                    </div>

                    {/* Fila 2: Dirección + Precio */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                          <FiMapPin size={11} className="text-amber-600" />
                          Dirección exacta <span className="text-amber-600">(aparece en el mapa)</span>
                        </label>
                        <div className="flex gap-2">
                          <input type="text" required placeholder="Av. América Norte 123, Trujillo"
                            className="border border-slate-200 rounded-lg py-2 px-3 text-sm outline-none bg-white focus:ring-2 focus:ring-amber-600 flex-1"
                            value={nuevoProyecto.ubicacion}
                            onChange={(e) => {
                              setNuevoProyecto({ ...nuevoProyecto, ubicacion: e.target.value });
                              setMostrarMapaPreview(false);
                            }} />
                          <button type="button"
                            disabled={!nuevoProyecto.ubicacion}
                            onClick={() => setMostrarMapaPreview((v) => !v)}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-colors whitespace-nowrap">
                            <FiEye size={13} />
                            {mostrarMapaPreview ? 'Ocultar' : 'Ver mapa'}
                          </button>
                        </div>
                        <p className="text-[10px] text-slate-400">Escribe la dirección lo más precisa posible para que el mapa sea exacto.</p>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-slate-600">Precio (S/.)</label>
                        <input type="number" required placeholder="450000"
                          className="border border-slate-200 rounded-lg py-2 px-3 text-sm outline-none bg-white focus:ring-2 focus:ring-amber-600"
                          value={nuevoProyecto.precio}
                          onChange={(e) => setNuevoProyecto({ ...nuevoProyecto, precio: e.target.value })} />
                      </div>
                    </div>

                    {/* Mini mapa preview */}
                    {mostrarMapaPreview && mapaPreviewUrl && (
                      <div className="rounded-xl overflow-hidden border border-amber-200 bg-amber-50">
                        <div className="px-3 py-2 border-b border-amber-200 flex items-center gap-2 text-xs font-bold text-amber-700">
                          <FiMapPin size={12} />
                          Vista previa del mapa — {nuevoProyecto.ubicacion}
                        </div>
                        <div className="h-48">
                          <iframe src={mapaPreviewUrl} width="100%" height="100%"
                            className="border-0 w-full h-full" loading="lazy" title="Mapa preview" />
                        </div>
                      </div>
                    )}

                    {/* Fila 3: m², dorms, baños */}
                    <div className="grid grid-cols-3 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-slate-600 flex items-center gap-1"><FiMaximize2 size={11} />Área m²</label>
                        <input type="number" placeholder="140 (opcional)"
                          className="border border-slate-200 rounded-lg py-2 px-3 text-sm outline-none bg-white focus:ring-2 focus:ring-amber-600"
                          value={nuevoProyecto.metros}
                          onChange={(e) => setNuevoProyecto({ ...nuevoProyecto, metros: e.target.value })} />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-slate-600 flex items-center gap-1"><FaBed size={11} />Dormitorios</label>
                        <input type="number" placeholder="3 (opcional)"
                          className="border border-slate-200 rounded-lg py-2 px-3 text-sm outline-none bg-white focus:ring-2 focus:ring-amber-600"
                          value={nuevoProyecto.cuartos}
                          onChange={(e) => setNuevoProyecto({ ...nuevoProyecto, cuartos: e.target.value })} />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-slate-600 flex items-center gap-1"><FaBath size={11} />Baños</label>
                        <input type="number" placeholder="2 (opcional)"
                          className="border border-slate-200 rounded-lg py-2 px-3 text-sm outline-none bg-white focus:ring-2 focus:ring-amber-600"
                          value={nuevoProyecto.banos}
                          onChange={(e) => setNuevoProyecto({ ...nuevoProyecto, banos: e.target.value })} />
                      </div>
                    </div>

                    {/* Descripción */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-600">Descripción del Inmueble</label>
                      <textarea rows={3} required placeholder="Acabados de lujo, iluminación natural..."
                        className="border border-slate-200 rounded-lg py-2 px-3 text-sm outline-none bg-white resize-none focus:ring-2 focus:ring-amber-600"
                        value={nuevoProyecto.descripcion}
                        onChange={(e) => setNuevoProyecto({ ...nuevoProyecto, descripcion: e.target.value })} />
                    </div>

                    {/* Enlace externo */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-600 flex items-center gap-1"><FiLink size={11} />Enlace externo (opcional)</label>
                      <input type="url" placeholder="https://drive.google.com/... (Brochure, video, etc.)"
                        className="border border-slate-200 rounded-lg py-2 px-3 text-sm outline-none bg-white focus:ring-2 focus:ring-amber-600"
                        value={nuevoProyecto.enlace_mas_info}
                        onChange={(e) => setNuevoProyecto({ ...nuevoProyecto, enlace_mas_info: e.target.value })} />
                    </div>

                    {/* Imágenes */}
                    <div className="flex flex-col gap-3">
                      <label className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                        <FiImage size={12} className="text-amber-600" />
                        Imágenes {editandoProyectoId ? '(opcional — solo si deseas reemplazarlas)' : `(mínimo 1, máximo ${MAX_IMAGENES})`}
                      </label>
                      <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 bg-white hover:border-amber-400 transition-colors">
                        <input id="file-selector" type="file" multiple accept="image/*"
                          className="text-xs file:mr-3 file:py-1.5 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-slate-900 file:text-white hover:file:bg-slate-800 cursor-pointer"
                          onChange={handleImagenesChange} />
                        <p className="text-[10px] text-slate-400 mt-2 flex items-center gap-1">
                          <FiInfo size={10} /> Formatos: JPG, PNG, WebP. Máximo {MAX_IMAGENES} imágenes. La primera será la portada.
                        </p>
                      </div>

                      {/* Preview de imágenes seleccionadas */}
                      {imagenesPreview.length > 0 && (
                        <div>
                          <p className="text-[10px] text-slate-500 font-bold mb-2 uppercase tracking-wide">
                            Previsualización — {imagenesPreview.length} imagen{imagenesPreview.length > 1 ? 'es' : ''} seleccionada{imagenesPreview.length > 1 ? 's' : ''}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {imagenesPreview.map((src, i) => (
                              <div key={i} className={`relative w-20 h-16 rounded-lg overflow-hidden border-2 ${i === 0 ? 'border-amber-500' : 'border-slate-200'}`}>
                                <img src={src} alt={`Preview ${i + 1}`} className="w-full h-full object-cover" />
                                {i === 0 && (
                                  <div className="absolute bottom-0 left-0 right-0 bg-amber-500 text-white text-[8px] font-black text-center py-0.5">
                                    PORTADA
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <button type="submit" disabled={loading}
                      className="bg-amber-600 hover:bg-amber-700 text-white font-black py-3 rounded-xl text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                      {loading ? (
                        <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Procesando...</>
                      ) : editandoProyectoId ? (
                        <><FiEdit2 /> Guardar Cambios</>
                      ) : (
                        <><FiUploadCloud /> Publicar Inmueble</>
                      )}
                    </button>
                  </div>
                </form>

                {/* Tabla de inmuebles */}
                <div>
                  <h4 className="text-sm font-black text-slate-900 mb-3 flex items-center gap-2">
                    <FiBriefcase className="text-slate-400" />
                    Inmuebles publicados ({proyectos.length})
                  </h4>
                  {proyectos.length === 0 ? (
                    <div className="text-center py-10 text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                      <FiBriefcase size={28} className="mx-auto mb-2 opacity-30" />
                      <p className="text-sm">No hay inmuebles publicados aún.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto border border-slate-100 rounded-xl">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-slate-900 text-white">
                            <th className="px-4 py-3 font-bold rounded-tl-xl">Portada</th>
                            <th className="px-4 py-3 font-bold">Inmueble</th>
                            <th className="px-4 py-3 font-bold">Precio</th>
                            <th className="px-4 py-3 font-bold text-center">Características</th>
                            <th className="px-4 py-3 font-bold text-center rounded-tr-xl">Acciones</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {proyectos.map((p) => (
                            <tr key={p.id} className={`hover:bg-slate-50 transition-colors ${editandoProyectoId === p.id ? 'bg-amber-50' : ''}`}>
                              <td className="px-4 py-3 w-16">
                                <img src={p.imagen} className="w-14 h-10 object-cover rounded-lg border border-slate-200" alt="" />
                              </td>
                              <td className="px-4 py-3">
                                <p className="font-black text-slate-900 text-sm">{p.titulo}</p>
                                <p className="flex items-center gap-1 text-slate-400 mt-0.5">
                                  <FiMapPin size={10} className="shrink-0" />
                                  {p.ubicacion}
                                  <span className="ml-1 bg-amber-100 text-amber-700 font-bold px-1.5 py-0.5 rounded text-[9px] uppercase">{p.tipo}</span>
                                </p>
                              </td>
                              <td className="px-4 py-3 font-black text-slate-800 whitespace-nowrap">
                                S/. {p.precio.toLocaleString('es-PE')}
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center justify-center gap-3 text-slate-500 font-semibold">
                                  <span className="flex items-center gap-1"><FiMaximize2 size={11} />{p.metros || '—'} m²</span>
                                  <span className="flex items-center gap-1"><FaBed size={11} />{p.cuartos || '—'}</span>
                                  <span className="flex items-center gap-1"><FaBath size={11} />{p.banos || '—'}</span>
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center justify-center gap-2">
                                  <button onClick={() => iniciarEdicionProyecto(p)}
                                    title="Editar"
                                    className="p-2 bg-blue-50 text-blue-700 rounded-lg border border-blue-100 hover:bg-blue-100 transition-colors">
                                    <FiEdit2 size={13} />
                                  </button>
                                  <button onClick={() => handleEliminarProyecto(p.id)}
                                    title="Eliminar"
                                    className="p-2 bg-red-50 text-red-700 rounded-lg border border-red-100 hover:bg-red-100 transition-colors">
                                    <FiTrash2 size={13} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── GESTIÓN USUARIOS ─────────────────────────────── */}
            {activeTab === 'gestion-usuarios' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

                <form onSubmit={handleGuardarUsuario} className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden lg:col-span-1">
                  <div className="px-5 py-4 border-b border-slate-200 bg-white">
                    <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                      <FiUserPlus className="text-amber-600" />
                      {editandoUsuarioId ? 'Editar Asesor' : 'Nuevo Asesor'}
                    </h3>
                  </div>
                  <div className="p-5 flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-600">Nombre Completo</label>
                      <input type="text" required placeholder="Carlos Mendoza"
                        className="border border-slate-200 rounded-lg py-2 px-3 text-sm outline-none bg-white focus:ring-2 focus:ring-amber-600"
                        value={nuevoUsuario.nombre}
                        onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, nombre: e.target.value })} />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-600 flex items-center gap-1"><FiMail size={11} />Correo</label>
                      <input type="email" required placeholder="carlos@horos.pe"
                        className="border border-slate-200 rounded-lg py-2 px-3 text-sm outline-none bg-white focus:ring-2 focus:ring-amber-600"
                        value={nuevoUsuario.email}
                        onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, email: e.target.value })} />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-600 flex items-center gap-1">
                        <FiShield size={11} />
                        {editandoUsuarioId ? 'Nueva contraseña (vacío = no cambia)' : 'Contraseña'}
                      </label>
                      <input type="password" placeholder="••••••••"
                        minLength={editandoUsuarioId ? undefined : 6}
                        required={!editandoUsuarioId}
                        className="border border-slate-200 rounded-lg py-2 px-3 text-sm outline-none bg-white focus:ring-2 focus:ring-amber-600"
                        value={nuevoUsuario.password}
                        onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, password: e.target.value })} />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-600">Rol de Acceso</label>
                      <select className="border border-slate-200 rounded-lg py-2 px-3 text-sm bg-white outline-none cursor-pointer focus:ring-2 focus:ring-amber-600"
                        value={nuevoUsuario.rol}
                        onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, rol: e.target.value })}>
                        <option value="asesor">Asesor Inmobiliario</option>
                        <option value="admin">Administrador</option>
                      </select>
                    </div>
                    <button type="submit" disabled={loading}
                      className="bg-slate-900 hover:bg-slate-800 text-white font-black py-2.5 rounded-xl text-sm transition-colors disabled:opacity-50">
                      {loading ? 'Guardando...' : editandoUsuarioId ? 'Actualizar Asesor' : 'Crear Asesor'}
                    </button>
                    {editandoUsuarioId && (
                      <button type="button"
                        onClick={() => { setEditandoUsuarioId(null); setNuevoUsuario({ email: '', password: '', nombre: '', rol: 'asesor' }); }}
                        className="w-full bg-white border border-slate-200 text-slate-600 py-2 rounded-xl font-bold text-xs hover:bg-slate-50 transition-colors">
                        Cancelar edición
                      </button>
                    )}
                  </div>
                </form>

                <div className="lg:col-span-2 flex flex-col gap-3">
                  <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                    <FiUser className="text-slate-400" /> Asesores con acceso ({usuarios.length})
                  </h4>
                  {usuarios.length === 0 ? (
                    <div className="text-center py-10 text-slate-400 bg-slate-50 rounded-xl border border-dashed">
                      <FiUser size={28} className="mx-auto mb-2 opacity-30" />
                      <p className="text-sm">No hay asesores registrados.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto border border-slate-100 rounded-xl">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-slate-900 text-white">
                            <th className="px-4 py-3 font-bold rounded-tl-xl">Nombre</th>
                            <th className="px-4 py-3 font-bold">Correo</th>
                            <th className="px-4 py-3 font-bold text-center">Rol</th>
                            <th className="px-4 py-3 font-bold text-center">Registro</th>
                            <th className="px-4 py-3 font-bold text-center rounded-tr-xl">Acciones</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {usuarios.map((u) => (
                            <tr key={u.id} className={`hover:bg-slate-50 transition-colors ${u.id === user.id ? 'bg-amber-50/50' : ''}`}>
                              <td className="px-4 py-3 font-black text-slate-900">
                                {u.nombre}
                                {u.id === user.id && (
                                  <span className="ml-2 text-[9px] bg-amber-100 text-amber-700 font-black px-1.5 py-0.5 rounded uppercase">Tú</span>
                                )}
                              </td>
                              <td className="px-4 py-3 text-slate-500">{u.email}</td>
                              <td className="px-4 py-3 text-center">
                                <span className={`px-2 py-0.5 rounded-full font-black text-[10px] uppercase ${u.rol === 'admin' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>
                                  {u.rol}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-center text-slate-400 flex items-center justify-center gap-1">
                                <FiCalendar size={10} />
                                {new Date(u.created_at).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })}
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center justify-center gap-2">
                                  <button onClick={() => iniciarEdicionUsuario(u)} title="Editar"
                                    className="p-2 bg-blue-50 text-blue-700 rounded-lg border border-blue-100 hover:bg-blue-100 transition-colors">
                                    <FiEdit2 size={13} />
                                  </button>
                                  <button onClick={() => handleEliminarUsuario(u.id)} title="Eliminar"
                                    disabled={u.id === user.id}
                                    className="p-2 bg-red-50 text-red-700 rounded-lg border border-red-100 hover:bg-red-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
                                    <FiTrash2 size={13} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
