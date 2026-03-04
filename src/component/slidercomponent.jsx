// import React, { useEffect } from "react";
// // import "./ClientSlider.css"; // move your CSS here

// const ClientSlider = () => {
//   useEffect(() => {
//     // Duplicate content for infinite loop
//     const slider1 = document.querySelector("#client-slider-1");
//     const slider2 = document.querySelector("#client-slider-2");

//     if (slider1 && slider2) {
//       slider1.innerHTML += slider1.innerHTML;
//       slider2.innerHTML += slider2.innerHTML;
//     }
//   }, []);

//   return (
//     <div className="w-full">
//       {/* Slider 1 (Left to Right) */}
//       <div className="client-slider-container" id="client-slider-1-container">
//         <div className="client-slider-wrapper">
//           <div className="client-slider" id="client-slider-1">
//             <img
//               src="https://rs-digitalmarketing.com/wp-content/uploads/2025/04/1.avif"
//               alt="Image 1"
//             />
//             <img
//               src="https://rs-digitalmarketing.com/wp-content/uploads/2025/04/2-1.avif"
//               alt="Image 2"
//             />
//             <img
//               src="https://rs-digitalmarketing.com/wp-content/uploads/2025/04/3.avif"
//               alt="Image 3"
//             />
//              <img
//               src="https://rs-digitalmarketing.com/wp-content/uploads/2025/04/6.avif"
//               alt="Image 3"
//             />
//           </div>
//         </div>
//       </div>

//       {/* Slider 2 (Right to Left) */}
//       <div className="client-slider-container" id="client-slider-2-container">
//         <div className="client-slider-wrapper">
//           <div className="client-slider" id="client-slider-2">
//             <img
//               src="https://rs-digitalmarketing.com/wp-content/uploads/2025/04/9.avif"
//               alt="Image 1"
//             />
//             <img
//               src="https://rs-digitalmarketing.com/wp-content/uploads/2025/04/10.avif"
//               alt="Image 2"
//             />
//             <img
//               src="https://rs-digitalmarketing.com/wp-content/uploads/2025/04/5.avif"
//               alt="Image 3"
//             />
//              <img
//               src="https://rs-digitalmarketing.com/wp-content/uploads/2025/04/4.avif"
//               alt="Image 3"
//             />
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ClientSlider;

import React, { useEffect } from "react";
// import "./ClientSlider.css";
import img1 from "../assets/1-updraft-pre-smush-original.png";
import img2 from "../assets/2-1.png.webp";
import img3 from "../assets/3.png.webp";
import img4 from "../assets/4.avif";
import img5 from "../assets/5-updraft-pre-smush-original.png";
import img6 from "../assets/6.avif";
import img7 from "../assets/7.png.webp";
import img8 from "../assets/8.png.webp";
import img9 from "../assets/9.png.webp";
import img10 from "../assets/10.png.webp";

const ClientSlider = () => {
  useEffect(() => {
    // Duplicate each slider for seamless infinite loop
    const sliders = document.querySelectorAll(".client-slider");
    sliders.forEach(slider => {
      slider.innerHTML += slider.innerHTML; // duplicate images
    });
  }, []);

  return (
    <div className="w-full overflow-hidden">
      {/* ===== Slider 1 (Left to Right) ===== */}
        <div className="client-slider-container">
        <div className="client-slider" id="client-slider-1">
          <img src={img1} alt="Client logo 1: Professional brand identity" />
          <img src={img2} alt="Client logo 2: Modern corporate branding" />
          <img src={img3} alt="3" />
          <img src={img4} alt="4" />
          <img src={img9} alt="9" />
          <img src={img10} alt="10" />
        </div>
        </div>

      {/* ===== Slider 2 (Right to Left) ===== */}
      <div className="client-slider-container">
        <div className="client-slider" id="client-slider-2">
          <img src={img5} alt="5" />
          <img src={img6} alt="6" />
          <img src={img7} alt="7" />
          <img src={img8} alt="8" />
        </div>
      </div>
    </div>
  );
};

export default ClientSlider;
