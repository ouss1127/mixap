import { useEffect, useState } from 'react';
import { layerSlice } from '../features/layers/slice';
import Layer from '../features/layers/slice';

export const useLayer = () => {
  const [layers, setLayers] = useState<Layer[]>([]);
  const { addLayer, removeLayer, toggleVisibility } = layerSlice();

  useEffect(() => {
    const fetchLayers = async () => {
      const initialLayers: Layer[] = []; 
      setLayers(initialLayers);
    };

    fetchLayers();
  }, []);

  const addNewLayer = (name: string, content: any) => {
    addLayer(name, content);
  };

  const removeExistingLayer = (id: string) => {
    removeLayer(id);
  };

  const toggleLayerVisibility = (id: string) => {
    toggleVisibility(id);
  };

  return {
    layers,
    addNewLayer,
    removeExistingLayer,
    toggleLayerVisibility,
  };
};