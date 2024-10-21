import React from 'react';
import { Layer } from '../enums/layer';
import { useLayer } from '../hooks/useLayer';

const LayerList: React.FC = () => {
    const layers: Layer[] = useLayer(state => state.layers);
    const addLayer = useLayer(state => state.addLayer);
    const removeLayer = useLayer(state => state.removeLayer);
    const toggleVisibility = useLayer(state => state.toggleVisibility);

    return (
        <div>
            <h2>Calques</h2>
            <ul>
                {layers.map(layer => (
                    <li key={layer.id}>
                        {layer.name} ({layer.visible ? 'Visible' : 'Hidden'})
                        <button onClick={() => toggleVisibility(layer.id)}>
                            {layer.visible ? 'Cacher' : 'Afficher'}
                        </button>
                        <button onClick={() => removeLayer(layer.id)}>Supprimer</button>
                    </li>
                ))}
            </ul>
            <button onClick={() => addLayer('Nouveau Calque', {})}>Ajouter un Calque</button>
        </div>
    );
};

export default LayerList;