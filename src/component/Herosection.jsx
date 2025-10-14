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
    <section  className=" herosection" >
      <div className="flex flex-col items-center justify-center text-center bg-[#FEFDF8] pt-10 pb-10">
        <div className="max-w-[1000px]">
          {/* Heading */}
          <h1 className="fontforever  sm:text-[60px] md:text-[80px] lg:text-[60px] leading-tight font-semibold opacity-100 ">
            Building creative and impactful
            web solutions for <span className='text-[#8e827c]'>the modern world.</span>
          </h1>

          {/* Paragraph */}
          <p className="text-[16px] sm:text-[18px] md:text-[20px] text-[#333] pt-6 pb-6">
            I build digital experiences that combine creativity, technology, and
            purpose to make every website stand out.
          </p>

          {/* Button */}
          <button className="bg-[#24CDD7] text-black text-[16px] sm:text-[18px] px-6 py-3 rounded-[15px] hover:tracking-wider hover:text-white hover:bg-black transition-all duration-300">
            Download Me →
          </button>

          {/* Note */}
          <p className="text-[#888888] text-sm mt-3">Yes, that’s my resume</p>
        </div>
      </div>
    </section>
  );
}


export default Herosection;
