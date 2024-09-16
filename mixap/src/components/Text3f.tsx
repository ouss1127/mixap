import React, { useContext } from 'react';
import { extend } from '@react-three/fiber';
import { Text } from 'troika-three-text';
import useStore from '../hooks/useStore';

extend({ Text });

import fonts from '../fonts/fonts';
import { Plane } from '@react-three/drei';

import { RenderingOrder } from '../features/arview';
import { cos } from '@tensorflow/tfjs';
import { DoubleSide, MeshStandardMaterial, PlaneBufferGeometry } from 'three';

let currentText;

export function TextViewer() {
  return (
    <div
      style={{
        display: 'contents',
      }}>
      <div
        style={{
          width: '80%',
          margin: 'auto',
          marginTop: '50px',
          objectFit: 'cover',
          background: 'white',
          borderRadius: '10px',
        }}>
        <p
          style={{
            margin: '50px',
            marginLeft: '100px',
            marginRight: '100px',
            textAlign: 'justify',
          }}>
          {currentText}
        </p>
      </div>
    </div>
  );
}

export function Text3f(props: any) {
  const {
    text,
    visible = true,
    fontSize,
    fontFamily,
    fontStyle,
    fontWeight,
    textAlign,
    fontVariant,
    maxWidth,
    color,
    background,
    width,
    height,
    position,
    scale,
    factor,
  } = props;

  currentText = text;
  console.log(props);
  console.log('maxWidth', maxWidth);

  const setFullScreen = useStore((state) => state.playerSlice.setFullScreen);

  let planeOpacity;
  let isPlaneTransparent;

  if (background === 'transparent') {
    planeOpacity = 0;
    isPlaneTransparent = true;
  } else {
    planeOpacity = 1;
    isPlaneTransparent = false;
  }
  console.log('factor', factor);
  return (
    <group
      visible={visible}
      renderOrder={10}>
      {
        <mesh
          // @ts-ignore
          renderOrder={RenderingOrder.text}
          position={[0, 0, 0]}
          onClick={() => {
            console.log('INOD CLICKED TEXT');
            setFullScreen(true, 'text');
          }}>
          <planeBufferGeometry
            args={[width / factor, height / factor]}></planeBufferGeometry>
          <meshStandardMaterial
            toneMapped={false}
            color={background}
            opacity={planeOpacity}
            transparent={isPlaneTransparent}
            //depthTest={true}
            //depthWrite={false}
            //polygonOffset={true}
            //polygonOffsetUnits={4}
            //polygonOffsetFactor={4}
          />
          <text
            // @ts-ignore
            position={position}
            scale={scale}
            onClick={() => {
              console.log('INOD CLICKED TEXT');
              setFullScreen(true, 'text');
            }}
            // @ts-ignore
            material-transparent={true} // Ensure transparency is enabled
            material-depthWrite={false} // Prevents writing to the depth buffer
            material-depthTest={false} // Ensure it's tested against the depth buffer
            material-side={DoubleSide} // Make text visible from both sides
            fontSize={fontSize}
            //font={fonts[fontFamily][fontStyle + fontWeight]}
            maxWidth={maxWidth / 0.05}
            overflowWrap='break-word'
            color={color}
            outlineOpacity={1}
            outlineWidth={0.001}
            outlineColor={color}
            textAlign={textAlign}
            fillOpacity={1}
            text={fontVariant === 'small-caps' ? text?.toUpperCase() : text}
            //text={'FUCK ME'}
            strokeOpacity={0}></text>
        </mesh>
      }
    </group>
  );
}
