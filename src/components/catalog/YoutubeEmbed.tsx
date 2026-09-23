function extractYoutubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtube\.com\/shorts\/|youtu\.be\/|youtube\.com\/embed\/)([\w-]{11})/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

export default function YoutubeEmbed({ url, title, aspect = "video" }: { url: string; title: string; aspect?: "video" | "square" | "portrait" }) {
  const videoId = extractYoutubeId(url);
  if (!videoId) return null;

  return (
    <div className={`w-full overflow-hidden rounded-xl bg-neutral-950 ${aspect === "square" ? "aspect-square" : aspect === "portrait" ? "aspect-[9/16]" : "aspect-video"}`}>
      <iframe
        src={`https://www.youtube.com/embed/${videoId}`}
        title={title}
        className="h-full w-full"
        loading="lazy"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}
