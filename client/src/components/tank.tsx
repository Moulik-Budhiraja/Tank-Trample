import { useEffect, useState } from 'react';
import { transform } from 'typescript';

export function Tank(props: {
  pos: { x: number; y: number };
  width: number;
  height: number;
  bodyRotation: number;
  turretRotation: number;
  name: string;
  ghost?: boolean;
}) {
  const [lastBodyRotation, setLastBodyRotation] = useState(Number);

  useEffect(() => {
    let currentRotation = (lastBodyRotation + 360) % 360;
    let smallestRotation = 360;

    let rot1 = (props.bodyRotation - currentRotation + 360) % 360;
    let rot2 = (currentRotation - props.bodyRotation + 360) % 360;
    let rot3 = (props.bodyRotation - currentRotation + 540) % 360;
    let rot4 = (currentRotation - props.bodyRotation + 540) % 360;

    let rots = [rot1, -rot2, rot3, -rot4];

    for (let rot of rots) {
      if (Math.abs(rot) < Math.abs(smallestRotation)) {
        smallestRotation = rot;
      }
    }

    setLastBodyRotation(lastBodyRotation + smallestRotation);
  });

  let tankOpacity = 1;
  let textOpacity = 1;
  if (props.ghost) {
    tankOpacity = 0;
    textOpacity = 0;
  }

  return (
    <>
      <div
        style={{
          opacity: tankOpacity
        }}
      >
        {props.name !== '' && (
          <h6
            className="noselect"
            style={{
              position: 'absolute',
              top: props.pos.y,
              left: props.pos.x,
              transform: `translate(-50%, ${-props.height - 12}px)`,
              whiteSpace: 'nowrap',
              maxWidth: `${props.width * 2.5}px`,
              textOverflow: 'ellipsis',
              overflow: 'hidden',
              opacity: textOpacity
            }}
          >
            {props.name}
          </h6>
        )}
        <div
          style={{
            width: props.width,
            height: props.height,
            backgroundColor: 'red',
            outline: '1px solid black',
            position: 'absolute',
            top: props.pos.y,
            left: props.pos.x,
            transform: `translate(-50%, -50%) rotate(${lastBodyRotation}deg)`,
            transition: 'transform 0.3s',
            borderRadius: '10%'
          }}
        >
          <div
            style={{
              width: props.width / 6,
              height: props.height,
              outline: '2px solid black',
              backgroundColor: 'gray',
              position: 'absolute',
              borderRadius: '10%'
            }}
          ></div>
          <div
            style={{
              width: props.width / 6,
              height: props.height,
              outline: '2px solid black',
              backgroundColor: 'gray',
              position: 'absolute',
              left: props.width - props.width / 6,
              borderRadius: '10%'
            }}
          ></div>
        </div>
        <div
          style={{
            width: props.width / 4,
            height: props.height / 1.2,
            backgroundColor: 'crimson',
            position: 'absolute',
            outline: '1px solid black',
            top: `${props.pos.y}px`,
            left: `${props.pos.x}px`,
            transform: `translate(-50%, -100%) rotate(${props.turretRotation}deg)`,
            transformOrigin: '50% 100%',
            transition: 'none',
            borderRadius: '0 0 40px 40px'
          }}
        ></div>
        <div
          style={{
            width: props.width / 2,
            height: props.height / 2,
            backgroundColor: 'crimson',
            outline: '1px solid black',
            position: 'absolute',
            top: props.pos.y - props.height / 4,
            left: props.pos.x - props.width / 4,
            borderRadius: '100%'
          }}
        ></div>
      </div>
    </>
  );
}
