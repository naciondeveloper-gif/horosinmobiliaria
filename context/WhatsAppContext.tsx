'use client';
import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { Proyecto } from '@/types/proyecto';

interface WhatsAppCtx {
  proyecto: Proyecto | null;
  setProyecto: (p: Proyecto | null) => void;
}

const WhatsAppContext = createContext<WhatsAppCtx>({
  proyecto: null,
  setProyecto: () => {},
});

export function WhatsAppProvider({ children }: { children: ReactNode }) {
  const [proyecto, setProyecto] = useState<Proyecto | null>(null);
  return (
    <WhatsAppContext.Provider value={{ proyecto, setProyecto }}>
      {children}
    </WhatsAppContext.Provider>
  );
}

export function useWhatsApp() {
  return useContext(WhatsAppContext);
}
