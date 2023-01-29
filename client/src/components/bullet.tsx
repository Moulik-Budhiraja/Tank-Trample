import { useEffect, useState } from 'react';

export function Bullet(props: {
  pos: { x: number; y: number };
  vel: { x: number; y: number };
  width: number;
  height: number;
}) {
  return (
    <>
      <div
        style={{
          position: 'absolute',
          top: props.pos.y,
          left: props.pos.x,
          transform: `translate(-50%, -50%)`,
          width: props.width,
          height: props.height,
          backgroundColor: 'black',
          borderRadius: '50%'
        }}
      ></div>
    </>
  );
}
