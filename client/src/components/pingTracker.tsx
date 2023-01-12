import { socket } from '../service/socket';
import { useEffect, useState } from 'react';
import { Ping } from '../../../server/common/types/networkComponents';

/**
 * Displays the ping from the server
 */
export function PingTracker() {
  const [currentPing, setCurrentPing] = useState(Number);
  useEffect(() => {
    const pingInterval = setInterval(() => {
      socket.emit('ping', {
        timeSent: Date.now(),
        timeReceived: 0
      });
    }, 2000);

    socket.on('pong', (data: Ping) => {
      setCurrentPing(Date.now() - data.timeSent);
    });

    return () => clearInterval(pingInterval);
  }, []);

  return (
    <>
      <p>Ping: {currentPing}ms</p>
    </>
  );
}
