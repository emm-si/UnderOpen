/**
 * État global du jeu.
 */
const GameState = {
  players: [],
  config: {
    lang: 'fr',
    packId: 'everyday',
    playersCount: 3,
    roles: null,
  },
  game: {
    phase: 'home',
    currentPlayerIndex: 0,
    turn: 1,
    pair: null,
    winner: null,
    pendingCaptainZero: null // Stocke l'ID de Captain Zero en attente de devinette
  }
};

function updatePlayerConfig(newCount) {
  GameState.config.playersCount = newCount;
  GameState.config.roles = getDefaultRoles(newCount);
}

window.GameState = GameState;
window.updatePlayerConfig = updatePlayerConfig;