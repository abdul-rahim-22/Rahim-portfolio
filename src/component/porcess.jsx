// import React from 'react'
// import gsap from 'gsap'
// import { useGSAP } from '@gsap/react'
// import { ScrollTrigger } from "gsap/ScrollTrigger";
// gsap.registerPlugin(ScrollTrigger);


// function Porcess() {
// useGSAP(() => {
//   gsap.utils.toArray(".processnum1").forEach((box) => {
//     gsap.from(box, { 
//       scale: 0.8,
//       scrollTrigger: { 
//         trigger: box,
//         start: "top 80%",
//         scrub: true,
//       },
//     });
//   });
// });

//     return (
//         <div className='flex  flex-col justify-center items-center'>
//             <h1 className='text-[90px] font-extrabold'>
//                 😃 Process <span className='text-[#8e827c] '>/ Workflow</span>
//             </h1>
//             <img src='https://cdn-icons-png.flaticon.com/512/8841/8841304.png' className='w-15 h-15'></img>
//             <p className="text-[20px] md:text-[24px] leading-relaxed text-gray-700 w-[900px]">
//                 My work process is simple but structured — built to deliver quality, clarity, and results. From understanding your goals to launching a fast, user-friendly website, every step is handled with clear communication and attention to detail.
//             </p>
//             <h2 className="text-3xl md:text-4xl font-semibold text-gray-800 mb-6 pt-10"> 
//           {"{ My Working Steps }"}
          
//         </h2>
//             {/* <!-- Process Section --> */}
// <div className="text-black font-sans flex flex-col items-center py-10 space-y-6">

//   {/* 01 */}
//   <div className="processnum1  scale-[0.7] w-[90%] max-w-[1200px] border-2 border-black rounded-3xl p-6 md:p-10 flex flex-col md:flex-row items-start gap-6 transition-transform duration-300 hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(0,0,0,0.2)]">
//     <h2 className="text-[60px] sm:text-[80px] md:text-[90px] italic font-serif leading-none md:w-1/4 text-center md:text-left">01</h2>
//     <div className="md:w-3/4 space-y-3 text-left">
//       <h3 className="text-2xl sm:text-3xl font-bold">🧠 Research & Planning</h3>
//       <p className="text-base sm:text-lg leading-relaxed text-black">
//         Every great website starts with understanding your goals, target audience, and brand identity.
//         I analyze your requirements, competitors, and user needs to create a clear project plan before touching the design.
//       </p>
//     </div>
//   </div>

//   {/* 02 */}
//   <div className="processnum1  scale-[0.7] w-[90%] max-w-[1200px] border-2 border-black rounded-3xl p-6 md:p-10 flex flex-col md:flex-row items-start gap-6 transition-transform duration-300 hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(0,0,0,0.2)]">
//     <h2 className="text-[60px] sm:text-[80px] md:text-[90px] italic font-serif leading-none md:w-1/4 text-center md:text-left">02</h2>
//     <div className="md:w-3/4 space-y-3 text-left">
//       <h3 className="text-2xl sm:text-3xl font-bold">🎨 Design & Prototype</h3>
//       <p className="text-base sm:text-lg leading-relaxed text-black">
//         Using clean layouts and smart UX principles, I create a visual prototype that shows exactly how your website will look and feel — modern, responsive, and brand-aligned.
//       </p>
//     </div>
//   </div>

//   {/* 03 */}
//   <div className=" processnum1 scale-[0.7]  w-[90%] max-w-[1200px] border-2 border-black rounded-3xl p-6 md:p-10 flex flex-col md:flex-row items-start gap-6 transition-transform duration-300 hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(0,0,0,0.2)]">
//     <h2 className="text-[60px] sm:text-[80px] md:text-[90px] italic font-serif leading-none md:w-1/4 text-center md:text-left">03</h2>
//     <div className="md:w-3/4 space-y-3 text-left">
//       <h3 className="text-2xl sm:text-3xl font-bold">💻 Development</h3>
//       <p className="text-base sm:text-lg leading-relaxed text-black">
//         Once the design is approved, I turn it into a fully functional website using WordPress, Elementor, or custom code.
//         Every line of code is clean, secure, and optimized for performance.
//       </p>
//     </div>
//   </div>

//   {/* 04 */}
//   <div className="processnum1 scale-[0.7]  w-[90%] max-w-[1200px] border-2 border-black rounded-3xl p-6 md:p-10 flex flex-col md:flex-row items-start gap-6 transition-transform duration-300 hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(0,0,0,0.2)]">
//     <h2 className="text-[60px] sm:text-[80px] md:text-[90px] italic font-serif leading-none md:w-1/4 text-center md:text-left">04</h2>
//     <div className="md:w-3/4 space-y-3 text-left">
//       <h3 className="text-2xl sm:text-3xl font-bold">🔍 Testing & Quality Assurance</h3>
//       <p className="text-base sm:text-lg leading-relaxed text-black">
//         Before launch, I test everything — responsiveness, speed, SEO, and browser compatibility — to ensure your website works perfectly on all devices.
//       </p>
//     </div>
//   </div>

//   {/* 05 */}
//   <div className="processnum1 scale-[0.7] w-[90%] max-w-[1200px] border-2 border-black rounded-3xl p-6 md:p-10 flex flex-col md:flex-row items-start gap-6 transition-transform duration-300 hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(0,0,0,0.2)]">
//     <h2 className="text-[60px] sm:text-[80px] md:text-[90px] italic font-serif leading-none md:w-1/4 text-center md:text-left">05</h2>
//     <div className="md:w-3/4 space-y-3 text-left">
//       <h3 className="text-2xl sm:text-3xl font-bold">🚀 Launch & Optimization</h3>
//       <p className="text-base sm:text-lg leading-relaxed text-black">
//         After your final approval, the website goes live. I monitor its performance, apply speed optimizations, and make sure everything runs smoothly from day one.
//       </p>
//     </div>
//   </div>

//   {/* 06 */}
//   <div className="processnum1 scale-[0.7] w-[90%] max-w-[1200px] border-2 border-black rounded-3xl p-6 md:p-10 flex flex-col md:flex-row items-start gap-6 transition-transform duration-300 hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(0,0,0,0.2)]">
//     <h2 className="text-[60px] sm:text-[80px] md:text-[90px] italic font-serif leading-none md:w-1/4 text-center md:text-left">06</h2>
//     <div className="md:w-3/4 space-y-3 text-left">
//       <h3 className="text-2xl sm:text-3xl font-bold">🔧 Maintenance & Support</h3>
//       <p className="text-base sm:text-lg leading-relaxed text-black">
//         I don’t just disappear after launch.
//         I offer ongoing updates, fixes, and technical support to keep your website secure, fast, and up-to-date.
//       </p>
//     </div>
//   </div>
// </div>
//         </div>
//     )
// }

// export default Porcess



import React from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);

function Process() {
   useGSAP(() => {
    // Pin the entire process section
    ScrollTrigger.create({
      trigger: ".process-section",
      start: "top top",
      end: "+=4000",
      pin: true,
      scrub: 1, // keeps scroll synced smoothly
    });

    // Animate each box with smooth scaling
    gsap.utils.toArray(".processnum1").forEach((box) => {
      gsap.fromTo(
        box,
        { scale: 0.7, opacity: 0.4 },
        {
          scale: 1,
          opacity: 1,
          ease: "power3.out", // smoother easing
          scrollTrigger: {
            trigger: box,
            start: "top 85%",
            end: "top 30%",
            scrub: 1.5, // smooth scrub motion
          },
        }
      );
    });
  });

  return (
    <div className=" flex flex-col justify-center items-center bg-white">
      <h1 className="text-[70px] md:text-[90px] font-extrabold text-center">
        😃 Process <span className="text-[#8e827c]">/ Workflow</span>
      </h1>
      <img
        src="https://cdn-icons-png.flaticon.com/512/8841/8841304.png"
        className="w-14 h-14 mb-4"
        alt="Process Icon"
      />
      <p className="text-[18px] md:text-[22px] leading-relaxed text-gray-700 max-w-[900px] text-center">
        My work process is simple but structured — built to deliver quality,
        clarity, and results. From understanding your goals to launching a fast,
        user-friendly website, every step is handled with clear communication
        and attention to detail.
      </p>

      <h2 className=" process-section text-3xl md:text-4xl font-semibold text-gray-800 mb-8 pt-10 text-center">
        {"{ My Working Steps }"}
      </h2>

      {/* Process Cards */}
      <div className="text-black font-sans flex flex-col items-center py-10 space-y-6 w-full">
        {[
          {
            num: "01",
            title: "🧠 Research & Planning",
            desc: "Every great website starts with understanding your goals, target audience, and brand identity. I analyze your requirements, competitors, and user needs to create a clear project plan before touching the design.",
          },
          {
            num: "02",
            title: "🎨 Design & Prototype",
            desc: "Using clean layouts and smart UX principles, I create a visual prototype that shows exactly how your website will look and feel — modern, responsive, and brand-aligned.",
          },
          {
            num: "03",
            title: "💻 Development",
            desc: "Once the design is approved, I turn it into a fully functional website using WordPress, Elementor, or custom code. Every line of code is clean, secure, and optimized for performance.",
          },
          {
            num: "04",
            title: "🔍 Testing & Quality Assurance",
            desc: "Before launch, I test everything — responsiveness, speed, SEO, and browser compatibility — to ensure your website works perfectly on all devices.",
          },
          {
            num: "05",
            title: "🚀 Launch & Optimization",
            desc: "After your final approval, the website goes live. I monitor its performance, apply speed optimizations, and make sure everything runs smoothly from day one.",
          },
          {
            num: "06",
            title: "🔧 Maintenance & Support",
            desc: "I don’t just disappear after launch. I offer ongoing updates, fixes, and technical support to keep your website secure, fast, and up-to-date.",
          },
        ].map((step, index) => (
          <div
            key={index}
            className="processnum1 scale-[0.7] opacity-60 w-[90%] max-w-[1200px] border-2 border-black rounded-3xl p-6 md:p-10 flex flex-col md:flex-row items-start gap-6 transition-transform duration-300 hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(0,0,0,0.2)] bg-white"
          >
            <h2 className="text-[60px] sm:text-[80px] md:text-[90px] italic font-serif leading-none md:w-1/4 text-center md:text-left">
              {step.num}
            </h2>
            <div className="md:w-3/4 space-y-3 text-left">
              <h3 className="text-2xl sm:text-3xl font-bold">{step.title}</h3>
              <p className="text-base sm:text-lg leading-relaxed text-black">
                {step.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Process;
