import { useState } from "react";
import { Sprout } from "lucide-react";
import { cx } from "../lib/format";

interface FieldImageProps {
  src: string;
  alt: string;
  className?: string;
}

export function FieldImage({ src, alt, className }: FieldImageProps) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={cx(
          "flex items-center justify-center bg-slate-100 text-ink-300",
          className,
        )}
      >
        <Sprout aria-hidden="true" className="h-8 w-8 opacity-80" />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setFailed(true)}
    />
  );
}
