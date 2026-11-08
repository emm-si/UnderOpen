document.addEventListener('DOMContentLoaded', () => {
  const app = document.getElementById('app');

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(err => console.warn('SW error:', err));
  }

  updatePlayerConfig(3);

  const screens = {
    home: `
      <div class="screen active" id="screen-home">
        <div class="top-bar" style="justify-content: space-between;">
          <div class="icon-btn" onclick="goToScreen('settings')">⚙️</div>
          <div class="icon-btn" style="background:rgba(255,255,255,0.1)">👥</div>
        </div>
        <h1 class="title-large" style="margin-top: 50px;">Underopen</h1>
        <p style="text-align: center; color: #aaa; margin-bottom: 20px;" id="home-pack-display"></p>
        <button class="btn-main" style="margin-top: auto; margin-bottom: 40px;" onclick="goToScreen('setup')">JOUER</button>
      </div>
    `,
    settings: `
      <div class="screen active" id="screen-settings">
        <div class="top-bar"><div class="icon-btn" onclick="goToScreen('home')">←</div></div>
        <h2 class="title-large">Paramètres</h2>
        
        <div class="role-card" style="color: white; background: rgba(255,255,255,0.1);">
          <h3>Langue / Language</h3>
          <div style="display: flex; gap: 10px; margin-top: 15px;">
            <button class="btn-secondary" id="btn-lang-fr" style="width: 50%;" onclick="changeLang('fr')">Français</button>
            <button class="btn-secondary" id="btn-lang-en" style="width: 50%;" onclick="changeLang('en')">English</button>
          </div>
        </div>
        <button class="btn-main" style="margin-top: auto;" onclick="goToScreen('home')">Retour</button>
      </div>
    `,
    packs: `
      <div class="screen active" id="screen-packs">
        <div class="top-bar"><div class="icon-btn" onclick="goToScreen('setup')">←</div></div>
        <h2 class="title-large">Thèmes de mots</h2>
        <div id="packs-list" style="display: flex; flex-direction: column; gap: 10px; overflow-y: auto; max-height: 70vh;">
          <!-- Généré par JS -->
        </div>
      </div>
    `,
    setup: `
      <div class="screen active" id="screen-setup">
        <div class="top-bar" style="justify-content: space-between;">
          <div class="icon-btn" onclick="goToScreen('home')">←</div>
          <div style="text-align: center; color: #5c9bff; font-weight: bold;">
            <div class="icon-btn" style="background:none; border:none; font-size: 30px; width:auto; height:auto;">👥</div>
            Groupes
          </div>
        </div>
        
        <div class="players-display">
          <h2 class="players-number">Joueurs : <span id="player-count-display">3</span></h2>
        </div>
        
        <div class="slider-container">
          <div class="avatar-indicator" id="avatar-indicator">👦🏻</div>
          <input type="range" id="player-slider" min="3" max="15" value="3" oninput="handlePlayerSliderChange(this.value)">
        </div>

        <div class="role-card" id="role-card">
          <div class="civil-badge" id="display-citizens">2 Civils</div>
          
          <div class="role-row">
            <button class="circle-btn dark" id="btn-uc-minus" onclick="adjustRole('infiltrators', -1)">-</button>
            <div class="role-pill undercover" id="display-uc">1 Infiltré</div>
            <button class="circle-btn dark" id="btn-uc-plus" onclick="adjustRole('infiltrators', 1)">+</button>
          </div>
          
          <div class="role-row">
            <button class="circle-btn" id="btn-mw-minus" onclick="adjustRole('captainZeros', -1)">-</button>
            <div class="role-pill mrwhite" id="display-mw">0 Captain Zero</div>
            <button class="circle-btn" id="btn-mw-plus" onclick="adjustRole('captainZeros', 1)">+</button>
          </div>
        </div>

        <div class="special-roles-banner" onclick="goToScreen('packs')" style="cursor: pointer;">
          <p>Mots</p>
          <strong id="setup-pack-display" style="font-size: 1.2rem;">Standards</strong>
        </div>

        <div style="display:flex; flex-direction:column; align-items:center; margin-top: auto;">
          <button class="btn-main" onclick="startGame()">Commencer</button>
        </div>
      </div>
    `,
    reveal: `
      <div class="screen active" id="screen-reveal">
        <h2 class="title-large" style="margin-top:40px;">Joueur <span id="reveal-player-num">1</span></h2>
        <div class="reveal-card" id="reveal-card" onclick="nextReveal()">
          <p class="role-hint">Passe le téléphone, puis tape pour révéler</p>
          <div class="word-display" id="reveal-word">•••</div>
          <p class="role-hint" id="reveal-role-hint"></p>
        </div>
        <button class="btn-main" id="reveal-next-btn" onclick="nextReveal()">J'ai vu</button>
      </div>
    `,
    play: `
      <div class="screen active" id="screen-play">
        <div class="top-bar">
          <div class="icon-btn" onclick="goToScreen('settings')">⚙️</div>
          <h2 style="font-size: 1.5rem;">Tour <span id="turn-number">1</span></h2>
          <div class="icon-btn">❓</div>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <p style="color: #aaa; margin-bottom: 10px;">Joueurs en jeu : <span id="alive-count"></span></p>
          <div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 10px; margin-bottom: 30px;">
            <div id="alive-players-list" style="display: flex; flex-wrap: wrap; justify-content: center; gap: 10px; width: 100%;"></div>
          </div>
        </div>

        <div class="reveal-card" style="margin-top: 0; padding: 20px;">
           <p class="role-hint" style="font-size: 1rem;">À tour de rôle, donnez un indice sur votre mot. Puis votez pour éliminer un suspect.</p>
        </div>

        <button class="btn-main" style="margin-top: auto;" onclick="goToScreen('vote')">Passer au vote 🗳️</button>
      </div>
    `,
    vote: `
      <div class="screen active" id="screen-vote">
        <h2 class="title-large" style="margin-top: 20px;">Qui est éliminé ?</h2>
        <p style="text-align: center; color: #aaa; margin-bottom: 20px;">Touchez le nom du joueur à éliminer.</p>
        
        <div id="vote-list" style="display: flex; flex-direction: column; gap: 10px; overflow-y: auto; max-height: 60vh;">
          <!-- Généré par JS -->
        </div>
      </div>
    `,
    captainGuess: `
      <div class="screen active" id="screen-captain">
        <h2 class="title-large" style="margin-top: 40px;">Captain Zero a été démasqué !</h2>
        <div class="reveal-card" style="margin: 20px 0; padding: 30px 20px;">
          <p class="role-hint">Pour voler la victoire, devine le mot des Citoyens :</p>
          <input type="text" id="captain-guess-input" style="width: 100%; padding: 15px; border-radius: 15px; border: 2px solid var(--primary); font-size: 1.2rem; text-align: center; margin: 20px 0; outline: none;" placeholder="Ton mot...">
          <button class="btn-main" style="background: var(--primary); color: white; padding: 15px;" onclick="submitCaptainGuess()">Valider</button>
        </div>
      </div>
    `,
    result: `
      <div class="screen active" id="screen-result">
        <h2 class="title-large" style="margin-top: 40px;" id="result-title">Résultat</h2>
        <div class="reveal-card" style="margin: 20px 0;">
          <div class="word-display" id="result-icon" style="font-size: 4rem;">🏆</div>
          <p class="role-hint" id="result-desc"></p>
        </div>
        <button class="btn-main" style="margin-top: auto;" onclick="goToScreen('home')">Retour à l'accueil</button>
      </div>
    `
  };

  window.goToScreen = (screenName) => {
    if (screens[screenName]) {
      app.innerHTML = screens[screenName];
      GameState.game.phase = screenName;
      
      if (screenName === 'setup') updateSetupUI();
      if (screenName === 'play') updatePlayUI();
      if (screenName === 'vote') updateVoteUI();
      if (screenName === 'packs') updatePacksUI();
      if (screenName === 'settings') updateSettingsUI();
      if (screenName === 'home') updateHomeUI();
    }
  };

  // --- UI UPDATES ---
  window.updateHomeUI = () => {
    const packs = getPacks(GameState.config.lang);
    const packName = packs[GameState.config.packId] ? packs[GameState.config.packId].name : "Inconnu";
    document.getElementById('home-pack-display').textContent = `Thème : ${packName}`;
  };

  window.updateSettingsUI = () => {
    document.getElementById('btn-lang-fr').style.background = GameState.config.lang === 'fr' ? 'var(--primary)' : 'rgba(255,255,255,0.2)';
    document.getElementById('btn-lang-fr').style.color = GameState.config.lang === 'fr' ? 'white' : 'black';
    
    document.getElementById('btn-lang-en').style.background = GameState.config.lang === 'en' ? 'var(--primary)' : 'rgba(255,255,255,0.2)';
    document.getElementById('btn-lang-en').style.color = GameState.config.lang === 'en' ? 'white' : 'black';
  };

  window.changeLang = (lang) => {
    GameState.config.lang = lang;
    updateSettingsUI();
  };

  window.updatePacksUI = () => {
    const packs = getPacks(GameState.config.lang);
    const list = document.getElementById('packs-list');
    list.innerHTML = Object.keys(packs).map(key => `
      <button class="btn-secondary" style="width: 100%; margin: 0; padding: 20px; font-size: 1.2rem; background: ${GameState.config.packId === key ? 'var(--primary)' : 'rgba(255,255,255,0.1)'}; color: ${GameState.config.packId === key ? 'white' : 'white'}; border: 1px solid rgba(255,255,255,0.2);"
        onclick="selectPack('${key}')">
        ${packs[key].name}
      </button>
    `).join('');
  };

  window.selectPack = (packId) => {
    GameState.config.packId = packId;
    updatePacksUI();
    setTimeout(() => goToScreen('setup'), 200); // Petit délai pour voir la sélection
  };

  window.updateSetupUI = () => {
    const cfg = GameState.config, roles = cfg.roles;
    if (!document.getElementById('player-slider')) return;

    const packs = getPacks(cfg.lang);
    const packName = packs[cfg.packId] ? packs[cfg.packId].name : "Standard";
    document.getElementById('setup-pack-display').textContent = packName;

    document.getElementById('player-count-display').textContent = cfg.playersCount;
    document.getElementById('display-citizens').textContent = `${roles.citizens} Civils`;
    document.getElementById('display-uc').textContent = `${roles.infiltrators} Infiltré${roles.infiltrators > 1 ? 's' : ''}`;
    document.getElementById('display-mw').textContent = `${roles.captainZeros} Captain Zero${roles.captainZeros > 1 ? 's' : ''}`;

    const percent = ((cfg.playersCount - 3) / (15 - 3)) * 100;
    document.getElementById('avatar-indicator').style.left = `calc(${percent}% - 16px)`;

    const canCustom = cfg.playersCount >= 5;
    ['btn-uc-plus', 'btn-uc-minus', 'btn-mw-plus', 'btn-mw-minus'].forEach(id => {
      document.getElementById(id).style.visibility = canCustom ? 'visible' : 'hidden';
    });
  };

  window.handlePlayerSliderChange = (val) => {
    updatePlayerConfig(parseInt(val, 10));
    updateSetupUI();
  };

  window.adjustRole = (roleKey, delta) => {
    const cfg = GameState.config;
    if (cfg.playersCount < 5) return;

    const newVal = cfg.roles[roleKey] + delta;
    if (roleKey === 'captainZeros' && newVal < 0) return;
    if (roleKey === 'infiltrators' && newVal < 1) return;

    const tempInf = roleKey === 'infiltrators' ? newVal : cfg.roles.infiltrators;
    const tempCap = roleKey === 'captainZeros' ? newVal : cfg.roles.captainZeros;
    const tempCit = cfg.playersCount - tempInf - tempCap;

    if (tempCit >= (tempInf + tempCap) && tempCit >= 1) {
      cfg.roles[roleKey] = newVal;
      cfg.roles.citizens = tempCit;
      updateSetupUI();
    }
  };

  // --- REVEAL LOGIC ---
  let isCardRevealed = false;

  window.updateRevealUI = () => {
    const idx = GameState.game.currentPlayerIndex;
    document.getElementById('reveal-player-num').textContent = idx + 1;
    document.getElementById('reveal-word').textContent = "•••";
    document.getElementById('reveal-role-hint').textContent = "Passe le téléphone, puis tape pour révéler";
    isCardRevealed = false;
    document.getElementById('reveal-next-btn').textContent = "J'ai vu";
  };

  window.nextReveal = () => {
    if (!isCardRevealed) {
      const player = GameState.players[GameState.game.currentPlayerIndex];
      document.getElementById('reveal-word').textContent = player.role === 'captainZero' ? "Captain Zero" : player.word;
      document.getElementById('reveal-role-hint').textContent = player.role === 'captainZero' ? "Tu n'as pas de mot. Bluffe !" : "Mémorise ton mot.";
      isCardRevealed = true;
      document.getElementById('reveal-next-btn').textContent = "Suivant";
    } else {
      GameState.game.currentPlayerIndex++;
      if (GameState.game.currentPlayerIndex >= GameState.players.length) {
        GameState.game.turn = 1;
        goToScreen('play');
      } else {
        updateRevealUI();
      }
    }
  };

  window.startGame = () => {
    const cfg = GameState.config;
    GameState.game.pair = getRandomPair(cfg.packId, cfg.lang);
    const assignedRoles = assignRoles(cfg.roles);
    
    GameState.players = assignedRoles.map((role, i) => ({
      id: i, name: `Joueur ${i + 1}`, role: role, alive: true,
      word: role === 'citizen' ? GameState.game.pair[0] : (role === 'infiltrator' ? GameState.game.pair[1] : '')
    }));

    GameState.game.currentPlayerIndex = 0;
    GameState.game.turn = 1;
    GameState.game.pendingCaptainZero = null;
    goToScreen('reveal');
    updateRevealUI();
  };

  // --- PLAY LOGIC ---
  window.updatePlayUI = () => {
    document.getElementById('turn-number').textContent = GameState.game.turn || 1;
    const alivePlayers = GameState.players.filter(p => p.alive);
    document.getElementById('alive-count').textContent = `${alivePlayers.length} / ${GameState.players.length}`;
    
    const list = document.getElementById('alive-players-list');
    list.innerHTML = alivePlayers.map(p => `
      <div style="background: rgba(255,255,255,0.1); padding: 8px 15px; border-radius: 15px; border: 1px solid rgba(255,255,255,0.2);">
        ${p.name}
      </div>
    `).join('');
  };

  // --- VOTE LOGIC ---
  window.updateVoteUI = () => {
    const list = document.getElementById('vote-list');
    const alivePlayers = GameState.players.filter(p => p.alive);
    
    list.innerHTML = alivePlayers.map(p => `
      <button class="btn-secondary" style="width: 100%; margin: 0; padding: 15px; font-size: 1.2rem; background: rgba(255,255,255,0.1); color: white; border: 1px solid rgba(255,255,255,0.2);" 
        onclick="eliminatePlayer(${p.id})">
        Éliminer ${p.name}
      </button>
    `).join('');
  };

  window.eliminatePlayer = (playerId) => {
    const player = GameState.players.find(p => p.id === playerId);
    player.alive = false;

    const alivePlayers = GameState.players.filter(p => p.alive);
    const aliveInfiltrators = alivePlayers.filter(p => p.role === 'infiltrator');
    const aliveCaptainZero = alivePlayers.filter(p => p.role === 'captainZero');
    const aliveCitizens = alivePlayers.filter(p => p.role === 'citizen');

    // CAS 1 : Captain Zero vient d'être éliminé -> Écran de devinette
    if (player.role === 'captainZero') {
        GameState.game.pendingCaptainZero = player.id;
        goToScreen('captainGuess');
        setTimeout(() => document.getElementById('captain-guess-input').focus(), 100);
        return;
    }

    // CAS 2 : Tous les infiltrés sont éliminés
    if (aliveInfiltrators.length === 0) {
        if (aliveCaptainZero.length > 0) {
            // Captain Zero est toujours en vie, le jeu continue
            GameState.game.turn++;
            goToScreen('play');
            return;
        }
        return endGame('citizens', "Tous les infiltrés ont été démasqués ! Les Citoyens gagnent.");
    }

    // CAS 3 : Les Citoyens n'ont plus la majorité
    if ((aliveInfiltrators.length + aliveCaptainZero.length) >= aliveCitizens.length) {
        return endGame('infiltrators', "Les Infiltrés et Captain Zero ont pris le contrôle ! Ils gagnent.");
    }

    // Sinon, tour suivant
    GameState.game.turn++;
    goToScreen('play');
  };

  window.submitCaptainGuess = () => {
    const guess = document.getElementById('captain-guess-input').value.trim().toLowerCase();
    const actualWord = GameState.game.pair[0].toLowerCase();

    if (guess === actualWord) {
        endGame('captainZero', `Captain Zero a deviné le mot "${GameState.game.pair[0]}" ! Victoire volée !`);
    } else {
        // Échec de la devinette
        const aliveInfiltrators = GameState.players.filter(p => p.alive && p.role === 'infiltrator');
        if (aliveInfiltrators.length === 0) {
            endGame('citizens', `Captain Zero a échoué (le mot était "${GameState.game.pair[0]}"). Les Citoyens gagnent !`);
        } else {
            // Le jeu continue avec les autres joueurs
            GameState.game.turn++;
            goToScreen('play');
        }
    }
  };

  window.endGame = (winner, message) => {
    GameState.game.winner = winner;
    goToScreen('result');
    
    document.getElementById('result-title').textContent = winner === 'citizens' ? "Victoire des Citoyens !" : (winner === 'infiltrators' ? "Victoire des Infiltrés !" : "Victoire de Captain Zero !");
    document.getElementById('result-icon').textContent = winner === 'citizens' ? "🛡️" : (winner === 'infiltrators' ? "🕵️" : "🃏");
    document.getElementById('result-desc').textContent = message;
  };

  goToScreen('home');
});