import Phaser from 'phaser';
import { paths, startRound, area } from './round';
import { Rowlet } from './towers/Rowlet'
import { Oshawott } from './towers/Oshawott';
import { Cyndaquil } from './towers/Cyndaquil';
import { Oddish } from './towers/Oddish';
import { Poliwag } from './towers/Poliwag';
import { Slowpoke } from './towers/Slowpoke';
import { Scyther } from './towers/Scyther';
import { Exeggcute } from './towers/Exeggcute';
import { Cubone } from './towers/Cubone';
import { Koffing } from './towers/Koffing';
import { Eevee } from './towers/Eevee';
import { Pichu } from './towers/Pichu';
import { MimeJr } from './towers/MimeJr';
import { Tyrogue } from './towers/Tyrogue';
import { Wurmple } from './towers/Wurmple';
import { Ralts } from './towers/Ralts';
import { Nincada } from './towers/Nincada';
import { Snorunt } from './towers/Snorunt';
import { Clamperl } from './towers/Clamperl';
import { Burmy } from './towers/Burmy';
import { Petilil } from './towers/Petilil';
import { Rufflet } from './towers/Rufflet';
import { Goomy } from './towers/Goomy';
import { Bergmite } from './towers/Bergmite';
import { Cosmog } from './towers/Cosmog';
import { Applin } from './towers/Applin';
import { Charcadet } from './towers/Charcadet';
import { Rockruff } from './towers/Rockruff';
import { Toxel } from './towers/Toxel';
import { Kubfu } from './towers/Kubfu';
import { Towers } from './towers/Towers';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 1920,
  height: 720,
  scene: {
    preload,
    create,
    update
  },
  physics: {
    default: 'arcade',
    arcade: {
      debug: false
    }
  }
};

const game = new Phaser.Game(config);

let path1: Phaser.Curves.Path;
let path2: Phaser.Curves.Path;
let areaLabel: Phaser.GameObjects.Text;
let healthLabel: Phaser.GameObjects.Text;
let currentTower: Towers;
let enemies: Phaser.GameObjects.PathFollower[] = [];

function preload(this: Phaser.Scene) {
  const kantoMons: string[] = [
  "Bulbasaur", "Ivysaur", "Venusaur", "Charmander", "Charmeleon", "Charizard",
  "Squirtle", "Wartortle", "Blastoise", "Caterpie", "Metapod", "Butterfree",
  "Weedle", "Kakuna", "Beedrill", "Pidgey", "Pidgeotto", "Pidgeot", "Rattata",
  "Raticate", "Spearow", "Fearow", "Ekans", "Arbok", "Pikachu", "Raichu",
  "Sandshrew", "Sandslash", "NidoranF", "Nidorina", "Nidoqueen", "NidoranM", "Nidorino",
  "Nidoking", "Clefairy", "Clefable", "Vulpix", "Ninetales", "Jigglypuff",
  "Wigglytuff", "Zubat", "Golbat", "Oddish", "Gloom", "Vileplume", "Paras",
  "Parasect", "Venonat", "Venomoth", "Diglett", "Dugtrio", "Meowth", "Persian",
  "Psyduck", "Golduck", "Mankey", "Primeape", "Growlithe", "Arcanine", "Poliwag",
  "Poliwhirl", "Poliwrath", "Abra", "Kadabra", "Alakazam", "Machop", "Machoke",
  "Machamp", "Bellsprout", "Weepinbell", "Victreebel", "Tentacool", "Tentacruel",
  "Geodude", "Graveler", "Golem", "Ponyta", "Rapidash", "Slowpoke", "Slowbro",
  "Magnemite", "Magneton", "Farfetch’d", "Doduo", "Dodrio", "Seel", "Dewgong",
  "Grimer", "Muk", "Shellder", "Cloyster", "Gastly", "Haunter", "Gengar", "Onix",
  "Drowzee", "Hypno", "Krabby", "Kingler", "Voltorb", "Electrode", "Exeggcute",
  "Exeggutor", "Cubone", "Marowak", "Hitmonlee", "Hitmonchan", "Lickitung",
  "Koffing", "Weezing", "Rhyhorn", "Rhydon", "Chansey", "Tangela", "Kangaskhan",
  "Horsea", "Seadra", "Goldeen", "Seaking", "Staryu", "Starmie", "Mr. Mime",
  "Scyther", "Jynx", "Electabuzz", "Magmar", "Pinsir", "Tauros", "Magikarp",
  "Gyarados", "Lapras", "Ditto", "Eevee", "Vaporeon", "Jolteon", "Flareon",
  "Porygon", "Omanyte", "Omastar", "Kabuto", "Kabutops", "Aerodactyl", "Snorlax",
  "Articuno", "Zapdos", "Moltres", "Dratini", "Dragonair", "Dragonite", "Mewtwo", "Mew", "Egg"
];
  for (const name of kantoMons) {
    this.load.image(name, `assets/kanto/${name}.png`);
  }
  for (let p = 0; p < 100; p++) {
    this.load.image("projectile" + p, `assets/projectiles/projectile${p}.png`);
  }
  this.load.image('bg', 'hoenn3.png');
  this.load.text('pokemonDescriptions', 'data/pokemonDescriptions.txt');
  this.load.text('pokemonUpgrades', 'data/pokemonUpgrades.txt');
  this.load.image('Nor', `assets/habitats/Nor.png`);
  this.load.image('Gra', `assets/habitats/Gra.png`);
  this.load.image('Wat', `assets/habitats/Wat.png`);
  this.load.image('Fly', `assets/habitats/Fly.png`);
  this.load.image('Roc', `assets/habitats/Roc.png`);
  this.load.image('Psy', `assets/habitats/Psy.png`);
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 10; c++) {
      const key = `pokemon${r}${c}`;
      this.load.image(key, `assets/pokemon/${key}.png`);
      this.load.image(`${key}0`, `assets/pokemon/${key}0.png`);
      this.load.image(`${key}1`, `assets/pokemon/${key}1.png`);
      this.load.image(`${key}2`, `assets/pokemon/${key}2.png`);
    }
  }
}

export let enemiesGroup: Phaser.Physics.Arcade.Group;
const descriptionMap: Record<string, string> = {};
const upgradeMap: Record<string, string[]> = {};
const statsMap: Record<string, string> = {};
let playerHealth = 0; export let currentHealth = 0;
let playerDef = 0; let playerSpDef = 0;
let playerEXP = 2000;

function create(this: Phaser.Scene) {
  this.add.rectangle(0, 480, 1920, 240, 0x2c2c2c).setOrigin(0, 0);

  let text = this.cache.text.get('pokemonDescriptions');
  if (text) {
    const lines = text.split('\n').map((line: string) => line.trim()).filter(Boolean);

    for (let i = 0; i < lines.length - 1; i += 3) {
      const key = lines[i];
      const description = lines[i + 1];
      descriptionMap[key] = description;
      statsMap[key] = lines[i + 2];
    }
  }
  text = this.cache.text.get('pokemonUpgrades');
  if (text) {
    const lines = text.split('\n').map((line: string) => line.trim()).filter(Boolean);

    for (let i = 0; i < lines.length - 1; i += 9) {
      const key = lines[i];
      upgradeMap[key] = [lines[i + 1], lines[i + 2], lines[i + 3],
      lines[i + 4], lines[i + 5], lines[i + 6], lines[i + 7], lines[i + 8]];
    }
  }

  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 10; c++) {
      const x = 50 + c * 60;
      const y = 530 + r * 60;
      const typeList = [
        [["Gra", "Fly"], ["Gra", "Poi"], ["Bug", "Fly"], ["Poi", "Non"], ["Psy", "Fai"], ["Psy", "Fai"], ["Wat", "Non"], ["Nor", "Fly"], ["Psy", "Non"], ["Roc", "Non"]],
        [["Wat", "Wat"], ["Wat", "Non"], ["Gra", "Psy"], ["Nor", "Non"], ["Fig", "Non"], ["Bug", "Gro"], ["Bug", "Non"], ["Dra", "Non"], ["Gra", "Dra"], ["Ele", "Poi"]],
        [["Fir", "Fir"], ["Wat", "Psy"], ["Gro", "Non"], ["Ele", "Non"], ["Bug", "Non"], ["Ice", "Non"], ["Gra", "Non"], ["Ice", "Non"], ["Fir", "Non"], ["Fig", "Non"]]
      ]
      const typeOne = typeList[r][c][0]; const typeTwo = typeList[r][c][1];
      const button = this.add.image(x, y, `pokemon${r}${c}`).setOrigin(0.5).setDepth(1)
        .setInteractive({ userHandCursor: true, draggable: true }).setDisplaySize(55, 55);
      button.on('pointerdown', () => {
        showPopup(this, r, c, `pokemon${r}${c}`, "", false);
        for (const slot of placementSlots) {
          if (slot.habitat.indexOf(typeOne) == -1 && slot.habitat.indexOf(typeTwo) == -1) {
            slot.container.setVisible(false);
          }
        }
      });
      button.on('drag', (pointer: Phaser.Input.Pointer,) => {
        button.setPosition(pointer.x, pointer.y);
        button.setDisplaySize(30, 30);
      })
      button.on('dragend', (pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.Image) => {
        let placed = false;
        const cost = [
          [2640, 1840, 3220, 1780, 2570, 1950, 1920, 2780, 5540, 2460],
          [1910, 1610, 1900, 1880, 1440, 2200, 1670, 2220, 2590, 1780],
          [1976, 2110, 2440, 1650, 1380, 2000, 2550, 2630, 1940, 12600]
        ]
        for (const slot of placementSlots) {
          const bounds = slot.container.getBounds();
          if (Phaser.Geom.Rectangle.Contains(bounds, pointer.x, pointer.y) && !slot.occupied && playerEXP >= cost[r][c] &&
          (slot.habitat.indexOf(typeOne) != -1 || slot.habitat.indexOf(typeTwo) != -1)) {
            playerEXP -= cost[r][c];
            const tower = placeTower(this, slot.x, slot.y, `pokemon${r}${c}`);
            if (tower) {
              slot.container.setVisible(false);
              slot.occupied = true;
              placed = true;
              button.destroy();
            }
            break;
          }
        }
        if (!placed) {
          button.setPosition(x, y);
          button.setDisplaySize(55, 55);
        }
        for (const slot of placementSlots) { if (!slot.occupied) { slot.container.setVisible(true); } }
      });
    }
  }
  for (let b = 0; b < 3; b++) {
    const button = this.add.image(1460, 500 + b * 60, `button${b}`).setOrigin(0, 0)
      .setInteractive({ userHandCursor: true }).setDisplaySize(55, 55);
    switch (b) {
      case 0:
        break;
      case 1:
        break;
      case 2:
        button.on('pointerdown', () => {
          if (currentHealth > 0) startRound(this);
        });
    }
  }

  this.add.image(0, 0, 'bg')
  .setOrigin(0, 0)
  .setDisplaySize(1920, 480);

  const placementSlots: {
    container: Phaser.GameObjects.Container,
    x: number,
    y: number,
    habitat: string,
    occupied: boolean
  }[] = [];
  const customSlotPositions = [
    { x: 220, y: 370, habitat: "Nor, Fir, Fig"},
    { x: 492, y: 300, habitat: "Nor, Fir, Fig"},
    { x: 1225, y: 215, habitat: "Nor, Fir, Fig"},
    { x: 1200, y: 315, habitat: "Nor, Fir, Fig"},
    { x: 180, y: 205, habitat: "Gra, Poi, Ele"},
    { x: 348, y: 85, habitat: "Gra, Poi, Ele"},
    { x: 373, y: 348, habitat: "Gra, Poi, Ele"},
    { x: 700, y: 300, habitat: "Wat, Ice, Dra"},
    { x: 1000, y: 300, habitat: "Wat, Ice, Dra"},
    { x: 850, y: 170, habitat: "Wat, Ice, Dra"},
    { x: 528, y: 136, habitat: "Fly, Bug"},
    { x: 528, y: 380, habitat: "Fly, Bug"},
    { x: 1116, y: 353, habitat: "Fly, Bug"},
    { x: 1260, y: 353, habitat: "Fly, Bug"},
    { x: 1078, y: 45, habitat: "Roc, Gro"},
    { x: 215, y: 95, habitat: "Psy, Fai"},
    { x: 395, y: 225, habitat: "Psy, Fai"},
    { x: 1430, y: 180, habitat: "Any, Nor, Fir, Fig, Gra, Poi, Ele, Wat, Ice, Dra, Fly, Bug, Roc, Gro, Psy, Fai"},
  ];
  for (const pos of customSlotPositions) {
    const rect = this.add.rectangle(0, 0, 30, 30, 0x444444, 0.2).setStrokeStyle(1, 0xffffff);

    const img = this.add.image(0, 0, `${pos.habitat.substring(0, 3)}`).setDisplaySize(30, 30).setAlpha(0.2);

    const container = this.add.container(pos.x, pos.y, [img, rect]);
    container.setSize(54, 54);

    placementSlots.push({ container, x: pos.x, y: pos.y, habitat: pos.habitat, occupied: false });
  }

  enemiesGroup = this.physics.add.group();

  areaLabel = this.add.text(10, 10, `${area}`, {
    fontSize: '24px',
    fontFamily: 'Arial',
    backgroundColor: '#ff474C',
    color: '#ffffff',
    padding: { x: 2, y: 1 },
    stroke: '#000000',
    strokeThickness: 4,
  });
  healthLabel = this.add.text(1125, 10, `Place your starter Pokémon! 💰2000`, {
    fontSize: '24px',
    fontFamily: 'Arial',
    stroke: '#000000',
    strokeThickness: 4,
    color: '#ffffff',
    padding: { x: 2, y: 1 },
  });
  paths(this);
}

type popUpData = {
  scene: Phaser.Scene;
  r: number;
  c: number;
  pokemon: string;
  customMessage: string;
  pokemonActive: boolean;
};
export let lastPopUp : popUpData;
export let popupContainer: Phaser.GameObjects.Container;
export function showPopup(scene: Phaser.Scene, r: number, c: number, pokemon: string, 
  customMessage: string, pokemonActive: boolean) {
  if (popupContainer) popupContainer.destroy();

  const boxX = 640;
  const boxY = 500;

  popupContainer = scene.add.container();

  const background = scene.add.rectangle(boxX, boxY, 780, 180, 0x800000)
    .setOrigin(0, 0)
    .setStrokeStyle(2, 0xffffff);
  popupContainer.add(background);

  let description = descriptionMap[pokemon] ?? 'No description available.';
  if (customMessage != "") {
    description = customMessage;
  }
  const stat = statsMap[pokemon] ?? 'No description available.';
  const label = scene.add.text(boxX + 20, boxY + 10, description, {
    fontSize: '20px',
    color: '#ffffff',
    wordWrap: { width: 650 }
  });
  popupContainer.add(label);
  if (pokemonActive) {
    const stats = scene.add.text(boxX + 20, boxY + 154, currentTower.returnStats(), {
      fontSize: '12px',
      color: '#ffffff',
      wordWrap: { width: 650 }
    });
    popupContainer.add(stats);
  }
  else {
    const stats = scene.add.text(boxX + 20, boxY + 154, stat, {
      fontSize: '12px',
      color: '#ffffff',
      wordWrap: { width: 650 }
    });
    popupContainer.add(stats);
  }

  for (let row = 0; row < 2; row++) {
    for (let col = 0; col < 4; col++) {
      const x = boxX + 20 + col * 150;
      const y = boxY + 75 + row * 35;
      const upgradeString = upgradeMap[pokemon][col + row * 4];
      const upgradePrice = upgradeString.indexOf("$") != -1 ? parseInt(upgradeString.substring(1,
        upgradeString.indexOf('+'))) : 0;
      const upgradeLevel = upgradeString.indexOf("LVL") != -1 ? parseInt(upgradeString.substring(upgradeString.indexOf('LVL')
        + 3, upgradeString.indexOf(':'))) : 0;
      let colorOfBox = playerEXP >= upgradePrice && currentTower && currentTower.getRounds() >= upgradeLevel && pokemonActive &&
      currentTower.getPath(row == 0) == col && (col < 2 || currentTower.getPath(row == 1) < 3) ? 0xFFFF00 : 0x800000;
      if (currentTower && (row == 0 && currentTower.getPath(true) > col || row == 1 && currentTower.getPath(false) > col) && pokemonActive) {
        colorOfBox = 0x90EE90;
      }
      const rect = scene.add.rectangle(x, y, 145, 30, colorOfBox).setInteractive()
        .setOrigin(0, 0)
        .setStrokeStyle(1, 0x000000);
      rect.on('pointerover', () => {
        showPopup(scene, r, c, pokemon, upgradeString, pokemonActive);
      })
      rect.on('pointerdown', () => {
        if (colorOfBox == 0xFFFF00) {
          award(-1 * upgradePrice);
          if (row == 0) {
            currentTower.upgradeFirstPath(true);
          }
          else {
            currentTower.upgradeFirstPath(false);
          }
        }
      })
      popupContainer.add(rect);
    }
  }

  const pokemonKeys = [`pokemon${r}${c}0`, `pokemon${r}${c}1`, `pokemon${r}${c}2`];

  for (let i = 0; i < 3; i++) {
    const px = boxX + 700;
    const py = boxY + i * 60;
    const key = scene.textures.exists(pokemonKeys[i]) ? pokemonKeys[i] : `pokemon${r}${c}`;
    const pkm = scene.add.image(px, py, key)
      .setOrigin(0, 0)
      .setDisplaySize(55, 55);
    popupContainer.add(pkm);
  }

  lastPopUp = {scene: scene, r: r, c: c, pokemon: pokemon, customMessage: customMessage, pokemonActive: pokemonActive};
}

function update(this: Phaser.Scene, time: number, delta: number) {
  enemies = enemies.filter(enemy => {
    if (enemy.isFollowing()) return true;
    enemy.destroy();
    return false;
  });
}

export function changeLabel(area: string) {
  areaLabel.setText(area);
}

function placeTower(scene: Phaser.Scene, x: number, y: number, key: string): Phaser.GameObjects.Image | undefined {
  let tower: Towers | undefined;

  switch (key) {
    case "pokemon00":
      tower = new Rowlet(scene, x, y);
      updateUserHP(scene, tower, key);
      break;
    case "pokemon10":
      tower = new Oshawott(scene, x, y);
      updateUserHP(scene, tower, key);
      break;
    /*
    case "pokemon20":
      tower = new Cyndaquil(scene, x, y);
      updateUserHP(scene, tower, key, 39, 8.6, 10);
      break;
    case "pokemon01":
      tower = new Oddish(scene, x, y);
      scene.physics.add.existing(tower);
      updateUserHP(scene, tower, key, 45, 11, 13);
      break;
    case "pokemon11":
      tower = new Poliwag(scene, x, y);
      updateUserHP(scene, tower, key, 40, 8, 8);
      break;
    case "pokemon21":
      tower = new Slowpoke(scene, x, y);
      updateUserHP(scene, tower, key, 90, 13, 8);
      break;
    case "pokemon02":
      tower = new Scyther(scene, x, y);
      updateUserHP(scene, tower, key, 70, 16, 16);
      break;
    case "pokemon12":
      tower = new Exeggcute(scene, x, y);
      scene.physics.add.existing(tower);
      updateUserHP(scene, tower, key, 60, 16, 9);
      break;
    case "pokemon22":
      tower = new Cubone(scene, x, y);
      updateUserHP(scene, tower, key, 50, 19, 10);
      break;
    case "pokemon03":
      tower = new Koffing(scene, x, y);
      updateUserHP(scene, tower, key, 40, 19, 9);
      break;
    case "pokemon13":
      tower = new Eevee(scene, x, y);
      updateUserHP(scene, tower, key, 55, 10, 13);
      break;
    case "pokemon23":
      tower = new Pichu(scene, x, y);
      updateUserHP(scene, tower, key, 20, 3, 7);
      break;
    case "pokemon04":
      tower = new MimeJr(scene, x, y);
      updateUserHP(scene, tower, key, 20, 9, 18);
      break;
    case "pokemon14":
      tower = new Tyrogue(scene, x, y);
      updateUserHP(scene, tower, key, 35, 7, 7);
      break;
    case "pokemon24":
      tower = new Wurmple(scene, x, y);
      updateUserHP(scene, tower, key, 45, 7, 6);
      break;
    case "pokemon05":
      tower = new Ralts(scene, x, y);
      updateUserHP(scene, tower, key, 28, 5, 7);
      break;
    case "pokemon15":
      tower = new Nincada(scene, x, y);
      updateUserHP(scene, tower, key, 31, 18, 6);
      break;
    case "pokemon25":
      tower = new Snorunt(scene, x, y);
      updateUserHP(scene, tower, key, 50, 10, 10);
      break;
    case "pokemon06":
      tower = new Clamperl(scene, x, y);
      updateUserHP(scene, tower, key, 35, 17, 11);
      break;
    case "pokemon16":
      tower = new Burmy(scene, x, y);
      updateUserHP(scene, tower, key, 40, 9, 9);
      break;
    case "pokemon26":
      tower = new Petilil(scene, x, y);
      updateUserHP(scene, tower, key, 45, 10, 10);
      break;
    case "pokemon07":
      tower = new Rufflet(scene, x, y);
      updateUserHP(scene, tower, key, 70, 10, 10);
      break;
    case "pokemon17":
      tower = new Goomy(scene, x, y);
      updateUserHP(scene, tower, key, 45, 7, 15);
      break;
    case "pokemon27":
      tower = new Bergmite(scene, x, y);
      updateUserHP(scene, tower, key, 55, 17, 7);
      break;
    case "pokemon08":
      tower = new Cosmog(scene, x, y);
      updateUserHP(scene, tower, key, 43, 6.2, 6.2);
      break;
    case "pokemon18":
      tower = new Applin(scene, x, y);
      updateUserHP(scene, tower, key, 40, 16, 8);
      break;
    case "pokemon28":
      tower = new Charcadet(scene, x, y);
      updateUserHP(scene, tower, key, 40, 8, 8);
      break;
    case "pokemon09":
      tower = new Rockruff(scene, x, y);
      updateUserHP(scene, tower, key, 45, 8, 8);
      break;
    case "pokemon19":
      tower = new Toxel(scene, x, y);
      updateUserHP(scene, tower, key, 40, 7, 7);
      break;
    case "pokemon29":
      tower = new Kubfu(scene, x, y);
      updateUserHP(scene, tower, key, 60, 12, 10);
      break;
    */
  }
  return tower;
}

function updateUserHP(scene: Phaser.Scene, tower: Towers, mon: string) {
  playerHealth += Towers.allHP(); playerDef += Towers.allDEF(); playerSpDef += Towers.allSPDEF(); updateHealth(0, true);
  currentTower = tower;
  showPopup(scene, mon.slice(-2).split('').map(d => Number(d))[0], mon.slice(-2).split('').map(d => Number(d))[1], mon, "", true);
  tower.on('pointerdown', () => {
    const numbers = mon.slice(-2).split('').map(d => Number(d));
    currentTower = tower;
    showPopup(scene, numbers[0], numbers[1], mon, "", true);
  });
}

export function award(exp: integer) {
  playerEXP += exp;
  healthLabel.setText(`❤️${currentHealth}/${playerHealth}   ⛊${Math.round(playerDef)}   ⛉${Math.round(playerSpDef)}   💰${Math.round(playerEXP)}`);
}

export function updateHealth(heal: integer, special: boolean) {
  if (currentHealth >= 0) {
    const reduce = special ? playerSpDef : playerDef;
    if (heal == 0) {
      currentHealth = playerHealth;
    }
    else if (heal > 0) {
      currentHealth += heal;
    }
    else {
      currentHealth = Math.max(-1, currentHealth + Math.round(heal / reduce));
    }
    healthLabel.setText(`❤️${currentHealth}/${playerHealth}   ⛊${Math.round(playerDef)}   ⛉${Math.round(playerSpDef)}   💰${Math.round(playerEXP)}`);
  }
}