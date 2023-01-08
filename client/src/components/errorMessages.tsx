import React from 'react';
import styled from 'styled-components';

type InvalidGameCodeProps = {
  gameCodeError: boolean;
}

/**
 * Displays an error message if the game code is invalid.
 * 
 * @param gameCodeError if an error message should be displayed
 */
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
