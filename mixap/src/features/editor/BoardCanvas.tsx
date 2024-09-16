import React, { Suspense, forwardRef, useContext } from 'react';
import { Canvas } from '@react-three/fiber';
import { RxProvider } from '../../db/RxProvider';

export const BoardCanvas = forwardRef(({ style, children }: any, ref: any) => {
  return (
    <Canvas
      id='three-canvas'
      ref={ref}
      // legacy={true}
      // gl={{ alpha: false, physicallyCorrectLights: true }}
      style={{
        height: 'calc(100% - 64px - 32px)',
        background: 'none',
        border: '1px dashed var(--active-color)',
        //position: 'absolute',
        ...style,
      }}
      dpr={[1, 2]}>
      <ambientLight />
      <Suspense fallback={null}>
        <RxProvider>{children}</RxProvider>
      </Suspense>
    </Canvas>
  );
});
