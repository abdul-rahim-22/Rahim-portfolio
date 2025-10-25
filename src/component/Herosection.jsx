// import { useGSAP } from "@gsap/react";
// import gsap from "gsap"
// import { ScrollTrigger } from "gsap/ScrollTrigger";



// // gsap.registerPlugin(ScrollTrigger);

// function Herosection() {

//   return (
//     <div className="h-80  flex flex-col items-center justify-center text-center  pt-40 pb-20  bg-[#FEFDF8]" >
//         <div className="max-w-[1000px]">
//       <h1 className="text-[100px]  leading-tight  fontforever  ">
//         We drive growth to <br/>
//         your business
//       </h1>
//       <p className="text-[20px] pt-4 pb-4 " >With award-winning branding expertise and a passion for cutting-edge design tools like Figma, I create compelling digital experiences tailored to your needs.</p>
//       <button className="bg-[#00f7ff] text-black pt-3 pb-3 pl-5 pr-5 rounded-[15px] hover:tracking-wider transition-all duration-300 "> Download Me → </button>
//       <p className="text-[#888888]   ">Yes, that’s my resume</p>
//     </div>
//     </div>
//   )
// }

// export default Herosection

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { section } from "motion/react-client";
import SplitType from "split-type";

function Herosection() {
  // useGSAP(() => {
  //   const split = new SplitType(".fontforever", { types: "chars" });

  //   gsap.from(split.chars, {
  //     y: 20,
  //     opacity: 0,
  //     stagger: 0.05,
  //     ease: "power2.out",
  //     duration: 1,
  //   });

  //   return () => {
  //     split.revert(); // cleanup
  //   };
  // }, []);

  return (
    <section>
      <div   id="home"  className="flex flex-col items-center paddinfdiv justify-center lg:text-center sm:text-left bg-[#ffffff] pt-10 pb-10">
        <div className="max-w-[1000px]">
         {/* ====== HEADING ====== */}
  <h1 className="  text-[32px] sm:text-[48px] md:text-[60px] lg:text-[50px] xl:text-[50px] leading-tight font-semibold text-black opacity-100 max-w-[1000px]">
    Building creative and impactful
    <br className="hidden sm:block" />
    web solutions for{" "}
    <span className="text-[#8e827c]">the modern world.</span>
  </h1>

  {/* ====== PARAGRAPH ====== */}
  <p className="text-[15px] sm:text-[17px] md:text-[18px] lg:text-[20px] lg:text-center sm:text-left  text-[#333] pt-6 pb-8 max-w-[800px]">
    I build digital experiences that combine creativity, technology, and
    purpose to make every website stand out.
  </p>
<a
            className="bg-[#24CDD7] text-black text-[15px] sm:text-[17px] md:text-[18px] px-6 sm:px-8 py-3 rounded-[15px] hover:tracking-wider hover:text-white hover:bg-black transition-all duration-300"
            href="https://calendly.com/abdul-rahim-developer/30min"
            target="_blank"
            rel="noreferrer"
          >
           Book A Free Strategy Call →
          </a>
  {/* ====== BUTTON ====== */}
  {/* <button className="bg-[#24CDD7] text-black text-[15px] sm:text-[17px] md:text-[18px] px-6 sm:px-8 py-3 rounded-[15px] hover:tracking-wider hover:text-white hover:bg-black transition-all duration-300">
    Book A Free Strategy Call →
  </button> */}
          {/* Note */}
          <p className="text-[#888888] text-sm mt-3">Lets Convert your idea in to reality</p>
        </div>
        
      </div>
    </section>
  );
}


export default Herosection;
