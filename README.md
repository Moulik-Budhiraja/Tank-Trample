# Tank Trample

## About

Tank Trample is a game that is being developed by @Moulik-Budhiraja and @Toonyloo for a high school computer science class. The game is a 2D top-down shooter where the player controls a tank and must destroy the enemy tanks. The game is heavily inspired by the local multiplayer game [Tank Trouble](https://tanktrouble.com/). The key difference between the two games being that Tank Trample has online multiplayer. The game is being developed using typescript and the [React](https://reactjs.org/) framework.

## Installation

There are multiple ways to install the game but the recommended method is to use [Docker](https://www.docker.com/) but it is also possible to use [Node.js](https://nodejs.org/en/) and [npm](https://www.npmjs.com/).

### Docker (Recommended)

You will need to have [Docker](https://docs.docker.com/get-docker/) and [Docker Compose](https://docs.docker.com/compose/install/) installed on your computer.

To install the game, clone the repository and run the following command in the root directory of the project:

```bash
docker compose up
```

The docker compose file will build both the client and server images and run them. The client will be available at `http://localhost:3000` and the server will be available at `http://localhost:3001`.

### Node.js

You will need to have [Node.js](https://nodejs.org/en/) and [npm](https://www.npmjs.com/) installed on your computer.

To install the game, clone the repository and run `npm install` in both the `client` and `server` directories.

```bash
cd client
npm install
cd ../server
npm install
```

To run the client, run the following command in the `client` directory:

```bash
npm start
```

To run the server, run the following command in the `server` directory:

```bash
npm start
```

The client will be available at `http://localhost:3000` and the server will be available at `http://localhost:3001`.

## Play

1. Navigate to your hosted URL.
2. Choose "Create Game" to create a new game or enter a game code to join an existing game.
3. In the lobby screen, choose a name and wait for the host to start the game.
4. Once in the play screen, use the WASD keys to move your tank, use the mouse to aim your cannon, and click to fire.
5. Powerups will spawn periodically that modify your tank's cannon. 
6. The last person standing in a round wins a point.

An online hosted version of this game is currently availible at [https://tank-trample.budhiraja.ca/](https://tank-trample.budhiraja.ca/).

## Known Issues

* Tanks can shoot through walls if close enough
* Tanks can drive on walls if colliding from an endpoint
* Bullets can hit tank if tank is clipping through a wall
* Players sometimes spawn inside walls at the start of a round
