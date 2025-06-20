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
  this.load.text('pokemonDescriptions', 'pokemonDescriptions.txt');
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
const statsMap: Record<string, string> = {};
let playerHealth = 0; export let currentHealth = 0;
let playerDef = 0; let playerSpDef = 0;
let playerEXP = 2500;

function create(this: Phaser.Scene) {
  this.add.rectangle(0, 480, 1920, 240, 0x2c2c2c).setOrigin(0, 0);

  const text = this.cache.text.get('pokemonDescriptions');
  if (text) {
    const lines = text.split('\n').map((line: string) => line.trim()).filter(Boolean);

    for (let i = 0; i < lines.length - 1; i += 3) {
      const key = lines[i];
      const description = lines[i + 1];
      descriptionMap[key] = description;
      statsMap[key] = lines[i + 2];
    }
  }

  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 10; c++) {
      const x = 20 + c * 60;
      const y = 500 + r * 60;
      const typeList = [
        [["Gra", "Fly"], ["Gra", "Poi"], ["Bug", "Fly"], ["Poi", "Non"], ["Psy", "Fai"], ["Psy", "Fai"], ["Wat", "Non"], ["Nor", "Fly"], ["Psy", "Non"], ["Roc", "Non"]],
        [["Wat", "Wat"], ["Wat", "Non"], ["Gra", "Psy"], ["Nor", "Non"], ["Fig", "Non"], ["Bug", "Gro"], ["Bug", "Non"], ["Dra", "Non"], ["Gra", "Dra"], ["Ele", "Poi"]],
        [["Fir", "Fir"], ["Wat", "Psy"], ["Gro", "Non"], ["Ele", "Non"], ["Bug", "Non"], ["Ice", "Non"], ["Gra", "Non"], ["Ice", "Non"], ["Fir", "Non"], ["Fig", "Non"]]
      ]
      const typeOne = typeList[r][c][0]; const typeTwo = typeList[r][c][1];
      const button = this.add.image(x, y, `pokemon${r}${c}`).setOrigin(0, 0)
        .setInteractive({ userHandCursor: true, draggable: true }).setDisplaySize(55, 55);
      button.on('pointerdown', () => {
        showPopup(this, r, c, `pokemon${r}${c}`);
      });
      button.on('dragend', (pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.Image) => {
        let placed = false;
        const cost = [
          [2280, 2400, 3400, 2400, 2250, 1330, 2490, 2530, 10000, 1900],
          [2080, 1600, 2450, 2250, 1400, 1960, 1590, 4200, 2000, 1640],
          [1920, 2350, 2450, 1050, 1550, 2000, 2150, 2440, 1700, 13000]
        ]
        for (const slot of placementSlots) {
          const bounds = slot.container.getBounds();
          if (Phaser.Geom.Rectangle.Contains(bounds, pointer.x, pointer.y) && !slot.occupied && playerEXP >= cost[r][c] &&
          (slot.habitat.indexOf(typeOne) != -1 || slot.habitat.indexOf(typeTwo) != -1)) {
            playerEXP -= cost[r][c];
            const tower = placeTower(this, slot.x, slot.y, `pokemon${r}${c}`);
            if (tower) {
              slot.occupied = true;
              placed = true;
              button.destroy();
            }
            break;
          }
        }
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
    { x: 200, y: 85, habitat: "Nor, Fir, Fig"},
    { x: 220, y: 370, habitat: "Nor, Fir, Fig"},
    { x: 395, y: 225, habitat: "Nor, Fir, Fig"},
    { x: 180, y: 205, habitat: "Gra, Poi, Ele"},
    { x: 348, y: 85, habitat: "Gra, Poi, Ele"},
    { x: 373, y: 348, habitat: "Gra, Poi, Ele"},
    { x: 700, y: 300, habitat: "Wat, Ice, Dra"},
    { x: 1000, y: 300, habitat: "Wat, Ice, Dra"},
    { x: 850, y: 170, habitat: "Wat, Ice, Dra"},
    { x: 528, y: 136, habitat: "Fly, Bug"},
    { x: 523, y: 380, habitat: "Fly, Bug"},
    { x: 1116, y: 353, habitat: "Fly, Bug"},
    { x: 1260, y: 353, habitat: "Fly, Bug"},
    { x: 1078, y: 45, habitat: "Roc, Gro"},
    { x: 1430, y: 180, habitat: "Psy, Fai"}
  ];
  for (const pos of customSlotPositions) {
    const rect = this.add.rectangle(0, 0, 54, 54, 0x444444, 0.2).setStrokeStyle(1, 0xffffff);

    const img = this.add.image(0, 0, `${pos.habitat.substring(0, 3)}`).setDisplaySize(54, 54).setAlpha(0.8);

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
  healthLabel = this.add.text(1125, 10, `Place your starter Pokémon! 💰2500`, {
    fontSize: '24px',
    fontFamily: 'Arial',
    stroke: '#000000',
    strokeThickness: 4,
    color: '#ffffff',
    padding: { x: 2, y: 1 },
  });
  paths(this);
}

let popupContainer: Phaser.GameObjects.Container;
function showPopup(scene: Phaser.Scene, r: number, c: number, pokemon: string) {
  if (popupContainer) popupContainer.destroy();

  const boxX = 640;
  const boxY = 500;

  popupContainer = scene.add.container();

  const background = scene.add.rectangle(boxX, boxY, 780, 180, 0x800000)
    .setOrigin(0, 0)
    .setStrokeStyle(2, 0xffffff);
  popupContainer.add(background);

  const description = descriptionMap[pokemon] ?? 'No description available.';
  const stat = statsMap[pokemon] ?? 'No description available.';
  const label = scene.add.text(boxX + 20, boxY + 10, description, {
    fontSize: '20px',
    color: '#ffffff',
    wordWrap: { width: 650 }
  });
  const stats = scene.add.text(boxX + 20, boxY + 150, stat, {
    fontSize: '20px',
    color: '#ffffff',
    wordWrap: { width: 650 }
  });
  popupContainer.add(stats);
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
  let tower: Phaser.GameObjects.Image | undefined;

  switch (key) {
    case "pokemon00":
      tower = new Rowlet(scene, x, y).setDisplaySize(30, 30).setOrigin(0.5).setInteractive();
      playerHealth += 68; playerDef += 11; playerSpDef += 10;
      updateHealth(68, true);
      tower.on('pointerdown', () => {
        
      });
      break;
    case "pokemon10":
      tower = new Oshawott(scene, x, y).setDisplaySize(30, 30).setOrigin(0.5);
      playerHealth += 55; playerDef += 9; playerSpDef += 9;
      updateHealth(55, true);
      break;
    case "pokemon20":
      tower = new Cyndaquil(scene, x, y).setDisplaySize(30, 30).setOrigin(0.5);
      playerHealth += 39; playerDef += 8.6; playerSpDef += 10;
      updateHealth(39, true);
      break;
    case "pokemon01":
      tower = new Oddish(scene, x, y).setDisplaySize(30, 30).setOrigin(0.5);
      scene.physics.add.existing(tower);
      playerHealth += 45; playerDef += 11; playerSpDef += 13;
      updateHealth(45, true);
      break;
    case "pokemon11":
      tower = new Poliwag(scene, x, y).setDisplaySize(30, 30).setOrigin(0.5);
      playerHealth += 40; playerDef += 8; playerSpDef += 8;
      updateHealth(40, true);
      break;
    case "pokemon21":
      tower = new Slowpoke(scene, x, y).setDisplaySize(30, 30).setOrigin(0.5);
      playerHealth += 90; playerDef += 13; playerSpDef += 8;
      updateHealth(90, true);
      break;
    case "pokemon02":
      tower = new Scyther(scene, x, y).setDisplaySize(30, 30).setOrigin(0.5);
      playerHealth += 70; playerDef += 16; playerSpDef += 16;
      updateHealth(70, true);
      break;
    case "pokemon12":
      tower = new Exeggcute(scene, x, y).setDisplaySize(30, 30).setOrigin(0.5);
      scene.physics.add.existing(tower);
      playerHealth += 60; playerDef += 16; playerSpDef += 9;
      updateHealth(60, true);
      break;
    case "pokemon22":
      tower = new Cubone(scene, x, y).setDisplaySize(30, 30).setOrigin(0.5);
      playerHealth += 50; playerDef += 19; playerSpDef += 10;
      updateHealth(50, true);
      break;
    case "pokemon03":
      tower = new Koffing(scene, x, y).setDisplaySize(30, 30).setOrigin(0.5);
      playerHealth += 40; playerDef += 19; playerSpDef += 9;
      updateHealth(40, true);
      break;
    case "pokemon13":
      tower = new Eevee(scene, x, y).setDisplaySize(30, 30).setOrigin(0.5);
      playerHealth += 55; playerDef += 10; playerSpDef += 13;
      updateHealth(55, true);
      break;
    case "pokemon23":
      tower = new Pichu(scene, x, y).setDisplaySize(30, 30).setOrigin(0.5);
      playerHealth += 20; playerDef += 3; playerSpDef += 7;
      updateHealth(20, true);
      break;
    case "pokemon04":
      tower = new MimeJr(scene, x, y).setDisplaySize(30, 30).setOrigin(0.5);
      playerHealth += 20; playerDef += 9; playerSpDef += 18;
      updateHealth(20, true);
      break;
    case "pokemon14":
      tower = new Tyrogue(scene, x, y).setDisplaySize(30, 30).setOrigin(0.5);
      playerHealth += 35; playerDef += 7; playerSpDef += 7;
      updateHealth(35, true);
      break;
    case "pokemon24":
      tower = new Wurmple(scene, x, y).setDisplaySize(30, 30).setOrigin(0.5);
      playerHealth += 45; playerDef += 7; playerSpDef += 6;
      updateHealth(45, true);
      break;
    case "pokemon05":
      tower = new Ralts(scene, x, y).setDisplaySize(30, 30).setOrigin(0.5);
      playerHealth += 28; playerDef += 5; playerSpDef += 7;
      updateHealth(28, true);
      break;
    case "pokemon15":
      tower = new Nincada(scene, x, y).setDisplaySize(30, 30).setOrigin(0.5);
      playerHealth += 31; playerDef += 18; playerSpDef += 6;
      updateHealth(31, true);
      break;
    case "pokemon25":
      tower = new Snorunt(scene, x, y).setDisplaySize(30, 30).setOrigin(0.5);
      playerHealth += 50; playerDef += 10; playerSpDef += 10;
      updateHealth(50, true);
      break;
    case "pokemon06":
      tower = new Clamperl(scene, x, y).setDisplaySize(30, 30).setOrigin(0.5);
      playerHealth += 35; playerDef += 17; playerSpDef += 11;
      updateHealth(35, true);
      break;
    case "pokemon16":
      tower = new Burmy(scene, x, y).setDisplaySize(30, 30).setOrigin(0.5);
      playerHealth += 40; playerDef += 9; playerSpDef += 9;
      updateHealth(40, true);
      break;
    case "pokemon26":
      tower = new Petilil(scene, x, y).setDisplaySize(30, 30).setOrigin(0.5);
      playerHealth += 45; playerDef += 10; playerSpDef += 10;
      updateHealth(45, true);
      break;
    case "pokemon07":
      tower = new Rufflet(scene, x, y).setDisplaySize(30, 30).setOrigin(0.5);
      playerHealth += 70; playerDef += 10; playerSpDef += 10;
      updateHealth(70, true);
      break;
    case "pokemon17":
      tower = new Goomy(scene, x, y).setDisplaySize(30, 30).setOrigin(0.5);
      playerHealth += 45; playerDef += 7; playerSpDef += 15;
      updateHealth(45, true);
      break;
    case "pokemon27":
      tower = new Bergmite(scene, x, y).setDisplaySize(30, 30).setOrigin(0.5);
      playerHealth += 55; playerDef += 17; playerSpDef += 7;
      updateHealth(55, true);
      break;
    case "pokemon08":
      tower = new Cosmog(scene, x, y).setDisplaySize(30, 30).setOrigin(0.5);
      playerHealth += 43; playerDef += 6.2; playerSpDef += 6.2;
      updateHealth(43, true);
      break;
    case "pokemon18":
      tower = new Applin(scene, x, y).setDisplaySize(30, 30).setOrigin(0.5);
      playerHealth += 40; playerDef += 16; playerSpDef += 8;
      updateHealth(40, true);
      break;
    case "pokemon28":
      tower = new Charcadet(scene, x, y).setDisplaySize(30, 30).setOrigin(0.5);
      playerHealth += 40; playerDef += 8; playerSpDef += 8;
      updateHealth(40, true);
      break;
    case "pokemon09":
      tower = new Rockruff(scene, x, y).setDisplaySize(30, 30).setOrigin(0.5);
      playerHealth += 45; playerDef += 8; playerSpDef += 8;
      updateHealth(45, true);
      break;
    case "pokemon19":
      tower = new Toxel(scene, x, y).setDisplaySize(30, 30).setOrigin(0.5);
      playerHealth += 40; playerDef += 7; playerSpDef += 7;
      updateHealth(40, true);
      break;
    case "pokemon29":
      tower = new Kubfu(scene, x, y).setDisplaySize(30, 30).setOrigin(0.5);
      playerHealth += 60; playerDef += 12; playerSpDef += 10;
      updateHealth(60, true);
      break;
  }
  return tower;
}

export function award(exp: integer) {
  playerEXP += exp;
  healthLabel.setText(`❤️${currentHealth}   ⛊${Math.round(playerDef)}   ⛉${Math.round(playerSpDef)}   💰${Math.round(playerEXP)}`);
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
    healthLabel.setText(`❤️${currentHealth}   ⛊${Math.round(playerDef)}   ⛉${Math.round(playerSpDef)}   💰${Math.round(playerEXP)}`);
  }
}