/** Largura máxima da foto de campo, sem esticar a imagem. */
const MAX_WIDTH = 1080;
/** Qualidade JPEG inicial pedida para o bucket. */
const JPEG_QUALITY = 0.8;
/** Teto para caber na faixa de 300–500 KB. Abaixo de 300 KB a foto permanece como saiu. */
const MAX_BYTES = 500 * 1024;

export interface CompressedPhoto {
  blob: Blob;
  width: number;
  height: number;
}

function canvasToJpeg(canvas: HTMLCanvasElement, quality: number) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Não foi possível compactar a imagem."));
      },
      "image/jpeg",
      quality,
    );
  });
}

async function drawImage(file: File) {
  if (typeof createImageBitmap === "function") {
    const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
    return {
      width: bitmap.width,
      height: bitmap.height,
      draw(context: CanvasRenderingContext2D, width: number, height: number) {
        context.drawImage(bitmap, 0, 0, width, height);
      },
      close() {
        bitmap.close();
      },
    };
  }

  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const element = new Image();
    element.onload = () => {
      URL.revokeObjectURL(url);
      resolve(element);
    };
    element.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Não foi possível ler a imagem. Use JPG ou PNG."));
    };
    element.src = url;
  });

  return {
    width: image.naturalWidth,
    height: image.naturalHeight,
    draw(context: CanvasRenderingContext2D, width: number, height: number) {
      context.drawImage(image, 0, 0, width, height);
    },
    close() {},
  };
}

function scaledSize(width: number, height: number, maxWidth: number) {
  if (width <= maxWidth) return { width, height };
  return {
    width: maxWidth,
    height: Math.max(1, Math.round((height * maxWidth) / width)),
  };
}

/**
 * Redimensiona a foto para no máximo 1080 px de largura e grava JPEG.
 * Começa em 80% de qualidade. Se passar de 500 KB, reduz a qualidade e, se preciso, a largura.
 */
export async function compressFieldPhoto(file: File): Promise<CompressedPhoto> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Escolha um arquivo de imagem.");
  }
  if (file.size > 20 * 1024 * 1024) {
    throw new Error("A foto original passa de 20 MB. Escolha outra imagem.");
  }

  const source = await drawImage(file).catch(() => {
    throw new Error("Não foi possível ler a imagem. Use JPG ou PNG.");
  });

  try {
    let maxWidth = MAX_WIDTH;
    let quality = JPEG_QUALITY;
    let blob: Blob | null = null;
    let size = scaledSize(source.width, source.height, maxWidth);

    for (let attempt = 0; attempt < 8; attempt += 1) {
      const canvas = document.createElement("canvas");
      canvas.width = size.width;
      canvas.height = size.height;
      const context = canvas.getContext("2d");
      if (!context) throw new Error("Não foi possível otimizar a imagem.");
      source.draw(context, size.width, size.height);
      blob = await canvasToJpeg(canvas, quality);
      if (blob.size <= MAX_BYTES) break;
      if (quality > 0.55) {
        quality = Math.round((quality - 0.08) * 100) / 100;
        continue;
      }
      maxWidth = Math.round(maxWidth * 0.85);
      if (maxWidth < 720) break;
      quality = JPEG_QUALITY;
      size = scaledSize(source.width, source.height, maxWidth);
    }

    if (!blob) throw new Error("Não foi possível compactar a imagem.");
    return { blob, width: size.width, height: size.height };
  } finally {
    source.close();
  }
}
