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
import { CondensedProjectile } from '../../../server/common/types/projectileTypes';
import { Bullet } from '../components/bullet';

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
    myEvents = [];
  }
}

function newShootEvent(
  position: CondensedPosition,
  bodyAngle: number,
  turretAngle: number
) {
  const newShootEvent: GameEvent = {
    type: 'shoot',
    position: position,
    bodyAngle: bodyAngle,
    turretAngle: turretAngle
  };

  myEvents.push(newShootEvent);

  if (Date.now() - lastPost > UPDATE_INTERVAL) {
    socket.emit('events', { events: myEvents });
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

  const [players, setPlayers] = useState<CondensedPlayer[]>([]);

  const [projectiles, setProjectiles] = useState<CondensedProjectile[]>([]);

  const VELOCITY = 2.5;

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

    myBodyAngle = targetRotation;

    newMoveEvent(myPosition, myBodyAngle, myTurretAngle);
    setBodyRotation(targetRotation);
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

  function handleClick() {
    newShootEvent(
      {
        x:
          myPosition.x +
          Math.cos((myTurretAngle - 90) * (Math.PI / 180)) * (35 / 1.2),
        y:
          myPosition.y +
          Math.sin((myTurretAngle - 90) * (Math.PI / 180)) * (35 / 1.2)
      },
      myBodyAngle,
      myTurretAngle - 90
    );
  }

  // SET UP LOCAL LISTENERS ON EACH MOUNT
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

  // SET UP SOCKET LISTENERS ON FIRST MOUNT
  useEffect(() => {
    socket.on('roundStart', (data: CondensedRound) => {
      setPlayers(data.players);
      if (data.map) {
        persistentMapData = data.map.mapData;
        setMapData(data.map.mapData);
      }
    });

    socket.on('roundUpdate', (data: CondensedRound) => {
      setPlayers(data.players);
      setProjectiles(data.projectiles);
    });

    socket.on('player-update', (data: CondensedPlayer) => {
      playerId = data.id;
      setPos(data.position);
      myPosition.x = data.position.x;
      myPosition.y = data.position.y;
    });
  }, []);
  console.log(mapData);
  return (
    <>
      <div
        onMouseMove={handleMouseMove}
        onClick={handleClick}
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

          {/* RENDER ALL TANKS, AND SELF AS SHADOW */}
          {players.map((player) => {
            if (!player.alive) return null;

            if (player.id === playerId)
              return (
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
            );
          })}
          <Tank
            name={'You'}
            pos={pos}
            width={35}
            height={35}
            bodyRotation={bodyRotation}
            turretRotation={turretRotation}
          />

          {/* RENDER ALL PROJECTILES */}
          {projectiles.map((projectile) => {
            return (
              <Bullet
                key={projectile.id}
                pos={projectile.pos}
                vel={projectile.vel}
              ></Bullet>
            );
          })}
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
