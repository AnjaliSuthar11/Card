import React, { useRef, useEffect, useState } from "react";

const CircleCard = () => {
  const canvasRef = useRef(null);
  const glitterRef = useRef(null);
  const audioRef = useRef(null);

  const lastPoint = useRef(null);
  const isDrawing = useRef(false);
  const revealed = useRef(false);
  const audioStarted = useRef(false);
  const scratchCounter = useRef(0);

  const [pop, setPop] = useState(false);
  const [showGlitter, setShowGlitter] = useState(false);
  const [coverReady, setCoverReady] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    const setupCanvas = () => {
      const width = canvas.offsetWidth;
      const height = canvas.offsetHeight;

      if (!width || !height) return;

      // ✅ CLAMP DPR (HUGE mobile boost)
      const ratio = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = width * ratio;
      canvas.height = height * ratio;

      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

      const coverImg = new Image();
      coverImg.src = "/fill circle-01.svg";

      coverImg.onload = () => {
        ctx.globalCompositeOperation = "source-over";
        ctx.clearRect(0, 0, width, height);
        ctx.drawImage(coverImg, 0, 0, width, height);

        ctx.globalCompositeOperation = "destination-out";
        ctx.lineJoin = "round";
        ctx.lineCap = "round";
        ctx.lineWidth = width * 0.12;

        setCoverReady(true); // ✅ Prevent early reveal flash
      };
    };

    setupCanvas();
    window.addEventListener("resize", setupCanvas);

    if (audioRef.current) {
      audioRef.current.load();
    }

    return () => window.removeEventListener("resize", setupCanvas);
  }, []);

  // ✅ Silent Audio Unlock (mobile safe)
  const unlockAudio = () => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = 0.01;
    audio.currentTime = 0.01;

    const playPromise = audio.play();

    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          audio.pause();
          audio.currentTime = 0;
          audio.volume = 0.8;
        })
        .catch(() => {});
    }
  };

  const playMusic = () => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = 0.8;
    audio.currentTime = 66; // ✅ Start at 1:06
    audio.play();
  };

  const getCoords = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();

    if (e.touches) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    }

    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const startScratch = (e) => {
    if (!coverReady) return;

    isDrawing.current = true;
    lastPoint.current = getCoords(e);

    if (!audioStarted.current) {
      unlockAudio();
      audioStarted.current = true;
    }
  };

  const scratch = (e) => {
    if (!isDrawing.current || revealed.current || !coverReady) return;

    const ctx = canvasRef.current.getContext("2d");
    const { x, y } = getCoords(e);

    if (!lastPoint.current) {
      lastPoint.current = { x, y };
      return;
    }

    ctx.beginPath();
    ctx.moveTo(lastPoint.current.x, lastPoint.current.y);
    ctx.lineTo(x, y);
    ctx.stroke();

    lastPoint.current = { x, y };

    // ✅ PERFORMANCE BOOST → Check less often
    scratchCounter.current++;

    if (scratchCounter.current % 12 === 0) {
      checkReveal();
    }
  };

  const stopScratch = () => {
    isDrawing.current = false;
    lastPoint.current = null;
  };

  const checkReveal = () => {
    if (revealed.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const width = canvas.offsetWidth;
    const height = canvas.offsetHeight;

    const imageData = ctx.getImageData(0, 0, width, height);
    const pixels = imageData.data;

    let cleared = 0;

    for (let i = 3; i < pixels.length; i += 4) {
      if (pixels[i] === 0) cleared++;
    }

    const percent = cleared / (pixels.length / 4);

    if (percent > 0.90) {
      revealed.current = true;

      triggerPop();
      setShowGlitter(true);
      triggerGlitter();
      autoClearScratchLayer();

      // ✅ Play ONLY after reveal
      setTimeout(playMusic, 350);
    }
  };

  const triggerPop = () => {
    setPop(true);
    setTimeout(() => setPop(false), 450);
  };

  const autoClearScratchLayer = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const width = canvas.offsetWidth;
    const height = canvas.offsetHeight;

    let opacity = 1;

    const fade = () => {
      opacity -= 0.06;

      ctx.globalCompositeOperation = "source-over";
      ctx.clearRect(0, 0, width, height);

      ctx.fillStyle = `rgba(255,255,255,${opacity})`;
      ctx.fillRect(0, 0, width, height);

      ctx.globalCompositeOperation = "destination-out";

      if (opacity > 0) {
        requestAnimationFrame(fade);
      } else {
        ctx.clearRect(0, 0, width, height);
      }
    };

    fade();
  };

  const triggerGlitter = () => {
    const canvas = glitterRef.current;
    const ctx = canvas.getContext("2d");

    const width = canvas.offsetWidth;
    const height = canvas.offsetHeight;

    canvas.width = width;
    canvas.height = height;

    const particles = Array.from({ length: 90 }).map(() => ({
      x: Math.random() * width,
      y: height,
      size: Math.random() * 2 + 1,
      speedY: Math.random() * 0.45 + 0.2,
      opacity: Math.random(),
    }));

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        p.y -= p.speedY;
        p.opacity -= 0.0035;

        ctx.fillStyle = `rgba(255,215,0,${p.opacity})`;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        if (p.opacity <= 0 || p.y < 0) {
          p.x = Math.random() * width;
          p.y = height;
          p.opacity = Math.random();
        }
      });

      requestAnimationFrame(animate);
    };

    animate();
  };

  return (
    <div className="bg-gray-600">
      <div
        className={`relative md:p-4 flex justify-center items-center overflow-hidden 
        transition-transform duration-500 ${pop ? "scale-105" : "scale-100"}`}
      >
        <audio
          ref={audioRef}
          src="/love_story.mp3"
          preload="auto"
          loop
          playsInline
        />

        <img
          className="w-[400px] h-[600px] pointer-events-none"
          src="/background-01.svg"
          alt=""
        />

        <img
          className={`absolute w-[250px] h-[250px] md:w-[290px] md:h-[290px] 
            top-36 md:top-[145px] rounded-full object-cover
            transition-opacity duration-300
            ${coverReady ? "opacity-100" : "opacity-0"}`}
          src="/image.jpg"
          alt=""
        />

            <img className="absolute  md:w-[400px] md:h-[600px] top-11 md:top-5" src="/outline circle-02.svg"/>

        <canvas
          ref={canvasRef}
          style={{ touchAction: "none" }}
          className="absolute w-[370px] h-[520px] md:w-[420px] md:h-[600px] 
                     top-9 md:top-[18px] cursor-pointer"
          onMouseDown={startScratch}
          onTouchStart={startScratch}
          onMouseMove={scratch}
          onTouchMove={(e) => {
            e.preventDefault();
            scratch(e);
          }}
          onMouseUp={stopScratch}
          onMouseLeave={stopScratch}
          onTouchEnd={stopScratch}
        />

        <canvas
          ref={glitterRef}
          className={`absolute w-[370px] h-[520px] md:w-[420px] md:h-[600px] 
                     top-9 md:top-[18px] pointer-events-none transition-opacity duration-700
                     ${showGlitter ? "opacity-100" : "opacity-0"}`}
        />
      </div>
    </div>
  );
};

export default CircleCard;