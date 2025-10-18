import React from 'react'

const Herosectiongrid = () => {
  return (
    <div
      class="grid grid-cols-[1fr_1.2fr_1fr] grid-rows-2 gap-4 w-[90%] max-w-[1200px] h-[80vh]"
    >
      {/* <!-- Left Full Height --> */}
      <div
        class="row-span-2 bg-fuchsia-600 rounded-xl flex items-center justify-center text-white text-3xl font-bold hover:scale-105 hover:shadow-[0_0_15px_rgba(255,0,255,0.4)] transition-transform duration-300"
      >
        01
      </div>
{/* 
      <!-- Top Middle --> */}
      <div
        class="bg-purple-700 rounded-xl flex items-center justify-center text-white text-3xl font-bold hover:scale-105 hover:shadow-[0_0_15px_rgba(255,0,255,0.4)] transition-transform duration-300"
      >
        02
      </div>
{/* 
      <!-- Bottom Middle --> */}
      <div
        class="bg-pink-600 rounded-xl flex items-center justify-center text-white text-3xl font-bold hover:scale-105 hover:shadow-[0_0_15px_rgba(255,0,255,0.4)] transition-transform duration-300"
      >
        03
      </div>

      {/* <!-- Right Full Height --> */}
      <div
        class="row-span-2 bg-fuchsia-400 rounded-xl flex items-center justify-center text-white text-3xl font-bold hover:scale-105 hover:shadow-[0_0_15px_rgba(255,0,255,0.4)] transition-transform duration-300"
      >
        04
      </div>
    </div>

  )
}

export default Herosectiongrid