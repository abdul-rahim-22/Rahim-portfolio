import React from 'react'
// import Arrowimag from 'src/assets/down-arrow.png'

function Porcess() {
    return (
        <div className='flex  flex-col justify-center items-center'>
            <h1 className='text-[90px] font-extrabold'>
                ⚙️ Process <span className='text-[#8e827c] '>/ Workflow</span>
            </h1>
            {/* <img src={Arrowimag} className='w-15 h-15'></img> */}
            <p className="text-[20px] md:text-[24px] leading-relaxed text-gray-700 w-[400px] ">
                We create innovative and purposeful designs that not only capture attention but also drive meaningful results.
            </p>
            {/* <!-- Repeatable Section --> */}
            <div className=' text-black font-sans flex flex-col items-center min-h-screen py-10 space-y-6'>
                <div class="w-[90%] max-w-[1200px] border-2 border-black rounded-3xl p-10 flex flex-col md:flex-row items-start md:items-center gap-6 transition-transform duration-300 hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                    <h2 class="text-[90px] italic font-serif leading-none md:w-1/4">01</h2>
                    <div class="md:w-3/4 space-y-3">
                        <h3 class="text-3xl font-bold">🧠 Research & Planning</h3>
                        <p class="text-lg leading-relaxed text-black">
                            Every great website starts with understanding your goals, target audience, and brand identity.
                            I analyze your requirements, competitors, and user needs to create a clear project plan before touching the design.
                        </p>
                    </div>
                </div>


                <div class="w-[90%] max-w-[1200px] border-2 border-black  rounded-3xl p-10 flex flex-col md:flex-row items-start md:items-center gap-6 hover:scale-[1.02] transition-all duration-300">
                    <h2 class="text-[90px] italic font-serif leading-none md:w-1/4">02</h2>
                    <div class="md:w-3/4 space-y-3">
                        <h3 class="text-3xl font-bold">🎨 Design & Prototype</h3>
                        <p class="text-lg leading-relaxed text-black">
                            Using clean layouts and smart UX principles, I create a visual prototype that shows exactly how your website will look and feel — modern, responsive, and brand-aligned.
                        </p>
                    </div>
                </div>


                <div class="w-[90%] max-w-[1200px] border-2 border-black  rounded-3xl p-10 flex flex-col md:flex-row items-start md:items-center gap-6 hover:scale-[1.02] transition-all duration-300">
                    <h2 class="text-[90px] italic font-serif leading-none md:w-1/4">03</h2>
                    <div class="md:w-3/4 space-y-3">
                        <h3 class="text-3xl font-bold">💻 Development</h3>
                        <p class="text-lg leading-relaxed text-black">
                            Once the design is approved, I turn it into a fully functional website using WordPress, Elementor, or custom code.
                            Every line of code is clean, secure, and optimized for performance.
                        </p>
                    </div>
                </div>


                <div class="w-[90%] max-w-[1200px] border-2 border-black  rounded-3xl p-10 flex flex-col md:flex-row items-start md:items-center gap-6 hover:scale-[1.02] transition-all duration-300">
                    <h2 class="text-[90px] italic font-serif leading-none md:w-1/4">04</h2>
                    <div class="md:w-3/4 space-y-3">
                        <h3 class="text-3xl font-bold">🔍 Testing & Quality Assurance</h3>
                        <p class="text-lg leading-relaxed text-black">
                            Before launch, I test everything — responsiveness, speed, SEO, and browser compatibility — to ensure your website works perfectly on all devices.
                        </p>
                    </div>
                </div>


                <div class="w-[90%] max-w-[1200px] border-2 border-black  rounded-3xl p-10 flex flex-col md:flex-row items-start md:items-center gap-6 hover:scale-[1.02] transition-all duration-300">
                    <h2 class="text-[90px] italic font-serif leading-none md:w-1/4">05</h2>
                    <div class="md:w-3/4 space-y-3">
                        <h3 class="text-3xl font-bold">🚀 Launch & Optimization</h3>
                        <p class="text-lg leading-relaxed text-black">
                            After your final approval, the website goes live. I monitor its performance, apply speed optimizations, and make sure everything runs smoothly from day one.
                        </p>
                    </div>
                </div>
                <div class="w-[90%] max-w-[1200px] border-2 border-black  rounded-3xl p-10 flex flex-col md:flex-row items-start md:items-center gap-6 hover:scale-[1.02] transition-all duration-300">
                    <h2 class="text-[90px] italic font-serif leading-none md:w-1/4">06</h2>
                    <div class="md:w-3/4 space-y-3">
                        <h3 class="text-3xl font-bold">🔧  Maintenance & Support</h3>
                        <p class="text-lg leading-relaxed text-black">
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