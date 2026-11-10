document.addEventListener('DOMContentLoaded', () => {
  const app = document.getElementById('app');

  // Service Worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(err => console.warn('SW:', err));
  }

  updatePlayerConfig(4);

  // ═══════════════════════════════════════════════
  //  NAVIGATION
  // ═══════════════════════════════════════════════
  window.goToScreen = (name) => {
    GameState.game.phase = name;
    if (SCREENS[name]) {
      app.innerHTML = SCREENS[name]();
      POST_RENDER[name]?.();
    }
  };

  // ═══════════════════════════════════════════════
  //  WIN CONDITIONS  (appelé après chaque élimination)
  // ═══════════════════════════════════════════════
  window.checkWin = (eliminatedPlayer) => {
    const alive    = GameState.game.players.filter(p => p.alive);
    const infAlive = alive.filter(p => p.role === Role.INFILTRATOR);
    const capAlive = alive.filter(p => p.role === Role.CAPTAIN_ZERO);
    const citAlive = alive.filter(p => p.role === Role.CITIZEN);

    // CAS 1 — Captain Zero éliminé → écran de devinette
    if (eliminatedPlayer.role === Role.CAPTAIN_ZERO) {
      goToScreen('captainGuess');
      return;
    }

    // CAS 2 — Tous les infiltrés sont morts
    if (infAlive.length === 0) {
      if (capAlive.length > 0) {
        // Captain Zero encore vivant : vérifie la majorité
        if (capAlive.length >= citAlive.length) {
          endGame('infiltrators',
            `Captain Zero seul domine (${capAlive.length} vs ${citAlive.length} citoyen(s)).`);
        } else {
          nextTurn();
        }
        return;
      }
      // Plus personne côté imposteurs
      endGame('citizens', 'Tous les imposteurs sont éliminés !');
      return;
    }

    // CAS 3 — Les imposteurs ont la majorité / parité
    if ((infAlive.length + capAlive.length) >= citAlive.length) {
      endGame('infiltrators',
        `Les Infiltrés contrôlent la partie (${infAlive.length + capAlive.length} vs ${citAlive.length}).`);
      return;
    }

    // Sinon, tour suivant
    nextTurn();
  };

  function nextTurn() {
    GameState.game.turn++;
    GameState.game.currentTurnIdx = 0;
    goToScreen('play');
  }

  window.endGame = (winner, msg) => {
    GameState.game.winner = winner;
    GameState.game.winMsg = msg;
    goToScreen('result');
  };

  // ═══════════════════════════════════════════════
  //  SCREENS (retournent du HTML)
  // ═══════════════════════════════════════════════
  const SCREENS = {};
  const POST_RENDER = {};

  // ── HOME ──────────────────────────────────────
  SCREENS.home = () => {
    const packs = getPacks(GameState.config.lang);
    const packName = packs[GameState.config.packId]?.name ?? '…';
    return `
      <div class="screen active">
        <div class="topbar">
          <div class="icon-btn" onclick="goToScreen('settings')">⚙️</div>
          <span class="topbar-title">Thème : ${packName}</span>
          <div class="icon-btn" onclick="goToScreen('packs')">🃏</div>
        </div>
        <div class="spacer"></div>
        <div style="text-align:center;margin-bottom:12px">
          <span class="logo-text">Underopen</span>
          <p class="subtitle">Like Under Cover, en mieux</p>
        </div>
        <div class="spacer"></div>
        <div class="home-btn-group">
          <button class="btn btn-green" onclick="goToScreen('setup')">JOUER</button>
          <button class="btn btn-ghost" onclick="goToScreen('rules')">Règles du jeu</button>
        </div>
      </div>`;
  };

  // ── RULES ─────────────────────────────────────
  SCREENS.rules = () => `
    <div class="screen active">
      <div class="topbar">
        <div class="icon-btn" onclick="goToScreen('home')">←</div>
        <span class="topbar-title">Règles</span>
        <div style="width:44px"></div>
      </div>
      <div class="scroll-area" style="padding-bottom:16px">
        ${[
          ['🧑‍🤝‍🧑 Citoyens',   'Reçoivent le mot secret. Donnez des indices sans trop le dévoiler.'],
          ['🕵️ Infiltrés',   'Reçoivent un mot proche. Bluffez pour passer inaperçu.'],
          ['🃏 Captain Zero', 'Pas de mot. Bluffez et déduisez. Si éliminé, devinez le mot des citoyens pour voler la victoire.'],
          ['🗳️ Vote',        'Chaque tour : chacun donne un indice, puis un joueur est éliminé.'],
          ['🛡️ Citoyens gagnent',      'Tous les imposteurs sont éliminés.'],
          ['🕵️ Infiltrés gagnent',     'Ils obtiennent la majorité ou la parité avec les citoyens.'],
          ['🃏 Captain Zero gagne',    'Éliminé ? Devinez le mot secret pour voler la victoire !'],
        ].map(([t, d]) => `
          <div class="card" style="margin-bottom:10px">
            <div style="font-weight:800;margin-bottom:6px">${t}</div>
            <div style="color:var(--text-muted);font-size:.9rem">${d}</div>
          </div>`).join('')}
      </div>
    </div>`;

  // ── SETTINGS ──────────────────────────────────
  SCREENS.settings = () => `
    <div class="screen active">
      <div class="topbar">
        <div class="icon-btn" onclick="goToScreen('home')">←</div>
        <span class="topbar-title">Paramètres</span>
        <div style="width:44px"></div>
      </div>
      <div class="card" style="margin-top:8px">
        <div style="font-weight:700;margin-bottom:12px">Langue / Language</div>
        <div class="lang-toggle">
          <button class="lang-btn ${GameState.config.lang === 'fr' ? 'active' : ''}"
            onclick="setLang('fr')">🇫🇷 Français</button>
          <button class="lang-btn ${GameState.config.lang === 'en' ? 'active' : ''}"
            onclick="setLang('en')">🇬🇧 English</button>
        </div>
      </div>
    </div>`;

  window.setLang = (lang) => {
    GameState.config.lang = lang;
    // Rebasculer vers un pack valide si nécessaire
    const packs = getPacks(lang);
    if (!packs[GameState.config.packId]) {
      GameState.config.packId = Object.keys(packs)[0];
    }
    goToScreen('settings');
  };

  // ── PACKS ─────────────────────────────────────
  SCREENS.packs = () => {
    const packs = getPacks(GameState.config.lang);
    return `
      <div class="screen active">
        <div class="topbar">
          <div class="icon-btn" onclick="goToScreen('home')">←</div>
          <span class="topbar-title">Thèmes de mots</span>
          <div style="width:44px"></div>
        </div>
        <div class="scroll-area" style="padding-top:4px">
          ${Object.entries(packs).map(([id, { name }]) => `
            <button class="pack-btn ${GameState.config.packId === id ? 'active' : ''}"
              onclick="selectPack('${id}')">${name}</button>
          `).join('')}
        </div>
      </div>`;
  };

  window.selectPack = (id) => {
    GameState.config.packId = id;
    setTimeout(() => goToScreen('setup'), 160);
  };

  // ── SETUP ─────────────────────────────────────
  SCREENS.setup = () => {
    if (!GameState.config.roles) updatePlayerConfig(GameState.config.playerCount);
    const r = GameState.config.roles;
    const n = GameState.config.playerCount;
    const pct = ((n - 3) / (15 - 3)) * 100;
    const canCustom = n >= 5;
    const emoji = n <= 4 ? '👦🏻' : n <= 7 ? '👨🏻' : n <= 10 ? '👨🏻‍👩🏻' : '👨‍👩‍👦‍👦';
    const packs = getPacks(GameState.config.lang);
    const packName = packs[GameState.config.packId]?.name ?? '…';

    return `
      <div class="screen active">
        <div class="topbar">
          <div class="icon-btn" onclick="goToScreen('home')">←</div>
          <span class="topbar-title">Configuration</span>
          <div class="icon-btn" onclick="goToScreen('packs')">🃏</div>
        </div>

        <div class="player-count-display">
          <div class="player-count-num">${n}</div>
          <div class="player-count-label">joueurs</div>
        </div>

        <div class="slider-wrap">
          <span class="slider-emoji" style="left:calc(${pct}% + ${(0.5 - pct / 100) * 0}px)">${emoji}</span>
          <input type="range" min="3" max="15" value="${n}"
            oninput="handleSlider(parseInt(this.value))" style="margin-top:8px">
        </div>

        <div class="card">
          <div class="role-row">
            <div>
              <div class="role-name">🧑‍🤝‍🧑 Citoyens</div>
              <div style="color:var(--text-muted);font-size:.8rem">Mot commun</div>
            </div>
            <div class="role-count" style="color:var(--primary)">${r.citizens}</div>
          </div>

          <div class="role-row">
            <div>
              <div class="role-name">🕵️ Infiltrés</div>
              <div style="color:var(--text-muted);font-size:.8rem">Mot proche</div>
            </div>
            <div class="role-ctrl" style="${canCustom ? '' : 'visibility:hidden'}">
              <button class="circle-btn" onclick="adjustRole('infiltrators',-1)"
                ${r.infiltrators <= 1 ? 'disabled' : ''}>−</button>
              <div class="role-count">${r.infiltrators}</div>
              <button class="circle-btn" onclick="adjustRole('infiltrators',1)">+</button>
            </div>
            ${!canCustom ? `<div class="role-count">${r.infiltrators}</div>` : ''}
          </div>

          <div class="role-row">
            <div>
              <div class="role-name">🃏 Captain Zero</div>
              <div style="color:var(--text-muted);font-size:.8rem">Aucun mot</div>
            </div>
            <div class="role-ctrl" style="${canCustom ? '' : 'visibility:hidden'}">
              <button class="circle-btn" onclick="adjustRole('captainZeros',-1)"
                ${r.captainZeros <= 0 ? 'disabled' : ''}>−</button>
              <div class="role-count">${r.captainZeros}</div>
              <button class="circle-btn" onclick="adjustRole('captainZeros',1)">+</button>
            </div>
            ${!canCustom ? `<div class="role-count">${r.captainZeros}</div>` : ''}
          </div>
        </div>

        <div class="card" style="margin-top:0;cursor:pointer" onclick="goToScreen('packs')">
          <div style="font-size:.8rem;color:var(--text-muted)">Thème actuel</div>
          <div style="font-weight:800;font-size:1.1rem;margin-top:4px">${packName} →</div>
        </div>

        <button class="btn btn-blue" style="margin-top:auto" onclick="goToScreen('names')">
          Nommer les joueurs →
        </button>
        <div style="height:8px"></div>
      </div>`;
  };

  window.handleSlider = (val) => { updatePlayerConfig(val); goToScreen('setup'); };

  window.adjustRole = (key, delta) => {
    const r = GameState.config.roles;
    const n = GameState.config.playerCount;
    const newInf = key === 'infiltrators' ? r.infiltrators + delta : r.infiltrators;
    const newCap = key === 'captainZeros' ? r.captainZeros + delta : r.captainZeros;
    const newCit = n - newInf - newCap;
    if (newInf >= 1 && newCap >= 0 && newCit >= 1 && newCit >= (newInf + newCap)) {
      GameState.config.roles.infiltrators = newInf;
      GameState.config.roles.captainZeros = newCap;
      GameState.config.roles.citizens     = newCit;
      goToScreen('setup');
    }
  };

  // ── NAMES ─────────────────────────────────────
  SCREENS.names = () => {
    const n = GameState.config.playerCount;
    // Préserver les noms existants ou créer les défauts
    if (!GameState.playerNames.length || GameState.playerNames.length !== n) {
      GameState.playerNames = Array.from({ length: n }, (_, i) =>
        GameState.playerNames[i] || `Joueur ${i + 1}`);
    }
    return `
      <div class="screen active">
        <div class="topbar">
          <div class="icon-btn" onclick="goToScreen('setup')">←</div>
          <span class="topbar-title">Noms des joueurs</span>
          <div style="width:44px"></div>
        </div>
        <p style="color:var(--text-muted);font-size:.85rem;margin-bottom:12px">
          Optionnel — laissez vide pour les noms par défaut
        </p>
        <div class="name-input-list">
          ${GameState.playerNames.map((name, i) => `
            <div class="name-row">
              <span class="name-num">${i + 1}</span>
              <input class="name-input" id="name-input-${i}"
                type="text" value="${name}" placeholder="Joueur ${i + 1}"
                oninput="saveName(${i}, this.value)" maxlength="20">
            </div>`).join('')}
        </div>
        <button class="btn btn-green" style="margin-top:14px" onclick="startGame()">
          C'est parti ! 🎲
        </button>
        <div style="height:8px"></div>
      </div>`;
  };

  window.saveName = (i, val) => {
    GameState.playerNames[i] = val.trim() || `Joueur ${i + 1}`;
  };

  window.startGame = () => {
    const cfg = GameState.config;
    const pair = getRandomPair(cfg.packId, cfg.lang);
    const roles = assignRoles(cfg.roles);

    GameState.game.pair    = pair;
    GameState.game.winner  = null;
    GameState.game.winMsg  = '';
    GameState.game.turn    = 1;
    GameState.game.currentRevealIdx = 0;
    GameState.game.currentTurnIdx   = 0;

    GameState.game.players = roles.map((role, i) => ({
      id:    i,
      name:  GameState.playerNames[i] || `Joueur ${i + 1}`,
      role,
      alive: true,
      word:  role === Role.CITIZEN ? pair[0]
           : role === Role.INFILTRATOR ? pair[1]
           : null
    }));

    goToScreen('reveal');
  };

  // ── REVEAL ────────────────────────────────────
  let revealOpen = false;

  SCREENS.reveal = () => {
    revealOpen = false;
    const idx   = GameState.game.currentRevealIdx;
    const total = GameState.game.players.length;
    const pName = GameState.game.players[idx].name;

    return `
      <div class="screen active">
        <h2 class="title" style="font-size:1.5rem;padding-top:8px">
          ${idx + 1} / ${total}
        </h2>
        <p class="subtitle">${pName}</p>

        <div class="reveal-card" onclick="toggleReveal()">
          <p class="reveal-hint" id="reveal-hint">
            Passe le téléphone,<br>puis tape pour révéler
          </p>
          <div id="reveal-content" style="display:none;text-align:center"></div>
        </div>

        <button class="btn btn-blue" id="reveal-next-btn"
          style="display:none" onclick="nextReveal()">Suivant →</button>
        <div style="height:16px;flex-shrink:0"></div>
      </div>`;
  };

  window.toggleReveal = () => {
    if (revealOpen) return;
    revealOpen = true;

    const player  = GameState.game.players[GameState.game.currentRevealIdx];
    const isLast  = GameState.game.currentRevealIdx >= GameState.game.players.length - 1;
    const hintEl  = document.getElementById('reveal-hint');
    const contEl  = document.getElementById('reveal-content');
    const nextBtn = document.getElementById('reveal-next-btn');

    hintEl.style.display = 'none';

    if (player.role === Role.CAPTAIN_ZERO) {
      contEl.innerHTML = `
        <div class="reveal-word" style="font-size:3rem">?</div>
        <div class="reveal-role-badge badge-captain">🃏 Captain Zero</div>
        <p style="color:#555;font-size:.85rem;margin-top:10px">Tu n'as aucun mot — écoute et bluffe !</p>`;
    } else {
      const isCit = player.role === Role.CITIZEN;
      contEl.innerHTML = `
        <div class="reveal-word">${player.word}</div>
        <div class="reveal-role-badge ${isCit ? 'badge-citizen' : 'badge-infiltrator'}">
          ${isCit ? '🧑‍🤝‍🧑 Citoyen' : '🕵️ Infiltré'}
        </div>
        <p style="color:#555;font-size:.85rem;margin-top:10px">Mémorise ton mot.</p>`;
    }

    contEl.style.display = 'block';
    nextBtn.textContent  = isLast ? 'Lancer la partie 🎮' : 'Suivant →';
    nextBtn.style.display = 'block';
  };

  window.nextReveal = () => {
    GameState.game.currentRevealIdx++;
    if (GameState.game.currentRevealIdx >= GameState.game.players.length) {
      GameState.game.currentRevealIdx = 0;
      goToScreen('play');
    } else {
      goToScreen('reveal');
    }
  };

  // ── PLAY ──────────────────────────────────────
  SCREENS.play = () => {
    const alive = GameState.game.players.filter(p => p.alive);
    const chips = alive.map((p, i) => `
      <div class="player-chip ${i === GameState.game.currentTurnIdx ? 'turn-active' : ''}">
        ${p.name}
      </div>`).join('');

    return `
      <div class="screen active">
        <div class="topbar">
          <div class="icon-btn" onclick="goToScreen('home')" title="Quitter">🏠</div>
          <span class="topbar-title">Tour ${GameState.game.turn}</span>
          <div class="icon-btn" onclick="goToScreen('rules')">❓</div>
        </div>

        <div class="card" style="margin-bottom:12px">
          <div style="font-size:.85rem;color:var(--text-muted);margin-bottom:10px">
            ${alive.length} joueur(s) encore en jeu
          </div>
          <div class="alive-grid">${chips}</div>
          <div style="font-size:.8rem;color:var(--text-muted);margin-top:8px;text-align:center">
            🔵 = joue en ce moment
          </div>
        </div>

        <div class="card" style="margin-bottom:auto">
          <p style="color:var(--text-muted);font-size:.9rem;text-align:center">
            Chacun donne un indice à son tour, puis votez pour éliminer un suspect.
          </p>
        </div>

        <div style="display:flex;gap:10px;margin-top:16px">
          <button class="btn btn-ghost" style="flex:1;padding:14px;font-size:.9rem"
            onclick="advanceTurn()">Suivant 👤</button>
          <button class="btn btn-danger" style="flex:1;padding:14px;font-size:.9rem"
            onclick="goToScreen('vote')">Voter 🗳️</button>
        </div>
        <div style="height:8px"></div>
      </div>`;
  };

  window.advanceTurn = () => {
    const alive = GameState.game.players.filter(p => p.alive);
    GameState.game.currentTurnIdx = (GameState.game.currentTurnIdx + 1) % alive.length;
    goToScreen('play');
  };

  // ── VOTE ──────────────────────────────────────
  SCREENS.vote = () => {
    const alive = GameState.game.players.filter(p => p.alive);
    return `
      <div class="screen active">
        <div class="topbar">
          <div class="icon-btn" onclick="goToScreen('play')">←</div>
          <span class="topbar-title">Vote — Tour ${GameState.game.turn}</span>
          <div style="width:44px"></div>
        </div>
        <h2 class="title" style="font-size:1.6rem;margin-bottom:6px">Qui éliminer ?</h2>
        <p class="subtitle" style="margin-bottom:16px">Touchez le nom du joueur éliminé</p>
        <div class="scroll-area">
          ${alive.map(p => `
            <button class="vote-btn" onclick="eliminatePlayer(${p.id})">${p.name}</button>
          `).join('')}
        </div>
      </div>`;
  };

  window.eliminatePlayer = (id) => {
    const player = GameState.game.players.find(p => p.id === id);
    player.alive = false;
    GameState.game.currentTurnIdx = 0;
    checkWin(player);
  };

  // ── CAPTAIN GUESS ─────────────────────────────
  SCREENS.captainGuess = () => {
    const cap = GameState.game.players
      .filter(p => p.role === Role.CAPTAIN_ZERO && !p.alive)
      .pop();
    const capName = cap?.name ?? 'Captain Zero';

    return `
      <div class="screen active">
        <h2 class="title" style="font-size:1.5rem;margin-top:16px">
          ${capName} est éliminé !
        </h2>
        <p class="subtitle">Dernière chance de voler la victoire</p>

        <div class="card" style="margin:20px 0;text-align:center;padding:28px 20px">
          <p style="color:var(--text-muted)">Devine le mot des Citoyens :</p>
          <input class="guess-input" id="captain-input" type="text"
            placeholder="Ton mot…" autocomplete="off" autocorrect="off" spellcheck="false"
            onkeydown="if(event.key==='Enter') submitCaptainGuess()">
          <button class="btn btn-blue" onclick="submitCaptainGuess()">Valider</button>
        </div>
      </div>`;
  };

  POST_RENDER.captainGuess = () => {
    setTimeout(() => document.getElementById('captain-input')?.focus(), 100);
  };

  window.submitCaptainGuess = () => {
    const guess  = document.getElementById('captain-input').value.trim().toLowerCase();
    const actual = GameState.game.pair[0].toLowerCase();

    if (guess === actual) {
      endGame('captainZero', `Captain Zero a deviné "${GameState.game.pair[0]}" — victoire volée ! 🃏`);
      return;
    }

    // Échec de la devinette : recalcule l'état
    const alive    = GameState.game.players.filter(p => p.alive);
    const infAlive = alive.filter(p => p.role === Role.INFILTRATOR);
    const capAlive = alive.filter(p => p.role === Role.CAPTAIN_ZERO);
    const citAlive = alive.filter(p => p.role === Role.CITIZEN);

    if (infAlive.length === 0) {
      endGame('citizens',
        `Captain Zero a raté (le mot était "${GameState.game.pair[0]}"). Les Citoyens gagnent !`);
      return;
    }

    if ((infAlive.length + capAlive.length) >= citAlive.length) {
      endGame('infiltrators', `Les Infiltrés ont la majorité malgré l'échec de Captain Zero.`);
      return;
    }

    // Jeu continue
    GameState.game.turn++;
    GameState.game.currentTurnIdx = 0;
    goToScreen('play');
  };

  // ── RESULT ────────────────────────────────────
  SCREENS.result = () => {
    const w = GameState.game.winner;
    const icons  = { citizens: '🛡️', infiltrators: '🕵️', captainZero: '🃏' };
    const titles = {
      citizens:    'Victoire des Citoyens !',
      infiltrators:'Victoire des Infiltrés !',
      captainZero: 'Captain Zero a volé la victoire !'
    };
    const colors = { citizens: '#4ade80', infiltrators: '#f87171', captainZero: '#fbbf24' };

    const citPlayers = GameState.game.players.filter(p => p.role === Role.CITIZEN);
    const infPlayers = GameState.game.players.filter(p => p.role === Role.INFILTRATOR);
    const capPlayers = GameState.game.players.filter(p => p.role === Role.CAPTAIN_ZERO);

    return `
      <div class="screen active">
        <div class="result-icon">${icons[w]}</div>
        <h2 class="title" style="font-size:1.6rem;color:${colors[w]}">${titles[w]}</h2>
        <p class="subtitle" style="margin-bottom:16px">${GameState.game.winMsg}</p>

        <div class="card" style="margin-bottom:12px">
          <div style="font-weight:700;margin-bottom:10px;font-size:.9rem;color:var(--text-muted)">
            Les mots de cette partie
          </div>
          <div class="result-words">
            <div class="word-pill word-citizen">🧑‍🤝‍🧑 ${GameState.game.pair[0]}</div>
            <div class="word-pill word-infiltrator">🕵️ ${GameState.game.pair[1]}</div>
          </div>
        </div>

        <div class="card scroll-area" style="margin-bottom:12px;max-height:200px">
          <div style="font-weight:700;margin-bottom:8px;font-size:.9rem;color:var(--text-muted)">
            Révélation des rôles
          </div>
          ${[
            ...citPlayers.map(p => `
              <div class="score-row score-citizen">
                <span>${p.name}</span>
                <span style="font-size:.8rem">🧑‍🤝‍🧑 Citoyen</span>
              </div>`),
            ...infPlayers.map(p => `
              <div class="score-row score-infiltrator">
                <span>${p.name}</span>
                <span style="font-size:.8rem">🕵️ Infiltré</span>
              </div>`),
            ...capPlayers.map(p => `
              <div class="score-row score-captain">
                <span>${p.name}</span>
                <span style="font-size:.8rem">🃏 Captain Zero</span>
              </div>`),
          ].join('')}
        </div>

        <div style="display:flex;gap:10px;margin-top:auto;padding-bottom:8px">
          <button class="btn btn-ghost" style="flex:1" onclick="replayGame()">Rejouer</button>
          <button class="btn btn-green" style="flex:1" onclick="goToScreen('home')">Accueil</button>
        </div>
      </div>`;
  };

  window.replayGame = () => { goToScreen('names'); };

  // ── BOOT ──────────────────────────────────────
  goToScreen('home');
});
