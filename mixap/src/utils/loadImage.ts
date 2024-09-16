import Compress from 'compress.js';

export const loadImage = async (file: any) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
};

export const loadVideoBase64 = async (file: any) => {
  return new Promise<{
    file: Blob;
    base64: string;
    worldWidth: number;
    worldHeight: number;
  }>((resolve, reject) => {
    const reader = new FileReader();

    const video = document.createElement('video');

    if (typeof file === 'string') {
      video.src = file;

      const fileType = file.substring(
        file.indexOf(':') + 1,
        file.lastIndexOf(';'),
      );

      video.onloadedmetadata = function () {
        return resolve({
          base64: file,
          file: new Blob([file], { type: fileType }),
          worldWidth: video.videoWidth,
          worldHeight: video.videoHeight,
        });
      };

      video.onerror = reject;
    } else {
      const video = document.createElement('video');

      reader.readAsDataURL(file);
      reader.onload = () => {
        video.src = reader.result as string;

        video.onloadedmetadata = function () {
          return resolve({
            base64: reader.result as string,
            file: file,
            worldWidth: video.videoWidth,
            worldHeight: video.videoHeight,
          });
        };

        video.onerror = reject;
      };
      reader.onerror = reject;
    }
  });
};

export const loadImageBase64 = async (file: any) => {
  return new Promise<{
    image: HTMLImageElement;
    file: Blob;
    base64: string;
    worldWidth: number;
    worldHeight: number;
  }>((resolve, reject) => {
    const reader = new FileReader();

    const image: any = new Image();

    if (typeof file === 'string') {
      image.src = file;

      // const fileType = file.substring(
      //   file.indexOf(':') + 1,
      //   file.lastIndexOf(';'),
      // );

      // const fileExtension = fileType.split('/');

      image.onload = async function () {
        let blob = await (await fetch(file)).blob();
        blob = await compressImage(blob);

        return resolve({
          image,
          base64: file,
          file: blob,
          worldWidth: this.width,
          worldHeight: this.height,
        });
      };
      image.onerror = reject;
    } else {
      return compressImage(file).then((cfile) => {
        reader.readAsDataURL(cfile);
        reader.onload = () => {
          const image: any = new Image();
          image.src = reader.result;
          image.onload = function () {
            return resolve({
              image,
              file: cfile,
              base64: reader.result as string,
              worldWidth: this.width,
              worldHeight: this.height,
            });
          };
          image.onerror = reject;
        };
        return (reader.onerror = reject);
      });
    }
  });
};

export const loadCompressImageBase64 = async (
  file: any,
  { compress = true },
) => {
  const base64 = typeof file === 'string';

  const reader = new FileReader();
  const image = new Image();

  if (!base64 && compress) {
    file = await compressImage(file);
  }

  return new Promise<{
    image: HTMLImageElement;
    file: Blob;
    base64: string;
    worldWidth: number;
    worldHeight: number;
  }>((resolve, reject) => {
    if (base64) {
      image.src = file;

      image.onload = async function () {
        let blob = await (await fetch(file)).blob();

        if (compress) {
          blob = await compressImage(blob);
        }

        return resolve({
          image,
          base64: file,
          file: blob,
          worldWidth: image.width,
          worldHeight: image.height,
        });
      };
      image.onerror = reject;
    } else {
      reader.readAsDataURL(file);

      reader.onload = () => {
        image.src = reader.result as string;
        image.onload = function () {
          return resolve({
            image,
            file: file,
            base64: reader.result as string,
            worldWidth: image.width,
            worldHeight: image.height,
          });
        };
        image.onerror = reject;
      };

      reader.onerror = reject;
    }
  });
};

export const compressImage = async (file: any | any[]) => {
  // .6 Mb
  if (file?.size <= 600000) {
    return file;
  }

  const compress = new Compress();

  const result = await compress.compress(Array.isArray(file) ? file : [file], {
    size: 0.6,
    quality: 0.92, // the quality of the image, max is 1,
    resize: true, // defaults to true, set false if you do not want to resize the image width and height
    rotate: false,
  });

  const img1 = result[0];
  const base64str = img1.data;
  const imgExt = img1.ext;

  return Compress.convertBase64ToFile(base64str, imgExt);
};

export const compressImageBase64 = async (file: any | any[]) => {
  // .6 Mb
  if (file?.size <= 600000) {
    return getBase64(file);
  }

  const compress = new Compress();

  const result = await compress.compress(Array.isArray(file) ? file : [file], {
    size: 0.6,
    quality: 0.92, // the quality of the image, max is 1,
    resize: true, // defaults to true, set false if you do not want to resize the image width and height
    rotate: false,
  });

  const img1 = result[0];

  return `data:${img1.ext};base64, ${img1.data}`;
};

export const loadAndCompressImage = async (file: any | any[]) => {
  const compress = new Compress();

  let result = await compress.compress(Array.isArray(file) ? file : [file], {
    size: 0.6,
    quality: 0.92, // the quality of the image, max is 1,
    resize: true, // defaults to true, set false if you do not want to resize the image width and height
    rotate: false,
  });

  result = result[0];

  return new Promise<{
    base64;
    image: any;
    worldWidth: number;
    worldHeight: number;
  }>((resolve, reject) => {
    const reader = new FileReader();

    reader.readAsDataURL(file);
    reader.onload = () => {
      const image: any = new Image();
      image.src = reader.result;

      image.onload = function () {
        return resolve({
          image: image,
          base64: `data:${result.ext};base64, ${result.data}`,
          worldWidth: result.endWidthInPx,
          worldHeight: result.endHeightInPx,
        });
      };
    };
    reader.onerror = reject;
  });
};

export const getBase64 = (file: any): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();

    if (!file) return resolve('');

    reader.readAsDataURL(file);
    reader.onload = () => {
      return resolve(reader.result as string);
    };
    reader.onerror = (error) => reject(error);
  });

export const getImgWidthHeight = (
  src: any,
): Promise<{ image: any; width: number; height: number }> =>
  new Promise((resolve, reject) => {
    const image: any = new Image();
    image.src = src;
    image.onload = function () {
      return resolve({ image, width: this.width, height: this.height });
    };
    image.onerror = (error) => reject(error);
  });
