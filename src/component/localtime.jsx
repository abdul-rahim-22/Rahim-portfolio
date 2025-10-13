import React, { useEffect, useState } from "react";

function LocalTimeWithCountry() {
  const [time, setTime] = useState("");
  const [countryName, setCountryName] = useState("");
  const [countryCode, setCountryCode] = useState("");
  const [flag, setFlag] = useState("");

  // 🕒 Live Time Updater
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const localTime = now.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
      setTime(localTime);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // 🌍 Get user country (CORS safe for localhost)
  useEffect(() => {
    fetch("https://ipwho.is/")
      .then((res) => res.json())
      .then((data) => {
        setCountryName(data.country);
        setCountryCode(data.country_code);
        setFlag(`https://flagcdn.com/48x36/${data.country_code.toLowerCase()}.png`);
      })
      .catch((err) => console.error("Location fetch error:", err));
  }, []);

  return (
    <div className="flex flex-col items-center text-center ">
      {countryName ? (
        <div className="flex items-center gap-2 text-lg  text-white">
          <img src={flag} alt={countryName} className="w-6 h-5 rounded-sm" />
          <span>{countryName}</span>
          <span>— {time}</span>
        </div>
      ) : (
        <div className="text-white">Detecting your location...</div>
      )}
    </div>
  );
}

export default LocalTimeWithCountry;
