import { Tank } from '../components/tank';
import { useEffect, useState } from 'react';
import { useInterval } from '../hooks/useInterval';

const keys = {
  w: false,
  a: false,
  s: false,
  d: false
};

/**
 * Renders the play page.
 */
export function Play() {
  const [pos, setPos] = useState({ x: 150, y: 50 });
  const [bodyRotation, setBodyRotation] = useState(0);
  const [turretRotation, setTurretRotation] = useState(0);

  type keyTypes = 'w' | 'a' | 's' | 'd';

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key in keys) {
      keys[e.key as keyTypes] = true;
    }

    // console.log(e.key, 'Down');

    // console.table(keys);
  }

  function handleKeyUp(e: KeyboardEvent) {
    if (e.key in keys) {
      keys[e.key as keyTypes] = false;
    }

    // console.log(e.key, 'Up');
    // console.table(keys);
  }

  function handleMove() {
    // Use last move and keys to determine new move

    if (keys.w) {
      setPos((prevPos) => ({ ...prevPos, y: prevPos.y - 3 }));
    }

    if (keys.a) {
      setPos((prevPos) => ({ ...prevPos, x: prevPos.x - 3 }));
    }

    if (keys.s) {
      setPos((prevPos) => ({ ...prevPos, y: prevPos.y + 3 }));
    }

    if (keys.d) {
      setPos((prevPos) => ({ ...prevPos, x: prevPos.x + 3 }));
    }

    let newRotation: number;

    if (keys.w && keys.a) {
      newRotation = 315;
    } else if (keys.w && keys.d) {
      newRotation = 45;
    } else if (keys.s && keys.a) {
      newRotation = 225;
    } else if (keys.s && keys.d) {
      newRotation = 135;
    } else if (keys.w) {
      newRotation = 0;
    } else if (keys.a) {
      newRotation = 270;
    } else if (keys.s) {
      newRotation = 180;
    } else if (keys.d) {
      newRotation = 90;
    } else {
      newRotation = bodyRotation;
    }

    let currentRotation = 0;
    let apparentRotation = currentRotation % 360;

    currentRotation = currentRotation || 0; // if rot undefined or 0, make 0, else rot
    apparentRotation = currentRotation % 360;
    if (apparentRotation < 0) {
      apparentRotation += 360;
    }
    if (apparentRotation < 180 && newRotation > apparentRotation + 180) {
      currentRotation -= 360;
    }
    if (apparentRotation >= 180 && newRotation <= apparentRotation - 180) {
      currentRotation += 360;
    }
    currentRotation += newRotation - apparentRotation;

    setBodyRotation(currentRotation);
  }

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const gameContainer = document.getElementById('game-container');
    if (gameContainer === null) return;
    const rect = gameContainer.getBoundingClientRect();

    // Point turret at mouse
    const mousePos = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };

    const dx = mousePos.x - pos.x;
    const dy = mousePos.y - pos.y;

    const radians = Math.atan2(dy, dx);
    const degrees = radians * (180 / Math.PI);

    setTurretRotation(degrees + 90);

    console.table({ pos: pos, mousePos: mousePos });
  }

  useEffect(() => {
    document.querySelector('body')?.addEventListener('keydown', handleKeyDown);
    document.querySelector('body')?.addEventListener('keyup', handleKeyUp);

    let moveInterval = setInterval(handleMove, 1000 / 60);

    return () => {
      document
        .querySelector('body')
        ?.removeEventListener('keydown', handleKeyDown);
      document.querySelector('body')?.removeEventListener('keyup', handleKeyUp);

      clearInterval(moveInterval);
    };
  }, [keys, pos]);

  return (
    <>
      <div
        onMouseMove={handleMouseMove}
        onClick={handleMouseMove}
        style={{
          width: '100%',
          height: 'calc(100vh - 1rem)'
        }}
      >
        <div
          id="game-container"
          style={{
            outline: '3px solid black',
            width: '600px',
            height: '400px',
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            overflow: 'hidden'
          }}
        >
          <Tank
            pos={pos}
            width={50}
            height={50}
            bodyRotation={bodyRotation}
            turretRotation={turretRotation}
          />
        </div>
      </div>
    </>
  );
}
