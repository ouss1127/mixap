export const mxResizable = {
  display: 'inline-block',
  zIndex: 99999999999999,
  // padding: 5,
  // paddingBottom: 10,
  border: '2px dashed var(--hot-color)',
  '&:active, &:hover': {
    border: '2px solid var(--hot-color)',
  },
  background: `linear-gradient(to left, var(--hot-color) 8px, transparent 8px) 100% 100%,
                linear-gradient(to top, var(--hot-color) 8px, transparent 8px) 100% 100%
                `,
  backgroundRepeat: 'no-repeat',
  backgroundSize: '25px 25px',
};

export const mxPopbar: any = {
  background: 'transparent',
  width: '100%',
  height: '100%',
  touchAction: 'none',
  userSelect: 'none',
  display: 'flex',
  justifyContent: 'space-between',
  cursor: 'move',
  position: 'relative',
};
