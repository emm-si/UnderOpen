/**
 * Gestionnaire des packs de mots.
 */
function getPacks(lang) {
  return lang === 'fr' ? window.PACKS_FR : window.PACKS_EN;
}

function getRandomPair(packId, lang) {
  const packs = getPacks(lang);
  if (!packs || !packs[packId]) {
    console.error(`Pack ${packId} introuvable pour la langue ${lang}`);
    return ["Erreur", "Bug"]; // Fallback de sécurité
  }
  const pairs = packs[packId].pairs;
  return pairs[Math.floor(Math.random() * pairs.length)];
}

window.getPacks = getPacks;
window.getRandomPair = getRandomPair;