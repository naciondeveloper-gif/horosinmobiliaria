'use client';
import { useEffect } from 'react';
import { useWhatsApp } from '@/context/WhatsAppContext';
import type { Proyecto } from '@/types/proyecto';

export default function WhatsAppProjectSync({ proyecto }: { proyecto: Proyecto }) {
  const { setProyecto } = useWhatsApp();
  useEffect(() => {
    setProyecto(proyecto);
    return () => setProyecto(null);
  }, [proyecto, setProyecto]);
  return null;
}
