import React from 'react';
import styled from 'styled-components';

interface InvalidGameCodeProps {
  gameCodeError: boolean;
}

export function InvalidGameCode({ gameCodeError }: InvalidGameCodeProps) {
  if (gameCodeError) {
    return (
      <p
        style={{
          color: 'red'
        }}
      >
        Invalid game code
      </p>
    );
  }
  return <></>;
}
