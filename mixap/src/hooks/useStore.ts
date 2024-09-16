import create, { GetState, SetState } from 'zustand';
import { devtools } from 'zustand/middleware';

import activity from '../features/activity/slice';
import aura from '../features/aura/slice';
import editor from '../features/editor/slice';
import player from '../features/player/slice';
import mkUpload from '../features/markerUpload/slice';
import auth from '../features/auth/slice';

export type StoreSlice<T extends object, E extends object = T> = (
  set: SetState<E extends T ? E : E & T>,
  get: GetState<E extends T ? E : E & T>,
) => T;

type StateFromFunctions<T extends [...any]> = T extends [infer F, ...infer R]
  ? F extends (...args: any) => object
    ? StateFromFunctions<R> & ReturnType<F>
    : unknown
  : unknown;

type State = StateFromFunctions<
  [
    typeof activity,
    typeof aura,
    typeof editor,
    typeof player,
    typeof mkUpload,
    typeof auth,
  ]
>;

const slice = (set: SetState<any>, get: GetState<any>) => ({
  ...activity(set, get),
  ...aura(set, get),
  ...editor(set, get),
  ...player(set, get),
  ...mkUpload(set, get),
  ...auth(set, get),
});

const store = import.meta.env.NODE_ENV === 'production' ? slice : devtools(slice);

const useStore = create<State>(store as any);

export default useStore;
