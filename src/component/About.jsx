
// function About() {
//   return (
//     <div className=" w-1000 h-auto flex flex-col items-center justify-center text-center  pt-20 pb-20 bg-[#FEFDF8] border-t-2 border-b-1 " >
//         <div className="max-w-[1000px]">
//         {/* <div className="">
//           <img src="src/assets/WhatsApp Image 2025-10-07 at 19.48.58.jpeg" className="rounded-[15px]"></img>
//         </div>  */}
//       <h2>{"{About us}"}</h2>
// <p className="text-[50px] ">
//    "I’m Abdul Rahim, and I design experiences that people love to use.
//   I focus on making digital products that feel intuitive and easy, while also Solving real problems. My goal is to create clean, thoughtful designs that make a difference for both users and businesses!"
// </p>
//       {/* <p className="text-[20px] pt-4 pb-4 text-[#ffffff]">With award-winning branding expertise and a passion for cutting-edge design tools like Figma, I create compelling digital experiences tailored to your needs.</p> */}
//     </div>
//     </div>
//   ) 
// }

// export default About

import ScrambledText from './aboutustext';





function About() {
  return (
    <section className="w-full flex flex-col items-center justify-center text-center py-20 bg-[#FEFDF8] border-t-2 border-b border-gray-200">
      <div className="max-w-[900px] px-6">
        <h2 className="text-3xl md:text-4xl font-semibold text-gray-800 mb-6">
          {"{ About Me }"}
          
        </h2>

        <p className=" not-last:sm:text-[17px] md:text-[18px] lg:text-[30px] leading-relaxed text-gray-700">
  I’m Abdul Rahim and I design experiences that people love to use. I focus on making digital
  products that feel intuitive and easy, while also solving real problems. My
  goal is to create clean, thoughtful designs that make a difference for both
  users and businesses.
</p>


        {/* Optional Image Section */}
        {/* <div className="mt-10">
          <img
            src="src/assets/WhatsApp Image 2025-10-07 at 19.48.58.jpeg"
            alt="Abdul Rahim"
            className="rounded-2xl shadow-lg w-full max-w-[400px] mx-auto"
          />
        </div> */}
      </div>

    </section>
  );
}

export default About;
