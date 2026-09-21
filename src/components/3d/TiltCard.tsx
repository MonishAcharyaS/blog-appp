"use client";

import React, { useRef, useState, useCallback } from "react";

interface TiltCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  maxTilt?: number; // max tilt angle in degrees (default: 10)
  glareOpacity?: number; // max opacity of the specular glare (default: 0.25)
  perspective?: number; // perspective in pixels (default: 1000)
  className?: string;
  enableGlare?: boolean;
}

export const TiltCard: React.FC<TiltCardProps> = ({
  children,
  maxTilt = 8,
  glareOpacity = 0.2,
  perspective = 1000,
  className = "",
  enableGlare = true,
  ...rest
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [transformStyle, setTransformStyle] = useState<string>(
    "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)"
  );
  const [glarePosition, setGlarePosition] = useState<{ x: number; y: number; opacity: number }>({
    x: 50,
    y: 50,
    opacity: 0,
  });
  const [isHovered, setIsHovered] = useState(false);

  // Check for prefers-reduced-motion
  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (prefersReducedMotion || !cardRef.current) return;
      const rect = cardRef.current.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;

      // Cursor position relative to card (0 to 1)
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const pctX = mouseX / width;
      const pctY = mouseY / height;

      // Calculate tilt degrees (-maxTilt to +maxTilt)
      const rotateX = ((pctY - 0.5) * -2 * maxTilt).toFixed(2);
      const rotateY = ((pctX - 0.5) * 2 * maxTilt).toFixed(2);

      setTransformStyle(
        `perspective(${perspective}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`
      );

      if (enableGlare) {
        setGlarePosition({
          x: Math.round(pctX * 100),
          y: Math.round(pctY * 100),
          opacity: glareOpacity,
        });
      }
    },
    [maxTilt, perspective, enableGlare, glareOpacity, prefersReducedMotion]
  );

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    setTransformStyle(
      `perspective(${perspective}px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`
    );
    if (enableGlare) {
      setGlarePosition((prev) => ({ ...prev, opacity: 0 }));
    }
  }, [perspective, enableGlare]);

  return (
    <div
      ref={cardRef}
      data-testid="tilt-card-wrapper"
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: transformStyle,
        transition: isHovered
          ? "transform 0.1s ease-out"
          : "transform 0.5s cubic-bezier(0.2, 0, 0.2, 1)",
        transformStyle: "preserve-3d",
      }}
      className={`relative preserve-3d will-change-transform ${className}`}
      {...rest}
    >
      {children}

      {/* Dynamic Specular Light Glare Overlay */}
      {enableGlare && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-inherit overflow-hidden transition-opacity duration-300 z-50"
          style={{
            borderRadius: "inherit",
            opacity: glarePosition.opacity,
            background: `radial-gradient(circle 320px at ${glarePosition.x}% ${glarePosition.y}%, rgba(255, 255, 255, 0.4), transparent 80%)`,
          }}
        />
      )}
    </div>
  );
};
