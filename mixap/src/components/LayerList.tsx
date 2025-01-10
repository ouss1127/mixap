import React from 'react';
import useStore from '../hooks/useStore';

/**
 * LayerList component displays a list of layers with options to toggle their visibility and remove them.
 *
 * @component
 * @example
 * // Usage example:
 * // <LayerList />
 *
 * @returns {JSX.Element} A React component that renders a list of layers with visibility toggle and delete buttons.
 *
 * @remarks
 * This component uses the `useStore` hook to access the state and actions from the store.
 * It retrieves the list of layers, and provides buttons to toggle the visibility and remove each layer.
 *
 * @hook
 * @function useStore
 * @param {Function} state - The state selector function to retrieve the necessary state slices.
 * @returns {Array} layers - The list of layers from the state.
 * @returns {Function} toggleVisibility - The function to toggle the visibility of a layer.
 * @returns {Function} removeLayer - The function to remove a layer.
 */
const LayerList = () => {
  const layers = useStore((state) => state.layerSlice.layers);
  
  const toggleVisibility = useStore((state) => state.layerSlice.toggleLayerVisibility);
  const removeLayer = useStore((state) => state.layerSlice.removeLayer);

  return (
    <div>
      <h3>Layers</h3>
      <ul>
        {layers.map((layer) => (
          <li key={layer.id}>
            <span>{layer.name || `Layer ${layer.id}`}</span>
            
            <button onClick={() => toggleVisibility(layer.id)}>
              {layer.visible ? 'Hide' : 'Show'}
            </button>
            
            <button onClick={() => removeLayer(layer.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default LayerList;
