import Image from "next/image";
import Link from "next/link";

const SOURCES = {
  "horizontal-teal": {
    src: "/brand/logo-horizontal-teal.png",
    width: 1610,
    height: 369,
  },
  "horizontal-white": {
    src: "/brand/logo-horizontal-white.png",
    width: 1610,
    height: 369,
  },
  "icon-teal": {
    src: "/brand/logo-icon-teal.png",
    width: 783,
    height: 765,
  },
  "icon-white": {
    src: "/brand/logo-icon-white.png",
    width: 852,
    height: 829,
  },
} as const;

export function Logo({
  variant = "horizontal-teal",
  className,
  height = 40,
  priority,
}: {
  variant?: keyof typeof SOURCES;
  className?: string;
  height?: number;
  priority?: boolean;
}) {
  const { src, width, height: h } = SOURCES[variant];
  const width_ = Math.round((width / h) * height);
  return (
    <Image
      src={src}
      alt="Let It Out"
      width={width_}
      height={height}
      className={className}
      priority={priority}
    />
  );
}

export function LogoLink({
  variant = "horizontal-teal",
  className,
  height = 40,
}: {
  variant?: keyof typeof SOURCES;
  className?: string;
  height?: number;
}) {
  return (
    <Link href="/" aria-label="Let It Out home" className="inline-flex items-center">
      <Logo variant={variant} className={className} height={height} priority />
    </Link>
  );
}
