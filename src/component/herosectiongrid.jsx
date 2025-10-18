import React from 'react'

const Herosectiongrid = () => {
  return (
    <div>
  <div class="grid grid-cols-[1fr_1.5fr] grid-rows-[1fr_2fr] gap-3 w-full ">
    
    <div class="row-span-2 bg-fuchsia-600 rounded-xl flex items-center justify-center text-white text-2xl font-bold">
      01
    </div>


    <div class="bg-purple-800 rounded-xl flex items-center justify-center text-fuchsia-300 text-2xl font-bold">
      02
    </div>

  
    <div class="bg-fuchsia-500 rounded-xl flex items-center justify-center text-white text-2xl font-bold">
      03
    </div>
  </div>
</div>

  )
}

export default Herosectiongrid