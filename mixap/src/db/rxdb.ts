import { createRxDatabase, RxDatabase, addRxPlugin } from 'rxdb';
import { getRxStoragePouch, addPouchPlugin, PouchSettings } from 'rxdb/plugins/pouchdb';
import { RxDBAttachmentsPlugin } from 'rxdb/plugins/attachments';

import { RxDBDevModePlugin } from 'rxdb/plugins/dev-mode';
import { RxDBUpdatePlugin } from 'rxdb/plugins/update';
import * as RxIdbAdapter from 'pouchdb-adapter-idb';
import { RxDBMigrationPlugin } from 'rxdb/plugins/migration';
import { RxDBQueryBuilderPlugin } from 'rxdb/plugins/query-builder';

import { LocalDb, LocalDbCollections } from './types';
import { activitySchema, auraSchema, userSchema } from './schemas';
import { logger } from '../hooks/useLogger';

addRxPlugin(RxDBMigrationPlugin);

addRxPlugin(RxDBAttachmentsPlugin);
addRxPlugin(RxDBDevModePlugin);
addPouchPlugin(RxIdbAdapter);
addRxPlugin(RxDBUpdatePlugin);
addRxPlugin(RxDBQueryBuilderPlugin);

const log = logger('rxdb');

let dbPromise: Promise<RxDatabase<LocalDbCollections>>;

const createDB = async () => {
  log.debug('DatabaseService: creating database..');

  const db: LocalDb = await createRxDatabase<LocalDbCollections>({
    name: 'mixapdb', // <- name
    storage: getRxStoragePouch('idb',{revs_limit:1}),//Important il faut ajouter le paramètre rexvs_limit à 1 pour limlité les enregistrement d'une même activité à une seule ligne
    password: 'passpasspass', // <- password (optional)
    multiInstance: true, // This should be set to false when you have single-instances like a single-window electron-app
    eventReduce: true, // <- eventReduce (optional, default: true),

  });

  await db.addCollections({
    users: {
      schema: userSchema,
      migrationStrategies: {
        1: function (oldDoc) {
          return oldDoc;
        },
      },
    },
    activities: {
      schema: activitySchema,
      migrationStrategies: {
        1: function (oldDoc) {
          return oldDoc;
        },
        2: function (oldDoc) {
          return oldDoc;
        },
        3: function (oldDoc) {
          return oldDoc;
        },
        4: function (oldDoc) {
          return oldDoc;
        },
        5: function (oldDoc) {
          return oldDoc;
        },
        6: function (oldDoc) {
          return oldDoc;
        },
      },
    },
    auras: {
      schema: auraSchema,
      migrationStrategies: {
        1: function (oldDoc) {
          return oldDoc;
        },
      },
    },
  });

  log.debug('DatabaseService: DB dir', db);
  log.debug('DatabaseService: Database created!!');

  return db;
};

const deleteDB = async () => {
  if (!dbPromise) return false;
  const db = await dbPromise;
  await db.destroy();
  await db.remove();
  return true;
};

const getDB = async () => {
  if (!dbPromise) dbPromise = createDB();
  return dbPromise;
};

export { getDB, deleteDB };
