
// import  LocalTimeWithCountry from './localtime'

// const Header = () => {

//   return (
//     <div className="w-full sticky top-0 z-10 bg-[#fefdf800] pt-2">
//       <div className="max-w-[1200px] mx-auto flex justify-center items-center px-4">
//         <div
//           id="myBox" className="flex flex-wrap md:flex-nowrap justify-center items-center gap-4 md:gap-10 
//           text-sm md:text-lg font-medium py-2 bg-[#000000] rounded-[25px]
//           border  px-5 md:px-10 "
//         >
//           {/* Logo */}
//           <h1 className="text-[22px] md:text-[30px] text-white hover:tracking-wider transition-all duration-300 name-btn">
//            Abdul.R
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
//               <LocalTimeWithCountry/>
//           </div>
//           {/* Hire Me Button */}
//           <a  className="bg-[white] text-black px-4 md:px-5 py-1 rounded-[15px] hover:bg-white text-[16px] md:text-[20px] hover:text-black hover:tracking-wider transition-all duration-300 hire-btn"  href="https://wa.me/03164949427" target="click">Hire Me</a>
//           {/* // <button className="bg-[white] text-black px-4 md:px-5 py-1 rounded-[15px] hover:bg-white text-[16px] md:text-[20px] hover:text-black hover:tracking-wider transition-all duration-300 hire-btn " >
//           //   Hire Me
//           // </button>   */}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Header;



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






import { useState } from "react";
import LocalTimeWithCountry from "./localtime";

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="w-full sticky top-0 z-20 bg-[#fefdf800] pt-2">
      <div className="max-w-[1200px] mx-auto flex justify-center items-center px-4">
        {/* =============== DESKTOP HEADER =============== */}
        <div
          id="desktopHeader"
          className="hidden md:flex flex-wrap md:flex-nowrap justify-center items-center gap-4 md:gap-10 
          text-sm md:text-lg font-medium py-2 bg-[#000000] rounded-[25px]
          border px-5 md:px-10"
        >
          {/* Logo */}
          <h1 className="text-[22px] md:text-[30px] text-white hover:tracking-wider transition-all duration-300 name-btn flex items-center gap-2">
            Abdul.R
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
            <LocalTimeWithCountry />
          </div>

          {/* Hire Me Button */}
          <a
            className="bg-white text-black px-4 md:px-5 py-1 rounded-[15px] hover:tracking-wider transition-all duration-300 text-[16px] md:text-[20px]"
            href="https://wa.me/03164949427"
            target="_blank"
            rel="noreferrer"
          >
            Hire Me
          </a>
        </div>

        {/* =============== MOBILE HEADER =============== */}
        <div
          id="mobileHeader"
          className="flex md:hidden w-full justify-between items-center bg-black px-5 py-3 rounded-[25px]"
        >
          {/* Logo */}
          <div className="flex items-center gap-2 text-white text-[22px] font-semibold">
            Abdul.R
          </div>

          {/* Hamburger Icon */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-black text-[30px] mt-[-10px]"
          >
            {menuOpen ? "✖" : "☰"}
          </button>

          {/* Mobile Fullscreen Menu */}
          <div
            className={`fixed top-0 left-0 w-full h-screen bg-black text-white flex flex-col justify-center items-left gap-8 text-[22px] transition-all duration-500 ${
              menuOpen
                ? "opacity-100 visible translate-y-0"
                : "opacity-0 invisible -translate-y-10"
            }`}
          >
            {/* Close Button inside Menu */}
            <button
              onClick={() => setMenuOpen(false)}
              className="absolute top-6 right-6 text-[30px] font-bold"
            >
              ✖
            </button>

            {/* Menu Links */}
            <h4
              onClick={() => setMenuOpen(false)}
              className="cursor-pointer hover:tracking-wider transition-all duration-300 text-[30px]"
            >
              Home
            </h4>
            <h4
              onClick={() => setMenuOpen(false)}
              className="cursor-pointer hover:tracking-wider transition-all duration-300 text-[30px]"
            >
              About
            </h4>
            <h4
              onClick={() => setMenuOpen(false)}
              className="cursor-pointer hover:tracking-wider transition-all duration-300 text-[30px]"
            >
              Work
            </h4>
            <h4
              onClick={() => setMenuOpen(false)}
              className="cursor-pointer hover:tracking-wider transition-all duration-300 text-[30px]"
            >
              Contact
            </h4>

            <LocalTimeWithCountry />

            {/* Hire Me Button */}
            <a
              className="bg-white text-black px-6 py-3 rounded-[15px] hover:tracking-wider transition-all duration-300 text-[30px]"
              href="https://wa.me/03164949427"
              target="_blank"
              rel="noreferrer"
            >
              Hire Me
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;


