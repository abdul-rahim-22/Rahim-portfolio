// src/components/Snowfall.js
import React, { useEffect } from "react";
import "./Snowfall.css";

const Snowfall = () => {
  useEffect(() => {
    const snowContainer = document.querySelector(".snow-container");
    const snowGround = document.querySelector(".snow-ground");

    const particlesPerThousandPixels = 0.1;
    const fallSpeed = 1.25;
    const pauseWhenNotActive = true;
    const maxSnowflakes = 200;
    const snowflakes = [];

    let snowflakeInterval;
    let isTabActive = true;

    function resetSnowflake(snowflake) {
      const size = Math.random() * 5 + 1;
      const viewportWidth = window.innerWidth - size;

      snowflake.style.width = `${size}px`;
      snowflake.style.height = `${size}px`;
      snowflake.style.left = `${Math.random() * viewportWidth}px`;
      snowflake.style.top = `-${size}px`;

      const animationDuration = (Math.random() * 3 + 2) / fallSpeed;
      snowflake.style.animationDuration = `${animationDuration}s`;
      snowflake.style.animationTimingFunction = "linear";
      snowflake.style.animationName =
        Math.random() < 0.5 ? "fall" : "diagonal-fall";

      // When the snowflake finishes falling
      setTimeout(() => {
        const snowLeft = parseFloat(snowflake.style.left);
        addToGround(snowLeft);
        snowflake.remove();
        const index = snowflakes.indexOf(snowflake);
        if (index > -1) snowflakes.splice(index, 1);
      }, animationDuration * 1000);
    }

    function addToGround(xPos) {
      const flake = document.createElement("div");
      flake.classList.add("ground-flake");
      flake.style.left = `${xPos}px`;
      snowGround.appendChild(flake);

      // Random width and small fade for realism
      flake.style.width = `${Math.random() * 3 + 2}px`;
      flake.style.opacity = `${Math.random() * 0.6 + 0.4}`;

      // Remove old flakes to avoid infinite buildup
      if (snowGround.childNodes.length > 500) {
        snowGround.removeChild(snowGround.firstChild);
      }
    }

    function createSnowflake() {
      if (snowflakes.length < maxSnowflakes) {
        const snowflake = document.createElement("div");
        snowflake.classList.add("snowflake");
        snowflakes.push(snowflake);
        snowContainer.appendChild(snowflake);
        resetSnowflake(snowflake);
      }
    }

    function generateSnowflakes() {
      const numberOfParticles =
        Math.ceil((window.innerWidth * window.innerHeight) / 1000) *
        particlesPerThousandPixels;
      const interval = 5000 / numberOfParticles;

      clearInterval(snowflakeInterval);
      snowflakeInterval = setInterval(() => {
        if (isTabActive && snowflakes.length < maxSnowflakes) {
          requestAnimationFrame(createSnowflake);
        }
      }, interval);
    }

    function handleVisibilityChange() {
      if (!pauseWhenNotActive) return;
      isTabActive = !document.hidden;
      if (isTabActive) {
        generateSnowflakes();
      } else {
        clearInterval(snowflakeInterval);
      }
    }

    generateSnowflakes();
    window.addEventListener("resize", generateSnowflakes);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(snowflakeInterval);
      window.removeEventListener("resize", generateSnowflakes);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return (
    <>
      <div className="snow-container"></div>
      <div className="snow-ground"></div>
    </>
  );
};

export default Snowfall;
