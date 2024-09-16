import { RxDocumentBase } from 'rxdb';

import { RxColAttachMapOp } from './types';
import { getBase64 } from '../utils/loadImage';

export const mapDocAttachment = async (
  rxColAttachMapOp: RxColAttachMapOp,
  doc: RxDocumentBase<any>,
) => {
  const payload = { ...doc.toJSON(true) };

  switch (rxColAttachMapOp) {
    case RxColAttachMapOp.ActivityAttachments: {
      const imgIds = payload.markerImagesIds;
      if (!imgIds) {
        return payload;
      }

      const markerId = payload.markerFileId;
      let marker: any = doc.getAttachment(markerId);
      marker = await marker?.getData();

      let imgBase64 = imgIds.map((image: string) => doc.getAttachment(image));
      imgBase64 = await Promise.all(
        imgBase64.map(async (img) => {
          img = await img?.getData();
          img = await getBase64(img);
          return Promise.resolve(img);
        }),
      );

      payload.markerFile = marker || null;
      payload.markerImages = imgBase64 || [];
      // payload.markerFileBase64 = await getBase64(marker);
      payload.markerFileId = markerId;
      payload.markerImagesIds = imgIds;
      break;
    }

    case RxColAttachMapOp.ActivityMarkerUrl: {
      const markerId = doc.get('markerFileId');
      if (!markerId) {
        return payload;
      }

      let marker: any = doc.getAttachment(markerId);
      marker = await marker?.getData();

      payload.markerFile = marker ? window.URL.createObjectURL(marker) : null;
      break;
    }

    case RxColAttachMapOp.AuraAttachments: {
      if (!['AImage', 'AVideo', 'AAudio', 'A3d'].includes(payload.type)) {
        return payload;
      }

      console.log('RxColAttachMapOp.AuraAttachments');

      let attachment = doc.getAttachment(payload.id);
      attachment = (await attachment?.getData()) as any;

      // payload.fileUpload = attachment;
      payload.content = {
        // base64: await getBase64(attachment),
        file: attachment,
        type: payload.content.type,
      };
      break;
    }

    default:
      break;
  }

  return payload;
};
