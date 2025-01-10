import { useEffect, useState } from 'react';
import layerSlice from '../features/layers/slice';
import type { Layer } from '../features/layers/slice';
import  Aura from '../features/aura/Aura'
import useStore from './useStore';

/**
 * Custom hook to manage layers.
 *
 * @returns {Object} An object containing the layers state and functions to manipulate layers.
 * @returns {Layer[]} layers - The current list of layers.
 * @returns {Function} addNewLayer - Function to add a new layer.
 * @param {string} name - The name of the new layer.
 * @param {any} content - The content of the new layer.
 * @returns {Function} removeExistingLayer - Function to remove an existing layer.
 * @param {string} id - The ID of the layer to remove.
 * @returns {Function} toggleLayerVisibility - Function to toggle the visibility of a layer.
 * @param {string} id - The ID of the layer to toggle visibility.
 * @returns {Function} addNewAuraToLayer - Function to add a new aura to a layer.
 * @param {string} layerId - The ID of the layer to add the aura to.
 * @param {Aura} aura - The aura to add to the layer.
 */
export const useLayer = () => {
  const [layers, setLayers] = useState<Layer[]>([]);
  const addLayer = useStore((state) => state.layerSlice.addLayer);
  const removeLayer = useStore((state) => state.layerSlice.removeLayer);
  const toggleVisibility = useStore((state) => state.layerSlice.toggleVisibility);
  const addAuraToLayer = useStore((state) => state.layerSlice.addAuraToLayer);

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

  const addNewAuraToLayer = (layerId: string, aura: Aura) => {
    addAuraToLayer(layerId, aura);
  };

  return {
    layers,
    addNewLayer,
    removeExistingLayer,
    toggleLayerVisibility,
    addNewAuraToLayer,
  };
};
