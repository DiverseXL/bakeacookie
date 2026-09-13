"use client";

import React, { useRef, useEffect } from "react";

// Cookie SVG shape — geometric, tasteful placeholder (not Cookie Monster)
function CookieSVG({
  size,
  style,
  className,
}: {
  size: number;
  style?: React.CSSProperties;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
      aria-hidden="true"
    >
      {/* Cookie body */}
      <circle cx="32" cy="32" r="30" fill="#0B1F3A" />
      {/* Golden baked tone */}
      <circle cx="32" cy="32" r="27" fill="#E8B84A" />
      {/* Light highlight arc */}
      <ellipse cx="24" cy="22" rx="8" ry="5" fill="#F5C84B" opacity="0.6" transform="rotate(-20 24 22)" />
      {/* Chocolate chips */}
      <ellipse cx="20" cy="26" rx="4" ry="3.5" fill="#3D1C02" transform="rotate(-15 20 26)" />
      <ellipse cx="38" cy="22" rx="3.5" ry="3" fill="#3D1C02" transform="rotate(10 38 22)" />
      <ellipse cx="30" cy="38" rx="4" ry="3.5" fill="#3D1C02" transform="rotate(-5 30 38)" />
      <ellipse cx="44" cy="36" rx="3" ry="2.5" fill="#3D1C02" transform="rotate(20 44 36)" />
      <ellipse cx="18" cy="40" rx="3" ry="2.5" fill="#3D1C02" transform="rotate(-10 18 40)" />
      {/* Edge crinkle marks */}
      <circle cx="32" cy="32" r="27" stroke="#C89830" strokeWidth="1.5" fill="none" strokeDasharray="4 3" opacity="0.5" />
    </svg>
  );
}

const PARTICLES: Array<{
  size: number;
  left: string;
  top: string;
  dur: string;
  delay: string;
  opacity: number;
}> = [
  { size: 72, left: "5%", top: "15%", dur: "8s", delay: "0s", opacity: 0.14 },
  { size: 48, left: "88%", top: "8%", dur: "9.5s", delay: "1.2s", opacity: 0.10 },
  { size: 88, left: "78%", top: "60%", dur: "11s", delay: "0.5s", opacity: 0.12 },
  { size: 56, left: "20%", top: "72%", dur: "7.5s", delay: "2s", opacity: 0.09 },
  { size: 40, left: "52%", top: "5%", dur: "10s", delay: "3s", opacity: 0.11 },
  { size: 64, left: "92%", top: "35%", dur: "12s", delay: "0.8s", opacity: 0.08 },
  { size: 36, left: "35%", top: "85%", dur: "8.5s", delay: "1.8s", opacity: 0.10 },
  { size: 52, left: "65%", top: "78%", dur: "9s", delay: "4s", opacity: 0.09 },
];

export default function CookieParticles() {
  return (
    <div
      className="absolute inset-0 overflow-hidden pointer-events-none"
      aria-hidden="true"
    >
      {PARTICLES.map((p, i) => (
        <div
          key={i}
          className="absolute cookie-particle"
          style={{
            left: p.left,
            top: p.top,
            opacity: p.opacity,
            "--dur": p.dur,
            "--delay": p.delay,
          } as React.CSSProperties}
        >
          <CookieSVG size={p.size} />
        </div>
      ))}
    </div>
  );
}
