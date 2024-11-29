import create from 'zustand';
import { StoreSlice } from '../../hooks/useStore';
import { Slice } from '@tiptap/pm/model';
import Aura from '../aura/aura';

export interface Layer {
  id: string;
  name?: string;
  visible: boolean;
  opacity: number;
  zIndex: number;
  content: any;
  auras: Aura[];
  cfg?: any;
  meta?: any;
}

interface State {
  layers: Layer[];
  addLayer: (name: string, content: any) => void;
  removeLayer: (id: string) => void;
  toggleVisibility: (id: string) => void;
  addAuraToLayer: (layerId: string, aura: Aura) => void;
}

interface LayerState {
  layerSlice: State;
}

const layerSlice: StoreSlice<LayerState> = (set /*, get*/) => ({
  layerSlice: {
  layers: [],
  addLayer: (name, content) => { set((state): any => ({
      layerSlice: {...state.layerSlice, 
        layers: [...state.layerSlice.layers, { 
          id: Date.now().toString(), 
          name, 
          visible: true, 
          opacity: 1, 
          zIndex: state.layerSlice.layers.length, 
          content, 
          auras: [] }]}
  }));
},
  removeLayer: (id) =>{ set((state): any => ({
    layers: state.layerSlice.layers.filter((layer) => layer.id !== id)
  }));
},
  toggleVisibility: (id) =>{ set((state): any => ({
    layers: state.layerSlice.layers.map(layer => layer.id === id ? { ...layer, visible: !layer.visible } : layer)
  }));
},
addAuraToLayer: (layerId, aura) => {
      set((state): any => ({
        layerSlice: {
          ...state.layerSlice,
          layers: state.layerSlice.layers.map((layer) =>
            layer.id === layerId ? { ...layer, auras: [...layer.auras, aura] } : layer,
          ),}
        }
    ));
    },
},
});

export default layerSlice;
