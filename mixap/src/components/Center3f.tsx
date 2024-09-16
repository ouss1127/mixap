import React from 'react';
import { useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';

export function Center3f(props: any) {
  const { children, top = 0, left = 0 } = props;
  const { viewport, size } = useThree();

  return (
    <group
      position={[viewport.width / 2 + left, -viewport.height / 2 + top, 0]}>
      {/* <Html
        calculatePosition={() => [0, 0]}
        style={{
          border: '2px dashed #1890ff',
          width: size.width,
          height: size.height,
        }}></Html> */}
      {children}
    </group>
  );
}
