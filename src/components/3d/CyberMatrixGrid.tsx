"use client";

import React, { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
}

export const CyberMatrixGrid: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    let mouseX = width / 2;
    let mouseY = height / 2;
    let targetMouseX = mouseX;
    let targetMouseY = mouseY;

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e: MouseEvent) => {
      targetMouseX = e.clientX;
      targetMouseY = e.clientY;
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove);

    // Initialize cyber particles
    const particleCount = Math.min(45, Math.floor(width / 30));
    const colors = ["#00F0FF", "#8A2BE2", "#3B82F6", "#00FF66"];
    const particles: Particle[] = [];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        size: Math.random() * 2 + 1,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: Math.random() * 0.6 + 0.2,
      });
    }

    let gridOffset = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Smooth mouse lerping
      mouseX += (targetMouseX - mouseX) * 0.05;
      mouseY += (targetMouseY - mouseY) * 0.05;

      const isDark = document.documentElement.classList.contains("dark");
      const gridColor = isDark
        ? "rgba(0, 240, 255, 0.04)"
        : "rgba(91, 72, 238, 0.04)";
      const horizonY = height * 0.65;

      // 1. Draw 3D Perspective Grid Ground
      ctx.save();
      ctx.strokeStyle = gridColor;
      ctx.lineWidth = 1;

      // Perspective vertical lines converging to horizon
      const perspectiveOriginX = width / 2 + (mouseX - width / 2) * 0.15;
      const numLines = 24;
      const stepX = width / (numLines / 2);

      for (let x = -width * 0.5; x <= width * 1.5; x += stepX) {
        ctx.beginPath();
        ctx.moveTo(perspectiveOriginX, horizonY);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      // Horizontal perspective depth lines moving forward
      gridOffset = (gridOffset + 0.4) % 40;
      for (let i = 0; i < 15; i++) {
        const depth = (i * 40 + gridOffset) / (15 * 40);
        const y = horizonY + Math.pow(depth, 2) * (height - horizonY);

        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
      ctx.restore();

      // 2. Cyber Particles & Constellation nodes
      ctx.save();
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        // Particle glow dot
        ctx.fillStyle = p.color;
        ctx.globalAlpha = isDark ? p.alpha : p.alpha * 0.4;
        ctx.shadowBlur = 8;
        ctx.shadowColor = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        // Connect nearby particles with subtle cyber circuit traces
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
          if (dist < 110) {
            ctx.strokeStyle = p.color;
            ctx.globalAlpha = (1 - dist / 110) * (isDark ? 0.18 : 0.08);
            ctx.shadowBlur = 0;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }
      ctx.restore();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-0 opacity-85 transition-opacity duration-500"
    />
  );
};
