import React from 'react'

const Herosectiongrid = () => {
  return (
  <div>
 <div
      class="grid grid-cols-[1fr_1.2fr_1fr] grid-rows-2 gap-4 w-[90%] max-w-[1200px] h-[80vh]
             md:grid-cols-1 md:grid-rows-[repeat(4,200px)] md:h-auto"
    >
      <div
        class="row-span-2 bg-[#e600ff] rounded-xl flex items-center justify-center text-3xl font-bold transition-transform duration-300 hover:scale-105 hover:shadow-[0_0_15px_rgba(255,0,255,0.4)]"
      >
        01
      </div>

     
      <div
        class="bg-[#b300ff] rounded-xl flex items-center justify-center text-3xl font-bold transition-transform duration-300 hover:scale-105 hover:shadow-[0_0_15px_rgba(255,0,255,0.4)]"
      >
        02
      </div>


      <div
        class="bg-[#ff00aa] rounded-xl flex items-center justify-center text-3xl font-bold transition-transform duration-300 hover:scale-105 hover:shadow-[0_0_15px_rgba(255,0,255,0.4)]"
      >
        03
      </div>

   
      <div
        class="row-span-2 bg-[#ff00ff] rounded-xl flex items-center justify-center text-3xl font-bold transition-transform duration-300 hover:scale-105 hover:shadow-[0_0_15px_rgba(255,0,255,0.4)]"
      >
        04
      </div>
    </div>
  </div>
  )
}

export default Herosectiongrid