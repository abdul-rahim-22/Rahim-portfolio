import React from 'react'
// import Arrowimag from 'src/assets/down-arrow.png'

function Porcess() {
    return (
       <div className="flex flex-col justify-center items-center px-4 md:px-0">
  {/* ===== HEADING ===== */}
  <h1 className="text-[40px] sm:text-[60px] md:text-[90px] font-extrabold text-center md:text-left leading-tight">
    ⚙️ Process <span className="text-[#8e827c]">/ Workflow</span>
  </h1>

  {/* ===== DESCRIPTION ===== */}
  <p className="text-[16px] sm:text-[20px] md:text-[24px] leading-relaxed text-gray-700 w-full sm:w-[500px] md:w-[600px] text-center md:text-left mt-3">
    My work process is simple but structured — built to deliver quality, clarity, and results.
    From understanding your goals to launching a fast, user-friendly website,
    every step is handled with clear communication and attention to detail.
  </p>

  {/* ===== SUB HEADING ===== */}
  <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-gray-800 mb-6 pt-6 md:pt-10">
    {"{ My Working Steps }"}
  </h2>

  {/* ===== MAIN CONTAINER ===== */}
  <div className="text-black font-sans flex flex-col items-center py-10 space-y-6 w-full">
    
    {/* ===== STEP 01 ===== */}
    <div className="w-[95%] max-w-[1200px] border-2 border-black rounded-3xl p-4 sm:p-6 md:p-10 flex flex-col md:flex-row items-start gap-6 transition-transform duration-300 hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(0,0,0,0.2)]">
      <h2 className="text-[50px] sm:text-[70px] md:text-[90px] italic font-serif leading-none md:w-1/4 text-center md:text-left">
        01
      </h2>
      <div className="md:w-3/4 space-y-3 text-center md:text-left">
        <h3 className="text-xl sm:text-2xl md:text-3xl font-bold">🧠 Research & Planning</h3>
        <p className="text-sm sm:text-base md:text-lg leading-relaxed text-black">
          Every great website starts with understanding your goals, target audience, and brand identity.
          I analyze your requirements, competitors, and user needs to create a clear project plan before touching the design.
        </p>
      </div>
    </div>

    {/* ===== STEP 02 ===== */}
    <div className="w-[95%] max-w-[1200px] border-2 border-black rounded-3xl p-4 sm:p-6 md:p-10 flex flex-col md:flex-row items-start gap-6 transition-transform duration-300 hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(0,0,0,0.2)]">
      <h2 className="text-[50px] sm:text-[70px] md:text-[90px] italic font-serif leading-none md:w-1/4 text-center md:text-left">
        02
      </h2>
      <div className="md:w-3/4 space-y-3 text-center md:text-left">
        <h3 className="text-xl sm:text-2xl md:text-3xl font-bold">🎨 Design & Prototype</h3>
        <p className="text-sm sm:text-base md:text-lg leading-relaxed text-black">
          Using clean layouts and smart UX principles, I create a visual prototype that shows exactly how your website will look and feel — modern, responsive, and brand-aligned.
        </p>
      </div>
    </div>

    {/* ===== STEP 03 ===== */}
    <div className="w-[95%] max-w-[1200px] border-2 border-black rounded-3xl p-4 sm:p-6 md:p-10 flex flex-col md:flex-row items-start gap-6 transition-transform duration-300 hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(0,0,0,0.2)]">
      <h2 className="text-[50px] sm:text-[70px] md:text-[90px] italic font-serif leading-none md:w-1/4 text-center md:text-left">
        03
      </h2>
      <div className="md:w-3/4 space-y-3 text-center md:text-left">
        <h3 className="text-xl sm:text-2xl md:text-3xl font-bold">💻 Development</h3>
        <p className="text-sm sm:text-base md:text-lg leading-relaxed text-black">
          Once the design is approved, I turn it into a fully functional website using WordPress, Elementor, or custom code.
          Every line of code is clean, secure, and optimized for performance.
        </p>
      </div>
    </div>

    {/* ===== STEP 04 ===== */}
    <div className="w-[95%] max-w-[1200px] border-2 border-black rounded-3xl p-4 sm:p-6 md:p-10 flex flex-col md:flex-row items-start gap-6 transition-transform duration-300 hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(0,0,0,0.2)]">
      <h2 className="text-[50px] sm:text-[70px] md:text-[90px] italic font-serif leading-none md:w-1/4 text-center md:text-left">
        04
      </h2>
      <div className="md:w-3/4 space-y-3 text-center md:text-left">
        <h3 className="text-xl sm:text-2xl md:text-3xl font-bold">🔍 Testing & Quality Assurance</h3>
        <p className="text-sm sm:text-base md:text-lg leading-relaxed text-black">
          Before launch, I test everything — responsiveness, speed, SEO, and browser compatibility — to ensure your website works perfectly on all devices.
        </p>
      </div>
    </div>

    {/* ===== STEP 05 ===== */}
    <div className="w-[95%] max-w-[1200px] border-2 border-black rounded-3xl p-4 sm:p-6 md:p-10 flex flex-col md:flex-row items-start gap-6 transition-transform duration-300 hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(0,0,0,0.2)]">
      <h2 className="text-[50px] sm:text-[70px] md:text-[90px] italic font-serif leading-none md:w-1/4 text-center md:text-left">
        05
      </h2>
      <div className="md:w-3/4 space-y-3 text-center md:text-left">
        <h3 className="text-xl sm:text-2xl md:text-3xl font-bold">🚀 Launch & Optimization</h3>
        <p className="text-sm sm:text-base md:text-lg leading-relaxed text-black">
          After your final approval, the website goes live. I monitor its performance, apply speed optimizations,
          and make sure everything runs smoothly from day one.
        </p>
      </div>
    </div>

    {/* ===== STEP 06 ===== */}
    <div className="w-[95%] max-w-[1200px] border-2 border-black rounded-3xl p-4 sm:p-6 md:p-10 flex flex-col md:flex-row items-start gap-6 transition-transform duration-300 hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(0,0,0,0.2)]">
      <h2 className="text-[50px] sm:text-[70px] md:text-[90px] italic font-serif leading-none md:w-1/4 text-center md:text-left">
        06
      </h2>
      <div className="md:w-3/4 space-y-3 text-center md:text-left">
        <h3 className="text-xl sm:text-2xl md:text-3xl font-bold">🔧 Maintenance & Support</h3>
        <p className="text-sm sm:text-base md:text-lg leading-relaxed text-black">
          I don’t just disappear after launch.
          I offer ongoing updates, fixes, and technical support to keep your website secure, fast, and up-to-date.
        </p>
      </div>
    </div>
  </div>
</div>

    )
}

export default Porcess