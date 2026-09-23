type AdaptiveSquareImageProps = {
  src: string;
  alt: string;
  className?: string;
};

export default function AdaptiveSquareImage({ src, alt, className = "" }: AdaptiveSquareImageProps) {
  return (
    <div className={`relative aspect-square overflow-hidden bg-neutral-950 ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full scale-110 object-cover opacity-25 blur-xl"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] via-black/10 to-black/25" aria-hidden />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} className="relative h-full w-full object-contain p-2" />
    </div>
  );
}
