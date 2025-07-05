import localFont from "next/font/local";
import Link from "next/link";

const myFont = localFont({
  src: "../../public/fonts/blue_vinyl_regular_ps_ot.otf",
  display: "swap",
});

interface LogoProps {
  className?: string;
}

export default function Logo({ className }: LogoProps) {
  return (
    <Link className={`w-full ${className}`} href="/">
      <h1 className={`${myFont.className} font-thin`}>Instagram</h1>
    </Link>
  );
}
