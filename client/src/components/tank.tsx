import { transform } from 'typescript';

export function Tank(props: {
  pos: { x: number; y: number };
  width: number;
  height: number;
  bodyRotation: number;
  turretRotation: number;
  name: string;
}) {
  return (
    <>
      <h4
        style={{
          position: 'absolute',
          top: props.pos.y,
          left: props.pos.x,
          transform: `translate(-50%, ${-props.height - 25}px)`,
          whiteSpace: 'nowrap',
          maxWidth: `${props.width * 2.5}px`,
          textOverflow: 'ellipsis',
          overflow: 'hidden'
        }}
      >
        {props.name}
      </h4>
      <div
        style={{
          width: props.width,
          height: props.height,
          backgroundColor: 'red',
          position: 'absolute',
          top: props.pos.y,
          left: props.pos.x,
          transform: `translate(-50%, -50%) rotate(${props.bodyRotation}deg)`,
          transition: 'transform 0.3s',
          borderRadius: '10%'
        }}
      ></div>
      <div
        style={{
          width: props.width / 4,
          height: props.height / 1.2,
          backgroundColor: 'blue',
          position: 'absolute',
          top: `${props.pos.y}px`,
          left: `${props.pos.x}px`,
          transform: `translate(-50%, -100%) rotate(${props.turretRotation}deg)`,
          transformOrigin: '50% 100%',
          transition: 'none',

          borderRadius: '0 0 40px 40px'
        }}
      ></div>
    </>
  );
}
