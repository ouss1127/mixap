import { useCallback } from 'react';
import { useRxCollection } from 'rxdb-hooks';
import { RxDocumentBase, RxDocument, RxCollection } from 'rxdb';

import { AuraDocType, RxColAttachMapOp, RxColOp } from '../db/types';
import useLogger from '../hooks/useLogger';
import useStore from './useStore';
import { mapDocAttachment } from '../db/loadAttachment';

export function useAura() {
  const log = useLogger('useAura');

  const rxColAuras = useRxCollection<AuraDocType>('auras');

  // const find = useStore((state) => state.auraSlice.find);
  const add = useStore((state) => state.auraSlice.add);
  const remove = useStore((state) => state.auraSlice.remove);
  const update = useStore((state) => state.auraSlice.update);
  const set = useStore((state) => state.auraSlice.set);

  const onRxColAura = useCallback(
    (
      rxColOp: RxColOp,
      payload: Partial<AuraDocType>,
      activitiesId: string[],
    ) => {
      log.debug('== add aura many', rxColAuras);

      if (!rxColAuras) {
        log.warn('Storing aura halted', rxColAuras);
        return;
      }

      (async () => {
        switch (rxColOp) {
          case RxColOp.Add: {
            log.debug('== add auras many', payload);
            const doc = (
              await rxColAuras.insert(payload as AuraDocType)
            ).toJSON();
            add(doc as any);

            break;
          }

          case RxColOp.AddMany: {
            const res = await rxColAuras.bulkInsert(payload as any);

            if (res.success) {
              const docs = res.success.map((doc) => doc.toJSON());

              docs.forEach((doc) => {
                add(doc as any);
              });
            }

            break;
          }

          case RxColOp.Remove: {
            remove(payload.id as string);

            let doc = await rxColAuras
              .findOne({
                selector: {
                  id: payload.id,
                },
              })
              .exec();

            if (doc) {
              doc = (await doc.remove()) as any;
            } else {
              log.warn(`${rxColOp}: payload, doc`, payload, doc);
            }
            break;
          }

          case RxColOp.Update: {
            log.debug('update payload', payload);

            update(payload);

            const docQuery = rxColAuras.findOne(payload.id as string);
            const doc = await docQuery.exec();

            if (!doc) {
              log.error('RxColOp.Update doc not found');
              return;
            }

            try {
              await doc.atomicUpdate((oldData: any) => {
                Object.assign(oldData, {
                  cfg: {
                    ...oldData.cfg,
                    ...payload.cfg,
                  },
                  meta: {
                    ...payload.meta,
                    ...oldData.meta,
                  },
                  content: {
                    // ...oldData.content,
                    value: payload.content?.value || oldData.content.value,
                    type: payload.content?.type || oldData.content.type,
                  },
                });
                return oldData;
              });
            } catch (error) {
              log.debug('update aura error', error);
            }

            log.debug('RxColOp.Update payload type', payload.type);

            // save attachments
            const file = payload?.content?.file;
            if (
              file &&
              (file instanceof File || file instanceof Blob) &&
              ['AImage', 'AVideo', 'AAudio', 'A3d'].includes(
                payload.type as string,
              )
            ) {
              log.debug('update file', file);

              try {
                doc.putAttachment(
                  {
                    id: payload.id as string, // (string) name of the attachment like 'cat.jpg'
                    data: file as any, // (string|Blob|Buffer) data of the attachment
                    // @ts-ignore
                    type: (file.type as string) || 'plain/text', // (string) type of the attachment-data like 'image/jpeg'
                  },
                  //false, // (boolean, optional, default=true) skipIfSame:If true and attachment already exists with same data, the write will be skipped
                );
              } catch (error) {
                log.error('update aura - adding attachment error', error);
              }
            }

            break;
          }

          case RxColOp.FindAll: {
            let docs = await rxColAuras.find(payload as any).exec();

            console.log('USEAURA', payload, docs);
            try {
              docs = (await Promise.all(
                docs.map(
                  mapDocAttachment.bind(null, RxColAttachMapOp.AuraAttachments),
                ),
              )) as any;

              set(docs as Partial<AuraDocType>[]);
              log.debug('found aura docs success', docs);
            } catch (error) {
              log.error('found docs error', error);
            }

            break;
          }

          case RxColOp.FindAllActivities: {
            let allDocs: RxDocument<AuraDocType, object>[] = [];
            activitiesId.map(async (activityId) => {
              const myLoad = {
                selector: {
                  activityId,
                },
              } as any;
              const docs = await rxColAuras.find(myLoad as any).exec();
              allDocs.push(docs[0]);
              console.log(allDocs);

              try {
                allDocs = (await Promise.all(
                  allDocs.map(
                    mapDocAttachment.bind(
                      null,
                      RxColAttachMapOp.AuraAttachments,
                    ),
                  ),
                )) as any;

                set(allDocs as Partial<AuraDocType>[]);
                log.debug('found aura docs success', allDocs);
                console.log('USEAURA', payload, allDocs);
              } catch (error) {
                log.error('found docs error', error);
              }
            });

            break;
          }

          case RxColOp.FindOne: {
            break;
          }

          default:
            break;
        }

        log.debug(`${rxColOp}: payload <-`, payload);
      })();
    },
    [rxColAuras, set, add, remove, update],
  );

  return { onRxColAura };
}
