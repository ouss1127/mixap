import useLogger from '../../hooks/useLogger';
import React, { useLayoutEffect } from 'react';

import annoter from '../../assets/annoter.png';

export function Lasso({ canvasRef }: any) {
  const log = useLogger('Lasso');

  useLayoutEffect(() => {
    if (canvasRef?.current) {
      const canvas = document.createElement('canvas');
      const container = document.getElementById('three-canvas');

      //   const style = canvasRef.current.style;
      //   log.debug('style', style);

      const { width, height } = canvasRef.current;

      Object.assign(canvas, {
        // style,
        width,
        height,
      });

      Object.assign(canvas.style, {
        position: 'absolute',
        top: 0,
        left: 0,
      });

      log.debug('canvas', canvas);

      container?.appendChild(canvas);

      const ctx = canvas.getContext('2d');

      const image = new Image();
      image.src = annoter;
      image.width = 300;
      image.height = 200;

      image.src = annoter;

      log.debug('image', image);

      if (!ctx) return;

      ctx.drawImage(image, 10, 10);

      ctx.rect(10, 20, 150, 100);
      ctx.fill();

      log.debug('ctx', ctx);
    }
  }, [canvasRef]);

  return null;
}
