import React from 'react'
import LocalTime from './localtime'

function Footer() {
  return (
   <div className="bg-black flex flex-col md:flex-row items-center justify-between gap-3 md:gap-0 text-center md:text-left py-5 px-6 md:px-10">
  <h1 className="text-white text-[16px] md:text-base">
    © 2025 Abdul Rahim. All Rights Reserved.
  </h1>
  
  <h1 className="text-white text-[16px] md:text-base flex items-center gap-2">
    <span className="inline-flex"><LocalTime /></span> 
    <span>Follow us on</span>
    <a 
      href="https://www.linkedin.com/in/abdul-raheem-webdeveloper/" 
      target="_blank" 
      rel="noopener noreferrer" 
      className="text-[#0A66C2] hover:underline"
    >
      LinkedIn
    </a>
    <span>|</span>
    <a 
      href="#" 
      className="text-[#E1306C] hover:underline"
    >
      Instagram
    </a>
  </h1>
</div>
  )
}

export default Footer