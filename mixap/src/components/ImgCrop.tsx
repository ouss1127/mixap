import React, {
  ReactNode,
  RefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import ReactCrop, { Crop, PixelCrop } from 'react-image-crop';

import { Button, Space } from 'antd';

import CropOutlinedIcon from '@mui/icons-material/CropOutlined';

/** @jsxImportSource @emotion/react */
// import { css } from '@emotion/react';

import 'react-image-crop/dist/ReactCrop.css';

import useLogger from '../hooks/useLogger';
import { SaveOutlined } from '@ant-design/icons';
import useStore from '../hooks/useStore';
import { Spinner } from './Spinner';
import { toBlob } from '../utils/canvas';
import { useTrace } from '../hooks/useTrace';
import { TRACES } from '../db/traces';

const TO_RADIANS = Math.PI / 180;

export function ImgCrop({
  imgRef,
  children,
  onComplete,
}: {
  imgRef: RefObject<HTMLImageElement>;
  children: ReactNode;
  onComplete?: (blob: any) => void;
}) {
  const log = useLogger('ImgCrop');
  const time = useRef<number>(0);

  log.debug('Render');

  const cropping = useStore((state) => state.mkUploadSlice.cropping);
  const setCropping = useStore((state) => state.mkUploadSlice.setCropping);

  const { trace } = useTrace({});

  const [saving, setSaving] = useState<boolean>(false);
  const [crop, setCrop] = useState<Crop>({
    unit: 'px', // Can be 'px' or '%'
    x: 25,
    y: 25,
    width: 100,
    height: 100,
  });
  const [scale] = useState<number>(1);
  const [rotate] = useState<number>(0);
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>({
    unit: 'px', // Can be 'px' or '%'
    x: 25,
    y: 25,
    width: 100,
    height: 100,
  });

  const handleSave = useCallback(async () => {
    log.debug('completedCrop', completedCrop);

    setSaving(true);
    setCropping(false);

    const canvas = document.createElement('canvas');
    if (!imgRef.current) {
      log.error('imgRef is ', imgRef);
      return;
    }

    toCanvas(imgRef.current, canvas, completedCrop as PixelCrop, scale, rotate);

    const blob = await toBlob(canvas);

    onComplete && onComplete(blob);

    setTimeout(() => {
      setSaving(false);
    }, 500);

    trace(TRACES.EXIT_CROP_MARKER, {
      duration: Date.now() - time.current,
    });
  }, [completedCrop, scale, rotate, onComplete, setSaving, setCropping]);

  const handleComplete = useCallback((crop) => {
    log.debug('handleComplete', crop);

    if (crop?.width === 0 || crop?.height === 0) {
      // e.g., cancel
      setSaving(false);
      setCropping(false);

      return;
    }

    setCompletedCrop(crop);
  }, []);

  return (
    <>
      {saving && <Spinner tip='Enregistrement...' />}
      <Space
        direction='vertical'
        css={{
          position: 'absolute',
          right: '-32px',
          top: `50%`,
          transform: `translate(50%, 0px)`,
        }}>
        {!cropping && (
          <Button
            type='text'
            size='large'
            onClick={() => {
              setCropping(!cropping);

              time.current = Date.now();
              trace(TRACES.ENTER_CROP_MARKER);
            }}
            icon={<CropOutlinedIcon />}
          />
        )}
        {cropping && (
          <Button
            type='primary'
            size='large'
            onClick={handleSave}
            icon={<SaveOutlined />}
          />
        )}
      </Space>

      {cropping && (
        <ReactCrop
          crop={crop}
          onChange={(_, percent) => setCrop(percent)}
          onComplete={handleComplete}>
          {children}
        </ReactCrop>
      )}

      {saving && (
        <ReactCrop
          crop={crop}
          onChange={() => {
            //
          }}
          onComplete={() => {
            //
          }}>
          {children}
        </ReactCrop>
      )}

      {!saving && !cropping && children}
    </>
  );
}

export async function toCanvas(
  image: HTMLImageElement,
  canvas: HTMLCanvasElement,
  crop: PixelCrop,
  scale = 1,
  rotate = 0,
) {
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('No 2d context');
  }

  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;
  // devicePixelRatio slightly increases sharpness on retina devices
  // at the expense of slightly slower render times and needing to
  // size the image back down if you want to download/upload and be
  // true to the images natural size.
  const pixelRatio = window.devicePixelRatio;
  // const pixelRatio = 1

  canvas.width = Math.floor(crop.width * scaleX * pixelRatio);
  canvas.height = Math.floor(crop.height * scaleY * pixelRatio);

  ctx.scale(pixelRatio, pixelRatio);
  ctx.imageSmoothingQuality = 'high';

  const cropX = crop.x * scaleX;
  const cropY = crop.y * scaleY;

  const rotateRads = rotate * TO_RADIANS;
  const centerX = image.naturalWidth / 2;
  const centerY = image.naturalHeight / 2;

  ctx.save();

  // 5) Move the crop origin to the canvas origin (0,0)
  ctx.translate(-cropX, -cropY);
  // 4) Move the origin to the center of the original position
  ctx.translate(centerX, centerY);
  // 3) Rotate around the origin
  ctx.rotate(rotateRads);
  // 2) Scale the image
  ctx.scale(scale, scale);
  // 1) Move the center of the image to the origin (0,0)
  ctx.translate(-centerX, -centerY);
  ctx.drawImage(
    image,
    0,
    0,
    image.naturalWidth,
    image.naturalHeight,
    0,
    0,
    image.naturalWidth,
    image.naturalHeight,
  );

  ctx.restore();
}
