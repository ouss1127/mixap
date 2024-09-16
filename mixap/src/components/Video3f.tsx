import React, { useState, useEffect, useMemo, useContext } from 'react';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { context, useThree } from '@react-three/fiber';
import { useSpring, animated } from '@react-spring/web';
import Modal from 'antd/es/modal/Modal';
import { Button, Layout, Steps, Space, Typography, message } from 'antd';
import { RenderingOrder } from '../features/arview';
import useStore from '../hooks/useStore';

import { Spin } from 'antd';

import {
  UndoOutlined,
  SoundOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
} from '@ant-design/icons';
import { useAspect } from '../hooks/useAspect';

/** @jsxImportSource @emotion/react */
// import { css } from '@emotion/react';

let currentVideo;
const planeRendering = false;

const Texture = ({
  url,
  scale,
  factor,
  anchoring = true,
  width = 1,
  height = 1,
  position,
  audioOnly = false,
  aspect = false,
}: {
  url: any;
  scale: any;
  factor: number;
  position?: any;
  anchoring?: boolean;
  audioOnly?: boolean;
  aspect?: boolean;
  width?: number;
  height?: number;
  onChange?: any;
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [video, setVideo] = useState<any>(null);
  const [playing, setPlaying] = useState<boolean>(false);
  const [active, setActive] = useState<boolean>(false);
  const [isMeshRendering, setMeshRendering] = useState<boolean>(false);
  const setFullScreen = useStore((state) => state.playerSlice.setFullScreen);
  const isFullScreen = useStore((state) => state.playerSlice.isFullScreen);
  const [webcamOn, setWebcamOn] = useState(true);

  const { viewport, size } = useThree();
  const maxWidth = (2 * size.width) / 3;
  const maxHeight = (2 * size.height) / 3;
  const p = position ? position : [0, 0, 0];
  const s = scale ? scale : [viewport.width / 2, viewport.height / 2, 1];
  const { newWidth, newHeight } = aspect
    ? useAspect({
        width,
        height,
        maxWidth,
        maxHeight,
      })
    : { newWidth: width, newHeight: height };

  const styles = useSpring({
    opacity: active ? 1 : playing && !audioOnly ? 0 : 1,
  });

  currentVideo = video;

  useEffect(() => {
    const handlePlaying = (/*event*/) => {
      setPlaying(true);
    };

    const handlePausing = (/*event*/) => {
      setPlaying(false);
    };

    const handleEnded = (/*event*/) => {
      setPlaying(false);
    };

    if (!video) {
      const videoElement = window.document.createElement('video');

      videoElement.src = '';
      videoElement.crossOrigin = 'Anonymous';
      videoElement.loop = false;
      videoElement.playsInline = true;
      videoElement.muted = false; //!shallPlayAudio;
      videoElement.volume = 1;
      videoElement.preload = 'metadata';

      setVideo(videoElement);

      videoElement.addEventListener('playing', handlePlaying);
      videoElement.addEventListener('pause', handlePausing);
      videoElement.addEventListener('ended', handleEnded);
    }

    return () => {
      if (!video) return;

      video.removeEventListener('playing', handlePlaying);
      video.removeEventListener('pause', handlePausing);
      video.removeEventListener('ended', handleEnded);

      video.pause();
      video.currentTime = 0;
    };
  }, [video]);

  useMemo(() => {
    if (url && video) {
      video.src = url;
      video.currentTime = 0.5;
      setLoading(false);
    }
  }, [video, url]);

  const play = () => {
    if (!video) return;
    video.play();
  };

  const pause = () => {
    if (!video) return;
    video.pause();
  };

  const replay = () => {
    if (!video) return;
    video.pause();
    video.currentTime = 0;
    video.play();
  };
  return (
    <>
      {url && (
        <mesh
          onBeforeRender={() => {
            setMeshRendering(true);
          }}
          onClick={() => {
            setFullScreen(true, 'video');
          }}
          renderOrder={RenderingOrder.video}
          position={p}
          scale={aspect ? [1, 1, 1] : s}>
          {audioOnly ? null : (
            <planeBufferGeometry
              args={[newWidth / factor, newHeight / factor]}
              attach='geometry'
            />
          )}

          {video && (
            <meshBasicMaterial
              transparent={true}
              toneMapped={false}
              depthTest={true}
              depthWrite={false}
              polygonOffset={true}
              polygonOffsetUnits={0}
              polygonOffsetFactor={0}>
              <videoTexture
                attach='map'
                args={[video]}
                encoding={THREE.sRGBEncoding}
              />
            </meshBasicMaterial>
          )}

          {video && !isFullScreen && webcamOn && (
            <Html
              css={{
                userDrag: 'none',
                userSelect: 'none',
                visibility: isMeshRendering ? 'visible' : 'hidden',
              }}
              position={[0, 0, 0.1]}
              occlude
              center
              //zIndexRange={[4,14]}
            >
              <animated.div
                onPointerOver={() => setActive(true)}
                onPointerOut={() => setActive(false)}
                //style={styles}
                css={{ transform: 'scale(3)', display: 'flex' }}>
                {!playing &&
                  (audioOnly ? (
                    <SoundOutlined
                      css={{
                        color: 'var(--primary-color)',
                        background: '#fff',
                        borderRadius: '50%',
                        padding: 2,
                        visibility: 'visible',
                      }}
                      onClick={play}
                    />
                  ) : (
                    <PlayCircleOutlined
                      css={{ color: 'var(--primary-color)' }}
                      onClick={play}
                    />
                  ))}
                {playing && (
                  <>
                    <PauseCircleOutlined
                      css={{ color: 'var(--primary-color)', marginRight: 4 }}
                      onClick={pause}
                    />
                    <UndoOutlined
                      css={{ color: 'var(--primary-color)' }}
                      onClick={replay}
                    />
                  </>
                )}
              </animated.div>
            </Html>
          )}
        </mesh>
      )}
      <Html center>{loading && <Spin />}</Html>
    </>
  );
};

export function VideoViewer() {
  return (
    <div
      style={{
        display: 'contents',
      }}>
      <video
        src={currentVideo.src}
        controls
        style={{ height: '50%', margin: 'auto', objectFit: 'cover' }}></video>
    </div>
  );
}

export function Video3f(props: any) {
  const { file, ...others } = props;

  const [url, setUrl] = useState<any>(null);

  useEffect(() => {
    if (!file) return;

    let objectUrl;
    const urlCreator = window.URL || window.webkitURL;

    if (typeof file === 'string' || file instanceof String) {
      setUrl(file);
    } else {
      objectUrl = urlCreator.createObjectURL(file);
      setUrl(objectUrl);
    }

    return () => {
      urlCreator.revokeObjectURL(objectUrl);
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
