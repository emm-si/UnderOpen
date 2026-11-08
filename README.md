<div align="center">

# 🕵️ Underopen

**Le jeu de déduction sociale et de mots secrets, directement dans ta poche.**

[![PWA](https://img.shields.io/badge/PWA-Ready-success.svg)](#)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Vanilla JS](https://img.shields.io/badge/JavaScript-Vanilla-F7DF1E.svg?logo=javascript&logoColor=black)](#)
[![Cloudflare Pages](https://img.shields.io/badge/Deployed%20on-Cloudflare%20Pages-F38020.svg?logo=cloudflare&logoColor=white)](#)

*Underopen est un jeu de société mobile gratuit (PWA), inspiré d'Undercover. Il se joue à tour de rôle sur un seul téléphone et fonctionne entièrement hors-ligne.*

</div>

---

## 📖 À propos du jeu

Underopen repose sur la déduction sociale et le bluff. Les joueurs reçoivent un mot secret, mais l'un d'entre eux n'a pas le même que les autres... ou n'en a pas du tout.

### 🎭 Les Rôles

| Rôle | Description | Objectif |
| :--- | :--- | :--- |
| 👨‍🌾 **Citoyens** | La majorité. Ils partagent tous le même mot de base. | Démasquer les Infiltrés et Captain Zero. |
| 🕵️ **Infiltrés** | La minorité. Ils reçoivent un mot proche, mais différent. | Se fondre dans la masse et éliminer les Citoyens. |
| 🃏 **Captain Zero** | Le rôle sans mot. | Bluffer pour survivre. S'il est éliminé, il peut voler la victoire en devinant le mot des Citoyens. |

### 🎮 Déroulement d'une partie

1. **Configuration** : Choisissez le nombre de joueurs (min. 3) et ajustez les rôles (règle stricte : `Citoyens >= Infiltrés + Captain Zero`).
2. **Révélation** : Le téléphone circule. Chaque joueur découvre son mot (ou son rôle) en secret.
3. **Indices** : À tour de rôle, chaque joueur donne un indice oral sur son mot, sans jamais le prononcer.
4. **Vote** : Tout le monde vote pour éliminer le joueur le plus suspect.
5. **Fin de partie** : Le jeu continue jusqu'à ce qu'une équipe remplisse ses conditions de victoire.

---

## ✨ Fonctionnalités

- 📚 **Plus de 2 400 mots** répartis en 6 packs thématiques (Quotidien, Food & Cocktails, Pop Culture, Globe-Trotter, Soirée, Hot 🔥).
- 🌍 **Bilingue** : Jouable en Français et en Anglais.
- 📱 **PWA (Progressive Web App)** : Installable sur l'écran d'accueil, fonctionne 100% hors-ligne.
- 🎨 **Interface responsive** : Optimisée pour les téléphones mobiles (Safe-area pour les encoches).
- ⚖️ **Règles strictes** : Le jeu empêche les configurations déséquilibrées (ex: plus de rôles spéciaux que de civils).

---

## 🛠️ Stack Technique

Ce projet a été conçu pour être le plus léger et le plus rapide possible, sans aucune dépendance externe (framework ou librairie).

- **Frontend** : HTML5, CSS3, JavaScript (Vanilla ES6+).
- **Architecture** : Machine à états simple (`state.js`), composants d'interface injectés dynamiquement (`app.js`).
- **PWA** : Service Worker (`sw.js`) pour la mise en cache et `manifest.webmanifest` pour l'installation.
- **Hébergement** : [Cloudflare Pages](https://pages.cloudflare.com/).

---

## 🚀 Installation & Déploiement

### 1. Jouer en local (Développement)

Aucun outil de build (Webpack, Vite, etc.) n'est nécessaire. Le projet est du HTML/JS/CSS pur.

```bash
# 1. Cloner le dépôt
git clone https://github.com/TON_NOM_UTILISATEUR/underopen.git

# 2. Se rendre dans le dossier
cd underopen

# 3. Lancer un serveur local (ex: avec Python)
python3 -m http.server 8080
