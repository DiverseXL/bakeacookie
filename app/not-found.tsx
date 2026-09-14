import React from "react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-24 sm:py-32">
      {/* Big cookie icon */}
      <div className="mb-8">
        <svg
          width="120"
          height="120"
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <circle cx="32" cy="32" r="30" fill="#0B1F3A" />
          <circle cx="32" cy="32" r="27" fill="#E8B84A" />
          <ellipse
            cx="24"
            cy="22"
            rx="7"
            ry="5"
            fill="#F5C84B"
            opacity="0.55"
            transform="rotate(-20 24 22)"
          />
          <ellipse cx="20" cy="26" rx="4" ry="3.5" fill="#3D1C02" transform="rotate(-15 20 26)" />
          <ellipse cx="38" cy="22" rx="3.5" ry="3" fill="#3D1C02" transform="rotate(10 38 22)" />
          <ellipse cx="30" cy="38" rx="4" ry="3.5" fill="#3D1C02" transform="rotate(-5 30 38)" />
          <ellipse cx="44" cy="36" rx="3" ry="2.5" fill="#3D1C02" transform="rotate(20 44 36)" />
          <ellipse cx="18" cy="41" rx="3" ry="2.5" fill="#3D1C02" transform="rotate(-10 18 41)" />
          <circle
            cx="32"
            cy="32"
            r="27"
            stroke="#C89830"
            strokeWidth="1.5"
            fill="none"
            strokeDasharray="4 3"
            opacity="0.4"
          />
        </svg>
      </div>

      {/* 404 number */}
      <span className="font-display text-7xl font-extrabold tracking-tight text-navy/15 sm:text-8xl select-none">
        404
      </span>

      {/* Card */}
      <div className="card-chunky mt-6 flex max-w-md flex-col items-center gap-4 px-8 py-10 text-center sm:px-12">
        <h1 className="font-display text-2xl font-extrabold tracking-tight text-navy sm:text-3xl">
          Crumbs — this page is gone
        </h1>

        <p className="max-w-sm font-body text-sm leading-relaxed text-ink/65 sm:text-base">
          This recipe wasn&apos;t found in the on-chain Recipe Book. It may have
          been rolled back, or the URL might be a typo.
        </p>

        <Link
          href="/"
          className="btn-navy mt-2 text-sm"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}
