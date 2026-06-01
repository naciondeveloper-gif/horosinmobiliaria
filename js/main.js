// =========================================================================
// 1. BASE DE DATOS INICIAL + STORAGE (Esto resuelve la creación automática)
// =========================================================================

// Proyectos por defecto (si el almacenamiento está vacío)
const proyectosPredeterminados = [
    {
        id: 1,
        titulo: "Residencial San Isidro",
        tipo: "Condominio",
        precio: 111250,
        imagen: "./img/BANNER.SANT_.MOV-1.webp",
        ubicacion: "San Andrés",
        metros: 120,
        cuartos: 3,
        banos: 2
    },
    {
        id: 2,
        titulo: "Residencial Mont Blanc",
        tipo: "Departamento",
        precio: 623500,
        imagen: "./img/BANNER.SANT_.MOV-1.webp",
        ubicacion: "El Golf",
        metros: 335,
        cuartos: 3,
        banos: 4
    },
    {
        id: 3,
        titulo: "Residencial Larco Mar",
        tipo: "Departamento",
        precio: 122700,
        imagen: "./img/BANNER.SANT_.MOV-1.webp",
        ubicacion: "California",
        metros: 150,
        cuartos: 3,
        banos: 4
    }
];

// Si ya hay proyectos guardados en el navegador, los usa. Si no, guarda los predeterminados.
if (!localStorage.getItem("mis_proyectos")) {
    localStorage.setItem("mis_proyectos", JSON.stringify(proyectosPredeterminados));
}

// Esta es nuestra lista real y viva de proyectos
let proyectos = JSON.stringify(localStorage.getItem("mis_proyectos")) ? JSON.parse(localStorage.getItem("mis_proyectos")) : proyectosPredeterminados;


// =========================================================================
// 2. ELEMENTOS DEL DOM
// =========================================================================
const contenedorProyectos = document.getElementById("contenedor-proyectos");
const filtroUbicacion = document.getElementById("filtro-ubicacion");
const filtroCuartos = document.getElementById("filtro-cuartos");
const filtroBanos = document.getElementById("filtro-banos");
const btnCalcular = document.getElementById("btn-calcular");


// =========================================================================
// 3. FUNCIÓN RENDERIZAR TARJETAS (Página Principal)
// =========================================================================
function mostrarProyectos(listaProyectos) {
    if (!contenedorProyectos) return;
    contenedorProyectos.innerHTML = ""; 

    if (listaProyectos.length === 0) {
        contenedorProyectos.innerHTML = `
            <div class="col-span-full py-12 text-center text-gray-400 font-medium">
                <i class="bi bi-info-circle text-3xl block mb-2 text-gray-300"></i>
                No se encontraron propiedades con esos filtros.
            </div>
        `;
        return;
    }

    listaProyectos.forEach(proyecto => {
        const tarjetaHtml = `
            <div class="bg-white shadow-sm border border-slate-100 rounded-lg overflow-hidden flex flex-col text-left transition-all hover:shadow-md">
                <div class="relative h-52 w-full overflow-hidden bg-slate-200">
                    <div style="background-image: url('${proyecto.imagen}')" class="w-full h-full bg-cover bg-center hover:scale-105 transition-transform duration-300"></div>
                    <div class="absolute bottom-3 left-3 bg-neutral-900/90 text-white font-semibold text-sm px-3 py-1 rounded-sm shadow-sm">
                        S/. ${proyecto.precio.toLocaleString('es-PE')}
                    </div>
                </div>
                <div class="p-4 flex-1 flex flex-col justify-between">
                    <div class="mb-4">
                        <p class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">${proyecto.tipo}</p>
                        <h4 class="text-lg font-bold text-slate-900 hover:text-horos_dorado transition-colors">
                            <a href="proyecto.html?id=${proyecto.id}">${proyecto.titulo}</a>
                        </h4>
                        <span class="text-xs text-gray-500 block mt-1">📍 ${proyecto.ubicacion}, Trujillo</span>
                    </div>
                    <div class="flex justify-between items-center text-xs text-gray-600 font-semibold border-t border-slate-100 pt-3">
                        <span class="flex items-center gap-1">📐 ${proyecto.metros} m²</span>
                        <span class="flex items-center gap-1">🛏️ ${proyecto.cuartos} Dorms</span>
                        <span class="flex items-center gap-1">🚿 ${proyecto.banos} Baños</span>
                    </div>
                </div>
            </div>
        `;
        contenedorProyectos.insertAdjacentHTML("beforeend", tarjetaHtml);
    });
}


// =========================================================================
// 4. LÓGICA DE FILTROS DINÁMICOS
// =========================================================================
function filtrarProyectos() {
    const ubicacionSeleccionada = filtroUbicacion.value;
    const cuartosSeleccionados = filtroCuartos.value;
    const banosSeleccionados = filtroBanos.value;

    const proyectosFiltrados = proyectos.filter(proyecto => {
        const cumpleUbicacion = ubicacionSeleccionada === "todos" || proyecto.ubicacion === ubicacionSeleccionada;
        const cumpleCuartos = cuartosSeleccionados === "todos" || 
            (cuartosSeleccionados === "4" ? proyecto.cuartos >= 4 : proyecto.cuartos === parseInt(cuartosSeleccionados));
        const cumpleBanos = banosSeleccionados === "todos" || 
            (banosSeleccionados === "4" ? proyecto.banos >= 4 : proyecto.banos === parseInt(banosSeleccionados));

        return cumpleUbicacion && cumpleCuartos && cumpleBanos;
    });

    mostrarProyectos(proyectosFiltrados);
}


// =========================================================================
// 5. CALCULADORA DE CUOTAS
// =========================================================================
if (btnCalcular) {
    btnCalcular.addEventListener("click", () => {
        const precio = parseFloat(document.getElementById("precio").value) || 0;
        const inicial = parseFloat(document.getElementById("inicial").value) || 0;
        const tasaAnual = (parseFloat(document.getElementById("tasa").value) || 0) / 100;
        const anios = parseInt(document.getElementById("plazo").value) || 0;

        const montoFinanciar = precio - inicial;
        const tasaMensual = tasaAnual / 12;
        const nMeses = anios * 12;

        if (montoFinanciar <= 0 || nMeses <= 0) {
            document.getElementById("cuota-final").innerText = "S/. 0.00";
            return;
        }

        let cuota = (tasaMensual > 0) 
            ? (montoFinanciar * tasaMensual) / (1 - Math.pow(1 + tasaMensual, -nMeses))
            : montoFinanciar / nMeses;

        const montoFormateado = montoFinanciar.toLocaleString('es-PE', { minimumFractionDigits: 2 });
        const cuotaFormateada = cuota.toLocaleString('es-PE', { minimumFractionDigits: 2 });

        document.getElementById("cuota-final").innerHTML = `
            <span class="text-sm font-medium text-slate-500 block mb-1">Monto a financiar: S/. ${montoFormateado}</span>
            <span class="text-2xl font-black text-horos_azul">S/. ${cuotaFormateada} <span class="text-xs font-normal text-slate-400">/ mes</span></span>
        `;
    });
}


// =========================================================================
// 6. INICIALIZACIÓN DE EVENTOS
// =========================================================================
document.addEventListener("DOMContentLoaded", () => {
    mostrarProyectos(proyectos);

    if (filtroUbicacion) filtroUbicacion.addEventListener("change", filtrarProyectos);
    if (filtroCuartos) filtroCuartos.addEventListener("change", filtrarProyectos);
    if (filtroBanos) filtroBanos.addEventListener("change", filtrarProyectos);
    
    // EJECUCIÓN EXCLUSIVA SI ESTAMOS EN LA PÁGINA PROYECTO.HTML (FICHA TÉCNICA)
    if (document.getElementById("detalle-proyecto")) {
        renderizarVistaDetalle();
    }
});


// =========================================================================
// 7. FUNCIÓN MÁGICA: CREACIÓN AUTOMÁTICA DE LA VISTA DE DETALLE
// =========================================================================
function renderizarVistaDetalle() {
    const params = new URLSearchParams(window.location.search);
    const idProyecto = parseInt(params.get("id"));

    // Busca el proyecto directamente en la base de datos sincronizada
    const proyecto = proyectos.find(p => p.id === idProyecto);
    const contenedor = document.getElementById("detalle-proyecto");

    if (!proyecto) {
        contenedor.innerHTML = `<div class="col-span-full text-center py-20 text-xl font-bold text-gray-500">Propiedad no encontrada.</div>`;
        return;
    }

    document.title = `${proyecto.titulo} | Horos Inmobiliaria`;

    contenedor.innerHTML = `
        <div class="lg:col-span-2 flex flex-col gap-6">
            <h2 class="text-3xl font-bold text-slate-900">${proyecto.titulo}</h2>
            <p class="text-horos_dorado font-semibold uppercase tracking-wider text-sm">${proyecto.tipo} en ${proyecto.ubicacion}</p>
            
            <div class="w-full h-[450px] bg-slate-200 rounded-lg overflow-hidden shadow-sm">
                <img src="${proyecto.imagen}" alt="${proyecto.titulo}" class="w-full h-full object-cover">
            </div>

            <div class="bg-white p-6 rounded-lg shadow-sm border border-slate-100">
                <h3 class="text-xl font-bold mb-4 text-slate-900">Características Principales</h3>
                <div class="grid grid-cols-3 gap-4 text-center text-slate-600 bg-slate-50 p-4 rounded-md">
                    <div>
                        <span class="font-bold block text-lg text-horos_dorado">📐 ${proyecto.metros} m²</span> Area Total
                    </div>
                    <div>
                        <span class="font-bold block text-lg text-horos_dorado">🛏️ ${proyecto.cuartos}</span> Dormitorios
                    </div>
                    <div>
                        <span class="font-bold block text-lg text-horos_dorado">🚿 ${proyecto.banos}</span> Baños
                    </div>
                </div>
                <p class="mt-6 text-slate-600 leading-relaxed">
                    Inmueble con acabados de primera calidad, excelente iluminación natural y una ubicación privilegiada dentro de las zonas más exclusivas de Trujillo. Ideal para inversión o vivienda familiar.
                </p>
            </div>
        </div>

        <div class="flex flex-col gap-6">
            <div class="bg-slate-900 text-white p-6 rounded-lg shadow-md text-center">
                <p class="text-gray-400 text-sm font-medium">Precio del Inmueble</p>
                <h3 class="text-3xl font-bold mt-1 text-horos_dorado">S/. ${proyecto.precio.toLocaleString('es-PE')}</h3>
            </div>

            <div class="bg-white p-6 rounded-lg shadow-sm border border-slate-100 flex flex-col gap-4">
                <h3 class="text-lg font-bold text-slate-900">Simulador de Crédito</h3>
                <div>
                    <label class="text-xs font-bold text-gray-500 block mb-1">Precio Fijo (S/.)</label>
                    <input type="number" id="precio-detalle" value="${proyecto.precio}" disabled class="w-full bg-gray-50 border border-gray-200 rounded-md py-2 px-3 text-gray-500 font-bold focus:outline-none">
                </div>
                <div>
                    <label class="text-xs font-bold text-gray-500 block mb-1">Inicial Recomendada (10%)</label>
                    <input type="number" id="inicial-detalle" value="${proyecto.precio * 0.1}" id="inicial-detalle-input" class="w-full border border-gray-300 rounded-md py-2 px-3 focus:ring-2 focus:ring-horos_dorado focus:outline-none">
                </div>
                <button id="btn-calcular-detalle" class="w-full bg-horos_dorado text-white font-bold py-2.5 rounded-md hover:bg-amber-700 transition-colors">Simular Cuota</button>
                <div class="bg-slate-50 p-3 rounded-md text-center mt-2 border border-slate-100">
                    <span class="text-xs text-gray-500 block">Mensualidad estimada a 20 años (5% Tasa):</span>
                    <span id="resultado-detalle" class="text-xl font-bold text-slate-900">S/. 0.00</span>
                </div>
            </div>
        </div>
    `;

    // Activar la mini calculadora interna de la ficha técnica
    const btnCalcularDetalle = document.getElementById("btn-calcular-detalle");
    if (btnCalcularDetalle) {
        const calcularDetalle = () => {
            const inicialDetalle = parseFloat(document.getElementById("inicial-detalle").value) || 0;
            const monto = proyecto.precio - inicialDetalle;
            const tasaMensual = (5 / 100) / 12;
            const meses = 20 * 12;

            let cuotaDetalle = (monto * tasaMensual) / (1 - Math.pow(1 + tasaMensual, -meses));
            document.getElementById("resultado-detalle").innerText = `S/. ${cuotaDetalle.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        };
        btnCalcularDetalle.addEventListener("click", calcularDetalle);
        calcularDetalle(); // Lanzar cálculo inicial predeterminado
    }
}

// =========================================================================
// 8. FUNCIÓN PARA AGREGAR UN NUEVO PROYECTO (Para usar desde tu panel o consola)
// =========================================================================
function agregarNuevoProyecto(titulo, tipo, precio, imagen, ubicacion, metros, cuartos, banos) {
    const nuevo = {
        id: proyectos.length + 1,
        titulo: titulo,
        tipo: tipo,
        precio: parseFloat(precio),
        imagen: imagen,
        ubicacion: ubicacion,
        metros: parseInt(metros),
        cuartos: parseInt(cuartos),
        banos: parseInt(banos)
    };

    proyectos.push(nuevo);
    localStorage.setItem("mis_proyectos", JSON.stringify(proyectos)); // Guardar permanentemente
    mostrarProyectos(proyectos); // Redibujar la portada inmediatamente
    console.log(`¡Proyecto "${titulo}" creado con éxito con el ID: ${nuevo.id}!`);
}