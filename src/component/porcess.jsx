import React from 'react'
// import Arrowimag from 'src/assets/down-arrow.png'

function Porcess() {
    return (
        <div className='flex  flex-col justify-center items-center'>
            <h1 className='text-[90px] font-extrabold'>
                Featured <span className='text-[#8e827c] '>work</span>
            </h1>
            {/* <img src={Arrowimag} className='w-15 h-15'></img> */}
            <p className="text-[20px] md:text-[24px] leading-relaxed text-gray-700 w-[400px] ">
                We create innovative and purposeful designs that not only capture attention but also drive meaningful results.
            </p>
             {/* <!-- Repeatable Section --> */}
<div className=  ' text-black font-sans flex flex-col items-center min-h-screen py-10 space-y-6'>
    <div class="w-[90%] max-w-[1200px] border-2 border-white rounded-3xl p-10 flex flex-col md:flex-row items-start md:items-center gap-6 transition-transform duration-300 hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(255,255,255,0.2)]">
      <h2 class="text-[90px] italic font-serif leading-none md:w-1/4">01</h2>
      <div class="md:w-3/4 space-y-3">
        <h3 class="text-3xl font-bold">Sweet Spot</h3>
        <p class="text-lg leading-relaxed text-gray-200">
          Meine Kunden haben eine klare Vision: Sie wollen das Leben ihrer Zielgruppe spürbar verbessern. 
          Durch innovative, hochwertige und oft höherpreisige Leistungen setzen sie sich von der Konkurrenz ab. 
          Häufig sind es kleine und mittelständische Unternehmen, Startups oder Familienbetriebe mit einer langfristigen Ausrichtung.
          Gemeinsam verwandeln wir ihre Strategie in starke Marken und Erlebnisse, die Kunden begeistern und Talente anziehen.
        </p>
      </div>
    </div>

    
    <div class="w-[90%] max-w-[1200px] border-2 border-white rounded-3xl p-10 flex flex-col md:flex-row items-start md:items-center gap-6 hover:scale-[1.02] transition-all duration-300">
      <h2 class="text-[90px] italic font-serif leading-none md:w-1/4">02</h2>
      <div class="md:w-3/4 space-y-3">
        <h3 class="text-3xl font-bold">Meine Rolle</h3>
        <p class="text-lg leading-relaxed text-gray-200">
          Wer mit mir arbeitet, ist bereit für Veränderung – sei es ein neues Business, Wachstum, Expansion oder der Einstieg in neue Märkte.
          Ich begleite dabei mit Expertise in Markenstrategie, Branding, Design, UX & UI und Kommunikation.
        </p>
      </div>
    </div>


    <div class="w-[90%] max-w-[1200px] border-2 border-white rounded-3xl p-10 flex flex-col md:flex-row items-start md:items-center gap-6 hover:scale-[1.02] transition-all duration-300">
      <h2 class="text-[90px] italic font-serif leading-none md:w-1/4">03</h2>
      <div class="md:w-3/4 space-y-3">
        <h3 class="text-3xl font-bold">Strategie & Wachstum</h3>
        <p class="text-lg leading-relaxed text-gray-200">
          Ich helfe Marken, ihren Fokus zu schärfen, damit sie klar, authentisch und langfristig wachsen können.
          Gemeinsam schaffen wir Strukturen, Strategien und Designs, die Wirkung zeigen.
        </p>
      </div>
    </div>

  
    <div class="w-[90%] max-w-[1200px] border-2 border-white rounded-3xl p-10 flex flex-col md:flex-row items-start md:items-center gap-6 hover:scale-[1.02] transition-all duration-300">
      <h2 class="text-[90px] italic font-serif leading-none md:w-1/4">04</h2>
      <div class="md:w-3/4 space-y-3">
        <h3 class="text-3xl font-bold">Design Fokus</h3>
        <p class="text-lg leading-relaxed text-gray-200">
          Vom Logo bis zum digitalen Auftritt – gutes Design schafft Vertrauen und Klarheit.
          Ich entwickle Lösungen, die nicht nur ästhetisch sind, sondern strategisch funktionieren.
        </p>
      </div>
    </div>


    <div class="w-[90%] max-w-[1200px] border-2 border-white rounded-3xl p-10 flex flex-col md:flex-row items-start md:items-center gap-6 hover:scale-[1.02] transition-all duration-300">
      <h2 class="text-[90px] italic font-serif leading-none md:w-1/4">05</h2>
      <div class="md:w-3/4 space-y-3">
        <h3 class="text-3xl font-bold">Zukunft & Vision</h3>
        <p class="text-lg leading-relaxed text-gray-200">
          Zukunft bedeutet Anpassung und Weiterentwicklung. 
          Ich begleite Marken auf dem Weg, ihre Werte in moderne, nachhaltige und digitale Strategien zu übersetzen.
        </p>
      </div>
    </div>
    </div>
        </div>
    )
}

export default Porcess