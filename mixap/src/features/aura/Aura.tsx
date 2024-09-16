import React from 'react';

import { AText } from './AText';
// import { AText } from './AText2';
import { AImage } from './AImage';
import { A3d } from './A3d';
import { APopover } from './APopover';
import { AVideo } from './AVideo';
import { AAudio } from './AAudio';
import { AArrow } from './AArrow';
import { AGeneration } from './AGeneration';
import { ALink } from './ALink';
// import { AList } from './AList';

export const Aura = ({
  mode,
  canvasRef,
  id,
  type,
  markerCfg = {},
  onChange,
  onDelete,
  anchoring,
}: any) => {
  let component;

  switch (type) {
    case 'AText':
      component = (
        <AText
          canvasRef={canvasRef}
          id={id}
          markerCfg={markerCfg}
          mode={mode}
          onChange={onChange}
          onDelete={onDelete}
        />
      );
      break;
    case 'AImage':
      component = (
        <AImage
          canvasRef={canvasRef}
          id={id}
          markerCfg={markerCfg}
          mode={mode}
          onChange={onChange}
          onDelete={onDelete}
        />
      );
      break;
    case 'A3d':
      component = (
        <A3d
          canvasRef={canvasRef}
          id={id}
          markerCfg={markerCfg}
          anchoring={anchoring}
          mode={mode}
          onChange={onChange}
          onDelete={onDelete}
        />
      );
      break;
    case 'APopover':
      component = (
        <APopover
          canvasRef={canvasRef}
          id={id}
          markerCfg={markerCfg}
          anchoring={anchoring}
          mode={mode}
          onChange={onChange}
          onDelete={onDelete}
        />
      );
      break;
    case 'AVideo':
      component = (
        <AVideo
          id={id}
          markerCfg={markerCfg}
          anchoring={anchoring}
          mode={mode}
          onChange={onChange}
          onDelete={onDelete}
        />
      );
      break;
    case 'AAudio':
      component = (
        <AAudio
          canvasRef={canvasRef}
          id={id}
          markerCfg={markerCfg}
          anchoring={anchoring}
          mode={mode}
          onChange={onChange}
          onDelete={onDelete}
        />
      );
      break;
    case 'AArrow':
      component = (
        <AArrow
          canvasRef={canvasRef}
          id={id}
          markerCfg={markerCfg}
          mode={mode}
          onChange={onChange}
          onDelete={onDelete}
        />
      );
      break;
    case 'ALink':
      component = (
        <ALink
          canvasRef={canvasRef}
          id={id}
          markerCfg={markerCfg}
          mode={mode}
          onChange={onChange}
          onDelete={onDelete}
        />
      );
      break;
    case 'AGeneration':
      component = (
        <AGeneration
          canvasRef={canvasRef}
          id={id}
          markerCfg={markerCfg}
          mode={mode}
          onChange={onChange}
          onDelete={onDelete}
        />
      );
      break;
    // case 'AList':
    //   component = (
    //     <AList
    //       canvasRef={canvasRef}
    //       id={id}
    //       markerCfg={markerCfg}
    //       mode={mode}
    //       onChange={onChange}
    //       onDelete={onDelete}
    //     />
    //   );
    //   break;
    default:
      break;
  }
  return component;
};
