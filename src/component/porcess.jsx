import React from 'react'
// import Arrowimag from 'src/assets/down-arrow.png'

function Porcess() {
    return (
       <div className="px-6 md:px-10 py-10 bg-white">
  {/* ========== HEADING ========== */}
  <h1 className="text-[45px] md:text-[90px] font-extrabold leading-tight">
    ⚙️ Process <span className="text-[#8e827c]">/ Workflow</span>
  </h1>

  {/* ========== DESCRIPTION ========== */}
  <p className="text-[18px] md:text-[24px] leading-relaxed text-gray-700 w-full md:w-[600px] mt-4">
    My work process is simple but structured — built to deliver quality, clarity, and results. 
    From understanding your goals to launching a fast, user-friendly website, every step is handled 
    with clear communication and attention to detail.
  </p>

  {/* ========== SUBTITLE ========== */}
  <h2 className="text-2xl md:text-4xl font-semibold text-gray-800 mb-6 pt-10">
    {"{ My Working Steps }"}
  </h2>

  {/* ========== WORKFLOW GRID ========== */}
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
    {/* STEP 1 */}
    <div className="bg-gray-100 rounded-2xl p-6 flex flex-col items-center justify-center text-center shadow-md">
      <div className="text-[40px] font-bold text-[#8e827c] mb-2">1</div>
      <h3 className="text-xl font-semibold mb-2">Research & Strategy</h3>
      <p className="text-gray-600 text-[16px]">
        Understand client needs, goals, and audience to build a strong foundation.
      </p>
    </div>

    {/* STEP 2 */}
    <div className="bg-gray-100 rounded-2xl p-6 flex flex-col items-center justify-center text-center shadow-md">
      <div className="text-[40px] font-bold text-[#8e827c] mb-2">2</div>
      <h3 className="text-xl font-semibold mb-2">Design Phase</h3>
      <p className="text-gray-600 text-[16px]">
        Create clean, modern, and responsive layouts aligned with your brand identity.
      </p>
    </div>

    {/* STEP 3 */}
    <div className="bg-gray-100 rounded-2xl p-6 flex flex-col items-center justify-center text-center shadow-md">
      <div className="text-[40px] font-bold text-[#8e827c] mb-2">3</div>
      <h3 className="text-xl font-semibold mb-2">Development</h3>
      <p className="text-gray-600 text-[16px]">
        Build fully functional websites with optimized performance and smooth interactivity.
      </p>
    </div>

    {/* STEP 4 */}
    <div className="bg-gray-100 rounded-2xl p-6 flex flex-col items-center justify-center text-center shadow-md md:col-span-2">
      <div className="text-[40px] font-bold text-[#8e827c] mb-2">4</div>
      <h3 className="text-xl font-semibold mb-2">Testing & Feedback</h3>
      <p className="text-gray-600 text-[16px]">
        Test across all devices and browsers; make adjustments based on client feedback.
      </p>
    </div>

    {/* STEP 5 */}
    <div className="bg-gray-100 rounded-2xl p-6 flex flex-col items-center justify-center text-center shadow-md">
      <div className="text-[40px] font-bold text-[#8e827c] mb-2">5</div>
      <h3 className="text-xl font-semibold mb-2">Launch & Support</h3>
      <p className="text-gray-600 text-[16px]">
        Launch the project and provide ongoing updates and maintenance if needed.
      </p>
    </div>
  </div>
</div>

    )
}

export default Porcess