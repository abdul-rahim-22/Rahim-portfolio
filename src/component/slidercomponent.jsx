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
          <img src="https://rs-digitalmarketing.com/wp-content/uploads/2025/04/1.avif" alt="1" />
          <img src="https://rs-digitalmarketing.com/wp-content/uploads/2025/04/2-1.avif" alt="2" />
          <img src="https://rs-digitalmarketing.com/wp-content/uploads/2025/04/3.avif" alt="3" />
          <img src="https://rs-digitalmarketing.com/wp-content/uploads/2025/04/6.avif" alt="4" />
        </div>
      </div>

      {/* ===== Slider 2 (Right to Left) ===== */}
      <div className="client-slider-container">
        <div className="client-slider" id="client-slider-2">
          <img src="https://rs-digitalmarketing.com/wp-content/uploads/2025/04/9.avif" alt="5" />
          <img src="https://rs-digitalmarketing.com/wp-content/uploads/2025/04/10.avif" alt="6" />
          <img src="https://rs-digitalmarketing.com/wp-content/uploads/2025/04/5.avif" alt="7" />
          <img src="https://rs-digitalmarketing.com/wp-content/uploads/2025/04/4.avif" alt="8" />
        </div>
      </div>
    </div>
  );
};

export default ClientSlider;
