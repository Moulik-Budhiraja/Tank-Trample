import { Tank } from '../components/tank';
import { useEffect, useState } from 'react';
import {
  CondensedRound,
  GameEvent
} from '../../../server/common/types/gameTypes';
import { CondensedPosition } from '../../../server/common/types/positionTypes';
import { socket } from '../service/socket';
import { CondensedPlayer } from '../../../server/common/types/playerTypes';
import { UPDATE_INTERVAL } from '../config';
import { PingTracker } from '../components/pingTracker';

const keys = {
  w: false,
  a: false,
  s: false,
  d: false
};

const myPosition: CondensedPosition = { x: 150, y: 50 };
let myBodyAngle: number = 0;
let myTurretAngle: number = 0;
let myEvents: GameEvent[] = [];
let lastPost: number = 0;

let persistentMapData = '';

let playerId: string;

function newMoveEvent(
  position: CondensedPosition,
  bodyAngle: number,
  turretAngle: number
) {
  // If a move event already exists, update it
  // If not, create a new one

  const existingMoveEvent = myEvents.find((event) => {
    return event.type === 'move';
  });

  if (existingMoveEvent) {
    existingMoveEvent.position = position;
    existingMoveEvent.bodyAngle = bodyAngle;
    existingMoveEvent.turretAngle = turretAngle;

    // console.log('updated move event');
    // console.table(existingMoveEvent);
  } else {
    const newMoveEvent: GameEvent = {
      type: 'move',
      position: position,
      bodyAngle: bodyAngle,
      turretAngle: turretAngle
    };

    myEvents.push(newMoveEvent);
  }

  if (Date.now() - lastPost > UPDATE_INTERVAL) {
    socket.emit('events', { events: myEvents });
    // console.log('Sent events', Date.now());
    // console.table(myEvents[0]);
    myEvents = [];
  }
}

/**
 * Renders the play page.
 */
export function Play() {
  const [pos, setPos] = useState(myPosition);
  const [bodyRotation, setBodyRotation] = useState(0);
  const [turretRotation, setTurretRotation] = useState(0);

  const [mapData, setMapData] = useState(persistentMapData);

  const [players, setPlayers] = useState<CondensedPlayer[]>([
    {
      id: 'lkdsajf',
      name: 'jksdfa',
      gameCode: 'gasdkfjh',
      host: false,
      position: { x: 0, y: 0 },
      bodyAngle: 0,
      turretAngle: 0
    }
  ]);

  const VELOCITY = 3;

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
      setPos((prevPos) => ({ ...prevPos, y: prevPos.y - VELOCITY }));
      myPosition.y -= VELOCITY;
    }

    if (keys.a) {
      setPos((prevPos) => ({ ...prevPos, x: prevPos.x - VELOCITY }));
      myPosition.x -= VELOCITY;
    }

    if (keys.s) {
      setPos((prevPos) => ({ ...prevPos, y: prevPos.y + VELOCITY }));
      myPosition.y += VELOCITY;
    }

    if (keys.d) {
      setPos((prevPos) => ({ ...prevPos, x: prevPos.x + VELOCITY }));
      myPosition.x += VELOCITY;
    }

    let targetRotation: number;

    if (keys.w && keys.a) {
      targetRotation = 315;
    } else if (keys.w && keys.d) {
      targetRotation = 45;
    } else if (keys.s && keys.a) {
      targetRotation = 225;
    } else if (keys.s && keys.d) {
      targetRotation = 135;
    } else if (keys.w) {
      targetRotation = 0;
    } else if (keys.a) {
      targetRotation = 270;
    } else if (keys.s) {
      targetRotation = 180;
    } else if (keys.d) {
      targetRotation = 90;
    } else {
      targetRotation = bodyRotation;
    }

    myBodyAngle = targetRotation; // KEEP THIS LINE

    newMoveEvent(myPosition, myBodyAngle, myTurretAngle);
    setBodyRotation(targetRotation);

    // let currentRotation = (bodyRotation + 360) % 360;
    // let smallestRotation = 360;

    // let rot1 = (targetRotation - currentRotation + 360) % 360;
    // let rot2 = (currentRotation - targetRotation + 360) % 360;
    // let rot3 = (targetRotation - currentRotation + 540) % 360;
    // let rot4 = (currentRotation - targetRotation + 540) % 360;
    
    // let rots = [rot1, -rot2, rot3, -rot4];
    
    // for (let rot of rots) {
    //   if (Math.abs(rot) < Math.abs(smallestRotation)) {
    //     smallestRotation = rot;
    //   }
    // }
  
    // setBodyRotation(bodyRotation + smallestRotation);
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
    myTurretAngle = degrees + 90;

    newMoveEvent(myPosition, myBodyAngle, myTurretAngle);
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

  useEffect(() => {
    socket.on('roundStart', (data: CondensedRound) => {
      setPlayers(data.players);
      if (data.map) {
        persistentMapData = data.map;
        setMapData(data.map);
      }
    });

    socket.on('roundUpdate', (data: CondensedRound) => {
      setPlayers(data.players);
    });

    socket.on('player-update', (data: CondensedPlayer) => {
        playerId = data.id;
    })
  }, []);

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
          <svg
            width="600px"
            height="400px"
            style={{
              position: 'absolute',
              top: '0',
              left: '0'
            }}
          >
            <path d={mapData} strokeWidth="3" stroke="black" fill="none"></path>
          </svg>

          {players.map((player) => {
            
            if (player.id === playerId) return (
                <Tank
              name={player.name}
              key={player.id}
              pos={player.position}
              width={35}
              height={35}
              bodyRotation={player.bodyAngle}
              turretRotation={player.turretAngle}
              ghost={true}
            />
            );

            return (
            <Tank
              name={player.name}
              key={player.id}
              pos={player.position}
              width={35}
              height={35}
              bodyRotation={player.bodyAngle}
              turretRotation={player.turretAngle}
            />
          )})}
                    <Tank
            name={'You'}
            pos={pos}
            width={35}
            height={35}
            bodyRotation={bodyRotation}
            turretRotation={turretRotation}
          />
        </div>
        <div
          style={{
            position: 'absolute',
            bottom: '1%',
            left: '50%',
            transform: 'translate(-50%, -50%)'
          }}
        >
          <PingTracker></PingTracker>
        </div>
      </div>
    </>
  );
}
