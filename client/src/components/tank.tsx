import { transform } from 'typescript';

export function Tank(props: {
  pos: { x: number; y: number };
  width: number;
  height: number;
  bodyRotation: number;
  turretRotation: number;
}) {
  return (
    <>
      <div
        style={{
          width: props.width,
          height: props.height,
          backgroundColor: 'red',
          position: 'absolute',
          top: props.pos.y,
          left: props.pos.x,
          transform: `translate(-50%, -50%) rotate(${props.bodyRotation}deg)`,
          transition: 'transform 0.2s',
          borderRadius: '10%'
        }}
      >
        <div
          style={{
            width: props.width / 4,
            height: props.height / 1.2,
            backgroundColor: 'blue',
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: `translate(-50%, -100%) rotate(${
              props.turretRotation - props.bodyRotation
            }deg)`,
            transformOrigin: '50% 100%',
            transition: 'none',

            borderRadius: '0 0 40px 40px'
          }}
        ></div>
      </div>
    </>
  );
}
