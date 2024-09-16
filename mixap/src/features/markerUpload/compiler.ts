import { Compiler } from 'mind-ar/src/image-target/compiler';

import { loadImageBase64 } from '../../utils/loadImage';
import { logger } from '../../hooks/useLogger';

const compiler = new Compiler();
const log = logger('Marker Compiler');

export async function compile(fileList) {
  log.debug('compile fileList', fileList);
  let images: HTMLImageElement[] | null = [];
  const files: Blob[] = [];
  const imagesBase64: any[] = [];
  const imagesCfg: any[] = [];
  let image, file, base64, worldWidth, worldHeight;

  for (let i = 0; i < fileList.length; i++) {
    // image = await loadImage(fileList[i]);
    ({ image, file, base64, worldWidth, worldHeight } = await loadImageBase64(
      fileList[i],
    ));

    log.debug('compile fileList', fileList[i], image);

    images.push(image);
    files.push(file);
    imagesBase64.push(base64);
    imagesCfg.push({ worldWidth, worldHeight });
  }

  await compiler.compileImageTargets(images, (/*progress: number*/) => {
    //
  });

  let exportedBuffer = await compiler.exportData();
  const blob = new Blob([exportedBuffer], { type: 'text/plain' });

  images = null;
  exportedBuffer = null;
  fileList = null;

  console.log(blob);
  console.log(files);
  console.log(imagesBase64);
  console.log(imagesCfg);

  return { blob, files, imagesBase64, imagesCfg };
}
