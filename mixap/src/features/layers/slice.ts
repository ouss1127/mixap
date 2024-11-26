import create from 'zustand';
import { StoreSlice } from '../../hooks/useStore';
import { Slice } from '@tiptap/pm/model';

export interface Layer {
  id: string;
  name?: string;
  visible: boolean;
  opacity: number;
  zIndex: number;
  content: any;
  cfg?: any;
  meta?: any;
}

interface State {
  layers: Layer[];
  addLayer: (name: string, content: any) => void;
  removeLayer: (id: string) => void;
  toggleVisibility: (id: string) => void;
}

interface LayerState {
  layerSlice: State;
}

const layerSlice: StoreSlice<LayerState> = (set /*, get*/) => ({
  layerSlice: {
  layers: [],
  addLayer: (name, content) => { set((state): any => ({
    layers: [...state.layerSlice.layers, { id: Date.now().toString(), name, visible: true, opacity: 1, zIndex: state.layerSlice.layers.length, content }]
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
},
});

export default layerSlice;
