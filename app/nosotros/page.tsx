import { FaBullseye, FaEye } from "react-icons/fa";

export default function NosotrosPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <section className="bg-slate-900 text-white py-20 text-center relative overflow-hidden">
        <div className="max-w-3xl mx-auto px-6 relative z-10">
          <h1 className="text-4xl md:text-5xl text-white tracking-tight">Sobre Nosotros</h1>
          <p className="text-slate-300 text-lg font-light max-w-xl mx-auto">Construyendo espacios exclusivos</p>
        </div>
      </section>
      <main className="max-w-6xl mx-auto py-16 px-6 grid grid-cols-1 md:grid-cols-2 gap-12 items-center flex-1">
        <div>
          <span className="text-horosblue text-xs font-bold uppercase tracking-widest block mb-2">Horos Inmobiliaria</span>
          <h2 className="text-3xl font-extrabold text-slate-900 mb-6 leading-tight">Garantía, Innovación y Calidad Arquitectónica</h2>
          <p className="text-slate-600 leading-relaxed mb-4">
            Somos una empresa dedicada al desarrollo, promoción y gestión de proyectos inmobiliarios premium en las zonas más cotizadas del país.
          </p>
        </div>
        <div className="rounded-lg overflow-hidden shadow-md h-80 bg-slate-200">

        </div>
        <div className="shadow-sm border border-slate-100 rounded-lg p-6 bg-white h-full relative overflow-hidden">
          <h3 className="text-2xl font-bold text-slate-900 mb-5">Nuestra Misión</h3>
          <p className="text-slate-600 leading-relaxed">
            Proveer a nuestros clientes el servicio de consultoría inmobiliaria más profesional y personal en todo el Perú, a través de un extenso conocimiento local, comunicación efectiva y fidedigna guía durante todo el proceso.</p>
          <FaBullseye className="text-horosblue/10 mr-2 text-[200px] absolute -top-10 -right-10 " />
        </div>
        <div className="shadow-sm border border-slate-100 rounded-lg p-6 bg-white h-full relative overflow-hidden">
          <div className="flex items-center mb-4">
            <h3 className="text-2xl font-bold text-slate-900">Nuestra Visión</h3>
            <FaEye className="text-horosblue/10 mr-2 text-[200px] absolute -top-10 -right-10" />
          </div>
          <p className="text-slate-600 leading-relaxed">
            Ser una compañía de bienes raíces que establece los estándares de operación y eficiencia. Facilitando las transacciones inmobiliarias para crear memorias a compartir, valor que heredar y tranquilidad para nuestros clientes y equipo de trabajo.</p>
        </div>
      </main>
    </div>
  );
}