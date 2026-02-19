import React, { useRef, useEffect, useState } from "react";

const ScratchCard = () => {
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

    canvas.width = 200 * ratio;
    canvas.height = 300 * ratio;
    canvas.style.width = "200px";
    canvas.style.height = "300px";

    ctx.scale(ratio, ratio);

    ctx.fillStyle = "#9CA3AF";
    ctx.fillRect(0, 0, 200, 300);

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
  if (percent > 0.85) {
    triggerReward();
  }
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

      ctx.clearRect(0, 0, 200, 300);
      ctx.globalCompositeOperation = "source-over";

      ctx.fillStyle = `rgba(156,163,175,${opacity})`;
      ctx.fillRect(0, 0, 200, 300);

      ctx.globalCompositeOperation = "destination-out";

      if (opacity > 0) {
        requestAnimationFrame(fade);
      } else {
        ctx.clearRect(0, 0, 200, 300);
      }
    };

    fade();
  };

  const triggerGlitter = () => {
    const canvas = glitterRef.current;
    const ctx = canvas.getContext("2d");

    canvas.width = 200;
    canvas.height = 300;

    const particles = Array.from({ length: 120 }).map(() => ({
      x: 100,
      y: 150,
      size: Math.random() * 5 + 2,
      speedX: (Math.random() - 0.5) * 10,
      speedY: (Math.random() - 0.5) * 10,
      life: 60,
    }));

    const animate = () => {
      ctx.clearRect(0, 0, 200, 300);

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

  return (
    <div className="flex flex-col items-center gap-5 bg-amber-800/20 py-5 w-[300px] border-4 border-amber-800 rounded-2xl">

      <p className="text-3xl px-10 py-2 text-amber-900 font-bold">
      Please Scratch
      </p>

      <div
        className={`relative w-[200px] h-[300px] transition-transform duration-300 
        ${pop ? "scale-110" : "scale-100"}`}
      >

        <img
          src="https://testingbot.com/free-online-tools/random-avatar/300"
          alt="Hidden"
          className="absolute w-full h-full object-cover rounded-lg"
        />

   

        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 cursor-pointer touch-none"
          onMouseMove={scratch}
          onMouseLeave={resetScratch}
          onTouchMove={scratch}
          onTouchEnd={resetScratch}
        />

        <canvas
          ref={glitterRef}
          className="absolute top-0 left-0 pointer-events-none"
        />
      </div>
    </div>
  );
};

export default ScratchCard;
