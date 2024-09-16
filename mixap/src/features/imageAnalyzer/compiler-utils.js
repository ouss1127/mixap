import hammingCompute from './hamming-distance';

export const loadImage = (file) => {
  return new Promise(async (resolve, reject) => { 
    if (!file.type.match( 'image.*' )) reject();

    const image = document.createElement( 'img' );
    image.addEventListener('load', () => {
      resolve(image);
    });

    const reader = new FileReader();
    reader.addEventListener( 'load', async (event) => {
      const src = event.target.result;
      image.src = src;
    });
    reader.readAsDataURL(file);
  });
}

export const resizeImage = (image, {targetSize}) => {
  return new Promise((resolve, reject) => {
    const width = parseInt(image.width > image.height? targetSize: targetSize * image.width/image.height);
    const height = parseInt(image.width > image.height? targetSize * image.height/image.width: targetSize);

    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    canvas.width = width;
    canvas.height = height;

    context.drawImage(image, 0, 0, width, height);

    const newImage = new Image();
    newImage.onload = () => {
      //console.log("new image", newImage, newImage.width, newImage.height);
      resolve(newImage);
    }
    newImage.src = canvas.toDataURL();
  });
}

export const drawResultImage = (inputImage, points) => {
  console.log("input", inputImage);
  const data = new Uint8ClampedArray(inputImage.height * inputImage.width * 4);
  for (let i = 0; i < inputImage.height * inputImage.width; i++) {
    data[i * 4 + 0] = inputImage.data[i];
    data[i * 4 + 1] = inputImage.data[i];
    data[i * 4 + 2] = inputImage.data[i];
    data[i * 4 + 3] = 255;
  }
  const imageData = new ImageData(data, inputImage.width, inputImage.height);

  const canvas = document.createElement('canvas');
  canvas.width = inputImage.width;
  canvas.height = inputImage.height;
  const ctx = canvas.getContext('2d');
  ctx.putImageData(imageData, 0, 0);
  //ctx.drawImage(targetImage, 0, 0);
  
  for (let i = 0; i < points.length; i++) {
    const {x, y, scale} = points[i];
    const radius = Math.pow(2, scale/2);

    const color = "#FF0000";
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI, false);
    ctx.fillStyle = color;
    ctx.lineWidth = 1;
    ctx.strokeStyle = color;
    ctx.stroke();
  }

  const image = new Image();
  //image.style.width = imageData.width / 4;
  image.src = canvas.toDataURL();
  return image;
}

export const computeStatistics = (inputImage, maximaPoints, minimaPoints) => {
  const {width, height} = inputImage;
  const points = [...maximaPoints, ...minimaPoints];

  const nPerDimension = 10;
  const buckets = [];
  for (let i = 0; i < nPerDimension * nPerDimension; i++) {
    buckets.push(0);
  }

  for (let i = 0; i < points.length; i++) {
    const bucketX = Math.floor(points[i].x / width * nPerDimension);
    const bucketY = Math.floor(points[i].y / height * nPerDimension);
    const bucket = bucketY * nPerDimension + bucketX;
    buckets[bucket] += 1;
  }

  let emptyBucket = 0;
  for (let i = 0; i < buckets.length; i++) {
    if (buckets[i] === 0) emptyBucket += 1;
  }

  let sum = 0;
  for (let i = 0; i < buckets.length; i++) {
    sum += buckets[i];
  }
  let avg = sum / (nPerDimension * nPerDimension);

  let sumSquareDiff = 0;
  for (let i = 0; i < buckets.length; i++) {
    sumSquareDiff += (avg - buckets[i]) * (avg - buckets[i]);
  }
  const sd = Math.sqrt(sumSquareDiff / (nPerDimension * nPerDimension));

  const computeRepeat = (points, threshold) => {
    let count = 0;
    for (let i = 0; i < points.length; i++) {
      let minD = 1000;
      for (let j = 0; j < points.length; j++) {
	if (i === j) continue;
	const d = hammingCompute({v1: points[i].descriptors, v2: points[j].descriptors});
	minD = Math.min(minD, d);
      }
      if (minD < threshold) count += 1;
    }
    return count;
  }
  const threshold = 50;
  const repeatCount1 = computeRepeat(maximaPoints, threshold);
  const repeatCount2 = computeRepeat(minimaPoints, threshold);

  const unique = 1 - (repeatCount1 + repeatCount2) / (maximaPoints.length + minimaPoints.length);
  const fill = 1 - emptyBucket / (nPerDimension * nPerDimension);
  const resultImage = new Image();
  const dimensions = 0;
  const overallRating = 0;

  return {fill, unique, dimensions, resultImage, overallRating};
}

