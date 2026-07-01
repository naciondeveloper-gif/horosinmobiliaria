'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  FiMail, FiUserPlus, FiLogOut, FiBriefcase,
  FiUser, FiCalendar, FiUploadCloud, FiTrash2, FiEdit2, FiX,
  FiMapPin, FiPhone, FiMaximize2, FiLink, FiImage,
  FiEye, FiShield, FiAlertCircle, FiCheckCircle, FiInfo,
  FiHash, FiPlus, FiChevronUp, FiChevronDown, FiHome, FiDownload, FiExternalLink,
} from 'react-icons/fi';
import { FaBed, FaBath } from 'react-icons/fa';
import { Proyecto, ModeloData } from '@/types/proyecto';

interface ImagenItem {
  src: string;
  file?: File;
}

interface ModeloCrudItem {
  key: string;
  titulo: string;
  descripcion: string;
  precio: string;
  area: string;
  dormitorios: string;
  banos: string;
  portada: ImagenItem | null;
  imagenes: ImagenItem[];
  ampliacion: {
    descripcion: string;
    area: string;
    pisos: string;
    imagenes: ImagenItem[];
    resumen_areas: { label: string; valor: string; resaltar: boolean }[];
  };
}

let _modeloKey = 0;
const nuevoModeloKey = () => `m_${++_modeloKey}_${Date.now()}`;

const MODELO_VACIO = (): ModeloCrudItem => ({
  key: nuevoModeloKey(),
  titulo: '',
  descripcion: '',
  precio: '',
  area: '',
  dormitorios: '',
  banos: '',
  portada: null,
  imagenes: [],
  ampliacion: { descripcion: '', area: '', pisos: '', imagenes: [], resumen_areas: [] },
});

const MAX_IMAGENES = 8;

const comprimirImagen = (file: File, maxDim = 1920): Promise<File> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(img.src);
      let w = img.width, h = img.height;
      if (w > maxDim || h > maxDim) {
        const r = Math.min(maxDim / w, maxDim / h);
        w *= r; h *= r;
      }
      const c = document.createElement('canvas');
      c.width = w; c.height = h;
      c.getContext('2d')!.drawImage(img, 0, 0, w, h);
      c.toBlob(b => {
        if (!b) { reject(new Error('Error al comprimir')); return; }
        resolve(new File([b], file.name.replace(/\.[^.]+$/, '.jpg'), { type: 'image/jpeg' }));
      }, 'image/jpeg', 0.82);
    };
    img.onerror = () => reject(new Error('Error al leer imagen'));
    img.src = URL.createObjectURL(file);
  });

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

  const [mostrarFormularioProyecto, setMostrarFormularioProyecto] = useState(false);
  const [editandoProyectoId, setEditandoProyectoId] = useState<number | null>(null);
  const [nuevoProyecto, setNuevoProyecto] = useState({
    titulo: '', tipo: 'Departamento', ubicacion: '', precio: '',
    ruta: '', descripcion: '', metros: '', cuartos: '', banos: '',
    enlace_mas_info: '',
    // Campos adicionales inmobiliarios
    estado: 'disponible',
    precio_desde: false,
    area_techada: '',
    garajes: '',
    pisos_proyectados: '',
    piso: '',
    total_pisos: '',
    antiguedad: '',
    entrega: '',
    financiamiento: false,
    financiamiento_tipo: '',
    amoblado: false,
    caracteristicas: '',   // CSV → se convierte a string[] al guardar
    video_url: '',
    imagen_mapa: '',
    landing_proveedor: '',
    landing_url: '',
    landing_imagen: '',
    landing_titulo: '',
    total_unidades: '',
  });
  const [imagenesItems, setImagenesItems] = useState<ImagenItem[]>([]);
  const [portadaIdx, setPortadaIdx] = useState<number>(0);
  const [modelosCrud, setModelosCrud] = useState<ModeloCrudItem[]>([]);
  const [archivoMapa, setArchivoMapa] = useState<File | null>(null);
  const [mapaPreviewUpload, setMapaPreviewUpload] = useState<string>('');
  const [mostrarMapaPreview, setMostrarMapaPreview] = useState(false);
  const [archivoLandingImg, setArchivoLandingImg] = useState<File | null>(null);
  const [landingImgPreview, setLandingImgPreview] = useState<string>('');

  const [fichaPdfFile, setFichaPdfFile] = useState<File | null>(null);
  const [fichaPdfUrl, setFichaPdfUrl] = useState('');
  const [fichaPdfLabel, setFichaPdfLabel] = useState('');
  const [fichaPdf2File, setFichaPdf2File] = useState<File | null>(null);
  const [fichaPdf2Url, setFichaPdf2Url] = useState('');
  const [fichaPdf2Label, setFichaPdf2Label] = useState('');

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

  const subirImagenesAlStorage = async (files: File[]): Promise<string[]> => {
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

  const subirArchivoUnico = async (file: File, prefijo: string): Promise<string> => {
    const { supabase } = await import('@/lib/supabase');
    const ext    = file.name.split('.').pop();
    const nombre = `${prefijo}_${Date.now()}.${ext}`;
    const { error } = await supabase.storage
      .from('proyectos-imagenes')
      .upload(nombre, file, { cacheControl: '3600', upsert: false });
    if (error) throw new Error(`Error subiendo ${prefijo}: ${error.message}`);
    const { data: urlData } = supabase.storage.from('proyectos-imagenes').getPublicUrl(nombre);
    return urlData.publicUrl;
  };

  const slugify = (text: string) =>
    text.toLowerCase().trim()
      .normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const handleAgregarImagen = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (imagenesItems.length >= MAX_IMAGENES) {
      setStatusMsg({ type: 'error', text: `Máximo ${MAX_IMAGENES} imágenes permitidas.` });
      e.target.value = '';
      return;
    }
    const comp = await comprimirImagen(file);
    setImagenesItems(prev => [...prev, { src: URL.createObjectURL(comp), file: comp }]);
    e.target.value = '';
  };

  const handleRemoverImagen = (idx: number) => {
    const item = imagenesItems[idx];
    if (item.file) URL.revokeObjectURL(item.src);
    setImagenesItems(prev => prev.filter((_, i) => i !== idx));
    setPortadaIdx(prev => {
      if (idx === prev) return 0;
      if (idx < prev) return prev - 1;
      return prev;
    });
  };

  const handleSeleccionarPortada = (idx: number) => {
    setPortadaIdx(idx);
  };

  const handleImagenMapaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) { setArchivoMapa(null); setMapaPreviewUpload(''); return; }
    setArchivoMapa(file);
    setMapaPreviewUpload(URL.createObjectURL(file));
  };

  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);
  const [lightboxTipo, setLightboxTipo] = useState<'imagen' | 'modelo'>('imagen');
  const [modeloLightbox, setModeloLightbox] = useState<{ modeloIdx: number; imgIdx: number } | null>(null);

  // ── Modelos CRUD ──
  const handleAgregarModeloCrud = () => {
    if (modelosCrud.length >= MAX_IMAGENES) {
      setStatusMsg({ type: 'error', text: `Máximo ${MAX_IMAGENES} modelos permitidos.` });
      return;
    }
    setModelosCrud(prev => [...prev, MODELO_VACIO()]);
  };

  const handleEliminarModeloCrud = (idx: number) => {
    const m = modelosCrud[idx];
    m.imagenes.forEach(item => { if (item.file) URL.revokeObjectURL(item.src); });
    m.ampliacion.imagenes.forEach(item => { if (item.file) URL.revokeObjectURL(item.src); });
    if (m.portada?.file) URL.revokeObjectURL(m.portada.src);
    setModelosCrud(prev => prev.filter((_, i) => i !== idx));
  };

  const handleUpdateModeloCrud = (idx: number, field: keyof Omit<ModeloCrudItem, 'key' | 'imagenes'>, value: string) => {
    setModelosCrud(prev => prev.map((m, i) => i === idx ? { ...m, [field]: value } : m));
  };

  const handleAddModeloImagen = async (modeloIdx: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (modelosCrud[modeloIdx].imagenes.length >= MAX_IMAGENES) {
      setStatusMsg({ type: 'error', text: `Máximo ${MAX_IMAGENES} imágenes por modelo.` });
      e.target.value = '';
      return;
    }
    const comp = await comprimirImagen(file);
    setModelosCrud(prev => prev.map((m, i) =>
      i === modeloIdx ? { ...m, imagenes: [...m.imagenes, { src: URL.createObjectURL(comp), file: comp }] } : m
    ));
    e.target.value = '';
  };

  const handleRemoveModeloImagen = (modeloIdx: number, imgIdx: number) => {
    setModelosCrud(prev => prev.map((m, i) => {
      if (i !== modeloIdx) return m;
      const item = m.imagenes[imgIdx];
      if (item.file) URL.revokeObjectURL(item.src);
      return { ...m, imagenes: m.imagenes.filter((_, j) => j !== imgIdx) };
    }));
  };

  const handleMoverModeloImagen = (modeloIdx: number, imgIdx: number, dir: -1 | 1) => {
    setModelosCrud(prev => prev.map((m, i) => {
      if (i !== modeloIdx) return m;
      const to = imgIdx + dir;
      if (to < 0 || to >= m.imagenes.length) return m;
      const next = [...m.imagenes];
      [next[imgIdx], next[to]] = [next[to], next[imgIdx]];
      return { ...m, imagenes: next };
    }));
  };

  const handleModeloPortada = async (modeloIdx: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const old = modelosCrud[modeloIdx].portada;
    if (old?.file) URL.revokeObjectURL(old.src);
    const comp = await comprimirImagen(file);
    setModelosCrud(prev => prev.map((m, i) =>
      i === modeloIdx ? { ...m, portada: { src: URL.createObjectURL(comp), file: comp } } : m
    ));
    e.target.value = '';
  };

  const handleQuitarModeloPortada = (modeloIdx: number) => {
    const old = modelosCrud[modeloIdx].portada;
    if (old?.file) URL.revokeObjectURL(old.src);
    setModelosCrud(prev => prev.map((m, i) => i === modeloIdx ? { ...m, portada: null } : m));
  };

  const handleAddAmpliacionImagen = async (modeloIdx: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const comp = await comprimirImagen(file);
    setModelosCrud(prev => prev.map((m, i) =>
      i === modeloIdx ? { ...m, ampliacion: { ...m.ampliacion, imagenes: [...m.ampliacion.imagenes, { src: URL.createObjectURL(comp), file: comp }] } } : m
    ));
    e.target.value = '';
  };

  const handleRemoveAmpliacionImagen = (modeloIdx: number, imgIdx: number) => {
    setModelosCrud(prev => prev.map((m, i) => {
      if (i !== modeloIdx) return m;
      const item = m.ampliacion.imagenes[imgIdx];
      if (item.file) URL.revokeObjectURL(item.src);
      return { ...m, ampliacion: { ...m.ampliacion, imagenes: m.ampliacion.imagenes.filter((_, j) => j !== imgIdx) } };
    }));
  };

  const handleUpdateAmpliacion = (modeloIdx: number, field: 'descripcion' | 'area' | 'pisos', value: string) => {
    setModelosCrud(prev => prev.map((m, i) =>
      i === modeloIdx ? { ...m, ampliacion: { ...m.ampliacion, [field]: value } } : m
    ));
  };

  const handleAddResumenArea = (modeloIdx: number) => {
    setModelosCrud(prev => prev.map((m, i) =>
      i === modeloIdx
        ? { ...m, ampliacion: { ...m.ampliacion, resumen_areas: [...m.ampliacion.resumen_areas, { label: '', valor: '', resaltar: false }] } }
        : m
    ));
  };
  const handleUpdateResumenArea = (modeloIdx: number, rowIdx: number, field: 'label' | 'valor' | 'resaltar', value: string | boolean) => {
    setModelosCrud(prev => prev.map((m, i) => {
      if (i !== modeloIdx) return m;
      const rows = m.ampliacion.resumen_areas.map((r, ri) => ri === rowIdx ? { ...r, [field]: value } : r);
      return { ...m, ampliacion: { ...m.ampliacion, resumen_areas: rows } };
    }));
  };
  const handleRemoveResumenArea = (modeloIdx: number, rowIdx: number) => {
    setModelosCrud(prev => prev.map((m, i) => {
      if (i !== modeloIdx) return m;
      return { ...m, ampliacion: { ...m.ampliacion, resumen_areas: m.ampliacion.resumen_areas.filter((_, ri) => ri !== rowIdx) } };
    }));
  };

  const handleMoverItem = (
    items: ImagenItem[],
    setItems: React.Dispatch<React.SetStateAction<ImagenItem[]>>,
    idx: number,
    dir: -1 | 1,
    setPortada?: React.Dispatch<React.SetStateAction<number>>,
  ) => {
    const to = idx + dir;
    if (to < 0 || to >= items.length) return;
    const next = [...items];
    [next[idx], next[to]] = [next[to], next[idx]];
    setItems(next);
    if (setPortada) {
      setPortada(prev => {
        if (prev === idx) return to;
        if (prev === to) return idx;
        return prev;
      });
    }
  };

  const PROYECTO_VACIO = {
    titulo: '', tipo: 'Departamento', ubicacion: '', precio: '',
    ruta: '', descripcion: '', metros: '', cuartos: '', banos: '',
    enlace_mas_info: '',
    estado: 'disponible', precio_desde: false,
    area_techada: '', garajes: '', pisos_proyectados: '',
    piso: '', total_pisos: '', antiguedad: '',
    entrega: '', financiamiento: false, financiamiento_tipo: '',
    amoblado: false, caracteristicas: '', video_url: '',
    imagen_mapa: '',
    landing_proveedor: '',
    landing_url: '',
    landing_imagen: '',
    landing_titulo: '',
    total_unidades: '',
  };

  const cancelarEdicionProyecto = () => {
    setEditandoProyectoId(null);
    setMostrarFormularioProyecto(false);
    setNuevoProyecto(PROYECTO_VACIO);
    imagenesItems.forEach(item => { if (item.file) URL.revokeObjectURL(item.src); });
    setImagenesItems([]);
    setPortadaIdx(0);
    modelosCrud.forEach(m => {
      m.imagenes.forEach(item => { if (item.file) URL.revokeObjectURL(item.src); });
      m.ampliacion.imagenes.forEach(item => { if (item.file) URL.revokeObjectURL(item.src); });
      if (m.portada?.file) URL.revokeObjectURL(m.portada.src);
    });
    setModelosCrud([]);
    setArchivoMapa(null);
    setMapaPreviewUpload('');
    setMostrarMapaPreview(false);
    setArchivoLandingImg(null);
    setLandingImgPreview('');
    setFichaPdfFile(null); setFichaPdfUrl(''); setFichaPdfLabel('');
    setFichaPdf2File(null); setFichaPdf2Url(''); setFichaPdf2Label('');
    const input = document.getElementById('file-selector') as HTMLInputElement;
    if (input) input.value = '';
    const inputMapa = document.getElementById('mapa-file') as HTMLInputElement;
    if (inputMapa) inputMapa.value = '';
    const landingFile = document.getElementById('landing-img-file') as HTMLInputElement;
    if (landingFile) landingFile.value = '';
  };

  const handleGuardarProyecto = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setStatusMsg({ type: '', text: '' });
    try {
      if (!editandoProyectoId && imagenesItems.length < 1) {
        throw new Error('Selecciona al menos 1 imagen para el inmueble.');
      }

      // Upload new images and build final URLs array
      let urlsImagenes: string[] = [];
      const newFiles = imagenesItems.filter(item => item.file).map(item => item.file!);
      if (newFiles.length > 0) {
        setStatusMsg({ type: 'info', text: 'Subiendo imágenes...' });
        const uploadedUrls = await subirImagenesAlStorage(newFiles);
        let fi = 0;
        urlsImagenes = imagenesItems.map(item => item.file ? uploadedUrls[fi++] : item.src);
      } else if (imagenesItems.length > 0) {
        urlsImagenes = imagenesItems.map(item => item.src);
      }

      const datos: any = {
        titulo: nuevoProyecto.titulo,
        tipo: nuevoProyecto.tipo,
        ubicacion: nuevoProyecto.ubicacion,
        ruta: nuevoProyecto.ruta ? slugify(nuevoProyecto.ruta) : (slugify(nuevoProyecto.titulo) || `proyecto-${Date.now()}`),
        precio: parseInt(nuevoProyecto.precio, 10),
        descripcion: nuevoProyecto.descripcion,
        metros: nuevoProyecto.metros ? parseFloat(nuevoProyecto.metros) : null,
        cuartos: nuevoProyecto.cuartos ? parseInt(nuevoProyecto.cuartos) : null,
        banos: nuevoProyecto.banos ? parseInt(nuevoProyecto.banos) : null,
        enlace_mas_info: nuevoProyecto.enlace_mas_info || null,
        estado: nuevoProyecto.estado,
        precio_desde: nuevoProyecto.precio_desde,
        area_techada: nuevoProyecto.area_techada ? parseFloat(nuevoProyecto.area_techada) : null,
        garajes: nuevoProyecto.garajes ? parseInt(nuevoProyecto.garajes) : null,
        pisos_proyectados: nuevoProyecto.pisos_proyectados ? parseInt(nuevoProyecto.pisos_proyectados) : null,
        piso: nuevoProyecto.piso ? parseInt(nuevoProyecto.piso) : null,
        total_pisos: nuevoProyecto.total_pisos ? parseInt(nuevoProyecto.total_pisos) : null,
        antiguedad: nuevoProyecto.antiguedad !== '' ? parseInt(nuevoProyecto.antiguedad) : null, // 0 es válido (obra nueva)
        entrega: nuevoProyecto.entrega || null,
        financiamiento: nuevoProyecto.financiamiento,
        financiamiento_tipo: nuevoProyecto.financiamiento_tipo || null,
        amoblado: nuevoProyecto.amoblado,
        caracteristicas: nuevoProyecto.caracteristicas
          ? nuevoProyecto.caracteristicas.split(',').map((s) => s.trim()).filter(Boolean)
          : null,
        video_url: nuevoProyecto.video_url || null,
        imagen_mapa: nuevoProyecto.imagen_mapa || null,
        landing_proveedor: nuevoProyecto.landing_proveedor || null,
        landing_url: nuevoProyecto.landing_url || null,
        landing_imagen: nuevoProyecto.landing_imagen || null,
        landing_titulo: nuevoProyecto.landing_titulo || null,
        total_unidades: nuevoProyecto.total_unidades ? parseInt(nuevoProyecto.total_unidades) : null,
      };
      if (urlsImagenes.length > 0) {
        datos.imagen = urlsImagenes[portadaIdx] || urlsImagenes[0];
        datos.imagenes = urlsImagenes;
      }
      if (archivoMapa) {
        setStatusMsg({ type: 'info', text: 'Subiendo imagen del mapa...' });
        datos.imagen_mapa = await subirArchivoUnico(archivoMapa, 'mapa');
      }
      if (archivoLandingImg) {
        datos.landing_imagen = await subirArchivoUnico(archivoLandingImg, 'landing');
      }
      if (fichaPdfFile) {
        setStatusMsg({ type: 'info', text: 'Subiendo ficha técnica...' });
        datos.ficha_tecnica_url = await subirArchivoUnico(fichaPdfFile, 'ficha');
        datos.ficha_tecnica_label = fichaPdfLabel || null;
      } else if (fichaPdfUrl) {
        datos.ficha_tecnica_url = fichaPdfUrl;
        datos.ficha_tecnica_label = fichaPdfLabel || null;
      }
      if (fichaPdf2File) {
        setStatusMsg({ type: 'info', text: 'Subiendo segundo PDF...' });
        datos.ficha_tecnica_2_url = await subirArchivoUnico(fichaPdf2File, 'ficha2');
        datos.ficha_tecnica_2_label = fichaPdf2Label || null;
      } else if (fichaPdf2Url) {
        datos.ficha_tecnica_2_url = fichaPdf2Url;
        datos.ficha_tecnica_2_label = fichaPdf2Label || null;
      }
      const subirItems = async (items: ImagenItem[]): Promise<string[]> => {
        const newFiles = items.filter(item => item.file).map(item => item.file!);
        if (newFiles.length === 0) return items.map(item => item.src);
        const uploaded = await subirImagenesAlStorage(newFiles);
        let fi = 0;
        return items.map(item => item.file ? uploaded[fi++] : item.src);
      };

      if (modelosCrud.length > 0) {
        setStatusMsg({ type: 'info', text: 'Subiendo modelos...' });
        datos.modelos = await Promise.all(modelosCrud.map(async (mc) => ({
          titulo: mc.titulo,
          descripcion: mc.descripcion || undefined,
          precio: mc.precio ? parseInt(mc.precio) : undefined,
          area: mc.area ? parseFloat(mc.area) : undefined,
          dormitorios: mc.dormitorios ? parseInt(mc.dormitorios) : undefined,
          banos: mc.banos ? parseInt(mc.banos) : undefined,
          portada: mc.portada ? (await subirItems([mc.portada]))[0] : undefined,
          imagenes: await subirItems(mc.imagenes),
          ampliacion: mc.ampliacion.imagenes.length > 0 || mc.ampliacion.descripcion || mc.ampliacion.area || mc.ampliacion.pisos || mc.ampliacion.resumen_areas.length > 0 ? {
            descripcion: mc.ampliacion.descripcion || undefined,
            area: mc.ampliacion.area ? parseFloat(mc.ampliacion.area) : undefined,
            pisos: mc.ampliacion.pisos ? parseInt(mc.ampliacion.pisos) : undefined,
            imagenes: await subirItems(mc.ampliacion.imagenes),
            resumen_areas: mc.ampliacion.resumen_areas.filter(r => r.label || r.valor).map(r => ({ label: r.label, valor: r.valor, resaltar: r.resaltar || undefined })),
          } : undefined,
        })));
      }

      const url = editandoProyectoId ? `/api/proyectos/${editandoProyectoId}` : '/api/proyectos';
      const method = editandoProyectoId ? 'PUT' : 'POST';
      if (!editandoProyectoId) datos.autor_id = user.id;

      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(datos) });
      if (!res.ok) { const err = await res.json(); throw new Error(err.error); }

      setStatusMsg({ type: 'success', text: editandoProyectoId ? '¡Inmueble actualizado con éxito!' : '¡Nuevo inmueble publicado con éxito!' });
      cancelarEdicionProyecto();
      setMostrarFormularioProyecto(false);
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
    setMostrarFormularioProyecto(true);
    setNuevoProyecto({
      titulo: p.titulo, tipo: p.tipo, ubicacion: p.ubicacion,
      ruta: p.ruta || '', precio: p.precio.toString(),
      descripcion: p.descripcion || '',
      metros: p.metros?.toString() || '', cuartos: p.cuartos?.toString() || '',
      banos: p.banos?.toString() || '', enlace_mas_info: p.enlace_mas_info || '',
      estado: p.estado || 'disponible',
      precio_desde: p.precio_desde ?? false,
      area_techada: p.area_techada?.toString() || '',
      garajes: p.garajes?.toString() || '',
      pisos_proyectados: p.pisos_proyectados?.toString() || '',
      piso: p.piso?.toString() || '',
      total_pisos: p.total_pisos?.toString() || '',
      antiguedad: p.antiguedad?.toString() || '',
      entrega: p.entrega || '',
      financiamiento: p.financiamiento ?? false,
      financiamiento_tipo: p.financiamiento_tipo || '',
      amoblado: p.amoblado ?? false,
      caracteristicas: Array.isArray(p.caracteristicas) ? p.caracteristicas.join(', ') : '',
      video_url: p.video_url || '',
      imagen_mapa: p.imagen_mapa || '',
      landing_proveedor: p.landing_proveedor || '',
      landing_url: p.landing_url || '',
      landing_imagen: p.landing_imagen || '',
      landing_titulo: p.landing_titulo || '',
      total_unidades: p.total_unidades?.toString() || '',
    });
    const imgItems: ImagenItem[] = (p.imagenes || [p.imagen]).map(url => ({ src: url }));
    setImagenesItems(imgItems);
    const foundIdx = (p.imagenes || []).indexOf(p.imagen);
    setPortadaIdx(foundIdx >= 0 ? foundIdx : 0);
    if (p.modelos && p.modelos.length > 0) {
      setModelosCrud(p.modelos.map(md => ({
        key: nuevoModeloKey(),
        titulo: md.titulo,
        descripcion: md.descripcion || '',
        precio: md.precio?.toString() || '',
        area: md.area?.toString() || '',
        dormitorios: md.dormitorios?.toString() || '',
        banos: md.banos?.toString() || '',
        portada: md.portada ? { src: md.portada } : null,
        imagenes: (md.imagenes || []).map(url => ({ src: url })),
        ampliacion: {
          descripcion: md.ampliacion?.descripcion || '',
          area: md.ampliacion?.area?.toString() || '',
          pisos: md.ampliacion?.pisos?.toString() || '',
          imagenes: (md.ampliacion?.imagenes || []).map(url => ({ src: url })),
          resumen_areas: (md.ampliacion?.resumen_areas || []).map(r => ({ label: r.label, valor: r.valor, resaltar: r.resaltar ?? false })),
        },
      })));
    } else {
      setModelosCrud([]);
    }
    setMapaPreviewUpload('');
    setArchivoMapa(null);
    setFichaPdfUrl(p.ficha_tecnica_url || '');
    setFichaPdfLabel(p.ficha_tecnica_label || '');
    setFichaPdf2Url(p.ficha_tecnica_2_url || '');
    setFichaPdf2Label(p.ficha_tecnica_2_label || '');
    setFichaPdfFile(null);
    setFichaPdf2File(null);
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
          <Link href="/"><img src="/img/horos-inmobiliaria.png" alt="Horos" className="h-8 brightness-0 invert cursor-pointer" /></Link>
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
              <div className="flex flex-col gap-6">

                {/* Header + Botón agregar */}
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                    <FiBriefcase className="text-amber-600" />
                    Inmuebles publicados ({proyectos.length})
                  </h3>
                  {!mostrarFormularioProyecto && (
                    <button
                      type="button"
                      onClick={() => { cancelarEdicionProyecto(); setMostrarFormularioProyecto(true); }}
                      className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white font-bold px-4 py-2.5 rounded-xl text-sm transition-colors shadow-sm">
                      <FiPlus size={16} /> Agregar Inmueble
                    </button>
                  )}
                </div>

                {/* Lista de inmuebles */}
                {proyectos.length === 0 && !mostrarFormularioProyecto ? (
                  <div className="text-center py-14 text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    <FiBriefcase size={32} className="mx-auto mb-3 opacity-30" />
                    <p className="text-sm font-medium">No hay inmuebles publicados aún.</p>
                    <button
                      type="button"
                      onClick={() => setMostrarFormularioProyecto(true)}
                      className="mt-4 inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white font-bold px-4 py-2 rounded-xl text-sm transition-colors">
                      <FiPlus size={14} /> Publicar tu primer inmueble
                    </button>
                  </div>
                ) : proyectos.length > 0 && (
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
                              <span className={`inline-block mt-1 text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full ${
                                p.estado === 'vendido'   ? 'bg-slate-100 text-slate-500' :
                                p.estado === 'reservado' ? 'bg-amber-100 text-amber-700' :
                                                           'bg-emerald-100 text-emerald-700'
                              }`}>
                                {p.estado ?? 'disponible'}
                              </span>
                            </td>
                            <td className="px-4 py-3 font-black text-slate-800 whitespace-nowrap">
                              {p.precio_desde && <span className="text-[10px] font-semibold text-slate-400 block">Desde</span>}
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

                {/* Formulario (solo visible al agregar o editar) */}
                {mostrarFormularioProyecto && (
                <form onSubmit={handleGuardarProyecto} className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden">
                  <div className={`px-6 py-4 border-b border-slate-200 flex justify-between items-center ${editandoProyectoId ? 'bg-amber-50 border-amber-200' : ''}`}>
                    <h3 className="font-black text-slate-900 flex items-center gap-2 text-sm">
                      <FiBriefcase className={editandoProyectoId ? 'text-amber-600' : 'text-slate-500'} />
                      {editandoProyectoId ? 'Editando Inmueble' : 'Publicar Nuevo Inmueble'}
                    </h3>
                    <button type="button" onClick={cancelarEdicionProyecto}
                      className="text-xs font-bold text-red-600 flex items-center gap-1 hover:text-red-800">
                      <FiX /> {editandoProyectoId ? 'Cancelar edición' : 'Cerrar'}
                    </button>
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
                        <label className="text-xs font-bold text-slate-600">Tipo de inmueble</label>
                        <select className="border border-slate-200 rounded-lg py-2 px-3 text-sm bg-white outline-none cursor-pointer focus:ring-2 focus:ring-amber-600"
                          value={nuevoProyecto.tipo}
                          onChange={(e) => setNuevoProyecto({ ...nuevoProyecto, tipo: e.target.value })}>
                          <optgroup label="── Proyectos / Conjuntos">
                            <option value="Conjunto Residencial">Conjunto Residencial</option>
                            <option value="Lote + Casa">Lote + Casa</option>
                            <option value="Lote / Terreno">Lote / Terreno</option>
                          </optgroup>
                          <optgroup label="── Venta">
                            <option value="Departamento">Departamento</option>
                            <option value="Casa">Casa</option>
                            <option value="Local Comercial">Local Comercial</option>
                            <option value="Oficina">Oficina</option>
                          </optgroup>
                          <optgroup label="── Alquiler">
                            <option value="Departamento (Alquiler)">Departamento (Alquiler)</option>
                            <option value="Casa (Alquiler)">Casa (Alquiler)</option>
                            <option value="Oficina (Alquiler)">Oficina (Alquiler)</option>
                            <option value="Local Comercial (Alquiler)">Local Comercial (Alquiler)</option>
                          </optgroup>
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
                          <input type="text" required placeholder="Av. América Norte 123"
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

                    {/* ── Campos dinámicos por tipo ───────────────────────── */}
                    {(() => {
                      const t   = nuevoProyecto.tipo.toLowerCase();
                      const cat = t.includes('conjunto') || t.includes('lote') || t.includes('terreno')
                        ? 'lote'
                        : t.includes('departamento') ? 'depto'
                        : t.includes('casa')         ? 'casa'
                        : 'comercial';

                      const inp = "border border-slate-200 rounded-lg py-2 px-3 text-sm outline-none bg-white focus:ring-2 focus:ring-amber-600";
                      const lbl = "text-xs font-bold text-slate-600";

                      const LABELS: Record<string, { icon: string; color: string; desc: string }> = {
                        lote:     { icon: '🏘️', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', desc: 'Conjunto / Lote' },
                        depto:    { icon: '🏢', color: 'bg-blue-50    text-blue-700    border-blue-200',    desc: 'Departamento'   },
                        casa:     { icon: '🏠', color: 'bg-amber-50   text-amber-700   border-amber-200',   desc: 'Casa'           },
                        comercial:{ icon: '🏪', color: 'bg-purple-50  text-purple-700  border-purple-200',  desc: 'Comercial'      },
                      };
                      const lb = LABELS[cat];

                      return (
                        <div className="flex flex-col gap-4">
                          {/* Badge de categoría detectada */}
                          <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-bold ${lb.color}`}>
                            <span>{lb.icon}</span>
                            Campos para: <strong>{lb.desc}</strong>
                            <span className="ml-auto font-normal opacity-60">Se ajustan automáticamente al cambiar el tipo</span>
                          </div>

                          {/* ── CONJUNTO / LOTE ──────────────────────────── */}
                          {cat === 'lote' && (
                            <>
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                <div className="flex flex-col gap-1.5">
                                  <label className={`${lbl} flex items-center gap-1`}><FiMaximize2 size={11} />Área del lote m²</label>
                                  <input type="number" placeholder="90" className={inp}
                                    value={nuevoProyecto.metros}
                                    onChange={(e) => setNuevoProyecto({ ...nuevoProyecto, metros: e.target.value })} />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                  <label className={`${lbl} flex items-center gap-1`}><FiMaximize2 size={11} />Área construida / techada m²</label>
                                  <input type="number" step="any" placeholder="35" className={inp}
                                    value={nuevoProyecto.area_techada}
                                    onChange={(e) => setNuevoProyecto({ ...nuevoProyecto, area_techada: e.target.value })} />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                  <label className={lbl}>Pisos proyectados</label>
                                  <input type="number" placeholder="1" className={inp}
                                    value={nuevoProyecto.pisos_proyectados}
                                    onChange={(e) => setNuevoProyecto({ ...nuevoProyecto, pisos_proyectados: e.target.value })} />
                                  <p className="text-[10px] text-slate-400">Ej. 1 piso con proyección a 2</p>
                                </div>
                                <div className="flex flex-col gap-1.5">
                                  <label className={`${lbl} flex items-center gap-1`}><FaBed size={11} />Dormitorios (si aplica)</label>
                                  <input type="number" placeholder="—" className={inp}
                                    value={nuevoProyecto.cuartos}
                                    onChange={(e) => setNuevoProyecto({ ...nuevoProyecto, cuartos: e.target.value })} />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                  <label className={`${lbl} flex items-center gap-1`}><FaBath size={11} />Baños (si aplica)</label>
                                  <input type="number" placeholder="—" className={inp}
                                    value={nuevoProyecto.banos}
                                    onChange={(e) => setNuevoProyecto({ ...nuevoProyecto, banos: e.target.value })} />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                  <label className={lbl}>Garajes</label>
                                  <input type="number" placeholder="—" className={inp}
                                    value={nuevoProyecto.garajes}
                                    onChange={(e) => setNuevoProyecto({ ...nuevoProyecto, garajes: e.target.value })} />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                  <label className={lbl}>Nº total de lotes / unidades</label>
                                  <input type="number" placeholder="Ej. 120"
                                    className={inp}
                                    value={nuevoProyecto.total_unidades}
                                    onChange={(e) => setNuevoProyecto({ ...nuevoProyecto, total_unidades: e.target.value })} />
                                  <p className="text-[10px] text-slate-400">Se muestra como "120 lotes" en la ficha</p>
                                </div>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1.5">
                                  <label className={lbl}>Estado del proyecto</label>
                                  <select className={`${inp} cursor-pointer`}
                                    value={nuevoProyecto.estado}
                                    onChange={(e) => setNuevoProyecto({ ...nuevoProyecto, estado: e.target.value })}>
                                    <option value="disponible">✅ Disponible</option>
                                    <option value="reservado">🟡 Reservado</option>
                                    <option value="vendido">⛔ Agotado / Vendido</option>
                                  </select>
                                </div>
                                <div className="flex flex-col gap-1.5">
                                  <label className={lbl}>Fecha de entrega</label>
                                  <input type="text" placeholder="Diciembre 2025" className={inp}
                                    value={nuevoProyecto.entrega}
                                    onChange={(e) => setNuevoProyecto({ ...nuevoProyecto, entrega: e.target.value })} />
                                </div>
                              </div>
                            </>
                          )}

                          {/* ── DEPARTAMENTO ─────────────────────────────── */}
                          {cat === 'depto' && (
                            <>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="flex flex-col gap-1.5">
                                  <label className={`${lbl} flex items-center gap-1`}><FiMaximize2 size={11} />Área total m²</label>
                                  <input type="number" placeholder="85" className={inp}
                                    value={nuevoProyecto.metros}
                                    onChange={(e) => setNuevoProyecto({ ...nuevoProyecto, metros: e.target.value })} />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                  <label className={`${lbl} flex items-center gap-1`}><FaBed size={11} />Dormitorios</label>
                                  <input type="number" placeholder="3" className={inp}
                                    value={nuevoProyecto.cuartos}
                                    onChange={(e) => setNuevoProyecto({ ...nuevoProyecto, cuartos: e.target.value })} />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                  <label className={`${lbl} flex items-center gap-1`}><FaBath size={11} />Baños</label>
                                  <input type="number" placeholder="2" className={inp}
                                    value={nuevoProyecto.banos}
                                    onChange={(e) => setNuevoProyecto({ ...nuevoProyecto, banos: e.target.value })} />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                  <label className={lbl}>Garajes</label>
                                  <input type="number" placeholder="1" className={inp}
                                    value={nuevoProyecto.garajes}
                                    onChange={(e) => setNuevoProyecto({ ...nuevoProyecto, garajes: e.target.value })} />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                  <label className={lbl}>Piso del departamento</label>
                                  <input type="number" placeholder="5" className={inp}
                                    value={nuevoProyecto.piso}
                                    onChange={(e) => setNuevoProyecto({ ...nuevoProyecto, piso: e.target.value })} />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                  <label className={lbl}>Total pisos del edificio</label>
                                  <input type="number" placeholder="12" className={inp}
                                    value={nuevoProyecto.total_pisos}
                                    onChange={(e) => setNuevoProyecto({ ...nuevoProyecto, total_pisos: e.target.value })} />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                  <label className={lbl}>Antigüedad (años)</label>
                                  <input type="number" placeholder="0 = obra nueva" className={inp}
                                    value={nuevoProyecto.antiguedad}
                                    onChange={(e) => setNuevoProyecto({ ...nuevoProyecto, antiguedad: e.target.value })} />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                  <label className={lbl}>Fecha de entrega</label>
                                  <input type="text" placeholder="Inmediata / Dic 2025" className={inp}
                                    value={nuevoProyecto.entrega}
                                    onChange={(e) => setNuevoProyecto({ ...nuevoProyecto, entrega: e.target.value })} />
                                </div>
                              </div>
                              <div className="flex flex-col gap-1.5">
                                <label className={lbl}>Estado</label>
                                <select className={`${inp} cursor-pointer`}
                                  value={nuevoProyecto.estado}
                                  onChange={(e) => setNuevoProyecto({ ...nuevoProyecto, estado: e.target.value })}>
                                  <option value="disponible">✅ Disponible</option>
                                  <option value="reservado">🟡 Reservado</option>
                                  <option value="vendido">⛔ Vendido</option>
                                </select>
                              </div>
                            </>
                          )}

                          {/* ── CASA ─────────────────────────────────────── */}
                          {cat === 'casa' && (
                            <>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="flex flex-col gap-1.5">
                                  <label className={`${lbl} flex items-center gap-1`}><FiMaximize2 size={11} />Área total m²</label>
                                  <input type="number" placeholder="120" className={inp}
                                    value={nuevoProyecto.metros}
                                    onChange={(e) => setNuevoProyecto({ ...nuevoProyecto, metros: e.target.value })} />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                  <label className={`${lbl} flex items-center gap-1`}><FiMaximize2 size={11} />Área construida m²</label>
                                  <input type="number" step="any" placeholder="100" className={inp}
                                    value={nuevoProyecto.area_techada}
                                    onChange={(e) => setNuevoProyecto({ ...nuevoProyecto, area_techada: e.target.value })} />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                  <label className={`${lbl} flex items-center gap-1`}><FaBed size={11} />Dormitorios</label>
                                  <input type="number" placeholder="3" className={inp}
                                    value={nuevoProyecto.cuartos}
                                    onChange={(e) => setNuevoProyecto({ ...nuevoProyecto, cuartos: e.target.value })} />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                  <label className={`${lbl} flex items-center gap-1`}><FaBath size={11} />Baños</label>
                                  <input type="number" placeholder="2" className={inp}
                                    value={nuevoProyecto.banos}
                                    onChange={(e) => setNuevoProyecto({ ...nuevoProyecto, banos: e.target.value })} />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                  <label className={lbl}>Garajes</label>
                                  <input type="number" placeholder="1" className={inp}
                                    value={nuevoProyecto.garajes}
                                    onChange={(e) => setNuevoProyecto({ ...nuevoProyecto, garajes: e.target.value })} />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                  <label className={lbl}>Pisos de la casa</label>
                                  <input type="number" placeholder="2" className={inp}
                                    value={nuevoProyecto.pisos_proyectados}
                                    onChange={(e) => setNuevoProyecto({ ...nuevoProyecto, pisos_proyectados: e.target.value })} />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                  <label className={lbl}>Antigüedad (años)</label>
                                  <input type="number" placeholder="0 = nueva" className={inp}
                                    value={nuevoProyecto.antiguedad}
                                    onChange={(e) => setNuevoProyecto({ ...nuevoProyecto, antiguedad: e.target.value })} />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                  <label className={lbl}>Fecha de entrega</label>
                                  <input type="text" placeholder="Inmediata / Dic 2025" className={inp}
                                    value={nuevoProyecto.entrega}
                                    onChange={(e) => setNuevoProyecto({ ...nuevoProyecto, entrega: e.target.value })} />
                                </div>
                              </div>
                              <div className="flex flex-col gap-1.5">
                                <label className={lbl}>Estado</label>
                                <select className={`${inp} cursor-pointer`}
                                  value={nuevoProyecto.estado}
                                  onChange={(e) => setNuevoProyecto({ ...nuevoProyecto, estado: e.target.value })}>
                                  <option value="disponible">✅ Disponible</option>
                                  <option value="reservado">🟡 Reservado</option>
                                  <option value="vendido">⛔ Vendido</option>
                                </select>
                              </div>
                            </>
                          )}

                          {/* ── COMERCIAL / OFICINA ──────────────────────── */}
                          {cat === 'comercial' && (
                            <>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="flex flex-col gap-1.5">
                                  <label className={`${lbl} flex items-center gap-1`}><FiMaximize2 size={11} />Área m²</label>
                                  <input type="number" placeholder="60" className={inp}
                                    value={nuevoProyecto.metros}
                                    onChange={(e) => setNuevoProyecto({ ...nuevoProyecto, metros: e.target.value })} />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                  <label className={lbl}>Piso</label>
                                  <input type="number" placeholder="3" className={inp}
                                    value={nuevoProyecto.piso}
                                    onChange={(e) => setNuevoProyecto({ ...nuevoProyecto, piso: e.target.value })} />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                  <label className={lbl}>Total pisos edificio</label>
                                  <input type="number" placeholder="10" className={inp}
                                    value={nuevoProyecto.total_pisos}
                                    onChange={(e) => setNuevoProyecto({ ...nuevoProyecto, total_pisos: e.target.value })} />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                  <label className={lbl}>Garajes</label>
                                  <input type="number" placeholder="—" className={inp}
                                    value={nuevoProyecto.garajes}
                                    onChange={(e) => setNuevoProyecto({ ...nuevoProyecto, garajes: e.target.value })} />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                  <label className={lbl}>Antigüedad (años)</label>
                                  <input type="number" placeholder="0 = nueva" className={inp}
                                    value={nuevoProyecto.antiguedad}
                                    onChange={(e) => setNuevoProyecto({ ...nuevoProyecto, antiguedad: e.target.value })} />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                  <label className={lbl}>Fecha de entrega</label>
                                  <input type="text" placeholder="Inmediata" className={inp}
                                    value={nuevoProyecto.entrega}
                                    onChange={(e) => setNuevoProyecto({ ...nuevoProyecto, entrega: e.target.value })} />
                                </div>
                              </div>
                              <div className="flex flex-col gap-1.5">
                                <label className={lbl}>Estado</label>
                                <select className={`${inp} cursor-pointer`}
                                  value={nuevoProyecto.estado}
                                  onChange={(e) => setNuevoProyecto({ ...nuevoProyecto, estado: e.target.value })}>
                                  <option value="disponible">✅ Disponible</option>
                                  <option value="reservado">🟡 Reservado</option>
                                  <option value="vendido">⛔ Vendido</option>
                                </select>
                              </div>
                            </>
                          )}
                        </div>
                      );
                    })()}

                    {/* Fila 6: Condiciones (checkboxes + financiamiento tipo) */}
                    <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col gap-3">
                      <p className="text-xs font-black text-slate-700 uppercase tracking-wide">Condiciones del proyecto</p>
                      <div className="flex flex-wrap gap-6">
                        <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-700">
                          <input type="checkbox"
                            className="w-4 h-4 rounded accent-amber-600"
                            checked={nuevoProyecto.precio_desde}
                            onChange={(e) => setNuevoProyecto({ ...nuevoProyecto, precio_desde: e.target.checked })} />
                          Precio <strong>"Desde"</strong>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-700">
                          <input type="checkbox"
                            className="w-4 h-4 rounded accent-amber-600"
                            checked={nuevoProyecto.financiamiento}
                            onChange={(e) => setNuevoProyecto({ ...nuevoProyecto, financiamiento: e.target.checked })} />
                          Acepta financiamiento
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-700">
                          <input type="checkbox"
                            className="w-4 h-4 rounded accent-amber-600"
                            checked={nuevoProyecto.amoblado}
                            onChange={(e) => setNuevoProyecto({ ...nuevoProyecto, amoblado: e.target.checked })} />
                          Se entrega amoblado
                        </label>
                      </div>
                      {nuevoProyecto.financiamiento && (
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-bold text-slate-600">Tipo de financiamiento</label>
                          <input type="text" placeholder="FOVIME, MIVIVIENDA, Banco BCP..."
                            className="border border-slate-200 rounded-lg py-2 px-3 text-sm outline-none bg-white focus:ring-2 focus:ring-amber-600"
                            value={nuevoProyecto.financiamiento_tipo}
                            onChange={(e) => setNuevoProyecto({ ...nuevoProyecto, financiamiento_tipo: e.target.value })} />
                        </div>
                      )}
                    </div>

                    {/* Fila 7: Amenidades */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-600">Amenidades y servicios incluidos</label>
                      <input type="text"
                        placeholder="Título de propiedad, Agua y desagüe, Áreas verdes, Juegos para niños"
                        className="border border-slate-200 rounded-lg py-2 px-3 text-sm outline-none bg-white focus:ring-2 focus:ring-amber-600"
                        value={nuevoProyecto.caracteristicas}
                        onChange={(e) => setNuevoProyecto({ ...nuevoProyecto, caracteristicas: e.target.value })} />
                      <p className="text-[10px] text-slate-400">Separa cada amenidad con una coma.</p>
                    </div>

                    {/* Fila 8: Video */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-600 flex items-center gap-1"><FiLink size={11} />Video tour (YouTube u otro)</label>
                      <input type="url" placeholder="https://www.youtube.com/watch?v=..."
                        className="border border-slate-200 rounded-lg py-2 px-3 text-sm outline-none bg-white focus:ring-2 focus:ring-amber-600"
                        value={nuevoProyecto.video_url}
                        onChange={(e) => setNuevoProyecto({ ...nuevoProyecto, video_url: e.target.value })} />
                    </div>

                    {/* Imagen del mapa */}
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-bold text-slate-600 flex items-center gap-1">
                        <FiMapPin size={11} className="text-amber-600" />
                        Imagen del mapa / plano de ubicación (opcional)
                      </label>
                      <div className="flex gap-3 items-start">
                        <div className="flex-1 flex flex-col gap-2">
                          {/* Upload de archivo */}
                          <div className="border-2 border-dashed border-slate-200 rounded-xl p-3 bg-white hover:border-amber-400 transition-colors">
                            <input
                              id="mapa-file"
                              type="file"
                              accept="image/*"
                              className="text-xs file:mr-3 file:py-1.5 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-slate-900 file:text-white hover:file:bg-slate-800 cursor-pointer"
                              onChange={handleImagenMapaChange}
                            />
                            <p className="text-[10px] text-slate-400 mt-1">Plano de ubicación, captura de mapa satelital, etc.</p>
                          </div>
                          {/* O pegar URL directa */}
                          <input
                            type="url"
                            placeholder="O pega la URL de la imagen si ya la tienes"
                            className="border border-slate-200 rounded-lg py-2 px-3 text-sm outline-none bg-white focus:ring-2 focus:ring-amber-600"
                            value={nuevoProyecto.imagen_mapa}
                            onChange={(e) => setNuevoProyecto({ ...nuevoProyecto, imagen_mapa: e.target.value })}
                          />
                        </div>
                        {/* Preview */}
                        {(mapaPreviewUpload || nuevoProyecto.imagen_mapa) && (
                          <div className="relative shrink-0 w-32 h-24 rounded-xl overflow-hidden border-2 border-amber-400 shadow-sm">
                            <img
                              src={mapaPreviewUpload || nuevoProyecto.imagen_mapa}
                              alt="Preview mapa"
                              className="w-full h-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setArchivoMapa(null);
                                setMapaPreviewUpload('');
                                setNuevoProyecto({ ...nuevoProyecto, imagen_mapa: '' });
                                const inp = document.getElementById('mapa-file') as HTMLInputElement;
                                if (inp) inp.value = '';
                              }}
                              className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-black hover:bg-red-600"
                              title="Quitar imagen"
                            >
                              ×
                            </button>
                          </div>
                        )}
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

                    {/* Landing embebido */}
                    <div className="border-t border-slate-100 pt-4 flex flex-col gap-3">
                      <p className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                        <FiExternalLink size={12} /> Landing embebido
                      </p>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold text-slate-500">Proveedor</label>
                        <select
                          className="border border-slate-200 rounded-lg py-2 px-3 text-sm bg-white outline-none cursor-pointer focus:ring-2 focus:ring-amber-600"
                          value={nuevoProyecto.landing_proveedor}
                          onChange={(e) => setNuevoProyecto({ ...nuevoProyecto, landing_proveedor: e.target.value })}>
                          <option value="">— Sin landing —</option>
                          <option value="neptuno">Consorcio Neptuno</option>
                        </select>
                        <p className="text-[10px] text-slate-400">Activa la sección de marca del proveedor al fondo de la ficha.</p>
                      </div>
                      {nuevoProyecto.landing_proveedor && (
                        <>
                          <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-bold text-slate-500">Título del landing</label>
                            <input type="text" placeholder="Ej. Consorcio Neptuno — Proyecto Exclusivo"
                              className="border border-slate-200 rounded-lg py-2 px-3 text-sm outline-none bg-white focus:ring-2 focus:ring-amber-600"
                              value={nuevoProyecto.landing_titulo}
                              onChange={(e) => setNuevoProyecto({ ...nuevoProyecto, landing_titulo: e.target.value })} />
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-bold text-slate-500">URL de redirección</label>
                            <input type="url" placeholder="https://www.consorcioneptuno.com"
                              className="border border-slate-200 rounded-lg py-2 px-3 text-sm outline-none bg-white focus:ring-2 focus:ring-amber-600"
                              value={nuevoProyecto.landing_url}
                              onChange={(e) => setNuevoProyecto({ ...nuevoProyecto, landing_url: e.target.value })} />
                          </div>
                          <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-bold text-slate-500">Imagen del landing</label>
                            <div className="flex gap-3 items-start">
                              <div className="flex-1 flex flex-col gap-2">
                                <div className="border-2 border-dashed border-slate-200 rounded-xl p-3 bg-white hover:border-amber-400 transition-colors">
                                  <input id="landing-img-file" type="file" accept="image/*"
                                    className="text-xs file:mr-3 file:py-1.5 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-slate-900 file:text-white hover:file:bg-slate-800 cursor-pointer"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (!file) { setArchivoLandingImg(null); setLandingImgPreview(''); return; }
                                      setArchivoLandingImg(file);
                                      setLandingImgPreview(URL.createObjectURL(file));
                                    }} />
                                </div>
                                <input type="url" placeholder="O pega la URL de la imagen"
                                  className="border border-slate-200 rounded-lg py-2 px-3 text-sm outline-none bg-white focus:ring-2 focus:ring-amber-600"
                                  value={nuevoProyecto.landing_imagen}
                                  onChange={(e) => setNuevoProyecto({ ...nuevoProyecto, landing_imagen: e.target.value })} />
                              </div>
                              {(landingImgPreview || nuevoProyecto.landing_imagen) && (
                                <div className="relative shrink-0 w-32 h-24 rounded-xl overflow-hidden border-2 border-amber-400 shadow-sm">
                                  <img src={landingImgPreview || nuevoProyecto.landing_imagen} alt="Preview landing"
                                    className="w-full h-full object-cover" />
                                  <button type="button" onClick={() => {
                                    setArchivoLandingImg(null);
                                    setLandingImgPreview('');
                                    setNuevoProyecto({ ...nuevoProyecto, landing_imagen: '' });
                                    const inp = document.getElementById('landing-img-file') as HTMLInputElement;
                                    if (inp) inp.value = '';
                                  }}
                                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-black hover:bg-red-600"
                                    title="Quitar imagen">×</button>
                                </div>
                              )}
                            </div>
                          </div>
                        </>
                      )}
                    </div>

                    {/* PDFs descargables */}
                    <div className="border-t border-slate-100 pt-4">
                      <p className="text-xs font-bold text-slate-600 mb-3 flex items-center gap-1.5">
                        <FiDownload size={12} /> PDFs descargables
                      </p>
                      <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 border-2 border-dashed border-slate-200 rounded-lg p-3 bg-white hover:border-amber-400 transition-colors">
                            <input type="file" accept=".pdf"
                              className="text-[10px] file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-[10px] file:font-bold file:bg-slate-900 file:text-white hover:file:bg-slate-800 cursor-pointer"
                              onChange={e => {
                                setFichaPdfFile(e.target.files?.[0] || null);
                                setFichaPdfUrl('');
                              }} />
                          </div>
                          {fichaPdfUrl && !fichaPdfFile && (
                            <span className="text-[10px] text-emerald-600 font-bold shrink-0">✓ Subido</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <label className="text-[10px] font-bold text-slate-500 shrink-0">Etiqueta:</label>
                          <input type="text" placeholder="Ej. Ficha técnica, Brochure, Planos"
                            className="border border-slate-200 rounded-lg py-1 px-2.5 text-xs outline-none flex-1 focus:ring-2 focus:ring-amber-500"
                            value={fichaPdfLabel}
                            onChange={e => setFichaPdfLabel(e.target.value)} />
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex-1 border-2 border-dashed border-slate-200 rounded-lg p-3 bg-white hover:border-amber-400 transition-colors">
                            <input type="file" accept=".pdf"
                              className="text-[10px] file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-[10px] file:font-bold file:bg-slate-900 file:text-white hover:file:bg-slate-800 cursor-pointer"
                              onChange={e => {
                                setFichaPdf2File(e.target.files?.[0] || null);
                                setFichaPdf2Url('');
                              }} />
                            <p className="text-[9px] text-slate-400 mt-1">Segundo PDF (brochure, planos, etc.)</p>
                          </div>
                          {fichaPdf2Url && !fichaPdf2File && (
                            <span className="text-[10px] text-emerald-600 font-bold shrink-0">✓ Subido</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <label className="text-[10px] font-bold text-slate-500 shrink-0">Etiqueta 2do PDF:</label>
                          <input type="text" placeholder="Ej. Brochure, Planos, Catálogo"
                            className="border border-slate-200 rounded-lg py-1 px-2.5 text-xs outline-none flex-1 focus:ring-2 focus:ring-amber-500"
                            value={fichaPdf2Label}
                            onChange={e => setFichaPdf2Label(e.target.value)} />
                        </div>
                      </div>
                    </div>

                    {/* Imágenes */}
                    <div className="flex flex-col gap-3">
                      <label className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                        <FiImage size={12} className="text-amber-600" />
                        Imágenes {editandoProyectoId ? '(opcional — agrega una por una)' : `(mínimo 1, máximo ${MAX_IMAGENES})`}
                      </label>

                      {/* Subida individual */}
                      <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 bg-white hover:border-amber-400 transition-colors">
                        <input id="file-selector" type="file" accept="image/*"
                          className="text-xs file:mr-3 file:py-1.5 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-slate-900 file:text-white hover:file:bg-slate-800 cursor-pointer"
                          onChange={handleAgregarImagen} />
                        <p className="text-[10px] text-slate-400 mt-2 flex items-center gap-1">
                          <FiInfo size={10} /> Formatos: JPG, PNG, WebP. Máximo {MAX_IMAGENES}. Cada archivo se agrega individualmente. Haz clic en una miniatura para marcarla como portada.
                        </p>
                      </div>

                      {/* Preview de imágenes */}
                      {imagenesItems.length > 0 && (
                        <div>
                          <p className="text-[10px] text-slate-500 font-bold mb-2 uppercase tracking-wide">
                            {imagenesItems.length} imagen{imagenesItems.length > 1 ? 'es' : ''} · Portada: #{portadaIdx + 1}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {imagenesItems.map((item, i) => (
                              <div key={i} className={`relative w-24 h-20 rounded-lg overflow-hidden border-2 group ${i === portadaIdx ? 'border-amber-500 ring-2 ring-amber-300' : 'border-slate-200'}`}>
                                <img src={item.src} alt={`Imagen ${i + 1}`}
                                  className="w-full h-full object-cover cursor-pointer"
                                  onClick={() => { setLightboxIdx(i); setLightboxTipo('imagen'); }} />
                                {i === portadaIdx && (
                                  <div className="absolute top-0 left-0 right-0 bg-amber-500 text-white text-[8px] font-black text-center py-0.5">
                                    PORTADA
                                  </div>
                                )}
                                <div className="absolute top-0.5 right-0.5 flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                  {i !== 0 && (
                                    <button type="button" onClick={() => handleMoverItem(imagenesItems, setImagenesItems, i, -1, setPortadaIdx)}
                                      className="bg-white/80 text-slate-700 rounded w-4 h-4 flex items-center justify-center text-[9px] font-black hover:bg-white border border-slate-300"
                                      title="Mover izquierda">◀</button>
                                  )}
                                  {i !== imagenesItems.length - 1 && (
                                    <button type="button" onClick={() => handleMoverItem(imagenesItems, setImagenesItems, i, 1, setPortadaIdx)}
                                      className="bg-white/80 text-slate-700 rounded w-4 h-4 flex items-center justify-center text-[9px] font-black hover:bg-white border border-slate-300"
                                      title="Mover derecha">▶</button>
                                  )}
                                </div>
                                {i !== portadaIdx && (
                                  <button type="button" onClick={() => handleSeleccionarPortada(i)}
                                    className="absolute top-8 right-1 bg-white/80 text-amber-700 rounded-full w-5 h-5 flex items-center justify-center text-[9px] font-black hover:bg-amber-100 border border-amber-300"
                                    title="Marcar como portada">
                                    ★
                                  </button>
                                )}
                                <button type="button" onClick={() => handleRemoverImagen(i)}
                                  className="absolute bottom-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-black hover:bg-red-600"
                                  title="Quitar imagen">
                                  ×
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Modelos CRUD */}
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                          <FiHome size={12} className="text-amber-600" />
                          Modelos de casas / planos {editandoProyectoId ? '(opcional)' : '(opcional)'}
                        </label>
                        <button type="button" onClick={handleAgregarModeloCrud}
                          disabled={modelosCrud.length >= MAX_IMAGENES}
                          className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-lg text-[10px] transition-colors disabled:opacity-40">
                          <FiPlus size={12} /> Agregar modelo
                        </button>
                      </div>

                      {modelosCrud.length === 0 && (
                        <p className="text-[10px] text-slate-400 italic">No hay modelos registrados. Haz clic en "Agregar modelo" para crear uno.</p>
                      )}

                      <div className="flex flex-col gap-4">
                        {modelosCrud.map((mc, mi) => (
                          <div key={mc.key} className="border border-slate-200 rounded-xl bg-white overflow-hidden shadow-sm">
                            {/* ── Header ── */}
                            <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 px-4 py-3 flex items-center justify-between">
                              <div className="flex items-center gap-2 text-white">
                                <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center text-xs font-black">
                                  {mi + 1}
                                </div>
                                <span className="text-sm font-black">{mc.titulo || `Modelo ${mi + 1}`}</span>
                              </div>
                              <button type="button" onClick={() => handleEliminarModeloCrud(mi)}
                                className="text-white/70 hover:text-white font-black text-lg transition-colors" title="Eliminar modelo">×</button>
                            </div>

                            <div className="p-5 flex flex-col gap-5">
                              {/* ── Portada del modelo ── */}
                              <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                                  <FiImage size={11} className="text-emerald-600" /> Portada del modelo
                                </label>
                                <div className="flex gap-3 items-start">
                                  <div className="border-2 border-dashed border-slate-200 rounded-lg p-3 bg-slate-50 hover:border-emerald-400 transition-colors flex-1">
                                    <input type="file" accept="image/*"
                                      className="text-[10px] file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-[10px] file:font-bold file:bg-slate-900 file:text-white hover:file:bg-slate-800 cursor-pointer"
                                      onChange={e => handleModeloPortada(mi, e)} />
                                    <p className="text-[9px] text-slate-400 mt-1">Imagen principal que identifica este modelo</p>
                                  </div>
                                  {mc.portada && (
                                    <div className="relative shrink-0 w-24 h-16 rounded-lg overflow-hidden border-2 border-emerald-500 shadow-sm">
                                      <img src={mc.portada.src} alt="Portada" className="w-full h-full object-cover" />
                                      <div className="absolute bottom-0 inset-x-0 bg-emerald-600 text-white text-[7px] font-black text-center py-0.5">PORTADA</div>
                                      <button type="button" onClick={() => handleQuitarModeloPortada(mi)}
                                        className="absolute top-0.5 right-0.5 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-[7px] font-black hover:bg-red-600">×</button>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* ── Datos del modelo ── */}
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                <div className="flex flex-col gap-1">
                                  <label className="text-[10px] font-bold text-slate-500">Nombre del modelo *</label>
                                  <input type="text" placeholder="Ej. Modelo A, Premium"
                                    className="border border-slate-200 rounded-lg py-1.5 px-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                                    value={mc.titulo} onChange={e => handleUpdateModeloCrud(mi, 'titulo', e.target.value)} />
                                </div>
                                <div className="flex flex-col gap-1">
                                  <label className="text-[10px] font-bold text-slate-500">Precio (S/.)</label>
                                  <input type="number" placeholder="Ej. 280000"
                                    className="border border-slate-200 rounded-lg py-1.5 px-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                                    value={mc.precio} onChange={e => handleUpdateModeloCrud(mi, 'precio', e.target.value)} />
                                </div>
                                <div className="flex flex-col gap-1">
                                  <label className="text-[10px] font-bold text-slate-500">Área (m²)</label>
                                  <input type="number" step="any" placeholder="Ej. 85"
                                    className="border border-slate-200 rounded-lg py-1.5 px-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                                    value={mc.area} onChange={e => handleUpdateModeloCrud(mi, 'area', e.target.value)} />
                                </div>
                                <div className="flex flex-col gap-1">
                                  <label className="text-[10px] font-bold text-slate-500">Dormitorios</label>
                                  <input type="number" placeholder="3"
                                    className="border border-slate-200 rounded-lg py-1.5 px-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                                    value={mc.dormitorios} onChange={e => handleUpdateModeloCrud(mi, 'dormitorios', e.target.value)} />
                                </div>
                                <div className="flex flex-col gap-1">
                                  <label className="text-[10px] font-bold text-slate-500">Baños</label>
                                  <input type="number" placeholder="2"
                                    className="border border-slate-200 rounded-lg py-1.5 px-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                                    value={mc.banos} onChange={e => handleUpdateModeloCrud(mi, 'banos', e.target.value)} />
                                </div>
                              </div>
                              <div className="flex flex-col gap-1">
                                <label className="text-[10px] font-bold text-slate-500">Descripción del modelo</label>
                                <textarea rows={2} placeholder="Acabados, características del modelo..."
                                  className="border border-slate-200 rounded-lg py-1.5 px-3 text-sm outline-none resize-none focus:ring-2 focus:ring-emerald-500"
                                  value={mc.descripcion} onChange={e => handleUpdateModeloCrud(mi, 'descripcion', e.target.value)} />
                              </div>

                              {/* ── Galería del modelo ── */}
                              <div className="border-t border-slate-100 pt-4">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1 mb-2">
                                  <FiImage size={11} className="text-emerald-600" /> Galería de imágenes del modelo
                                </label>
                                <div className="border-2 border-dashed border-slate-200 rounded-lg p-3 bg-slate-50 hover:border-emerald-400 transition-colors">
                                  <input type="file" accept="image/*"
                                    className="text-[10px] file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-[10px] file:font-bold file:bg-slate-900 file:text-white hover:file:bg-slate-800 cursor-pointer"
                                    onChange={e => handleAddModeloImagen(mi, e)} />
                                </div>
                                {mc.imagenes.length > 0 && (
                                  <div className="flex flex-wrap gap-1.5 mt-2">
                                    {mc.imagenes.map((item, ii) => (
                                      <div key={ii} className="relative w-16 h-12 rounded-lg overflow-hidden border border-emerald-300 group">
                                        <img src={item.src} alt={`${mc.titulo} ${ii + 1}`}
                                          className="w-full h-full object-cover cursor-pointer"
                                          onClick={() => setModeloLightbox({ modeloIdx: mi, imgIdx: ii })} />
                                        <div className="absolute inset-0 flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                                          {ii > 0 && (
                                            <button type="button" onClick={() => handleMoverModeloImagen(mi, ii, -1)}
                                              className="bg-white/80 text-slate-700 rounded w-4 h-4 flex items-center justify-center text-[8px] font-black hover:bg-white">◀</button>
                                          )}
                                          {ii < mc.imagenes.length - 1 && (
                                            <button type="button" onClick={() => handleMoverModeloImagen(mi, ii, 1)}
                                              className="bg-white/80 text-slate-700 rounded w-4 h-4 flex items-center justify-center text-[8px] font-black hover:bg-white">▶</button>
                                          )}
                                        </div>
                                        <button type="button" onClick={() => handleRemoveModeloImagen(mi, ii)}
                                          className="absolute top-0.5 right-0.5 bg-red-500 text-white rounded-full w-3.5 h-3.5 flex items-center justify-center text-[6px] font-black hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity">×</button>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>

                              {/* ── Ampliación ── */}
                              <div className="border-t border-slate-100 pt-4">
                                <div className="flex items-center gap-2 mb-3">
                                  <div className="w-5 h-5 rounded-md bg-amber-100 flex items-center justify-center text-[10px] font-black text-amber-700">+</div>
                                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Ampliación / proyección</label>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                                  <div className="flex flex-col gap-1">
                                    <label className="text-[10px] font-bold text-slate-400">Área de ampliación (m²)</label>
                                    <input type="number" step="any" placeholder="Ej. 40"
                                      className="border border-slate-200 rounded-lg py-1.5 px-3 text-sm outline-none focus:ring-2 focus:ring-amber-400"
                                      value={mc.ampliacion.area} onChange={e => handleUpdateAmpliacion(mi, 'area', e.target.value)} />
                                  </div>
                                  <div className="flex flex-col gap-1">
                                    <label className="text-[10px] font-bold text-slate-400">Pisos proyectados</label>
                                    <input type="number" placeholder="Ej. 2"
                                      className="border border-slate-200 rounded-lg py-1.5 px-3 text-sm outline-none focus:ring-2 focus:ring-amber-400"
                                      value={mc.ampliacion.pisos} onChange={e => handleUpdateAmpliacion(mi, 'pisos', e.target.value)} />
                                  </div>
                                </div>
                                <div className="flex flex-col gap-1 mb-3">
                                  <label className="text-[10px] font-bold text-slate-400">Descripción de la ampliación</label>
                                  <textarea rows={2} placeholder="Ej. Proyección a 2 pisos adicionales con terraza..."
                                    className="border border-slate-200 rounded-lg py-1.5 px-3 text-sm outline-none resize-none focus:ring-2 focus:ring-amber-400"
                                    value={mc.ampliacion.descripcion} onChange={e => handleUpdateAmpliacion(mi, 'descripcion', e.target.value)} />
                                </div>

                                {/* Resumen de áreas */}
                                <div className="mb-3">
                                  <div className="flex items-center justify-between mb-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Resumen de áreas</label>
                                    <button type="button" onClick={() => handleAddResumenArea(mi)}
                                      className="flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-1 rounded-lg hover:bg-amber-100 transition-colors">
                                      <FiPlus size={10} /> Agregar fila
                                    </button>
                                  </div>
                                  {mc.ampliacion.resumen_areas.length === 0 && (
                                    <p className="text-[10px] text-slate-400 italic">Ej: "Área techada inicial → 37.60 m²", "Área total → 101.56 m²"</p>
                                  )}
                                  <div className="flex flex-col gap-1.5">
                                    {mc.ampliacion.resumen_areas.map((row, ri) => (
                                      <div key={ri} className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border ${row.resaltar ? 'bg-amber-50 border-amber-200' : 'bg-slate-50 border-slate-200'}`}>
                                        <input
                                          type="text"
                                          placeholder="Ej. Área techada total"
                                          className="flex-1 bg-transparent text-xs outline-none text-slate-700 placeholder-slate-300"
                                          value={row.label}
                                          onChange={e => handleUpdateResumenArea(mi, ri, 'label', e.target.value)}
                                        />
                                        <span className="text-slate-300 text-xs">:</span>
                                        <input
                                          type="text"
                                          placeholder="101.56 m²"
                                          className="w-24 bg-transparent text-xs outline-none text-slate-700 placeholder-slate-300 text-right"
                                          value={row.valor}
                                          onChange={e => handleUpdateResumenArea(mi, ri, 'valor', e.target.value)}
                                        />
                                        <button type="button"
                                          title="Resaltar fila"
                                          onClick={() => handleUpdateResumenArea(mi, ri, 'resaltar', !row.resaltar)}
                                          className={`text-[9px] font-black px-1.5 py-0.5 rounded border transition-colors ${row.resaltar ? 'bg-amber-500 text-white border-amber-500' : 'bg-white text-slate-400 border-slate-200 hover:border-amber-300'}`}>
                                          B
                                        </button>
                                        <button type="button" onClick={() => handleRemoveResumenArea(mi, ri)}
                                          className="text-slate-300 hover:text-red-400 transition-colors">
                                          <FiX size={13} />
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                                <div className="border-2 border-dashed border-amber-200 rounded-lg p-3 bg-amber-50 hover:border-amber-400 transition-colors">
                                  <input type="file" accept="image/*"
                                    className="text-[10px] file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-[10px] file:font-bold file:bg-slate-900 file:text-white hover:file:bg-slate-800 cursor-pointer"
                                    onChange={e => handleAddAmpliacionImagen(mi, e)} />
                                  <p className="text-[9px] text-amber-500 mt-1">Planos, renders y visualizaciones de la ampliación</p>
                                </div>
                                {mc.ampliacion.imagenes.length > 0 && (
                                  <div className="flex flex-wrap gap-1.5 mt-2">
                                    {mc.ampliacion.imagenes.map((item, ii) => (
                                      <div key={ii} className="relative w-16 h-12 rounded-lg overflow-hidden border border-amber-300 group">
                                        <img src={item.src} alt="Ampliación" className="w-full h-full object-cover cursor-pointer"
                                          onClick={() => setModeloLightbox({ modeloIdx: mi, imgIdx: ii })} />
                                        <button type="button" onClick={() => handleRemoveAmpliacionImagen(mi, ii)}
                                          className="absolute top-0.5 right-0.5 bg-red-500 text-white rounded-full w-3.5 h-3.5 flex items-center justify-center text-[6px] font-black hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity">×</button>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Lightbox de imágenes */}
                    {lightboxIdx !== null && (
                      <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
                        onClick={() => setLightboxIdx(null)}>
                        <div className="relative max-w-4xl w-full max-h-[90vh] flex flex-col"
                          onClick={e => e.stopPropagation()}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-white/60 text-xs font-bold uppercase tracking-wider">
                              Imagen {lightboxIdx! + 1} de {imagenesItems.length}
                            </span>
                            <button type="button" onClick={() => setLightboxIdx(null)}
                              className="text-white/80 hover:text-white text-xl font-black">×</button>
                          </div>
                          <div className="relative flex-1 flex items-center justify-center min-h-0">
                            <button type="button"
                              onClick={() => setLightboxIdx(prev => prev !== null ? Math.max(0, prev - 1) : null)}
                              disabled={lightboxIdx === 0}
                              className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white/10 hover:bg-white/20 text-white rounded-full w-10 h-10 flex items-center justify-center text-lg font-black disabled:opacity-20 disabled:cursor-not-allowed transition-colors">
                              ‹
                            </button>
                            <img src={imagenesItems[lightboxIdx]?.src} alt="Detalle"
                              className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl" />
                            <button type="button"
                              onClick={() => setLightboxIdx(prev => prev !== null ? Math.min(imagenesItems.length - 1, prev + 1) : null)}
                              disabled={lightboxIdx === imagenesItems.length - 1}
                              className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white/10 hover:bg-white/20 text-white rounded-full w-10 h-10 flex items-center justify-center text-lg font-black disabled:opacity-20 disabled:cursor-not-allowed transition-colors">
                              ›
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Lightbox de imágenes de modelo */}
                    {modeloLightbox !== null && (
                      <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
                        onClick={() => setModeloLightbox(null)}>
                        <div className="relative max-w-4xl w-full max-h-[90vh] flex flex-col"
                          onClick={e => e.stopPropagation()}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-white/60 text-xs font-bold uppercase tracking-wider">
                              {modelosCrud[modeloLightbox.modeloIdx]?.titulo || 'Modelo'} · Imagen {modeloLightbox.imgIdx + 1} de {modelosCrud[modeloLightbox.modeloIdx]?.imagenes.length}
                            </span>
                            <button type="button" onClick={() => setModeloLightbox(null)}
                              className="text-white/80 hover:text-white text-xl font-black">×</button>
                          </div>
                          <div className="relative flex-1 flex items-center justify-center min-h-0">
                            <button type="button"
                              onClick={() => setModeloLightbox(prev => prev !== null ? { ...prev, imgIdx: Math.max(0, prev.imgIdx - 1) } : null)}
                              disabled={modeloLightbox.imgIdx === 0}
                              className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white/10 hover:bg-white/20 text-white rounded-full w-10 h-10 flex items-center justify-center text-lg font-black disabled:opacity-20 disabled:cursor-not-allowed transition-colors">
                              ‹
                            </button>
                            <img src={modelosCrud[modeloLightbox.modeloIdx]?.imagenes[modeloLightbox.imgIdx]?.src} alt="Detalle modelo"
                              className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl" />
                            <button type="button"
                              onClick={() => setModeloLightbox(prev => prev !== null ? { ...prev, imgIdx: Math.min(modelosCrud[prev.modeloIdx].imagenes.length - 1, prev.imgIdx + 1) } : null)}
                              disabled={modeloLightbox.imgIdx === modelosCrud[modeloLightbox.modeloIdx]?.imagenes.length - 1}
                              className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white/10 hover:bg-white/20 text-white rounded-full w-10 h-10 flex items-center justify-center text-lg font-black disabled:opacity-20 disabled:cursor-not-allowed transition-colors">
                              ›
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

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
                )}
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
