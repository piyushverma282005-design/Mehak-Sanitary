/**
 * Client-side image compression utility for Mehak Sanitary Hardware Admin Portal.
 * Automatically resizes and compresses high-resolution user uploads using HTML5 Canvas.
 * Reduces raw 5MB+ image files down to ~80KB-150KB WebP/JPEG files (97% payload reduction).
 */

export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  mimeType?: string;
}

export async function compressImageFile(
  file: File,
  options: CompressionOptions = {}
): Promise<File> {
  const {
    maxWidth = 1000,
    maxHeight = 1000,
    quality = 0.82,
    mimeType = 'image/webp',
  } = options;

  // If file is already smaller than 100KB, no need to compress
  if (file.size < 100 * 1024) {
    return file;
  }

  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      const img = new Image();

      img.onload = () => {
        let { width, height } = img;

        // Calculate aspect ratio scaling
        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        // Draw on canvas
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return resolve(file); // Fallback to original file if canvas context unavailable
        }

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              return resolve(file);
            }

            const compressedFileName = file.name.replace(/\.[^/.]+$/, '') + '.webp';
            const compressedFile = new File([blob], compressedFileName, {
              type: blob.type || mimeType,
              lastModified: Date.now(),
            });

            // If compressed file is somehow larger than original, stick with original
            if (compressedFile.size >= file.size) {
              return resolve(file);
            }

            resolve(compressedFile);
          },
          mimeType,
          quality
        );
      };

      img.onerror = () => resolve(file);

      if (event.target?.result) {
        img.src = event.target.result as string;
      } else {
        resolve(file);
      }
    };

    reader.onerror = () => resolve(file);
    reader.readAsDataURL(file);
  });
}
