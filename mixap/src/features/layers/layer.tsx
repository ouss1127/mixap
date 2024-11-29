import React from 'react';

interface LayerProps {
  id: string;
  name?: string;
  visible: boolean;
  opacity: number;
  zIndex: number;
  content: any;
  onChange: (layer: LayerProps) => void;
  onDelete: (id: string) => void;
}

const Layer: React.FC<LayerProps> = ({
  id,
  name,
  visible,
  opacity,
  zIndex,
  content,
  onChange,
  onDelete,
}) => {
  const handleVisibilityToggle = () => {
    onChange({ id, name, visible: !visible, opacity, zIndex, content });
  };

  const handleDelete = () => {
    onDelete(id);
  };

  const Layer: React.FC<LayerProps> = ({
    id,
    name,
    visible,
    opacity,
    zIndex,
    content,
    auras,
    onChange,
    onDelete,
  }) => {
    return (
      <div style={{ opacity: visible ? 1 : 0.5, zIndex }}>
        <h3>{name || `Layer ${id}`}</h3>
        <div>{content}</div>
        <h4>Auras:</h4>
        <ul>
          {auras.map((aura) => (
            <li key={aura.id}>
              {aura.type} - {aura.content?.value}
            </li>
          ))}
        </ul>
        <button onClick={() => onChange({ id, name, visible: !visible })}>
          {visible ? 'Hide' : 'Show'}
        </button>
        <button onClick={() => onDelete(id)}>Delete</button>
      </div>
    );
  };
};  

export default Layer;