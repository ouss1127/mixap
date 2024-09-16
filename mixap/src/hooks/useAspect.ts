import React from 'react';

export function calcAspect({
  width,
  height,
  maxWidth,
  maxHeight,
}: {
  width: number;
  height: number;
  maxWidth: number;
  maxHeight: number;
}) {
  let ratio = 0;
  const le = width > height ? width : height; //long edge

  if (maxWidth < maxHeight) {
    ratio = maxWidth / le;
  } else {
    ratio = maxHeight / le;
  }

  return { newWidth: width * ratio, newHeight: height * ratio };
}

export function useAspect({
  width,
  height,
  maxWidth,
  maxHeight,
}: {
  width: number;
  height: number;
  maxWidth: number;
  maxHeight: number;
}) {
  return calcAspect({ width, height, maxWidth, maxHeight });
}
