import React, { useState, useEffect, useRef } from 'react';
import Zoom from 'react-medium-image-zoom';

/** @jsxImportSource @emotion/react */
// import { css } from '@emotion/react';

import { useAspect } from '../hooks/useAspect';
import { getBase64, getImgWidthHeight } from '../utils/loadImage';
import { ImgCrop } from './ImgCrop';

export function Imager({
  file,
  maxWidth,
  maxHeight,
  shouldZoom = false,
  shouldCrop = false,
  onCropComplete,
}: {
  file: any;
  maxWidth: number;
  maxHeight: number;
  shouldZoom?: boolean;
  shouldCrop?: boolean;
  aspect?: boolean;
  onCropComplete?: (blob: any) => void;
}) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [previewImage, setPreviewImage] = useState<any>('');
  const [width, setWidth] = useState<number>(0);
  const [height, setHeight] = useState<number>(0);

  let newWidth = 0;
  let newHeight = 0;
  ({ newWidth, newHeight } = useAspect({
    width,
    height,
    maxWidth,
    maxHeight,
  }));

  useEffect(() => {
    if (!file) return;

    if (typeof file === 'string' || file instanceof String) {
      (async () => {
        const { width, height } = await getImgWidthHeight(file);
        setWidth(width);
        setHeight(height);
        setPreviewImage(file);
      })();
    } else {
      (async () => {
        const base64 = (await getBase64(file)) as string;
        const { width, height } = await getImgWidthHeight(base64);
        setWidth(width);
        setHeight(height);
        setPreviewImage(base64);
      })();
    }
  }, [file]);

  let image = (
    <img
      id='marker-image'
      ref={imgRef}
      css={{
        zIndex: -100,
        marginLeft: 'auto',
        marginRight: 'auto',
        display: 'flex',
        width: newWidth,
        height: newHeight,
      }}
      alt='Image Editable...'
      src={previewImage}
      width={newWidth || 0}
      height={newHeight || 0}
    />
  );

  if (shouldCrop) {
    image = (
      <ImgCrop
        imgRef={imgRef}
        onComplete={onCropComplete}>
        {image}
      </ImgCrop>
    );
  }

  if (shouldZoom) {
    image = <Zoom wrapStyle={{ zIndex: 0 }}>{image}</Zoom>;
  }

  return image;
}
