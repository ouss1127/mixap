import { RxJsonSchema } from 'rxdb';
import { ActivityDocType, AuraDocType, UserDocType } from './types';

export const userSchema: RxJsonSchema<UserDocType> = {
  title: 'user schema',
  description: 'user schema, for both learners and teachers',
  version: 1,
  keyCompression: false,
  type: 'object',
  primaryKey: 'id',
  properties: {
    id: {
      type: 'string',
      maxLength: 100,
    },
    code: {
      type: 'string',
    },
    name: {
      type: 'string',
    },
    email: {
      type: 'string',
      maxLength: 100,
    },
    host: {
      type: 'boolean',
    },
    role: {
      type: 'string',
    },
    phone: {
      type: 'string',
    },
    address: {
      type: 'string',
    },
    area: {
      type: 'string',
    },
  },
  attachments: {
    encrypted: false,
  },
  required: ['id'],
};

export const activitySchema: RxJsonSchema<
  Omit<ActivityDocType, 'markerImagesBase64' | 'markerFileBase64'>
> = {
  title: 'activity schema',
  description: 'activity schema ',
  version: 6,
  keyCompression: false,
  type: 'object',
  primaryKey: 'id',
  properties: {
    id: {
      type: 'string',
      maxLength: 100,
    },
    userId: {
      type: 'string',
    },
    token: {
      type: 'string',
    },
    auth: {
      type: 'string',
      default: 'editor',
    },
    title: {
      type: 'string',
    },
    instruction: {
      type: 'string',
    },
    description: {
      type: 'string',
    },
    type: {
      type: 'string',
    },
    markerFileId: {
      type: 'string',
    },
    markerFile: {
      type: 'object',
    },
    markerImagesIds: {
      type: 'array',
    },
    markerImages: {
      type: 'array',
    },
    comboIds: {
      type: 'array',
    },
    markerImagesCfg: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          worldWidth: {
            type: 'number',
          },
          worldHeight: {
            type: 'number',
          },
          width: {
            type: 'number',
          },
          height: {
            type: 'number',
          },
        },
      },
    },
    meta: {
      type: 'object',
    },
    isDownload: {
      type: 'boolean'
    },
    group: {
      type: 'array',
    },
    path: {
      type: 'array',
    },
  },
  attachments: {
    encrypted: false,
  },
  required: ['id', 'title', 'userId'],
};

export const auraSchema: RxJsonSchema<Omit<AuraDocType, 'contentBase64'>> = {
  title: 'aura schema',
  description: 'aura schema ',
  version: 1,
  keyCompression: false,
  type: 'object',
  primaryKey: 'id',
  properties: {
    id: {
      type: 'string',
      maxLength: 100,
    },
    activityId: {
      type: 'string',
    },
    type: {
      type: 'string',
    },
    content: {
      type: 'object',
    },
    cfg: {
      type: 'object',
    },
    meta: {
      type: 'object',
    },
  },
  attachments: {
    encrypted: false,
  },
  required: ['id', 'activityId', 'type'],
};
