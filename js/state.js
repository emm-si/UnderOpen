/**
 * État global du jeu.
 */
const GameState = {
  config: {
    lang: 'fr',
    packId: 'everyday',
    playerCount: 4,
    roles: null,
  },
  game: {
    phase: 'home',
    pair: null,
    players: [],
    currentRevealIdx: 0,
    turn: 1,
    currentTurnIdx: 0,
    winner: null,
    winMsg: ''
  },
  playerNames: []
};

function updatePlayerConfig(newCount) {
  GameState.config.playerCount = newCount;
  GameState.config.roles = getDefaultRoles(newCount);
}

window.GameState = GameState;
window.updatePlayerConfig = updatePlayerConfig;
