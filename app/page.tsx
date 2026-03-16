import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-white">

      {/* NAVBAR */}
      <nav className="flex items-center justify-between px-8 py-4 bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="font-black text-xl tracking-tight">
          thePRO<span className="text-orange-600">know</span>
        </div>
        <div className="flex items-center gap-2">
          {['Todos','Carpintería','Soldadura','Pintura','Finanzas'].map((cat, i) => (
            <button key={cat} className={`text-sm px-4 py-1.5 rounded-full transition-all ${i === 0 ? 'bg-gray-900 text-white' : 'text-gray-500 hover:bg-gray-100'}`}>
              {cat}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <button className="text-sm font-medium text-gray-900 border border-gray-300 rounded-full px-4 py-2">Iniciar sesión</button>
          <button className="text-sm font-medium text-white bg-orange-600 rounded-full px-4 py-2">Registrarse</button>
        </div>
      </nav>

      {/* HERO */}
      <div className="text-center pt-14 pb-8 px-8 max-w-2xl mx-auto">
        <span className="inline-block text-xs font-semibold uppercase tracking-widest text-orange-600 bg-orange-50 px-3 py-1 rounded-full mb-4">
          Conocimiento real de profesionales
        </span>
        <h1 className="text-5xl font-black tracking-tighter leading-tight text-gray-900 mb-3">
          El saber del oficio,<br /><span className="text-orange-600">sin filtros.</span>
        </h1>
        <p className="text-gray-400 text-base font-light">
          Tips probados por gente que trabaja con las manos.<br />Comparte lo que aprendiste en la cancha.
        </p>
      </div>

      {/* CATEGORÍAS */}
      <div className="flex flex-wrap justify-center gap-2 px-8 pb-6">
        {[
          { name: 'Todo', color: 'bg-orange-500' },
          { name: 'Carpintería', color: 'bg-green-600' },
          { name: 'Soldadura', color: 'bg-blue-600' },
          { name: 'Pintura', color: 'bg-amber-500' },
          { name: 'Rope Access', color: 'bg-red-700' },
          { name: 'Finanzas', color: 'bg-purple-600' },
          { name: 'Plomería', color: 'bg-teal-600' },
          { name: 'Electricidad', color: 'bg-pink-600' },
        ].map((cat) => (
          <button key={cat.name} className="flex items-center gap-2 text-xs px-4 py-1.5 rounded-full border border-gray-200 bg-gray-50 hover:bg-gray-100 transition-all">
            <span className={`w-2 h-2 rounded-full ${cat.color}`}></span>
            {cat.name}
          </button>
        ))}
      </div>

      {/* FEED HEADER */}
      <div className="flex items-center justify-between px-8 py-4">
        <h2 className="font-bold text-gray-900">Mejores valorados esta semana</h2>
        <button className="text-xs text-gray-400 border border-gray-200 rounded-full px-3 py-1">Ordenar</button>
      </div>

      {/* FEED MASONRY */}
      <div className="columns-4 gap-4 px-8 pb-16">
        {tips.map((tip, i) => (
          <div key={i} className="break-inside-avoid bg-white border border-gray-100 rounded-2xl overflow-hidden mb-4 hover:-translate-y-1 transition-transform cursor-pointer">
            {tip.imgH && (
              <div className="flex items-center justify-center text-5xl" style={{ height: tip.imgH, background: tip.iconBg }}>
                {tip.icon}
              </div>
            )}
            <div className="p-4">
              <span className="inline-block text-xs font-semibold uppercase tracking-wider rounded-full px-3 py-1 mb-3" style={{ background: tip.catBg, color: tip.catTxt }}>
                {tip.cat}
              </span>
              <h3 className="font-bold text-gray-900 text-sm leading-snug mb-2">{tip.title}</h3>
              <p className="text-xs text-gray-400 leading-relaxed">{tip.text}</p>
              <div className="flex gap-1 mt-3">
                {[1,2,3].map(d => <div key={d} className={`w-2 h-2 rounded-full ${d <= tip.diff ? 'bg-orange-500' : 'bg-gray-200'}`}></div>)}
              </div>
            </div>
            <div className="flex items-center justify-between px-4 pb-4 border-t border-gray-50 pt-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ background: tip.avatarBg }}>{tip.initials}</div>
                <span className="text-xs text-gray-400">{tip.author}</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-400">
                <span>♥</span><span>{tip.likes}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

    </main>
  )
}

const tips = [
  { cat:'Carpintería', catBg:'#EAF3DE', catTxt:'#27500A', icon:'🪵', iconBg:'#EAF3DE', imgH:130, title:'Nunca cortes contra la veta sin marcar primero', text:'Haz una línea con cutter antes de la sierra. Evitas el astillado y el corte queda limpio.', author:'Miguel A.', initials:'MA', avatarBg:'#639922', likes:347, diff:2 },
  { cat:'Soldadura', catBg:'#E6F1FB', catTxt:'#0C447C', icon:'🔥', iconBg:'#FFF0EB', imgH:140, title:'La técnica del ángulo de 15° para TIG en acero inox', text:'Mantén el electrodo a 15° del plano. Con argón al 100% logras un cordón espejo sin porosidad.', author:'Roberto C.', initials:'RC', avatarBg:'#185FA5', likes:512, diff:3 },
  { cat:'Finanzas', catBg:'#EEEDFE', catTxt:'#3C3489', icon:'📊', iconBg:'#EEEDFE', title:'Cobra el 30% de anticipo siempre, sin excepción', text:'No importa si es cliente conocido. El anticipo compromete y cubre materiales.', author:'Lucía M.', initials:'LM', avatarBg:'#7F77DD', likes:891, diff:1 },
  { cat:'Pintura', catBg:'#FAEEDA', catTxt:'#633806', icon:'🎨', iconBg:'#FAEEDA', imgH:110, title:'Imprimación en paredes con humedad: método del vinílico diluido', text:'3 partes de agua, 1 de vinílico blanco. Aplica con brocha y deja 24h.', author:'Andrés R.', initials:'AR', avatarBg:'#EF9F27', likes:203, diff:2 },
  { cat:'Rope Access', catBg:'#FAECE7', catTxt:'#712B13', icon:'🪢', iconBg:'#FAECE7', title:'Inspecciona tu cuerda por tramos, no toda junta', text:'Divide la cuerda en secciones de 1m. Una falla interna es casi invisible si la revisas rápido.', author:'Carlos V.', initials:'CV', avatarBg:'#D85A30', likes:678, diff:1 },
  { cat:'Electricidad', catBg:'#FBEAF0', catTxt:'#72243E', icon:'⚡', iconBg:'#FBEAF0', title:'Prueba de continuidad antes de cerrar cualquier instalación', text:'Nunca cierres una caja sin probar continuidad con el multímetro.', author:'Sofía T.', initials:'ST', avatarBg:'#D4537E', likes:429, diff:1 },
  { cat:'Plomería', catBg:'#E1F5EE', catTxt:'#085041', icon:'🔧', iconBg:'#E1F5EE', imgH:100, title:'Cinta teflón en 3 capas, siempre en sentido de la rosca', text:'Enróllala en sentido del cierre. 3 capas, tensa. Al revés se deshace al apretar.', author:'Héctor G.', initials:'HG', avatarBg:'#1D9E75', likes:764, diff:1 },
  { cat:'Carpintería', catBg:'#EAF3DE', catTxt:'#27500A', icon:'🔨', iconBg:'#EAF3DE', imgH:120, title:'Cómo nivelar una puerta que roza con el piso', text:'Usa papel carbón en la zona de roce. Marca exactamente dónde lija.', author:'Ernesto P.', initials:'EP', avatarBg:'#639922', likes:145, diff:2 },
]