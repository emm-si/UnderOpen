/**
 * Gestion des rôles (Citoyens, Infiltrés, Captain Zero).
 */
const Role = {
  CITIZEN:    'citizen',
  INFILTRATOR: 'infiltrator',
  CAPTAIN_ZERO: 'captainZero'
};

function getDefaultRoles(playerCount) {
  if (playerCount < 3) return null;

  let infiltrators = 1, captainZeros = 0;

  if (playerCount >= 5 && playerCount <= 6)  { infiltrators = 1; captainZeros = 1; }
  else if (playerCount >= 7 && playerCount <= 9) { infiltrators = 2; captainZeros = 1; }
  else if (playerCount >= 10) { infiltrators = 3; captainZeros = 1; }

  const citizens = playerCount - infiltrators - captainZeros;
  return { citizens, infiltrators, captainZeros };
}

function isValidRoles(roles, totalPlayers) {
  const citizens = totalPlayers - roles.infiltrators - roles.captainZeros;
  return (
    roles.infiltrators >= 1 &&
    roles.captainZeros >= 0 &&
    citizens >= 1 &&
    citizens >= (roles.infiltrators + roles.captainZeros)
  );
}

function assignRoles(roles) {
  const arr = [];
  for (let i = 0; i < roles.citizens;     i++) arr.push(Role.CITIZEN);
  for (let i = 0; i < roles.infiltrators; i++) arr.push(Role.INFILTRATOR);
  for (let i = 0; i < roles.captainZeros; i++) arr.push(Role.CAPTAIN_ZERO);

  // Mélange Fisher-Yates
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

window.Role = Role;
window.getDefaultRoles = getDefaultRoles;
window.isValidRoles = isValidRoles;
window.assignRoles = assignRoles;
