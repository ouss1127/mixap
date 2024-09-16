import React from 'react';
import useStore from '../hooks/useStore';

/** @jsxImportSource @emotion/react */
// import { css } from '@emotion/react';

export default function GirdCenter(props: any) {
  const { children, width = 200, style = {} } = props;
  const isAI = useStore((state) => state.playerSlice.isAI);

  // filtre la carte de création d'activité avec IA
  var childrenFiltered = children.filter((element) => {
    if (element.key != null && element.key.includes('IA') && !isAI) {
    } else {
      return element;
    }
  });

  return (
    <div
      css={{
        padding: '0 18px',
        display: 'grid',
        gridTemplateColumns: `repeat(auto-fill, ${width}px)`,
        justifyContent: 'center',
        gridGap: 8,
        ...style,
      }}>
      {childrenFiltered}
    </div>
  );
}
