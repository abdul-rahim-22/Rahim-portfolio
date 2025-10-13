import React, { useRef, useState } from "react";

function MusicPlayer() {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const toggleMusic = () => {
    const audio = audioRef.current;

    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play();
      setIsPlaying(true);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3 ">
      <audio ref={audioRef}>
        <source src="src/assets/The-Open-Sky-chosic.com_.mp3" type="audio/mp3" />
      </audio>

      <button
        onClick={toggleMusic}
        className={`px-6 py-3 rounded-xl font-semibold shadow-md transition-all duration-300 ${
          isPlaying
            ? " text-white"
            : " text-white"
        }`}
      >
        {isPlaying ? "Pause ⏸️" : "Play ▶️"}
      </button>
    </div>
  );
}

export default MusicPlayer;
