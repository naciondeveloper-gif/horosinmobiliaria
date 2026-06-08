import type { Proyecto } from '@/types/proyecto';

function fmt(n: number) {
  return n.toLocaleString('es-PE', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

// Colores Horos
const C = {
  dark:    [2,   48,  60]  as [number, number, number],
  mid:     [4,   74,  92]  as [number, number, number],
  accent:  [7,   166, 201] as [number, number, number],
  acLight: [220, 245, 252] as [number, number, number],
  white:   [255, 255, 255] as [number, number, number],
  gray1:   [240, 243, 245] as [number, number, number],
  gray2:   [160, 175, 185] as [number, number, number],
  text:    [30,  45,  55]  as [number, number, number],
  textSub: [90,  110, 120] as [number, number, number],
  green:   [16,  185, 129] as [number, number, number],
  orange:  [245, 158, 11]  as [number, number, number],
};

export async function generarFichaPDF(proyecto: Proyecto) {
  const { jsPDF } = await import('jspdf');

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const W = 210;
  const margin = 14;
  const colW = (W - margin * 2 - 6) / 2;
  let y = 0;

  // ── Header ──────────────────────────────────────────────────────────
  doc.setFillColor(...C.dark);
  doc.rect(0, 0, W, 36, 'F');

  // Línea acento inferior del header
  doc.setFillColor(...C.accent);
  doc.rect(0, 36, W, 1.2, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(17);
  doc.setTextColor(...C.white);
  doc.text('HOROS INMOBILIARIA', margin, 14);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(160, 215, 230);
  doc.text('horosinmobiliaria.com  |  971 000 482', margin, 21);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...C.acLight);
  doc.text('FICHA TECNICA DEL INMUEBLE', W - margin, 14, { align: 'right' });

  const fecha = new Date().toLocaleDateString('es-PE', {
    day: '2-digit', month: 'long', year: 'numeric',
  });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(140, 195, 215);
  doc.text(fecha, W - margin, 21, { align: 'right' });

  y = 46;

  // ── Título del proyecto ──────────────────────────────────────────────
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(...C.dark);
  const titulo = doc.splitTextToSize(proyecto.titulo, W - margin * 2);
  doc.text(titulo, margin, y);
  y += titulo.length * 7;

  // Tipo + estado
  const estado = proyecto.estado ?? 'disponible';
  const estadoLabel = estado === 'disponible' ? 'DISPONIBLE' : estado === 'reservado' ? 'RESERVADO' : 'VENDIDO';
  const estadoColor: [number, number, number] =
    estado === 'disponible' ? C.green : estado === 'reservado' ? C.orange : C.gray2;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(...C.white);
  doc.setFillColor(...C.accent);
  doc.roundedRect(margin, y, 28, 6, 1, 1, 'F');
  doc.text(proyecto.tipo.toUpperCase(), margin + 14, y + 4.2, { align: 'center' });

  doc.setFillColor(...estadoColor);
  doc.roundedRect(margin + 31, y, 28, 6, 1, 1, 'F');
  doc.text(estadoLabel, margin + 45, y + 4.2, { align: 'center' });

  y += 10;

  // Referencia
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...C.gray2);
  doc.text(`Ref. #${proyecto.id.toString().slice(0, 8)}`, margin, y);
  y += 5;

  // Ubicación
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...C.textSub);
  doc.text('Ubicacion:', margin, y);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...C.text);
  const ubic = doc.splitTextToSize(proyecto.ubicacion, W - margin * 2 - 24);
  doc.text(ubic, margin + 24, y);
  y += ubic.length * 5 + 3;

  // ── Divisor ──────────────────────────────────────────────────────────
  doc.setFillColor(...C.accent);
  doc.rect(margin, y, W - margin * 2, 0.6, 'F');
  y += 5;

  // ── Sección: Características ─────────────────────────────────────────
  const esLote = /lote|terreno|conjunto/i.test(proyecto.tipo);
  const areaEfectiva = proyecto.area_techada ?? proyecto.area_construida;

  type Dato = { label: string; valor: string };
  const specs: Dato[] = [
    proyecto.metros        ? { label: esLote ? 'Area terreno' : 'Area total',      valor: `${proyecto.metros} m2`   } : null,
    areaEfectiva           ? { label: esLote ? 'Area construida' : 'Area techada',  valor: `${areaEfectiva} m2`       } : null,
    proyecto.cuartos       ? { label: 'Dormitorios',   valor: String(proyecto.cuartos)        } : null,
    proyecto.banos         ? { label: 'Banos',         valor: String(proyecto.banos)          } : null,
    proyecto.garajes       ? { label: 'Garajes',       valor: String(proyecto.garajes)        } : null,
    proyecto.pisos_proyectados ? { label: esLote ? 'Pisos proy.' : 'Pisos', valor: String(proyecto.pisos_proyectados) } : null,
    proyecto.piso          ? { label: 'Nivel / Piso',  valor: `Piso ${proyecto.piso}${proyecto.total_pisos ? ` de ${proyecto.total_pisos}` : ''}` } : null,
    proyecto.total_pisos && !proyecto.piso ? { label: 'Total pisos', valor: String(proyecto.total_pisos) } : null,
    proyecto.total_unidades ? { label: 'N. de lotes',  valor: `${proyecto.total_unidades} unidades` } : null,
    proyecto.antiguedad !== undefined ? {
      label: 'Antiguedad',
      valor: proyecto.antiguedad === 0 ? 'Obra nueva' : `${proyecto.antiguedad} ano${proyecto.antiguedad !== 1 ? 's' : ''}`,
    } : null,
  ].filter(Boolean) as Dato[];

  if (specs.length > 0) {
    // Título sección
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(...C.dark);
    doc.setFillColor(...C.acLight);
    doc.rect(margin, y, W - margin * 2, 7, 'F');
    doc.text('CARACTERISTICAS DEL INMUEBLE', margin + 3, y + 5);
    y += 10;

    // Grid 2 columnas
    const rows = Math.ceil(specs.length / 2);
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < 2; col++) {
        const idx = row * 2 + col;
        if (idx >= specs.length) continue;
        const x = margin + col * (colW + 6);

        // Celda fondo
        doc.setFillColor(...C.gray1);
        doc.rect(x, y, colW, 10, 'F');

        // Label
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(...C.gray2);
        doc.text(specs[idx].label.toUpperCase(), x + 3, y + 4);

        // Valor
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(...C.dark);
        doc.text(specs[idx].valor, x + 3, y + 9);
      }
      y += 12;
    }
    y += 2;
  }

  // ── Sección: Precio ──────────────────────────────────────────────────
  doc.setFillColor(...C.dark);
  doc.rect(margin, y, W - margin * 2, 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(...C.white);
  doc.text('PRECIO', margin + 3, y + 5);
  y += 10;

  doc.setFillColor(...C.mid);
  doc.rect(margin, y, W - margin * 2, 14, 'F');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(160, 215, 230);
  doc.text(proyecto.precio_desde ? 'Precio desde' : 'Precio del inmueble', margin + 3, y + 5.5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(...C.white);
  const precioStr = `S/. ${fmt(proyecto.precio)}`;
  doc.text(precioStr, margin + 3, y + 12.5);

  const tags: string[] = [];
  if (proyecto.financiamiento) tags.push(proyecto.financiamiento_tipo ?? 'Financiable');
  if (proyecto.entrega) tags.push(`Entrega: ${proyecto.entrega}`);
  if (proyecto.amoblado) tags.push('Amoblado');

  if (tags.length > 0) {
    let tagX = margin + doc.getTextWidth(precioStr) + 8;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    tags.forEach(tag => {
      doc.setFillColor(...C.accent);
      const tw = doc.getTextWidth(tag) + 6;
      doc.roundedRect(tagX, y + 7.5, tw, 5.5, 1, 1, 'F');
      doc.setTextColor(...C.white);
      doc.text(tag, tagX + tw / 2, y + 11.5, { align: 'center' });
      tagX += tw + 3;
    });
  }
  y += 18;

  // ── Sección: Condiciones ─────────────────────────────────────────────
  const condItems: Dato[] = [
    proyecto.financiamiento ? { label: 'Financiamiento', valor: proyecto.financiamiento_tipo ?? 'Bancario / MIVIVIENDA' } : null,
    proyecto.entrega        ? { label: 'Entrega estimada', valor: proyecto.entrega } : null,
    proyecto.amoblado       ? { label: 'Amoblado', valor: 'Si, se entrega amoblado' } : null,
    proyecto.enlace_mas_info ? { label: 'Mas informacion', valor: proyecto.enlace_mas_info } : null,
  ].filter(Boolean) as Dato[];

  if (condItems.length > 0) {
    doc.setFillColor(...C.acLight);
    doc.rect(margin, y, W - margin * 2, 7, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(...C.dark);
    doc.text('CONDICIONES', margin + 3, y + 5);
    y += 9;

    condItems.forEach(item => {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(...C.dark);
      doc.text(`${item.label}:`, margin + 2, y);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...C.textSub);
      const val = doc.splitTextToSize(item.valor, W - margin * 2 - 50);
      doc.text(val, margin + 50, y);
      y += val.length * 5 + 1;
    });
    y += 3;
  }

  // ── Sección: Amenidades ──────────────────────────────────────────────
  const amenidades = Array.isArray(proyecto.caracteristicas) ? proyecto.caracteristicas : [];
  if (amenidades.length > 0) {
    doc.setFillColor(...C.acLight);
    doc.rect(margin, y, W - margin * 2, 7, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(...C.dark);
    doc.text('AMENIDADES Y SERVICIOS', margin + 3, y + 5);
    y += 10;

    // Grid de chips
    let chipX = margin;
    const chipH = 6;
    const chipMargin = 3;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);

    amenidades.forEach(item => {
      const tw = doc.getTextWidth(item) + 8;
      if (chipX + tw > W - margin) {
        chipX = margin;
        y += chipH + chipMargin;
      }
      doc.setFillColor(...C.acLight);
      doc.setDrawColor(...C.accent);
      doc.roundedRect(chipX, y, tw, chipH, 1, 1, 'FD');
      doc.setTextColor(...C.dark);
      doc.text(item, chipX + tw / 2, y + 4.2, { align: 'center' });
      chipX += tw + chipMargin;
    });
    y += chipH + 6;
  }

  // ── Descripción ──────────────────────────────────────────────────────
  if (proyecto.descripcion) {
    doc.setFillColor(...C.gray1);
    doc.rect(margin, y, W - margin * 2, 7, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(...C.dark);
    doc.text('DESCRIPCION', margin + 3, y + 5);
    y += 9;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(...C.textSub);
    const descLines = doc.splitTextToSize(proyecto.descripcion, W - margin * 2);
    const maxLines = 6;
    const excerpt = descLines.slice(0, maxLines);
    doc.text(excerpt, margin, y);
    y += excerpt.length * 5 + 3;
  }

  // ── Footer ───────────────────────────────────────────────────────────
  const footerY = 285;
  doc.setFillColor(...C.dark);
  doc.rect(0, footerY, W, 12, 'F');
  doc.setFillColor(...C.accent);
  doc.rect(0, footerY, W, 0.6, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...C.white);
  doc.text('HOROS INMOBILIARIA', margin, footerY + 5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(160, 215, 230);
  doc.text('horosinmobiliaria.com  |  +51 971 000 482', margin, footerY + 9.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(140, 195, 215);
  doc.text('Documento generado automaticamente. Informacion sujeta a cambios.', W - margin, footerY + 7.5, { align: 'right' });

  doc.save(`ficha-tecnica-${proyecto.ruta ?? proyecto.id}.pdf`);
}
