/**
 * Gestion des rôles (Citoyens, Infiltrés, Captain Zero).
 */
const Role = {
  CITIZEN: 'citizen',
  INFILTRATOR: 'infiltrator',
  CAPTAIN_ZERO: 'captainZero'
};

function getDefaultRoles(playerCount) {
  if (playerCount < 3) return null;

  let infiltrators = 1;
  let captainZeros = 0;

  if (playerCount === 3 || playerCount === 4) {
    infiltrators = 1; captainZeros = 0;
  } else if (playerCount >= 5 && playerCount <= 6) {
    infiltrators = 1; captainZeros = 1;
  } else if (playerCount >= 7 && playerCount <= 9) {
    infiltrators = 2; captainZeros = 1;
  } else if (playerCount >= 10) {
    infiltrators = 3; captainZeros = 1;
  }

  const citizens = playerCount - infiltrators - captainZeros;

  return {
    citizens,
    infiltrators,
    captainZeros,
    total: playerCount
  };
}

function isValidConfig(config) {
  // RÈGLE STRICTE : Civils >= Infiltrés + Captain Zeros
  return config.citizens >= (config.infiltrators + config.captainZeros);
}

function assignRoles(config) {
  const roles = [];
  
  for (let i = 0; i < config.citizens; i++) roles.push(Role.CITIZEN);
  for (let i = 0; i < config.infiltrators; i++) roles.push(Role.INFILTRATOR);
  for (let i = 0; i < config.captainZeros; i++) roles.push(Role.CAPTAIN_ZERO);

  // Mélange de Fisher-Yates
  for (let i = roles.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [roles[i], roles[j]] = [roles[j], roles[i]];
  }
  
  return roles;
}

window.Role = Role;
window.getDefaultRoles = getDefaultRoles;
window.isValidConfig = isValidConfig;
window.assignRoles = assignRoles;