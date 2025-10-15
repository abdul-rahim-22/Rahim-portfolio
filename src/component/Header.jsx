
import  LocalTimeWithCountry from './localtime'

const Header = () => {

  return (
    <div className="w-full sticky top-0 z-10 bg-[#fefdf800] pt-2">
      <div className="max-w-[1200px] mx-auto flex justify-center items-center px-4">
        <div
          id="myBox" className="flex flex-wrap md:flex-nowrap justify-center items-center gap-4 md:gap-10 
          text-sm md:text-lg font-medium py-2 bg-[#000000] rounded-[25px]
          border  px-5 md:px-10 "
        >
          {/* Logo */}
          <h1 className="text-[22px] md:text-[30px] text-white hover:tracking-wider transition-all duration-300 name-btn">
           <span><img src='src/assets/Untitled design (2).png'></img></span> Abdul.R
          </h1>

          {/* Navigation Links */}
          <div className="flex flex-wrap justify-center gap-4 md:gap-8">
            <h4 className="cursor-pointer text-white hover:tracking-wider transition-all duration-300">
              Home
            </h4>
            <h4 className="cursor-pointer text-white hover:tracking-wider transition-all duration-300">
              About
            </h4>
            <h4 className="cursor-pointer text-white hover:tracking-wider transition-all duration-300">
              Work
            </h4>
            <h4 className="cursor-pointer text-white hover:tracking-wider transition-all duration-300">
              Contact
            </h4>
              <LocalTimeWithCountry/>
          </div>
          {/* Hire Me Button */}
          <a  className="bg-[white] text-black px-4 md:px-5 py-1 rounded-[15px] hover:bg-white text-[16px] md:text-[20px] hover:text-black hover:tracking-wider transition-all duration-300 hire-btn"  href="https://wa.me/03164949427" target="click">Hire Me</a>
          {/* // <button className="bg-[white] text-black px-4 md:px-5 py-1 rounded-[15px] hover:bg-white text-[16px] md:text-[20px] hover:text-black hover:tracking-wider transition-all duration-300 hire-btn " >
          //   Hire Me
          // </button>   */}
        </div>
      </div>
    </div>
  );
};

export default Header;



// const Header = () => {


//   return (
//     <div className="w-full sticky top-0 z-10 bg-[#fefdf800] pt-2">
//       <div className="max-w-[1200px] mx-auto flex justify-center items-center px-4">
//         <div
//           id="myBox"
//           className="flex flex-wrap md:flex-nowrap justify-center items-center gap-4 md:gap-10 
//           text-sm md:text-lg font-medium py-2 bg-[#000000] rounded-[15px] backdrop-blur-sm
//           border px-5 md:px-10 transition-all duration-300"
//         >
//           {/* Logo */}
//           <h1 className="text-[22px] md:text-[30px] text-white hover:tracking-wider transition-all duration-300">
//             Abdul.R
//           </h1>

//           {/* Navigation Links */}
//           <div className="flex flex-wrap justify-center gap-4 md:gap-8">
//             <h4 className="cursor-pointer text-white hover:tracking-wider transition-all duration-300">
//               Home
//             </h4>
//             <h4 className="cursor-pointer text-white hover:tracking-wider transition-all duration-300">
//               About
//             </h4>
//             <h4 className="cursor-pointer text-white hover:tracking-wider transition-all duration-300">
//               Work
//             </h4>
//             <h4 className="cursor-pointer text-white hover:tracking-wider transition-all duration-300">
//               Contact
//             </h4>
//           </div>

//           {/* Hire Me Button */}
//           <button className="bg-[#00f7ff] text-black px-4 md:px-5 py-1 rounded-[15px] hover:bg-white text-[16px] md:text-[20px] hover:text-black hover:tracking-wider transition-all duration-300">
//             Hire Me
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Header;

