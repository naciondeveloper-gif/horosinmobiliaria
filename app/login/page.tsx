'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  FiMail, FiUserPlus, FiLogOut, FiBriefcase, 
  FiUser, FiCalendar, FiUploadCloud, FiTrash2, FiEdit2, FiX, FiCheck 
} from 'react-icons/fi';
import { Proyecto } from '@/types/proyecto';

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
  descripcion: '', metros: '', cuartos: '', banos: '',
  enlace_mas_info: ''
});
  const [archivosImagenes, setArchivosImagenes] = useState<FileList | null>(null);

  const [editandoUsuarioId, setEditandoUsuarioId] = useState<string | null>(null);
  const [nuevoUsuario, setNuevoUsuario] = useState({ email: '', password: '', nombre: '', rol: 'asesor' });

  const handleLogout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('horos_session');
    setStatusMsg({ type: 'success', text: 'Sesión cerrada automáticamente.' });
  }, []);

  useEffect(() => {
    if (!user) return;
    const tiempoLimite = 15 * 60 * 1000;
    let temporizador: NodeJS.Timeout | undefined;

    const reiniciarTemporizador = () => {
      clearTimeout(temporizador);
      temporizador = setTimeout(() => handleLogout(), tiempoLimite);
    };

    const eventos = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    eventos.forEach(ev => document.addEventListener(ev, reiniciarTemporizador));
    reiniciarTemporizador();

    return () => {
      clearTimeout(temporizador);
      eventos.forEach(ev => document.removeEventListener(ev, reiniciarTemporizador));
    };
  }, [user, handleLogout]);

  useEffect(() => {
    const sesionGuardada = localStorage.getItem('horos_session');
    if (sesionGuardada) {
      setUser(JSON.parse(sesionGuardada));
    }
  }, []);

  useEffect(() => {
    if (user) {
      cargarLeads();
      cargarProyectos();
      cargarUsuarios();
    }
  }, [user]);

  const cargarLeads = async () => {
    const { supabase } = await import('@/lib/supabase');
    const { data } = await supabase.from('leads').select('*').order('created_at', { ascending: false });
    if (data) setLeads(data);
  };

  const cargarProyectos = async () => {
    const res = await fetch('/api/proyectos');
    if (res.ok) {
      const data = await res.json();
      setProyectos(data);
    }
  };

  const cargarUsuarios = async () => {
    const res = await fetch('/api/usuarios');
    if (res.ok) {
      const data = await res.json();
      setUsuarios(data);
    }
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setStatusMsg({ type: '', text: '' });

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(authForm),
      });
      const data = await response.json();

      if (response.ok) {
        setUser(data.user);
        localStorage.setItem('horos_session', JSON.stringify(data.user));
      } else {
        setStatusMsg({ type: 'error', text: data.error || 'Credenciales inválidas.' });
      }
    } catch (err) {
      setStatusMsg({ type: 'error', text: 'Error de conexión con el servidor.' });
    } finally {
      setLoading(false);
    }
  };

  const subirImagenesAlStorage = async (files: FileList): Promise<string[]> => {
    const { supabase } = await import('@/lib/supabase');
    const urlsPublicas: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const extension = file.name.split('.').pop();
      const nombreArchivo = `${Date.now()}_${i}.${extension}`;

      const { data, error } = await supabase.storage
        .from('proyectos-imagenes')
        .upload(nombreArchivo, file, { cacheControl: '3600', upsert: false });

      if (error) throw new Error(`Error subiendo la imagen ${file.name}: ${error.message}`);

      if (data) {
        const { data: dataUrl } = supabase.storage
          .from('proyectos-imagenes')
          .getPublicUrl(nombreArchivo);
        urlsPublicas.push(dataUrl.publicUrl);
      }
    }
    return urlsPublicas;
  };

  const handleGuardarProyecto = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setStatusMsg({ type: '', text: '' });

    try {
      let listaUrlsDeImagenes: string[] = [];
      
      if (!editandoProyectoId && (!archivosImagenes || archivosImagenes.length < 2)) {
        throw new Error('Por favor, selecciona al menos 2 imágenes para el carrusel del proyecto.');
      }

      if (archivosImagenes && archivosImagenes.length > 0) {
        setStatusMsg({ type: 'info', text: 'Subiendo archivos de imagen a Supabase Storage...' });
        listaUrlsDeImagenes = await subirImagenesAlStorage(archivosImagenes);
      }

      const proyectoData: any = {
        titulo: nuevoProyecto.titulo,
        tipo: nuevoProyecto.tipo,
        ubicacion: nuevoProyecto.ubicacion,
        precio: parseFloat(nuevoProyecto.precio),
        descripcion: nuevoProyecto.descripcion,
        metros: nuevoProyecto.metros ? parseFloat(nuevoProyecto.metros) : null,
        cuartos: nuevoProyecto.cuartos ? parseInt(nuevoProyecto.cuartos) : null,
        banos: nuevoProyecto.banos ? parseInt(nuevoProyecto.banos) : null,
        enlace_mas_info: nuevoProyecto.enlace_mas_info
      };

      if (listaUrlsDeImagenes.length > 0) {
        proyectoData.imagen = listaUrlsDeImagenes[0];
        proyectoData.imagenes = listaUrlsDeImagenes;
      }

      if (editandoProyectoId) {
        const res = await fetch(`/api/proyectos/${editandoProyectoId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(proyectoData),
        });
        if (!res.ok) { const err = await res.json(); throw new Error(err.error); }
        setStatusMsg({ type: 'success', text: '¡Proyecto actualizado con éxito!' });
      } else {
        // Modo Creación: POST
        proyectoData.autor_id = user.id;
        const res = await fetch('/api/proyectos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(proyectoData),
        });
        if (!res.ok) { const err = await res.json(); throw new Error(err.error); }
        setStatusMsg({ type: 'success', text: '¡Nuevo inmueble publicado con éxito!' });
      }

      setNuevoProyecto({ titulo: '', tipo: 'Venta', ubicacion: '', precio: '', descripcion: '', metros: '', cuartos: '', banos: '', enlace_mas_info: '' });
      setArchivosImagenes(null);
      setEditandoProyectoId(null);
      const fileInput = document.getElementById('file-selector') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      
      cargarProyectos();
    } catch (error: any) {
      setStatusMsg({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleEliminarProyecto = async (id: number) => {
    if (!confirm('¿Estás completamente seguro de que deseas eliminar este inmueble?')) return;
    try {
      const res = await fetch(`/api/proyectos/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setStatusMsg({ type: 'success', text: 'Inmueble eliminado correctamente.' });
        cargarProyectos();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const iniciarEdicionProyecto = (p: Proyecto) => {
    setEditandoProyectoId(p.id);
    setNuevoProyecto({
      titulo: p.titulo,
      tipo: p.tipo,
      ubicacion: p.ubicacion,
      precio: p.precio.toString(),
      descripcion: p.descripcion || '',
      metros: p.metros?.toString() || '',
      cuartos: p.cuartos?.toString() || '',
      banos: p.banos?.toString() || '',
      enlace_mas_info: p.enlace_mas_info || ''
    });
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };
  const handleGuardarUsuario = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setStatusMsg({ type: '', text: '' });

    try {
      if (editandoUsuarioId) {
        const res = await fetch(`/api/usuarios/${editandoUsuarioId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nombre: nuevoUsuario.nombre,
            email: nuevoUsuario.email,
            rol: nuevoUsuario.rol,
            password: nuevoUsuario.password 
          }),
        });
        if (!res.ok) { const err = await res.json(); throw new Error(err.error); }
        setStatusMsg({ type: 'success', text: 'Perfil de asesor actualizado.' });
      } else {
        const res = await fetch('/api/usuarios', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(nuevoUsuario),
        });
        if (!res.ok) { const err = await res.json(); throw new Error(err.error); }
        setStatusMsg({ type: 'success', text: 'Nuevo perfil de asesor creado con hash.' });
      }

      setNuevoUsuario({ email: '', password: '', nombre: '', rol: 'asesor' });
      setEditandoUsuarioId(null);
      cargarUsuarios();
    } catch (error: any) {
      setStatusMsg({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleEliminarUsuario = async (id: string) => {
    if (id === user.id) {
      alert('No puedes eliminar tu propio usuario de la sesión activa.');
      return;
    }
    if (!confirm('¿Deseas revocar el acceso y borrar permanentemente a este asesor?')) return;
    
    try {
      const res = await fetch(`/api/usuarios/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setStatusMsg({ type: 'success', text: 'Asesor removido de la base de datos.' });
        cargarUsuarios();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const iniciarEdicionUsuario = (u: UsuarioAdmin) => {
    setEditandoUsuarioId(u.id);
    setNuevoUsuario({
      nombre: u.nombre,
      email: u.email,
      rol: u.rol,
      password: ''
    });
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-white border border-slate-100 shadow-sm rounded-lg">
        <h2 className="text-2xl font-bold text-slate-900 text-center mb-1">Horos Inmobiliaria</h2>
        <p className="text-xs text-gray-500 text-center mb-6">Acceso Administrativo Autónomo</p>
        
        {statusMsg.text && (
          <div className={`p-3 rounded text-sm text-center mb-4 ${statusMsg.type === 'error' ? 'bg-red-50 text-red-800' : 'bg-emerald-50 text-emerald-800'}`}>
            {statusMsg.text}
          </div>
        )}

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-600">Correo Electrónico</label>
            <input type="email" required placeholder="asesor@horos.pe" className="border border-gray-300 rounded-md py-2 px-3 text-sm focus:ring-2 focus:ring-amber-600 outline-none"
              value={authForm.email} onChange={(e) => setAuthForm({...authForm, email: e.target.value})} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-600">Contraseña</label>
            <input type="password" required placeholder="••••••••" className="border border-gray-300 rounded-md py-2 px-3 text-sm focus:ring-2 focus:ring-amber-600 outline-none"
              value={authForm.password} onChange={(e) => setAuthForm({...authForm, password: e.target.value})} />
          </div>
          <button type="submit" disabled={loading} className="bg-slate-900 text-white py-2 rounded font-bold hover:bg-slate-800 transition-colors text-sm disabled:opacity-50 mt-2">
            {loading ? 'Validando credenciales...' : 'Iniciar Sesión'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-10 px-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-200 pb-5 mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Panel Inmobiliaria Independiente</h1>
          <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5"><FiUser /> Conectado como: <span className="font-semibold text-amber-800">{user.nombre} ({user.email})</span></p>
        </div>
        <button onClick={handleLogout} className="flex items-center gap-2 bg-red-50 text-red-700 border border-red-200 px-4 py-2 rounded text-xs font-bold hover:bg-red-100 transition-colors">
          <FiLogOut /> Salir del Sistema
        </button>
      </div>

      {/* Alertas */}
      {statusMsg.text && (
        <div className={`p-3 rounded text-sm mb-6 border ${statusMsg.type === 'error' ? 'bg-red-50 text-red-800 border-red-100' : statusMsg.type === 'info' ? 'bg-blue-50 text-blue-800 border-blue-100' : 'bg-emerald-50 text-emerald-800 border-emerald-100'}`}>
          {statusMsg.text}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 mb-6 overflow-x-auto">
        <button onClick={() => { setActiveTab('leads'); setStatusMsg({type:'',text:''}); }} className={`flex items-center gap-2 px-4 py-2.5 border-b-2 font-bold text-sm transition-colors whitespace-nowrap ${activeTab === 'leads' ? 'border-amber-700 text-amber-700' : 'border-transparent text-gray-500 hover:text-slate-800'}`}>
          <FiMail /> Prospectos ({leads.length})
        </button>
        <button onClick={() => { setActiveTab('gestion-proyectos'); setStatusMsg({type:'',text:''}); }} className={`flex items-center gap-2 px-4 py-2.5 border-b-2 font-bold text-sm transition-colors whitespace-nowrap ${activeTab === 'gestion-proyectos' ? 'border-amber-700 text-amber-700' : 'border-transparent text-gray-500 hover:text-slate-800'}`}>
          <FiBriefcase /> Gestión de Inmuebles ({proyectos.length})
        </button>
        <button onClick={() => { setActiveTab('gestion-usuarios'); setStatusMsg({type:'',text:''}); }} className={`flex items-center gap-2 px-4 py-2.5 border-b-2 font-bold text-sm transition-colors whitespace-nowrap ${activeTab === 'gestion-usuarios' ? 'border-amber-700 text-amber-700' : 'border-transparent text-gray-500 hover:text-slate-800'}`}>
          <FiUserPlus /> Control de Asesores ({usuarios.length})
        </button>
      </div>

      {/* Contenido Dinámico de Pestañas */}
      <div className="bg-white border border-slate-100 rounded-lg shadow-sm p-6">
        
        {activeTab === 'leads' && (
          <div>
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2"><FiMail className="text-amber-700" /> Bandeja de Entrada Interna</h3>
            {leads.length === 0 ? (
              <p className="text-sm text-gray-400 py-6 text-center">No hay mensajes de clientes en la base de datos.</p>
            ) : (
              <div className="flex flex-col gap-4">
                {leads.map((lead) => (
                  <div key={lead.id} className="border border-slate-100 rounded-lg p-4 bg-slate-50 flex flex-col md:flex-row justify-between gap-4">
                    <div className="flex flex-col gap-1.5 max-w-2xl">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{lead.nombre}</span>
                        <span className="bg-amber-100 text-amber-800 font-bold text-[10px] px-2 py-0.5 rounded uppercase">{lead.interes}</span>
                      </div>
                      <p className="text-xs text-slate-600">📧 {lead.correo} {lead.telefono && `| 📞 ${lead.telefono}`}</p>
                      <p className="text-sm text-slate-700 bg-white p-3 rounded border border-slate-100 mt-1 italic">"{lead.mensaje}"</p>
                    </div>
                    <span className="text-[10px] text-gray-400 flex items-center gap-1 h-fit whitespace-nowrap"><FiCalendar /> {new Date(lead.created_at).toLocaleDateString('es-PE')}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'gestion-proyectos' && (
          <div className="flex flex-col gap-10">
            <form onSubmit={handleGuardarProyecto} className="bg-slate-50 p-5 border rounded-lg max-w-2xl flex flex-col gap-4">
              <div className="flex justify-between items-center border-b pb-2 mb-1">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <FiBriefcase className="text-amber-700" /> 
                  {editandoProyectoId ? `Modificando Inmueble (ID: #${editandoProyectoId})` : 'Publicar Nuevo Punto Inmobiliario'}
                </h3>
                {editandoProyectoId && (
                  <button type="button" onClick={() => { setEditandoProyectoId(null); setNuevoProyecto({titulo:'',tipo:'Venta',ubicacion:'',precio:'',descripcion:'',metros:'',cuartos:'',banos:'',enlace_mas_info:''}) }} className="text-xs font-bold text-red-600 flex items-center gap-1"><FiX /> Cancelar</button>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-gray-600">Nombre / Título</label>
                  <input type="text" required placeholder="Residencial Neptuno" className="border border-gray-300 rounded py-1.5 px-3 text-sm outline-none bg-white focus:ring-1 focus:ring-amber-700"
                    value={nuevoProyecto.titulo} onChange={(e) => setNuevoProyecto({...nuevoProyecto, titulo: e.target.value})} />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-gray-600">Modalidad</label>
                  <select className="border border-gray-300 rounded py-1.5 px-3 text-sm bg-white outline-none cursor-pointer focus:ring-1 focus:ring-amber-700"
                    value={nuevoProyecto.tipo} onChange={(e) => setNuevoProyecto({...nuevoProyecto, tipo: e.target.value})}>
                    <option value="Venta">Venta</option>
                    <option value="Alquiler">Alquiler</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-gray-600">Ubicación</label>
                  <input type="text" required placeholder="Urb. Víctor Larco" className="border border-gray-300 rounded py-1.5 px-3 text-sm outline-none bg-white focus:ring-1 focus:ring-amber-700"
                    value={nuevoProyecto.ubicacion} onChange={(e) => setNuevoProyecto({...nuevoProyecto, ubicacion: e.target.value})} />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-gray-600">Precio (S/.)</label>
                  <input type="number" required placeholder="450000" className="border border-gray-300 rounded py-1.5 px-3 text-sm outline-none bg-white focus:ring-1 focus:ring-amber-700"
                    value={nuevoProyecto.precio} onChange={(e) => setNuevoProyecto({...nuevoProyecto, precio: e.target.value})} />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-gray-600">Área m² (Opcional)</label>
                  <input type="number" placeholder="140" className="border border-gray-300 rounded py-1.5 px-3 text-sm outline-none bg-white"
                    value={nuevoProyecto.metros} onChange={(e) => setNuevoProyecto({...nuevoProyecto, metros: e.target.value})} />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-gray-600">Dorms (Opcional)</label>
                  <input type="number" placeholder="3" className="border border-gray-300 rounded py-1.5 px-3 text-sm outline-none bg-white"
                    value={nuevoProyecto.cuartos} onChange={(e) => setNuevoProyecto({...nuevoProyecto, cuartos: e.target.value})} />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-gray-600">Baños (Opcional)</label>
                  <input type="number" placeholder="Dejar vacío si no aplica" className="border border-gray-300 rounded py-1.5 px-3 text-sm outline-none bg-white"
                    value={nuevoProyecto.banos} onChange={(e) => setNuevoProyecto({...nuevoProyecto, banos: e.target.value})} />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-600">Descripción Completa del Inmueble</label>
                <textarea rows={3} required placeholder="Acabados de lujo, iluminación natural..." className="border border-gray-300 rounded py-1.5 px-3 text-sm outline-none bg-white resize-none focus:ring-1 focus:ring-amber-700"
                  value={nuevoProyecto.descripcion} onChange={(e) => setNuevoProyecto({...nuevoProyecto, descripcion: e.target.value})} />
              </div>
              
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-600">Enlace Externo "Conocer Más" (Opcional)</label>
                <input 
                  type="url" 
                  placeholder="https://drive.google.com/file/... (Brochure o Video)" 
                  className="border border-gray-300 rounded py-1.5 px-3 text-sm outline-none bg-white focus:ring-1 focus:ring-amber-700"
                  value={nuevoProyecto.enlace_mas_info} 
                  onChange={(e) => setNuevoProyecto({...nuevoProyecto, enlace_mas_info: e.target.value})} 
                />
              </div>

              <div className="flex flex-col gap-1.5 bg-white p-3 rounded border border-dashed border-gray-300">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5"><FiUploadCloud className="text-amber-700" /> Archivos de Imagen {editandoProyectoId ? '(Opcional, solo si deseas cambiarlas)' : '(Mínimo 2)'}</label>
                <input id="file-selector" type="file" multiple accept="image/*" className="text-xs file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-slate-900 file:text-white file:hover:bg-slate-800 cursor-pointer"
                  onChange={(e) => setArchivosImagenes(e.target.files)} />
              </div>

              <button type="submit" disabled={loading} className="bg-amber-700 text-white font-bold py-2 rounded text-sm hover:bg-amber-800 transition-colors disabled:opacity-50">
                {loading ? 'Procesando consulta...' : editandoProyectoId ? 'Aplicar Cambios en Registro' : 'Publicar Punto Inmobiliario'}
              </button>
            </form>

            {/* Tabla de Registros */}
            <div>
              <h4 className="text-sm font-bold text-slate-900 mb-3">Registros vigentes en la tabla de Proyectos</h4>
              <div className="overflow-x-auto border border-slate-100 rounded-lg">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-900 text-white font-bold">
                      <th className="p-3">Portada</th>
                      <th className="p-3">Título / Ubicación</th>
                      <th className="p-3">Precio</th>
                      <th className="p-3 text-center">Características</th>
                      <th className="p-3 text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {proyectos.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3 w-16">
                          <img src={p.imagen} className="w-12 h-12 object-cover rounded border" alt="" />
                        </td>
                        <td className="p-3">
                          <p className="font-bold text-slate-900">{p.titulo}</p>
                          <p className="text-gray-400">📍 {p.ubicacion} | <span className="text-amber-800 font-semibold">{p.tipo}</span></p>
                        </td>
                        <td className="p-3 font-bold text-slate-800">S/. {p.precio.toLocaleString('es-PE')}</td>
                        <td className="p-3 text-center text-gray-500 font-medium">
                          📐 {p.metros || '—'} m² | 🛏️ {p.cuartos || '—'} | 🚿 {p.banos || '—'}
                        </td>
                        <td className="p-3">
                          <div className="flex items-center justify-center gap-2">
                            <button onClick={() => iniciarEdicionProyecto(p)} className="p-1.5 bg-blue-50 text-blue-700 rounded border border-blue-100 hover:bg-blue-100 transition-colors"><FiEdit2 /></button>
                            <button onClick={() => handleEliminarProyecto(p.id)} className="p-1.5 bg-red-50 text-red-700 rounded border border-red-100 hover:bg-red-100 transition-colors"><FiTrash2 /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'gestion-usuarios' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            
            {/* Formulario */}
            <form onSubmit={handleGuardarUsuario} className="bg-slate-50 p-5 border rounded-lg flex flex-col gap-4 lg:col-span-1">
              <h3 className="text-base font-bold text-slate-900 border-b pb-2 flex items-center gap-2">
                <FiUserPlus className="text-amber-700" /> 
                {editandoUsuarioId ? 'Modificar Datos de Asesor' : 'Crear Perfil de Asesor'}
              </h3>
              
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-600">Nombre Completo</label>
                <input type="text" required placeholder="Carlos Mendoza" className="border border-gray-300 rounded py-1.5 px-3 text-sm outline-none bg-white"
                  value={nuevoUsuario.nombre} onChange={(e) => setNuevoUsuario({...nuevoUsuario, nombre: e.target.value})} />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-600">Correo Corporativo</label>
                <input type="email" required placeholder="carlos@horos.pe" className="border border-gray-300 rounded py-1.5 px-3 text-sm outline-none bg-white"
                  value={nuevoUsuario.email} onChange={(e) => setNuevoUsuario({...nuevoUsuario, email: e.target.value})} />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-600">
                  {editandoUsuarioId ? 'Nueva Contraseña (Dejar vacío si no cambia)' : 'Contraseña de Acceso'}
                </label>
                <input type="password" placeholder="••••••••" minLength={editandoUsuarioId ? undefined : 6} required={!editandoUsuarioId} className="border border-gray-300 rounded py-1.5 px-3 text-sm outline-none bg-white"
                  value={nuevoUsuario.password} onChange={(e) => setNuevoUsuario({...nuevoUsuario, password: e.target.value})} />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-600">Rol</label>
                <select className="border border-gray-300 rounded py-1.5 px-3 text-sm bg-white outline-none cursor-pointer"
                  value={nuevoUsuario.rol} onChange={(e) => setNuevoUsuario({...nuevoUsuario, rol: e.target.value})}>
                  <option value="asesor">Asesor Inmobiliario</option>
                  <option value="admin">Administrador global</option>
                </select>
              </div>

              <button type="submit" disabled={loading} className="bg-slate-900 text-white font-bold py-2 rounded text-sm hover:bg-slate-800 transition-colors mt-1">
                {editandoUsuarioId ? 'Actualizar Cuenta' : 'Guardar y Encriptar en BD'}
              </button>
              
              {editandoUsuarioId && (
                <button type="button" onClick={() => { setEditandoUsuarioId(null); setNuevoUsuario({email:'',password:'',nombre:'',rol:'asesor'}) }} className="w-full bg-slate-200 text-slate-700 py-1.5 rounded font-bold text-xs hover:bg-slate-300 transition-colors">Cancelar Edición</button>
              )}
            </form>

            {/* Listado / Tabla */}
            <div className="lg:col-span-2 flex flex-col gap-3">
              <h4 className="text-sm font-bold text-slate-900">Asesores con Acceso al Sistema</h4>
              <div className="overflow-x-auto border border-slate-100 rounded-lg">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-900 text-white font-bold">
                      <th className="p-3">Nombre</th>
                      <th className="p-3">Email</th>
                      <th className="p-3 text-center">Rol de Permiso</th>
                      <th className="p-3 text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {usuarios.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3 font-bold text-slate-900">{u.nombre}</td>
                        <td className="p-3 text-slate-600">{u.email}</td>
                        <td className="p-3 text-center">
                          <span className={`px-2 py-0.5 rounded font-bold text-[10px] uppercase ${u.rol === 'admin' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'}`}>
                            {u.rol}
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center justify-center gap-2">
                            <button onClick={() => iniciarEdicionUsuario(u)} className="p-1.5 bg-blue-50 text-blue-700 rounded border border-blue-100 hover:bg-blue-100 transition-colors"><FiEdit2 /></button>
                            <button onClick={() => handleEliminarUsuario(u.id)} className="p-1.5 bg-red-50 text-red-700 rounded border border-red-100 hover:bg-red-100 transition-colors"><FiTrash2 /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}