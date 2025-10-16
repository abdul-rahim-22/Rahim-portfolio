
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
//            <span><img src='src/assets/Untitled design (2).png'></img></span> Abdul.R
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
import { motion, AnimatePresence } from "framer-motion";

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const navLinks = ["Home", "About", "Work", "Contact"];

  return (
    <>
      {/* =========================
          DESKTOP HEADER
      ========================== */}
      <div className="hidden md:block w-full sticky top-0 z-20 bg-[#fefdf800] pt-2 backdrop-blur-lg">
        <div className="max-w-[1200px] mx-auto flex justify-center items-center px-4">
          <div
            id="myBox"
            className="flex flex-wrap md:flex-nowrap justify-center items-center gap-4 md:gap-10 
            text-sm md:text-lg font-medium py-2 bg-[#000000] rounded-[25px]
            border px-5 md:px-10"
          >
            {/* Logo */}
            <h1 className="text-[22px] md:text-[30px] text-white hover:tracking-wider transition-all duration-300 name-btn flex items-center gap-2">
              <img
                src="src/assets/Untitled design (2).png"
                alt="Logo"
                className="w-10 h-10"
              />
              Abdul.R
            </h1>

            {/* Navigation Links */}
            <div className="flex flex-wrap justify-center gap-4 md:gap-8">
              {navLinks.map((link, i) => (
                <h4
                  key={i}
                  className="cursor-pointer text-white hover:tracking-wider transition-all duration-300"
                >
                  {link}
                </h4>
              ))}
              <LocalTimeWithCountry />
            </div>

            {/* Hire Me Button */}
            <a
              href="https://wa.me/03164949427"
              target="_blank"
              rel="noreferrer"
              className="bg-[white] text-black px-4 md:px-5 py-1 rounded-[15px] hover:bg-white text-[16px] md:text-[20px] hover:text-black hover:tracking-wider transition-all duration-300 hire-btn"
            >
              Hire Me
            </a>
          </div>
        </div>
      </div>

      {/* =========================
          MOBILE HEADER
      ========================== */}
      <div className="flex md:hidden w-full sticky top-0 z-20 bg-[#000000] px-4 py-3 justify-between items-center">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <img
            src="src/assets/Untitled design (2).png"
            alt="Logo"
            className="w-8 h-8"
          />
          <h1 className="text-white text-[22px] font-semibold">Abdul.R</h1>
        </div>

        {/* Hamburger Icon */}
        <div
          className="text-white text-2xl cursor-pointer"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <i className={menuOpen ? "fas fa-times" : "fas fa-bars"}></i>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="flex md:hidden flex-col items-center bg-[#000000] py-5 gap-4 border-t border-gray-700"
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
          >
            {navLinks.map((link, index) => (
              <h4
                key={index}
                className="cursor-pointer text-white hover:tracking-wider transition-all duration-300"
                onClick={() => setMenuOpen(false)}
              >
                {link}
              </h4>
            ))}
            <LocalTimeWithCountry />
            <a
              href="https://wa.me/03164949427"
              target="_blank"
              rel="noreferrer"
              onClick={() => setMenuOpen(false)}
              className="bg-white text-black px-5 py-1 rounded-[15px] text-[16px] hover:tracking-wider transition-all duration-300"
            >
              Hire Me
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;
