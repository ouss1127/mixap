
import { loadCompressImageBase64 } from '../../utils/loadImage';
import { Compiler } from './compiler';
import { computeStatistics, drawResultImage, resizeImage, loadImage } from '../imageAnalyzer/compiler-utils.js';
// import { Compiler } from 'mind-ar/src/image-target/compiler';

export const log = console.log;
export var stats;

const statCoef = {
  fill: 1,
  unique: 1,
  dimensions: 1
};

const compiler = new Compiler();

function dataUrlToFile(dataUrl: string, filename: string): File | undefined {
  const arr = dataUrl.split(',');
  if (arr.length < 2) { return undefined; }
  const mimeArr = arr[0].match(/:(.*?);/);
  if (!mimeArr || mimeArr.length < 2) { return undefined; }
  const mime = mimeArr[1];
  const buff = Buffer.from(arr[1], 'base64');
  return new File([buff], filename, {type:mime});
}

async function isBase64UrlImage(base64String: string) {
  let image = new Image()
  image.src = base64String
  return await (new Promise((resolve)=>{
    image.onload = function () {
      if (image.height === 0 || image.width === 0) {
        resolve(false);
        return;
      }
      resolve(true)
    }
    image.onerror = () =>{
      resolve(false)
    }
  }))
}

export async function compile({ fileList, compress }: any) {
  log('compile fileList, compress', fileList, compress);
  let images: HTMLImageElement[] | null = [];
  let resizedImages: HTMLImageElement[] | null = [];
  let statsArray: any[] = [];
  const files: Blob[] = [];
  const imagesBase64: any[] = [];
  const imagesCfg: any[] = [];
  let image, file, base64, worldWidth, worldHeight, imageFile;

  
  
  for (let i = 0; i < fileList.length; i++) {
    let fileFrom64 = fileList[i];

    if(await isBase64UrlImage(fileList[i]))
      {
         fileFrom64 = dataUrlToFile(fileList[i],"Image_"+i);
      }


    console.log("INOD fileList", fileFrom64);
    imageFile = await loadImage(fileFrom64);
    ({ image, file, base64, worldWidth, worldHeight } =
      await loadCompressImageBase64(fileList[i], { compress }));

    log('compile fileList', fileList[i]);
    const resizedImage = await resizeImage(imageFile, { targetSize: 800 });
    resizedImages.push(resizedImage);

    images.push(image);
    files.push(file);
    imagesBase64.push(base64);
    imagesCfg.push({ worldWidth, worldHeight });

    ////// compiles resized image to get image stats
    const data = await compiler.compileImageTargets(resizedImages, (/*progress: number*/) => {
      //
    });
    const stats = await ImageStats(data, images, i);
    statsArray.push(stats);
    console.log(statsArray);
  }

  let exportedBuffer = await compiler.exportData();

  const blob = new Blob([exportedBuffer], { type: 'text/plain' });

  images = null;
  //exportedBuffer = null;
  fileList = null;

  // needed return blob, files, imagesBase64, imagesCfg
  return { blob, files, imagesBase64, imagesCfg, statsArray };
}

function ImageStats(data, images, index) {
  const { imageList, matchingData } = data[index];

  const results = [];
  for (let i = 0; i < imageList.length; i++) {
    const targetImage = imageList[i];
    const points = [...matchingData[i].maximaPoints, ...matchingData[i].minimaPoints];
    const resultImage = drawResultImage(targetImage, points);
    //results.push({ points, resultImage, width: targetImage.width, height: targetImage.height });


    if (i === 0) {
      const stats = computeStatistics(targetImage, matchingData[i].maximaPoints, matchingData[i].minimaPoints);
      const minDimension = Math.min(images[index].width, images[index].height);
      const maxDimension = Math.max(images[index].width, images[index].height);
      const ratio = minDimension / maxDimension;

      let sizeScore = 5;
      if (minDimension < 1000) sizeScore = 4;
      if (minDimension < 800) sizeScore = 3;
      if (minDimension < 600) sizeScore = 2;
      if (minDimension < 400) sizeScore = 1;
      if (minDimension < 200) sizeScore = 0;

      let ratioScore = 5;
      if (ratio < 0.8) ratioScore = 4;
      if (ratio < 0.8) ratioScore = 3;
      if (ratio < 0.6) ratioScore = 2;
      if (ratio < 0.4) ratioScore = 1;
      if (ratio < 0.2) ratioScore = 0;

      let dimensionScore = (sizeScore + ratioScore) / 10;
      stats.dimensions = dimensionScore;
      stats.resultImage = resultImage;
      if (isNaN(stats.unique)) {
        stats.unique = 0;
      }
      if (isNaN(stats.fill)) {
        stats.fill = 0;
      }

      stats.overallRating = ((((stats.fill * statCoef.fill) + (stats.unique * statCoef.unique) + (stats.dimensions * statCoef.dimensions)) / (statCoef.fill + statCoef.unique + statCoef.dimensions)))
      console.log("STATS :  ", stats);
      return stats;
    }
  }
  //setResults(results);
  //setSelectedImageIndex(0);
}
