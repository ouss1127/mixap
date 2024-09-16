import { RxCollection, RxDocument, RxDatabase } from 'rxdb/dist/types/types';

export type IAdapter = 'idb' | 'memory' | 'websql' | 'leveldb' | 'localstorage';

// Local db types
// --------------------
export type LocalDbCollections = {
  users: UserCollection;
  activities: ActivityCollection;
};

export type LocalDb = RxDatabase<LocalDbCollections>;

// Doc types
// --------------------
export type UserDocType = {
  id: string;
  code: string;
  name?: string;
  email?: string;
  host?: boolean;
  role?: 'teacher' | 'learner';
  phone?: string;
  address?: string;
  area?: string;
};

export type ActivityDocType = {
  id: string;
  title: string;
  instruction: string;
  description: string;
  type: string;
  userId: string;
  token?: string;
  auth?: string;
  markerFileId?: string;
  markerImagesIds?: string[];
  markerFile?: any;
  markerImages?: string[] | Blob[] | any[];
  markerImagesCfg?: {
    worldWidth: number;
    worldHeight: number;
    // marker width and height sould be relative
    // for multi-device
    width: number;
    height: number;
  }[];
  comboIds?: string[]; // for group and path activity ids
  meta: Record<string, unknown>;
  // not persisted in local rxdb
  markerImagesBase64?: string[];
  markerFileBase64?: string;
  isDownload: boolean;
  group?: string[];
  path?: string[];
};

export type AuraDocType = {
  id: string;
  activityId: string;
  type:
    | 'AText'
    | 'APopover'
    | 'A3d'
    | 'AImage'
    | 'APool'
    | 'AFile'
    | 'AVideo'
    | 'AAudio'
    | 'Alink';

  content: {
    value?: Record<string, unknown> | string;
    file?: File | Blob;
    base64?: string;
    type?: string;
  };
  cfg: Record<string, unknown>;
  meta: Record<string, unknown>;
  // not persisted in local rxdb
  contentBase64?: string;
};

export type ClassDocType = {
  id: string;
  title: string;
  description: string;
  cover: string;
  link: string;
  code: string;
};

export type UserActivityDocType = {
  userId: string;
  activityId: string;
  userRole: 'creator' | 'editor' | 'viewer';
};

export type ClassActivityDocType = {
  classId: string;
  activityId: string;
};

export type TraceDocType = {
  id: string;
  userId: string;
  activityId: string;
  auraId?: string;
  traceType: string;
  timestamp: number;
  timestampIso: string;
  duration?: number;
};

// Doc & Col methods types
// --------------------

// user
export type UserDocMethods = any;
export type UserCollectionMethods = {
  getCount: (this: UserCollection) => Promise<number>;
  addDoc: (this: UserCollection, doc: UserDocType) => Promise<UserDocType>;
};

export type UserDocument = RxDocument<UserDocType, UserDocMethods>;
export type UserCollection = RxCollection<
  UserDocType,
  UserDocMethods,
  UserCollectionMethods
>;

// activity
export type ActivityDocMethods = any;
export type ActivityCollectionMethods = {
  addDoc: (
    this: ActivityCollection,
    doc: ActivityDocType,
    user: UserDocType,
  ) => Promise<ActivityDocType>;
};

export type ActivityDocument = RxDocument<ActivityDocType, ActivityDocMethods>;
export type ActivityCollection = RxCollection<
  ActivityDocType,
  ActivityDocMethods,
  ActivityCollectionMethods
>;

// aura
export type AuraDocMethods = any;
export type AuraCollectionMethods = {
  addDoc: (this: AuraCollection, doc: AuraDocType) => Promise<AuraDocType>;
};

export type AuraDocument = RxDocument<AuraDocType, AuraDocMethods>;
export type AuraCollection = RxCollection<
  AuraDocType,
  AuraDocMethods,
  AuraCollectionMethods
>;

// trace
export type TraceDocMethods = any;
export type TraceCollectionMethods = {
  addDoc: (this: TraceCollection, doc: TraceDocType) => Promise<TraceDocType>;
};

export type TraceDocument = RxDocument<TraceDocType, TraceDocMethods>;
export type TraceCollection = RxCollection<
  TraceDocType,
  TraceDocMethods,
  TraceCollectionMethods
>;

export enum RxColOp {
  Add = 'Add',
  AddMany = 'AddMany',
  Remove = 'Remove',
  Update = 'Update',
  FindAll = 'FindAll',
  FindAllActivities = 'FindAllActivities',
  FindOne = 'FindOne',
  RemoveMarker = 'RemoveMarker',
  UpdateMarker = 'UpdateMarker',
  SetCurrActivity = 'SetCurrActivity',
}

export enum RxColAttachMapOp {
  ActivityAttachments = 'ActivityAttachments',
  ActivityMarkerUrl = 'ActivityMarkerUrl',
  AuraAttachments = 'AuraAttachments',
}
