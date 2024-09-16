import { StoreSlice } from '../../hooks/useStore';
import { AuraDocType } from '../../db/types';

interface State {
  auras: AuraDocType[];
  get: (activityId: string) => AuraDocType[];
  find: (auraId: string) => AuraDocType | undefined;
  set: (auras: Partial<AuraDocType>[]) => void;
  add: (aura: Partial<AuraDocType>) => void;
  remove: (id: string | number) => void;
  update: (aura: Partial<AuraDocType>) => void;
}

interface Slice {
  auraSlice: State;
}

const auraSlice: StoreSlice<Slice> = (set, get) => ({
  auraSlice: {
    auras: [],
    get: (activityId: string) => {
      return get().auraSlice.auras.filter(
        (aura) => aura.activityId === activityId,
      );
    },
    find: (auraId: string) => {
      return get().auraSlice.auras.find((aura) => aura.id === auraId);
    },
    set: (auras: Partial<AuraDocType>[]) => {
      set((state): any => ({
        auraSlice: { ...state.auraSlice, auras },
      }));
    },
    add: (aura) => {
      set((state): any => ({
        auraSlice: {
          ...state.auraSlice,
          auras: [aura, ...state.auraSlice.auras],
        },
      }));
    },
    remove: (id) => {
      set((state): any => ({
        auraSlice: {
          ...state.auraSlice,
          auras: state.auraSlice.auras.filter((aura) => aura.id !== id),
        },
      }));
    },
    update: (aura) => {
      set((state): any => ({
        auraSlice: {
          ...state.auraSlice,
          auras: state.auraSlice.auras.map((item) => {
            if (item.id === aura.id) {
              return {
                ...item,
                content: {
                  ...item.content,
                  ...aura.content,
                },
                cfg: {
                  ...item.cfg,
                  ...aura.cfg,
                },
                meta: {
                  ...item.meta,
                  ...aura.meta,
                },
              };
            } else {
              return item;
            }
          }),
        },
      }));
    },
  },
});

export default auraSlice;
