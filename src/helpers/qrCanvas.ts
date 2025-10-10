export interface QRCanvasOptions {
  qrImageBlob: Blob;
  bgColor: string;
  dotColor: string;
  downloadSize: number;
  qrMargin: number;
  borderRadius: number;
  borderWidth: number;
  backgroundBorderStyle: 'rounded' | 'square';
}

export interface CanvasDrawingParams {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  img: HTMLImageElement;
  bgColor: string;
  dotColor: string;
  downloadSize: number;
  padding: number;
  totalSize: number;
  borderRadius: number;
  borderWidth: number;
  backgroundBorderStyle: 'rounded' | 'square';
}

/**
 * Calculates the padding based on QR margin
 * @param qrMargin - The margin value (0-50)
 * @param downloadSize - The desired download size
 * @returns Scaled padding value
 */
export function calculatePadding(qrMargin: number, downloadSize: number): number {
  return (qrMargin / 200) * downloadSize;
}

/**
 * Calculates the total canvas size including padding and border
 * @param downloadSize - The QR code size
 * @param padding - The padding around the QR code
 * @param scaledBorderWidth - The scaled border width
 * @returns Total canvas size
 */
export function calculateTotalSize(downloadSize: number, padding: number, scaledBorderWidth: number): number {
  return downloadSize + padding * 2 + scaledBorderWidth;
}

/**
 * Calculates the scaled border radius
 * @param borderRadius - The border radius value (0-50)
 * @param downloadSize - The desired download size
 * @returns Scaled border radius
 */
export function calculateScaledBorderRadius(borderRadius: number, downloadSize: number): number {
  return (borderRadius / 300) * downloadSize;
}

/**
 * Calculates the scaled border width
 * @param borderWidth - The border width value (0-20)
 * @param downloadSize - The desired download size
 * @returns Scaled border width
 */
export function calculateScaledBorderWidth(borderWidth: number, downloadSize: number): number {
  return (borderWidth / 300) * downloadSize;
}

/**
 * Draws a rounded rectangle path on the canvas
 * @param ctx - Canvas 2D context
 * @param totalSize - Size of the rectangle
 * @param radius - Corner radius
 * @param inset - Optional inset from edges (default 0)
 */
export function drawRoundedRectPath(
  ctx: CanvasRenderingContext2D,
  totalSize: number,
  radius: number,
  inset: number = 0
): void {
  const size = totalSize - inset * 2;
  ctx.beginPath();
  ctx.moveTo(inset + radius, inset);
  ctx.lineTo(inset + size - radius, inset);
  ctx.quadraticCurveTo(inset + size, inset, inset + size, inset + radius);
  ctx.lineTo(inset + size, inset + size - radius);
  ctx.quadraticCurveTo(inset + size, inset + size, inset + size - radius, inset + size);
  ctx.lineTo(inset + radius, inset + size);
  ctx.quadraticCurveTo(inset, inset + size, inset, inset + size - radius);
  ctx.lineTo(inset, inset + radius);
  ctx.quadraticCurveTo(inset, inset, inset + radius, inset);
  ctx.closePath();
}

/**
 * Draws the background on the canvas
 * @param params - Canvas drawing parameters
 */
export function drawBackground(params: CanvasDrawingParams): void {
  const { ctx, bgColor, totalSize, backgroundBorderStyle, borderRadius, borderWidth, downloadSize } = params;
  
  ctx.fillStyle = bgColor;
  
  // Inset the background by half the border width to prevent it from showing outside the border
  const scaledBorderWidth = calculateScaledBorderWidth(borderWidth, downloadSize);
  const inset = scaledBorderWidth / 2;
  
  if (backgroundBorderStyle === 'rounded') {
    const radius = calculateScaledBorderRadius(borderRadius, downloadSize);
    drawRoundedRectPath(ctx, totalSize, radius, inset);
    ctx.fill();
  } else {
    ctx.fillRect(inset, inset, totalSize - scaledBorderWidth, totalSize - scaledBorderWidth);
  }
}

/**
 * Draws the border on the canvas
 * @param params - Canvas drawing parameters
 */
export function drawBorder(params: CanvasDrawingParams): void {
  const { ctx, dotColor, borderWidth, totalSize, backgroundBorderStyle, borderRadius, downloadSize } = params;
  
  if (borderWidth <= 0) return;
  
  const scaledBorderWidth = calculateScaledBorderWidth(borderWidth, downloadSize);
  ctx.strokeStyle = dotColor;
  ctx.lineWidth = scaledBorderWidth;
  
  // Inset the stroke by half the border width to prevent clipping
  const inset = scaledBorderWidth / 2;
  
  if (backgroundBorderStyle === 'rounded') {
    const radius = calculateScaledBorderRadius(borderRadius, downloadSize);
    drawRoundedRectPath(ctx, totalSize, radius, inset);
    ctx.stroke();
  } else {
    ctx.strokeRect(inset, inset, totalSize - scaledBorderWidth, totalSize - scaledBorderWidth);
  }
}

/**
 * Draws the QR code image on the canvas
 * @param params - Canvas drawing parameters
 */
export function drawQRCode(params: CanvasDrawingParams): void {
  const { ctx, img, padding, downloadSize, borderWidth } = params;
  const scaledBorderWidth = calculateScaledBorderWidth(borderWidth, downloadSize);
  // Position QR code after border width and padding
  const offset = scaledBorderWidth / 2 + padding;
  ctx.drawImage(img, offset, offset, downloadSize, downloadSize);
}

/**
 * Performs the complete canvas drawing operation
 * @param params - Canvas drawing parameters
 */
export function drawCompleteCanvas(params: CanvasDrawingParams): void {
    drawBackground(params);
    drawQRCode(params);
  drawBorder(params);
}

/**
 * Creates and configures a canvas for QR code rendering
 * @param options - QR canvas options
 * @returns Promise that resolves with the configured canvas
 */
export async function createQRCanvas(options: QRCanvasOptions): Promise<HTMLCanvasElement> {
  const {
    qrImageBlob,
    bgColor,
    dotColor,
    downloadSize,
    qrMargin,
    borderRadius,
    borderWidth,
    backgroundBorderStyle,
  } = options;

  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      reject(new Error('Failed to get canvas context'));
      return;
    }

    const img = new Image();
    
    img.onload = () => {
      try {
        const padding = calculatePadding(qrMargin, downloadSize);
        const scaledBorderWidth = calculateScaledBorderWidth(borderWidth, downloadSize);
        const totalSize = calculateTotalSize(downloadSize, padding, scaledBorderWidth);
        
        canvas.width = totalSize;
        canvas.height = totalSize;

        const params: CanvasDrawingParams = {
          canvas,
          ctx,
          img,
          bgColor,
          dotColor,
          downloadSize,
          padding,
          totalSize,
          borderRadius,
          borderWidth,
          backgroundBorderStyle,
        };

        drawCompleteCanvas(params);
        
        URL.revokeObjectURL(img.src);
        resolve(canvas);
      } catch (error) {
        URL.revokeObjectURL(img.src);
        reject(error);
      }
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(img.src);
      reject(new Error('Failed to load QR code image'));
    };
    
    img.src = URL.createObjectURL(qrImageBlob);
  });
}

/**
 * Triggers a download of the canvas as a PNG file
 * @param canvas - The canvas to download
 * @param filename - The filename for the downloaded file
 */
export function downloadCanvas(canvas: HTMLCanvasElement, filename: string = 'qr-code.png'): void {
  const link = document.createElement('a');
  link.download = filename;
  link.href = canvas.toDataURL('image/png');
  link.click();
}
