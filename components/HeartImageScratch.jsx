import React, { useRef, useEffect, useState } from "react";

const SIZE = 320;

const HeartImageScratch = () => {
  const canvasRef = useRef(null);
  const glitterRef = useRef(null);
  const lastPoint = useRef(null);
  const revealed = useRef(false);
  const audioRef = useRef(null);
  const audioStarted = useRef(false);

  const [pop, setPop] = useState(false);
  const [ready, setReady] = useState(false);


  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const ratio = window.devicePixelRatio || 1;

    canvas.width = SIZE * ratio;
    canvas.height = SIZE * ratio;
    canvas.style.width = SIZE + "px";
    canvas.style.height = SIZE + "px";

    ctx.scale(ratio, ratio);

    const coverImg = new Image();
    coverImg.src = "/image.jpg";

    coverImg.onload = () => {
      ctx.globalCompositeOperation = "source-over";
      ctx.drawImage(coverImg, 0, 0, SIZE, SIZE);

      ctx.globalCompositeOperation = "destination-out";

      ctx.lineJoin = "round";
      ctx.lineCap = "round";
      ctx.lineWidth = 35;

      setReady(true);
    };

    if (audioRef.current) {
      audioRef.current.load(); // ✅ FORCE PRELOAD
    }
  }, []);

  
const unlockAudio = () => {
  const audio = audioRef.current;
  if (!audio) return;

  audio.volume = 0.4;

  const playPromise = audio.play();

  if (playPromise !== undefined) {
    playPromise
      .then(() => console.log("AUDIO PLAYING ✅"))
      .catch(() => {
        console.log("Audio retry...");
        setTimeout(() => audio.play(), 50);
      });
  }
};

  const getCoords = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();

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

const scratch = (e) => {
  if (revealed.current || !ready) return;

  // ✅ HARD AUDIO UNLOCK
  if (audioRef.current && audioRef.current.paused) {
    unlockAudio();
  }

  const canvas = canvasRef.current;
  const ctx = canvas.getContext("2d");

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

  checkReveal();
};

  const resetScratch = () => {
    lastPoint.current = null;
  };

  const checkReveal = () => {
    if (revealed.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const imageData = ctx.getImageData(0, 0, SIZE, SIZE);
    const pixels = imageData.data;

    let cleared = 0;

    for (let i = 3; i < pixels.length; i += 4) {
      if (pixels[i] === 0) cleared++;
    }

    const percent = cleared / (pixels.length / 4);

    if (percent > 0.45) {
      revealed.current = true;
      triggerReward();
    }
  };

  const triggerReward = () => {
    triggerGlitter();
    autoReveal();
    triggerPop();
  };

  const triggerPop = () => {
    setPop(true);
    setTimeout(() => setPop(false), 300);
  };

  const autoReveal = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    let opacity = 1;

    const fade = () => {
      opacity -= 0.08;

      ctx.clearRect(0, 0, SIZE, SIZE);
      ctx.globalCompositeOperation = "source-over";

      ctx.fillStyle = `rgba(255,255,255,${opacity})`;
      ctx.fillRect(0, 0, SIZE, SIZE);

      ctx.globalCompositeOperation = "destination-out";

      if (opacity > 0) {
        requestAnimationFrame(fade);
      } else {
        ctx.clearRect(0, 0, SIZE, SIZE);
      }
    };

    fade();
  };

  const triggerGlitter = () => {
    const canvas = glitterRef.current;
    const ctx = canvas.getContext("2d");

    canvas.width = SIZE;
    canvas.height = SIZE;

    const particles = Array.from({ length: 150 }).map(() => ({
      x: SIZE / 2,
      y: SIZE / 2,
      size: Math.random() * 6 + 2,
      speedX: (Math.random() - 0.5) * 12,
      speedY: (Math.random() - 0.5) * 12,
      life: 60,
    }));

    const animate = () => {
      ctx.clearRect(0, 0, SIZE, SIZE);

      particles.forEach((p) => {
        p.x += p.speedX;
        p.y += p.speedY;
        p.life--;

        ctx.fillStyle = `rgba(255,215,0,${p.life / 60})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });

      if (particles.some((p) => p.life > 0)) {
        requestAnimationFrame(animate);
      }
    };

    animate();
  };

  return (
    <div className="relative w-full aspect-[3/4] border-4 rounded-2xl overflow-hidden ">
        
     <audio
  ref={audioRef}
  src="/love_story.mp3"
  preload="auto"
  loop
  playsInline
/>

      <img
        src="/background-01.svg"
        alt="Card Background"
        className="absolute inset-0 w-full h-full object-contain"
      />

      <div className="relative flex flex-col items-center h-full">
        <div className="absolute top-50">
          <div
            className={`relative overflow-hidden transition-transform duration-300 
            ${pop ? "scale-110" : "scale-100"}`}
            style={{
              width: SIZE,
              height: SIZE,
              clipPath: 'path("M160 295 \
              C25 215, 0 110, 85 55 \
              C140 20, 160 75, 160 105 \
              C160 75, 180 20, 235 55 \
              C320 110, 295 215, 160 295 Z")'
            }}
          >
            <img
              src="https://testingbot.com/free-online-tools/random-avatar/300"
              alt="Hidden"
              className="absolute inset-0 w-full h-full object-cover"
            />

            <canvas
              ref={canvasRef}
              className={`absolute inset-0 touch-none 
              ${ready ? "opacity-100" : "opacity-0"}`}
              onMouseDown={unlockAudio}     // ✅ IMPORTANT FIX
              onTouchStart={unlockAudio}    // ✅ IMPORTANT FIX
              onMouseMove={scratch}
              onMouseLeave={resetScratch}
              onTouchMove={scratch}
              onTouchEnd={resetScratch}
            />

            <canvas
              ref={glitterRef}
              className="absolute inset-0 pointer-events-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeartImageScratch;