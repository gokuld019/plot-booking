// components/BrandLogo.jsx
// Your company logo. Put the image file at:  public/logo.png  (or change LOGO_SRC)
// Use it anywhere:  <BrandLogo />   or   <BrandLogo height={48} />

import Link from "next/link";
import Image from "next/image";

const LOGO_SRC = "/genuinelogo.png";          // e.g. "/logo.svg" if you have an SVG
const LOGO_ALT = "Company logo";
const LOGO_RATIO = 2.6;                // logo width ÷ height — adjust to your file

export default function BrandLogo({ height = 44, href = "/dashboard", className = "" }) {
  const img = (
    <Image
      src={LOGO_SRC}
      alt={LOGO_ALT}
      width={Math.round(height * LOGO_RATIO)}
      height={height}
      priority
      className={`h-auto w-auto object-contain ${className}`}
      style={{ height, width: "auto" }}
    />
  );
  return href ? (
    <Link href={href} aria-label="Home" className="inline-flex items-center">
      {img}
    </Link>
  ) : (
    img
  );
}