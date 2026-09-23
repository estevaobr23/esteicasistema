export type ImageShape = "square" | "portrait" | "landscape";

export function inspectImageShape(file: File): Promise<{ shape: ImageShape; width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      const width = image.naturalWidth;
      const height = image.naturalHeight;
      URL.revokeObjectURL(objectUrl);
      const ratio = width / height;
      resolve({ shape: ratio > 1.1 ? "landscape" : ratio < 0.9 ? "portrait" : "square", width, height });
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Não foi possível analisar o formato da imagem."));
    };
    image.src = objectUrl;
  });
}
