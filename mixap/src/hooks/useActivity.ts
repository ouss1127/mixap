import { useCallback } from 'react';
import { useRxCollection } from 'rxdb-hooks';

import { ActivityDocType, RxColAttachMapOp, RxColOp } from '../db/types';
import { mapDocAttachment } from '../db/loadAttachment';
import { getID } from '../utils/uniqueId';
import useLogger from '../hooks/useLogger';
import useStore from './useStore';
import { getBase64 } from '../utils/loadImage';
import { useAura } from './useAura';
import { ActivityType } from '@/features/activity/ActivityType';

export function useActivity() {
  const log = useLogger('useActivity');

  const { onRxColAura } = useAura();

  const rxColActivities = useRxCollection<ActivityDocType>('activities');

  const get = useStore((state) => state.activitySlice.get);
  const add = useStore((state) => state.activitySlice.add);
  const remove = useStore((state) => state.activitySlice.remove);
  const update = useStore((state) => state.activitySlice.update);
  const set = useStore((state) => state.activitySlice.set);
  const setCurrActitityId = useStore(
    (state) => state.activitySlice.setCurrActitityId,
  );

  const onRxColActivity = useCallback(
    (rxColOp: RxColOp, payload: Partial<ActivityDocType>) => {
      if (!rxColActivities) {
        log.warn('Storing activity halted', rxColActivities);
        return;
      }

      (async () => {
        switch (rxColOp) {
          case RxColOp.Add: {
            add(payload as Partial<ActivityDocType>);
            const doc = (await rxColActivities.insert(payload as ActivityDocType)).toJSON();
            setCurrActitityId(payload.id as string);
            update(doc as Partial<ActivityDocType>);
            break;
          }

          case RxColOp.Remove: {
            remove(payload.id as string);

            let doc = await rxColActivities
              .findOne(payload.id)
              .exec();

            if (doc) {
              doc = (await doc.remove()) as any;
            } else {
              log.warn(`${rxColOp}: payload, doc`, payload, doc);
            }
            break;
          }

          case RxColOp.Update: {
            update(payload);

            const docQuery = rxColActivities.findOne(payload.id);
            const doc = await docQuery.exec();

            if (doc) {
              await doc.atomicUpdate((oldData) => {
                Object.assign(oldData, payload);
                return oldData;
              });
            } else {
              log.error('doc not found');
            }

            break;
          }

          case RxColOp.FindAll: {
            let docs = await rxColActivities.find(payload as any).exec();

            log.debug('docs', docs);
            try {
              docs = (await Promise.all(
                docs.map(
                  mapDocAttachment.bind(
                    null,
                    RxColAttachMapOp.ActivityAttachments,
                  ),
                ),
              )) as any;

              set(docs as Partial<ActivityDocType>[]);
              log.debug('found docs success', docs);
            } catch (error) {
              log.error('found docs error', error);
            }

            break;
          }

          case RxColOp.SetCurrActivity: {
            setCurrActitityId(payload.id as string);

            let doc = (await rxColActivities.findOne(payload.id).exec()) as any;
            doc = await doc?.toJSON();

            log.debug(`${rxColOp}: payload doc`, doc);

            update(doc as Partial<ActivityDocType>);

            onRxColAura(RxColOp.FindAll, {
              selector: {
                activityId: payload.id,
              },
            } as any,[]);

            // doc = await mapDocAttachment(
            //   RxColAttachMapOp.ActivityMarkerUrl,
            //   doc as any,
            // );

            break;
          }

          case RxColOp.UpdateMarker: {
            const {
              id,
              markerFile,
              markerImages,
              markerImagesBase64,
              markerImagesCfg,
            } = payload;

            // const current = get(id as string);

            // if (current.markerFile) {
            //   window.URL.revokeObjectURL(current.markerFile);
            // }

            update({
              id,
              markerFile, //: window.URL.createObjectURL(markerFile),
              markerImages: markerImagesBase64,
              markerImagesCfg,
            });

            // find activity
            const docQuery = rxColActivities.findOne(id);
            const doc = await docQuery.exec();

            if (doc) {
              const uuid = getID();
              const markerId = `${uuid}-mkfil.mind`;

              await doc.putAttachment(
                {
                  id: markerId, // (string) name of the attachment like 'cat.jpg'
                  data: markerFile as any, // (string|Blob|Buffer) data of the attachment
                  type: 'text/plain', // (string) type of the attachment-data like 'image/jpeg'
                }
                //false, // (boolean, optional, default=true) skipIfSame:If true and attachment already exists with same data, the write will be skipped
              );

              const imagesIds: string[] = await Promise.all(
                (markerImages || []).map(async (image: any, index) => {
                  const id = `${uuid}-mkimg-${index}`;

                  await doc?.putAttachment(
                    {
                      id: id, // (string) name of the attachment like 'cat.jpg'
                      data: image, // (string|Blob|Buffer) data of the attachment
                      type: image.type, // (string) type of the attachment-data like 'image/jpeg'
                    }
                    //false, // (boolean, optional, default=true) skipIfSame:If true and attachment already exists with same data, the write will be skipped
                  );

                  return Promise.resolve(id);
                }),
              );

              // update activity with marker and images
              await docQuery.update({
                $set: {
                  markerFileId: markerId,
                  markerImagesIds: imagesIds,
                  markerImagesCfg: markerImagesCfg,
                },
              });

              update({
                id,
                markerFileBase64: await getBase64(markerFile),
                markerFileId: markerId,
                markerImagesIds: imagesIds,
              });

              log.debug('updating activity with marker info', doc.toJSON());
            }

            break;
          }

          case RxColOp.RemoveMarker: {
            const { id, markerImages, markerImagesCfg } = payload;

            log.debug(
              'refresh activity marker info',
              markerImages,
              markerImagesCfg,
            );

            const current = get(id as string);

            if (current.markerFile) {
              window.URL.revokeObjectURL(current.markerFile);
            }

            update({
              id,
              markerFile: null,
              markerImages,
              markerImagesCfg,
            });

            break;
          }

          case RxColOp.FindOne:{
            
            get(payload.id as string);

            let doc = (await rxColActivities.findOne(payload.id).exec()) as any;
            doc = await doc?.toJSON();

            break;
          }

          default:
            break;
        }

        log.debug(`${rxColOp}: payload <-`, payload);
      })();
    },
    [
      rxColActivities,
      onRxColAura,
      set,
      remove,
      add,
      update,
      set,
      setCurrActitityId,
    ],
  );

  return { onRxColActivity };
}
