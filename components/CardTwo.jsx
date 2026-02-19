import React, { useRef, useEffect, useState } from "react";

const SIZE = 320;

const CardTwo = () => {
  const canvasRef = useRef(null);
  const glitterRef = useRef(null);
  const lastPoint = useRef(null);
  const scratchCount = useRef(0);
  const revealed = useRef(false);

  const [pop, setPop] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const ratio = window.devicePixelRatio || 1;

    canvas.width = SIZE * ratio;
    canvas.height = SIZE * ratio;
    canvas.style.width = SIZE + "px";
    canvas.style.height = SIZE + "px";

    ctx.scale(ratio, ratio);

    ctx.fillStyle = "#9CA3AF";
    ctx.fillRect(0, 0, SIZE, SIZE);

    ctx.globalCompositeOperation = "destination-out";

    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.lineWidth = 35;
  }, []);

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

  const triggerReward = () => {
    if (revealed.current) return;

    revealed.current = true;

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

      ctx.fillStyle = `rgba(156,163,175,${opacity})`;
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

  const scratch = (e) => {
    if (revealed.current) return;

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

   
    checkReveal();   // 🔥 Real scratch detection
  };

  const resetScratch = () => {
    lastPoint.current = null;
  };
  
  const checkReveal = () => {
  if (revealed.current) return;

  const canvas = canvasRef.current;
  const ctx = canvas.getContext("2d");

  const imageData = ctx.getImageData(0, 0, 200, 300);
  const pixels = imageData.data;

  let cleared = 0;

  for (let i = 3; i < pixels.length; i += 4) {
    if (pixels[i] === 0) cleared++; // alpha = transparent
  }

  const percent = cleared / (pixels.length / 4);

  // 🔥 Reveal at 85% scratched
  if (percent > 0.45) {
    triggerReward();
  }
};



  return (
    <div className="flex flex-col items-center gap-6 bg-amber-950/60 py-5 w-[350px] border-4 border-amber-800 rounded-2xl">

      <p className="text-xl px-10 py-4 bg-red-600 text-white rounded-lg shadow-lg">
        Scratch the Heart ❤️
      </p>

      <div
        className={`relative transition-transform duration-300 
        ${pop ? "scale-110" : "scale-100"}`}
        style={{
          width: SIZE,
          height: SIZE,
          clipPath: 'path("M160 295 \
          C40 210, 10 95, 90 45 \
          C140 10, 160 70, 160 95 \
          C160 70, 180 10, 230 45 \
          C310 95, 280 210, 160 295Z")',
        }}
      >

        {/* Hidden Image */}
        <img
          src="https://testingbot.com/free-online-tools/random-avatar/300"
          alt="Hidden"
          className="absolute w-full h-full object-cover "
        />

        {/* Scratch Layer */}
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 touch-none"
          onMouseMove={scratch}
          onMouseLeave={resetScratch}
          onTouchMove={scratch}
          onTouchEnd={resetScratch}
        />

        {/* Glitter Layer */}
        <canvas
          ref={glitterRef}
          className="absolute top-0 left-0 pointer-events-none"
        />
      </div>
    </div>
  );
};

export default CardTwo;
