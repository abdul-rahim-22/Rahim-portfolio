
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

  const toggleMenu = () => setMenuOpen(!menuOpen);

  const navLinks = ["Home", "About", "Work", "Contact"];

  return (
    <div className="w-full sticky top-0 z-20 bg-[#fefdf800] pt-2 backdrop-blur-lg">
      <div className="max-w-[1200px] mx-auto flex justify-between items-center px-4">
        {/* Left Side: Logo */}
        <div className="flex items-center gap-2">
          <img
            src="src/assets/Untitled design (2).png"
            alt="Logo"
            className="w-8 h-8 md:w-10 md:h-10"
          />
          <h1 className="text-[22px] md:text-[30px] text-white hover:tracking-wider transition-all duration-300 font-semibold">
            Abdul.Rahim
          </h1>
        </div>

        {/* Hamburger icon for mobile */}
        <div
          className="md:hidden text-white text-2xl cursor-pointer"
          onClick={toggleMenu}
        >
          <i className={menuOpen ? "fas fa-times" : "fas fa-bars"}></i>
        </div>

        {/* Desktop Menu */}
        <div
          className="hidden md:flex flex-wrap justify-center items-center gap-4 md:gap-8 bg-[#000000] rounded-[25px] border px-5 md:px-10 py-2"
          id="myBox"
        >
          {navLinks.map((link, index) => (
            <h4
              key={index}
              className="cursor-pointer text-white hover:tracking-wider transition-all duration-300"
            >
              {link}
            </h4>
          ))}
          <LocalTimeWithCountry />
          <a
            href="https://wa.me/03164949427"
            target="_blank"
            rel="noreferrer"
            className="bg-[white] text-black px-4 md:px-5 py-1 rounded-[15px] text-[16px] md:text-[20px] hover:bg-white hover:text-black hover:tracking-wider transition-all duration-300 hire-btn"
          >
            Hire Me
          </a>
        </div>
      </div>

      {/* Mobile Menu (Animated) */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="md:hidden bg-[#000000] mt-2 mx-4 rounded-[15px] py-4 flex flex-col items-center gap-4 border border-gray-700"
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
              className="bg-[white] text-black px-5 py-1 rounded-[15px] text-[16px] hover:tracking-wider transition-all duration-300"
              onClick={() => setMenuOpen(false)}
            >
              Hire Me
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Header;
