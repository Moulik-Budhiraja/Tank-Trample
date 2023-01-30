export function PowerUp(props: {
  pos: { x: number; y: number };
  letter: string;
}) {
  return (
    <div
      className="noselect"
      style={{
        width: 20,
        height: 20,
        backgroundColor: 'orange',
        position: 'absolute',
        top: props.pos.y,
        left: props.pos.x,
        transform: `translate(-50%, -50%)`,
        borderRadius: '100%',
        textAlign: 'center',
        lineHeight: '18px'
      }}
    >
      {props.letter}
    </div>
  );
}
