import React from 'react'
import LocalTime from './component/localtime.jsx'

function Footer() {
  return (
   <div className="bg-black flex flex-col md:flex-row items-center justify-between gap-3 md:gap-0 text-center md:text-left py-5 px-6 md:px-10">
  <h1 className="text-white text-sm md:text-base">
    © 2025 Abdul Rahim. All Rights Reserved.
  </h1>
  <h1 className="text-white text-sm md:text-base">
   <span><LocalTimeWithCountry/></span> Follow us on LinkedIn | Instagram |
  </h1>
</div>
  )
}

export default Footer