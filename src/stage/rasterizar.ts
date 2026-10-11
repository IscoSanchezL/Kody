/**
 * Convierte una imagen SVG (data URI) en un lienzo de tamaño exacto.
 * Se usa onload (no decode) y drawImage con medidas explícitas porque así se comporta igual
 * en Chrome, Edge y Safari.
 */
export function rasterizar(src: string, ancho: number, alto: number): Promise<HTMLCanvasElement> {
  return new Promise((resolver, rechazar) => {
    const img = new Image();
    img.onload = () => {
      const lienzo = document.createElement('canvas');
      lienzo.width = ancho;
      lienzo.height = alto;
      const ctx = lienzo.getContext('2d');
      if (!ctx) return rechazar(new Error('sin lienzo 2D'));
      ctx.drawImage(img, 0, 0, ancho, alto);
      resolver(lienzo);
    };
    img.onerror = () => rechazar(new Error('no se pudo cargar el dibujo'));
    img.src = src;
  });
}
