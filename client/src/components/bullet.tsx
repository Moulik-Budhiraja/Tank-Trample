import { useEffect, useState } from 'react';

export function Bullet(props: {
  pos: { x: number; y: number };
  vel: { x: number; y: number };
}) {
  return (
    <>
      <div
        style={{
          position: 'absolute',
          top: props.pos.y,
          left: props.pos.x,
          transform: `translate(-50%, -50%)`,
          width: '10px',
          height: '10px',
          backgroundColor: 'black',
          borderRadius: '50%'
        }}
      ></div>
    </>
  );
}
