import React, {
  useState,
  useContext,
  useEffect,
  useRef,
  forwardRef,
} from 'react';
import { Html, useTexture } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import { Image } from 'antd';
import { useAspect } from '../hooks/useAspect';
import { RenderingOrder } from '../features/arview';
import useStore from '../hooks/useStore';

/** @jsxImportSource @emotion/react */
// import { css } from '@emotion/react';

let currentImage;

function Texture(props: any) {
  const {
    url,
    position,
    scale,
    width,
    height,
    aspect = false,
    marker = false,
    factor,
    ...others
  } = props;
  const { viewport, size } = useThree();
  const maxWidth = (2 * size.width) / 3;
  const maxHeight = (2 * size.height) / 3;
  const s = scale ? scale : [viewport.width / 2, viewport.height / 2, 1];
  const p = position ? position : [0, 0, 0];

  const setFullScreen = useStore((state) => state.playerSlice.setFullScreen);

  const texture: any = useTexture(url);

  currentImage = url;

  const { newWidth, newHeight } = aspect
    ? useAspect({
        width,
        height,
        maxWidth,
        maxHeight,
      })
    : { newWidth: width, newHeight: height };

  return (
    <>
      {url && marker && (
        <Html
          center
          css={{ opacity: 0.5 }}
          zIndexRange={[-1000000000000001, -1000000000000001]}>
          <img
            css={{
              zIndex: 0,
              marginLeft: 'auto',
              marginRight: 'auto',
              width: newWidth,
              height: newHeight,
              pointerEvents: 'none',
              userSelect: 'none',
              userDrag: 'none',
            }}
            alt='Image Editable...'
            src={url}
            width={newWidth}
            height={newHeight}
          />
        </Html>
      )}
      {url && !marker && (
        <mesh
          onClick={() => {
            setFullScreen(true, 'image');
          }}
          renderOrder={RenderingOrder.image}
          position={p}
          scale={aspect ? [1, 1, 1] : s}>
          <planeBufferGeometry
            args={[newWidth / factor, newHeight / factor]}
            attach='geometry'
          />
          <meshStandardMaterial
            {...others}
            toneMapped={false}
            precision='highp'
            attach='material'
            map={texture}
            transparent={true}
            depthTest={true}
            depthWrite={false}
            polygonOffset={true}
            polygonOffsetUnits={4}
            polygonOffsetFactor={4}
          />
        </mesh>
      )}
    </>
  );
}

export function ImageViewer() {
  const isFullScreen = useStore((state) => state.playerSlice.isFullScreen);

  const setFullScreen = useStore((state) => state.playerSlice.setFullScreen);

  return (
    <div>
      <Image
        style={{ display: 'none' }}
        preview={{
          visible: isFullScreen,
          src: currentImage,

          onVisibleChange: (value) => {
            setFullScreen(value, '');
          },
        }}></Image>
    </div>
  );
}

export function Image3f(props: any) {
  const { file, ...others } = props;

  const [url, setUrl] = useState<any>(null);

  useEffect(() => {
    if (!file) return;

    let objectUrl: string | undefined;
    const urlCreator = window.URL || window.webkitURL;

    if (typeof file === 'string' || file instanceof String) {
      setUrl(file as string);
    } else if (file instanceof Blob || file instanceof File) {
      objectUrl = urlCreator.createObjectURL(file);
      setUrl(objectUrl);
    } else {
      console.error('Invalid file type:', file);
    }

    return () => {
      if (objectUrl) {
        urlCreator.revokeObjectURL(objectUrl);
      }
    };
  }, [file]);

  return (
    url && (
      <Texture
        {...others}
        url={url}
      />
    )
  );
}
