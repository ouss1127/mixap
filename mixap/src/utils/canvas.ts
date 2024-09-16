export function toBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve: any) => {
    canvas.toBlob(resolve);
  });
}
