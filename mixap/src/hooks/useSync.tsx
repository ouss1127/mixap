import React, { useCallback } from 'react';
import { notification, Spin, Typography, Space } from 'antd';
import { omit } from 'lodash';
import { useRxCollection } from 'rxdb-hooks';

/** @jsxImportSource @emotion/react */
// import { css } from '@emotion/react';

import useStore from './useStore';
import useLogger from './useLogger';
import supabase from '../db/supabase';
import { useActivity } from './useActivity';
import { ActivityDocType, RxColOp } from '../db/types';
import { AuraDocType } from '../db/types';
import { ActivityType } from '../features/activity/ActivityType';

import { useTranslation } from 'react-i18next';

export function useSync() {
  const log = useLogger('useSync');

  const rxColActivities = useRxCollection<ActivityDocType>('activities');
  const rxColAuras = useRxCollection<AuraDocType>('auras');
  const { onRxColActivity } = useActivity();
  const user = useStore((state) => state.authSlice.user);

  const { t } = useTranslation();

  const showNotification = useCallback(
    ({
      type = 'info',
      message,
      description = '',
      spin = false,
      duration = 0,
      error = '',
    }: {
      type?: string;
      message: string;
      description?: string;
      spin?: boolean;
      duration?: number;
      error?: string | unknown;
    }) => {
      switch (type) {
        case 'info': {
          notification.info({
            message,
            description: description && (
              <Space
                direction='vertical'
                style={{ padding: 18 }}>
                <Typography.Text>
                  {description}
                  {'  '}
                  {spin && <Spin />}
                </Typography.Text>
              </Space>
            ),
            duration,
            key: 'sync',
          });
          error && log.error('Error sync', error);
          break;
        }
        case 'warning': {
          notification.warning({
            message,
            description: description && (
              <Space
                direction='vertical'
                style={{ padding: 18 }}>
                <Typography.Text>
                  {description}
                  {'  '}
                  {spin && <Spin />}
                </Typography.Text>
              </Space>
            ),
            duration,
            key: 'sync',
          });
          error && log.error('Error sync', error);
          break;
        }
        case 'success': {
          notification.success({
            message,
            description: description && (
              <Space
                direction='vertical'
                style={{ padding: 18 }}>
                <Typography.Text>
                  {description}
                  {'  '}
                  {spin && <Spin />}
                </Typography.Text>
              </Space>
            ),
            duration,
            key: 'sync',
          });
          error && log.error('Error sync', error);
          break;
        }
        default: {
          break;
        }
      }

      /*notification[type]({
        message,
        description: description && (
          <Space
            direction='vertical'
            style={{ padding: 18 }}>
            <Typography.Text>
              {description}
              {'  '}
              {spin && <Spin />}
            </Typography.Text>
          </Space>
        ),
        duration,
        key: 'sync',
      });
      error && log.error('Error sync', error);*/
    },
    [],
  );

  const onPush = useCallback(
    async (token) => {
      // Atomicity : not needed, I guess

      if (!rxColActivities) {
        log.warn('Storing activity halted', rxColActivities);
        return;
      }

      if (!rxColAuras) {
        log.warn('Storing aura halted', rxColAuras);
        return;
      }

      // Get activities from Rxdb
      let activityDocs: any;
      try {
        activityDocs = await rxColActivities
          .find({
            selector: {
              $or: [
                { type: { $in: [ActivityType.Group, ActivityType.Path] } },
                { markerFileId: { $exists: true } },
              ],
            },
          })
          .exec();

        if (!activityDocs.length) {
          showNotification({
            message: t('common.synchro-nothing'),
            duration: 2,
          });
          return;
        }

        showNotification({
          message: t('common.synchro-data'),
          description: `${t('common.synchro-saving')} ${
            activityDocs.length
          } ${t('common.synchro-activites')}`,
          spin: true,
        });

        // Start Sync Activities
        // -----------------
        activityDocs = await Promise.all(
          activityDocs.map(async (activityDoc, index) => {
            const doc = activityDoc.toJSON() as ActivityDocType;

            showNotification({
              message: t('common.synchro-data'),
              description: `${t('common.synchro-saving')} ${index + 1} / ${
                activityDocs.length
              } ${t('common.synchro-activites')}`,
              spin: true,
            });

            // Get markerFile
            let markerFile: any = activityDoc.getAttachment(
              doc.markerFileId as string,
            );
            markerFile = await markerFile?.getData();

            // Insert into storage
            //markerFile
            const { data, error } = await supabase.storage
              .from('activity')
              .upload(
                `${doc.id}/${doc.markerFileId}`, //.${markerFileExtension}
                markerFile,
                {
                  cacheControl: '3600',
                  upsert: true,
                },
              );

            if (error) {
              throw Error(error.message);
            }

            log.debug('markerFile', data, error, doc);

            // markerImages
            doc.markerImagesIds?.forEach(async (markerImageId) => {
              let markerImage: any = activityDoc.getAttachment(markerImageId);

              markerImage = await markerImage?.getData();

              const { error } = await supabase.storage.from('activity').upload(
                `${doc.id}/${markerImageId}`, //.${markerImageExtension}
                markerImage,
                {
                  cacheControl: '3600',
                  upsert: true,
                },
              );

              if (error) {
                return Promise.reject(error.message);
              }
            });

            return Promise.resolve(doc);
          }),
        );

        // prepare activityDocs
        activityDocs = activityDocs.map((d) => {
          // Todo: omit is a cleanup for the old activities, to be removed
          return {
            ...omit(d, ['time']),
            instruction: d.instruction || '',
            markerFileId: d.markerFileId || '',
            comboIds: d.comboIds || [],
            markerImagesIds: d.markerImagesIds || [],
            markerImagesCfg: d.markerImagesCfg || [],
            token: token,
          };
        });

        // add activities to supabase
        const { error: errAc } = await supabase
          .from('Activity')
          .upsert(activityDocs);

        log.debug('activityDocs', activityDocs, token);

        if (errAc) {
          throw Error(errAc.message);
        }

        // End Sync Activities
        // -------------------

        // Start Sync Auras
        // -----------------

        // Get auras from Rxdb
        let auraDocs = (await rxColAuras
          .find({
            selector: {
              activityId: {
                $in: activityDocs.map((a) => a.id),
              },
            },
          })
          .exec()) as any;

        auraDocs = await Promise.all(
          auraDocs.map(async (auraDoc, index) => {
            const doc = auraDoc.toJSON() as AuraDocType;

            showNotification({
              message: t('common.synchro-data'),
              description: `${t('common.synchro-saving')} ${index + 1} / ${
                auraDocs.length
              } ${t('common.synchro-augmentations')}`,
              spin: true,
            });

            if (['AImage', 'AVideo', 'AAudio', 'A3d'].includes(doc.type)) {
              let auraFile: any = auraDoc.getAttachment(doc.id);

              auraFile = await auraFile?.getData();

              const { data, error } = await supabase.storage
                .from('activity')
                .upload(`${doc.activityId}/${doc.id}`, auraFile, {
                  cacheControl: '3600',
                  upsert: true,
                });

              log.debug('aura', data, error);

              if (error) {
                return Promise.reject(error.message);
              }
            }

            return Promise.resolve(doc);
          }),
        );

        log.debug('auraDocs', auraDocs);

        // prepare auraDocs
        auraDocs = auraDocs.map((d) => {
          return { ...d, meta: d.meta || {}, userId: d.userId || '' };
        });

        const { error: errAr, data: dataAr } = await supabase
          .from('Aura')
          .upsert(auraDocs);

        log.debug('dataAr, errAr', dataAr, errAr);

        if (errAr) {
          throw Error(errAr.message);
        }

        // End Sync Auras
        // -------------------

        showNotification({
          type: 'success',
          message: t('common.synchro-success'),
          description: `${t('common.synchro-saving')} ${
            activityDocs.length
          } ${t('common.synchro-activities')}`,
          duration: 2,
        });
      } catch (error) {
        showNotification({
          error,
          type: 'warning',
          message: t('common.synchro-failed'),
          description: t('common.error-message-retry') as string,
        });
      }
    },
    [rxColActivities, rxColAuras],
  );

  const onPushSingleActivity = useCallback(
    async (activityId, token) => {
      // Atomicity : not needed, I guess

      const { data: data, error: err } = await supabase
        .from('Authorization')
        .insert({
          userId: user?.id,
          title: activityId,
          auth: 'reader',
          token: token,
        });

      if (err) {
        notification.error({
          message: t('common.saving-failed'),
          description: t('common.error-message-retry'),
          key: 'sync-menu',
          duration: 3,
        });
      } else {
        if (!rxColActivities) {
          log.warn('Storing activity halted', rxColActivities);
          return;
        }

        if (!rxColAuras) {
          log.warn('Storing aura halted', rxColAuras);
          return;
        }

        // Get activities from Rxdb
        let activityDocs: any;
        try {
          activityDocs = await rxColActivities
            .find({
              selector: {
                id: activityId,
              },
            })
            .exec();

          if (!activityDocs.length) {
            showNotification({
              message: t('common.synchro-nothing'),
              duration: 2,
            });
            return;
          }

          showNotification({
            message: t('common.synchro-data'),
            description: `${t('common.synchro-saving')} ${
              activityDocs.length
            } ${t('common.synchro-activites')}`,
            spin: true,
          });

          // Start Sync Activities
          // -----------------
          activityDocs = await Promise.all(
            activityDocs.map(async (activityDoc, index) => {
              const doc = activityDoc.toJSON() as ActivityDocType;

              showNotification({
                message: t('common.synchro-data'),
                description: `${t('common.synchro-saving')} ${index + 1} / ${
                  activityDocs.length
                } ${t('common.synchro-activites')}`,
                spin: true,
              });

              // Get markerFile
              let markerFile: any = activityDoc.getAttachment(
                doc.markerFileId as string,
              );
              markerFile = await markerFile?.getData();

              // Insert into storage
              //markerFile
              const { data, error } = await supabase.storage
                .from('activity')
                .upload(
                  `${doc.id}/${doc.markerFileId}`, //.${markerFileExtension}
                  markerFile,
                  {
                    cacheControl: '3600',
                    upsert: true,
                  },
                );

              if (error) {
                throw Error(error.message);
              }

              log.debug('markerFile', data, error, doc);

              // markerImages
              doc.markerImagesIds?.forEach(async (markerImageId) => {
                let markerImage: any = activityDoc.getAttachment(markerImageId);

                markerImage = await markerImage?.getData();

                const { error } = await supabase.storage
                  .from('activity')
                  .upload(
                    `${doc.id}/${markerImageId}`, //.${markerImageExtension}
                    markerImage,
                    {
                      cacheControl: '3600',
                      upsert: true,
                    },
                  );

                if (error) {
                  return Promise.reject(error.message);
                }
              });

              return Promise.resolve(doc);
            }),
          );

          // prepare activityDocs
          activityDocs = activityDocs.map((d) => {
            // Todo: omit is a cleanup for the old activities, to be removed
            return {
              ...omit(d, ['time']),
              instruction: d.instruction || '',
              markerFileId: d.markerFileId || '',
              comboIds: d.comboIds || [],
              markerImagesIds: d.markerImagesIds || [],
              markerImagesCfg: d.markerImagesCfg || [],
              token: token,
            };
          });

          // add activities to supabase
          const { error: errAc } = await supabase
            .from('Activity')
            .upsert(activityDocs);

          log.debug('activityDocs', activityDocs, token);

          if (errAc) {
            throw Error(errAc.message);
          }

          // End Sync Activities
          // -------------------

          // Start Sync Auras
          // -----------------

          // Get auras from Rxdb
          let auraDocs = (await rxColAuras
            .find({
              selector: {
                activityId: {
                  $in: activityDocs.map((a) => a.id),
                },
              },
            })
            .exec()) as any;

          auraDocs = await Promise.all(
            auraDocs.map(async (auraDoc, index) => {
              const doc = auraDoc.toJSON() as AuraDocType;

              showNotification({
                message: t('common.synchro-data'),
                description: `${t('common.synchro-saving')} ${index + 1} / ${
                  auraDocs.length
                } ${t('common.synchro-augmentations')}`,
                spin: true,
              });

              if (['AImage', 'AVideo', 'AAudio', 'A3d'].includes(doc.type)) {
                let auraFile: any = auraDoc.getAttachment(doc.id);

                auraFile = await auraFile?.getData();

                const { data, error } = await supabase.storage
                  .from('activity')
                  .upload(`${doc.activityId}/${doc.id}`, auraFile, {
                    cacheControl: '3600',
                    upsert: true,
                  });

                log.debug('aura', data, error);

                if (error) {
                  return Promise.reject(error.message);
                }
              }

              return Promise.resolve(doc);
            }),
          );

          log.debug('auraDocs', auraDocs);

          // prepare auraDocs
          auraDocs = auraDocs.map((d) => {
            return { ...d, meta: d.meta || {}, userId: d.userId || '' };
          });

          const { error: errAr, data: dataAr } = await supabase
            .from('Aura')
            .upsert(auraDocs);

          log.debug('dataAr, errAr', dataAr, errAr);

          if (errAr) {
            throw Error(errAr.message);
          }

          // End Sync Auras
          // -------------------

          showNotification({
            type: 'success',
            message: t('common.synchro-success'),
            description: `${t('common.synchro-saving')} ${
              activityDocs.length
            } ${t('common.synchro-activities')}`,
            duration: 2,
          });
        } catch (error) {
          showNotification({
            error,
            type: 'warning',
            message: t('common.synchro-failed'),
            description: t('common.error-message-retry') as string,
          });
        }
      }
    },
    [rxColActivities, rxColAuras],
  );

  const onPull = useCallback(
    async (token) => {
      // There is a sec bridge, we should send a code by email,
      //  to avoid stealing data
      if (!rxColActivities || !rxColAuras) {
        log.warn(
          'rxColActivities, rxColAuras halted',
          rxColActivities,
          rxColAuras,
        );
        return;
      }

      if (!token) {
        showNotification({
          type: 'warning',
          message: t('common.share-code'),
          description: t('common.empty-share-code') as string,
          duration: 2,
        });
        return;
      }

      try {
        const { data: dataAuth, error: errAuth } = await supabase
          .from('Authorization')
          .select()
          .eq('token', token);

        if (errAuth) {
          throw Error(errAuth.message);
        }

        // Take first
        // Todo this could be enforced with userId
        const tokenDoc = dataAuth[0];
        log.debug('token found', tokenDoc);

        // code does not exist
        if (!dataAuth?.length) {
          showNotification({
            type: 'warning',
            message: t('common.share-code-notfound'),
            description: t('common.share-code-notfound-description') as string,
            duration: 2,
          });

          return;
        }

        const { data: dataAc, error: errAc } = await supabase
          .from('Activity')
          .select()
          .eq('token', tokenDoc.token);

        if (errAc) {
          throw Error(errAc.message);
        }

        if (dataAc?.length === 0) {
          showNotification({
            message: t('common.synchro-nothing'),
            duration: 2,
          });
          return;
        }

        showNotification({
          message: t('common.synchro-data-step1'),
          description: t('common.save-data') as string,
          spin: true,
        });

        const { data: dataAr, error: errAr } = await supabase
          .from('Aura')
          .select()
          .in(
            'activityId',
            dataAc.map((a) => a.id),
          );

        if (errAr) {
          throw Error(errAr.message);
        }

        showNotification({
          message: t('common.synchro-data-step2'),
          description: `${t('common.synchro-saving')} ${dataAc?.length} ${t(
            'common.synchro-activities',
          )}`,
          spin: true,
        });

        // Clean Sctvities Schema
        dataAc.forEach((doc) => {
          doc.userId = user?.id; // current user become the owner
          doc.auth = tokenDoc.auth; // associated auth
          delete doc._createdAt;
          delete doc._updatedAt;
          delete doc.markerFile;
          delete doc.markerImages;
        });

        const docsAC = await rxColActivities.bulkUpsert(dataAc);

        await Promise.all(
          (docsAC || []).map(async (rxDoc) => {
            const doc = rxDoc.toJSON() as ActivityDocType;

            onRxColActivity(RxColOp.Update, {
              id: doc.id,
              isDownload: true,
            });

            //Get markerFile from storage
            const { data: dataMarkerFileURL, error: errorMarkerFileURL } =
              await supabase.storage
                .from('activity')
                .getPublicUrl(`${doc.id}/${doc.markerFileId}`);

            if (!dataMarkerFileURL) {
              throw Error(errorMarkerFileURL?.message);
            }

            const dataMarkerFile = await (
              await fetch(dataMarkerFileURL?.publicURL)
            ).blob();

            log.debug('putAttachment dataMarkerFile', dataMarkerFile);

            // add markerFile to rxDB
            await rxDoc?.putAttachment(
              {
                id: doc.markerFileId as string, // (string) name of the attachment like 'cat.jpg'
                data: dataMarkerFile as any, // (string|Blob|Buffer) data of the attachment
                type: dataMarkerFile?.type as string, // (string) type of the attachment-data like 'image/jpeg'
              },
              //false, // (boolean, optional, default=true) skipIfSame:If true and attachment already exists with same data, the write will be skipped
            );

            // add markerImages to supabase
            doc?.markerImagesIds &&
              (await Promise.all(
                doc.markerImagesIds.map(async (markerImageId) => {
                  //Get markerImages from storage
                  const {
                    data: dataMarkerImageURL,
                    error: errorMarkerImageURL,
                  } = await supabase.storage
                    .from('activity')
                    .getPublicUrl(`${doc.id}/${markerImageId}`);

                  if (!dataMarkerImageURL) {
                    throw Error(errorMarkerImageURL?.message);
                  }

                  const dataMarkerImage = await (
                    await fetch(dataMarkerImageURL?.publicURL)
                  ).blob();

                  log.debug('putAttachment dataMarkerImage', dataMarkerImage);

                  // store markerImages in rxDB
                  await rxDoc?.putAttachment(
                    {
                      id: markerImageId, // (string) name of the attachment like 'cat.jpg'
                      data: dataMarkerImage as any, // (string|Blob|Buffer) data of the attachment
                      type: dataMarkerImage?.type as string, // (string) type of the attachment-data like 'image/jpeg'
                    },
                    //false, // (boolean, optional, default=true) skipIfSame:If true and attachment already exists with same data, the write will be skipped
                  );

                  return Promise.resolve(true);
                }),
              ));
          }),
        );

        // Clean Auras Schema
        dataAr.forEach((doc) => {
          delete doc._createdAt;
          delete doc._updatedAt;
        });

        showNotification({
          message: t('common.synchro-data-step3'),
          description: `${t('common.synchro-saving')} ${dataAc?.length} ${t(
            'common.synchro-activities',
          )}`,
          spin: true,
        });

        log.debug('putAttachment dataAr', dataAr);

        const docsAR = await rxColAuras.bulkUpsert(dataAr);

        await Promise.all(
          (docsAR || []).map(async (rxDoc) => {
            const doc = rxDoc.toJSON() as AuraDocType;

            if (['AImage', 'AVideo', 'AAudio', 'A3d'].includes(doc.type)) {
              const { data: dataAuraURL, error: errorAuraURL } =
                await supabase.storage
                  .from('activity')
                  .getPublicUrl(`${doc.activityId}/${doc.id}`);

              if (!dataAuraURL) {
                log.error('Error sync', errorAuraURL);
                throw Error(errorAuraURL?.message);
              }

              const dataAura = await (
                await fetch(dataAuraURL?.publicURL)
              ).blob();

              if (!dataAura?.size) {
                return;
              }

              await rxDoc?.putAttachment(
                {
                  id: doc.id, // (string) name of the attachment like 'cat.jpg'
                  data: dataAura as any, // (string|Blob|Buffer) data of the attachment
                  type: dataAura?.type as string, // doc.type
                },
                //false, // (boolean, optional, default=true) skipIfSame:If true and attachment already exists with same data, the write will be skipped
              );
            }
          }),
        );

        // hard add activities to the store
        // Todo: sort activities by date
        onRxColActivity(RxColOp.FindAll, {});

        showNotification({
          type: 'success',
          message: t('common.synchro-success'),
          description: `${t('common.synchro-saving')} ${dataAc.length} ${t(
            'common.synchro-activities',
          )}`,
          duration: 2,
        });
      } catch (error) {
        showNotification({
          error,
          type: 'warning',
          message: t('common.synchro-failed'),
          description: t('common.error-message-retry') as string,
        });
      }
    },
    [rxColActivities, rxColAuras, user],
  );

  const onPullSingleActivity = useCallback(
    async (userId, activityId, token) => {
      // There is a sec bridge, we should send a code by email,
      //  to avoid stealing data
      if (!rxColActivities || !rxColAuras) {
        log.warn(
          'rxColActivities, rxColAuras halted',
          rxColActivities,
          rxColAuras,
        );
        return;
      }

      if (!userId || !activityId || !token) {
        showNotification({
          type: 'warning',
          message: t('common.share-code'),
          description: t('common.empty-share-code') as string,
          duration: 2,
        });
        return;
      }

      try {
        const { data: dataAuth, error: errAuth } = await supabase
          .from('Authorization')
          .select()
          .eq('userId', userId)
          .eq('token', token);

        if (errAuth) {
          throw Error(errAuth.message);
        }

        // Take first
        // Todo this could be enforced with userId
        const tokenDoc = dataAuth[0];
        log.debug('token found', tokenDoc);

        // code does not exist
        if (!dataAuth?.length) {
          showNotification({
            type: 'warning',
            message: t('common.share-code-notfound'),
            description: t('common.share-code-notfound-description') as string,
            duration: 2,
          });

          return;
        }

        const { data: dataAc, error: errAc } = await supabase
          .from('Activity')
          .select()
          .eq('id', activityId)
          .eq('userId', tokenDoc.userId)
          .eq('token', tokenDoc.token);

        if (errAc) {
          throw Error(errAc.message);
        }

        if (dataAc?.length === 0) {
          showNotification({
            message: t('common.synchro-nothing'),
            duration: 2,
          });
          return;
        }

        showNotification({
          message: t('common.synchro-data-step1'),
          description: t('common.save-data') as string,
          spin: true,
        });

        const { data: dataAr, error: errAr } = await supabase
          .from('Aura')
          .select()
          .in(
            'activityId',
            dataAc.map((a) => a.id),
          );

        if (errAr) {
          throw Error(errAr.message);
        }

        showNotification({
          message: t('common.synchro-data-step2'),
          description: `${t('common.synchro-saving')} ${dataAc?.length} ${t(
            'common.synchro-activities',
          )}`,
          spin: true,
        });

        // Clean Sctvities Schema
        dataAc.forEach((doc) => {
          doc.userId = user?.id; // current user become the owner
          doc.auth = tokenDoc.auth; // associated auth
          delete doc._createdAt;
          delete doc._updatedAt;
          delete doc.markerFile;
          delete doc.markerImages;
        });

        const docsAC = await rxColActivities.bulkUpsert(dataAc);

        await Promise.all(
          (docsAC || []).map(async (rxDoc) => {
            const doc = rxDoc.toJSON() as ActivityDocType;

            //Get markerFile from storage
            const { data: dataMarkerFileURL, error: errorMarkerFileURL } =
              await supabase.storage
                .from('activity')
                .getPublicUrl(`${doc.id}/${doc.markerFileId}`);

            if (!dataMarkerFileURL) {
              throw Error(errorMarkerFileURL?.message);
            }

            const dataMarkerFile = await (
              await fetch(dataMarkerFileURL?.publicURL)
            ).blob();

            log.debug('putAttachment dataMarkerFile', dataMarkerFile);

            // add markerFile to rxDB
            await rxDoc?.putAttachment(
              {
                id: doc.markerFileId as string, // (string) name of the attachment like 'cat.jpg'
                data: dataMarkerFile as any, // (string|Blob|Buffer) data of the attachment
                type: dataMarkerFile?.type as string, // (string) type of the attachment-data like 'image/jpeg'
              },
              //false, // (boolean, optional, default=true) skipIfSame:If true and attachment already exists with same data, the write will be skipped
            );

            // add markerImages to supabase
            doc?.markerImagesIds &&
              (await Promise.all(
                doc.markerImagesIds.map(async (markerImageId) => {
                  //Get markerImages from storage
                  const {
                    data: dataMarkerImageURL,
                    error: errorMarkerImageURL,
                  } = await supabase.storage
                    .from('activity')
                    .getPublicUrl(`${doc.id}/${markerImageId}`);

                  if (!dataMarkerImageURL) {
                    throw Error(errorMarkerImageURL?.message);
                  }

                  const dataMarkerImage = await (
                    await fetch(dataMarkerImageURL?.publicURL)
                  ).blob();

                  log.debug('putAttachment dataMarkerImage', dataMarkerImage);

                  // store markerImages in rxDB
                  await rxDoc?.putAttachment(
                    {
                      id: markerImageId, // (string) name of the attachment like 'cat.jpg'
                      data: dataMarkerImage as any, // (string|Blob|Buffer) data of the attachment
                      type: dataMarkerImage?.type as string, // (string) type of the attachment-data like 'image/jpeg'
                    },
                    //false, // (boolean, optional, default=true) skipIfSame:If true and attachment already exists with same data, the write will be skipped
                  );

                  return Promise.resolve(true);
                }),
              ));
          }),
        );

        // Clean Auras Schema
        dataAr.forEach((doc) => {
          delete doc._createdAt;
          delete doc._updatedAt;
        });

        showNotification({
          message: t('common.synchro-data-step3'),
          description: `${t('common.synchro-saving')} ${dataAc?.length} ${t(
            'common.synchro-activities',
          )}`,
          spin: true,
        });

        log.debug('putAttachment dataAr', dataAr);

        const docsAR = await rxColAuras.bulkUpsert(dataAr);

        await Promise.all(
          (docsAR || []).map(async (rxDoc) => {
            const doc = rxDoc.toJSON() as AuraDocType;

            if (['AImage', 'AVideo', 'AAudio', 'A3d'].includes(doc.type)) {
              const { data: dataAuraURL, error: errorAuraURL } =
                await supabase.storage
                  .from('activity')
                  .getPublicUrl(`${doc.activityId}/${doc.id}`);

              if (!dataAuraURL) {
                log.error('Error sync', errorAuraURL);
                throw Error(errorAuraURL?.message);
              }

              const dataAura = await (
                await fetch(dataAuraURL?.publicURL)
              ).blob();

              if (!dataAura?.size) {
                return;
              }

              await rxDoc?.putAttachment(
                {
                  id: doc.id, // (string) name of the attachment like 'cat.jpg'
                  data: dataAura as any, // (string|Blob|Buffer) data of the attachment
                  type: dataAura?.type as string, // doc.type
                },
                //false, // (boolean, optional, default=true) skipIfSame:If true and attachment already exists with same data, the write will be skipped
              );
            }
          }),
        );

        // hard add activities to the store
        // Todo: sort activities by date
        onRxColActivity(RxColOp.FindAll, {});

        showNotification({
          type: 'success',
          message: t('common.synchro-success'),
          description: `${t('common.synchro-saving')} ${dataAc.length} ${t(
            'common.synchro-activities',
          )}`,
          duration: 2,
        });
      } catch (error) {
        showNotification({
          error,
          type: 'warning',
          message: t('common.synchro-failed'),
          description: t('common.error-message-retry') as string,
        });
      }
    },
    [rxColActivities, rxColAuras, user],
  );

  return { onPush, onPushSingleActivity, onPull, onPullSingleActivity };
}
