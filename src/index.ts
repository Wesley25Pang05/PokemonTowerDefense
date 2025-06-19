import Phaser from 'phaser';
import { paths, startRound, area } from './round';
import { Rowlett } from './towers/Rowlett'
import { Oshawott } from './towers/Oshawott';
import { Cyndaquil } from './towers/Cyndaquil';

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
  "Articuno", "Zapdos", "Moltres", "Dratini", "Dragonair", "Dragonite", "Mewtwo", "Mew"
];
  for (const name of kantoMons) {
    this.load.image(name, `assets/kanto/${name}.png`);
  }
  for (let p = 0; p < 100; p++) {
    this.load.image("projectile" + p, `assets/projectiles/projectile${p}.png`)
  }
  this.load.image('bg', 'hoenn3.png');
  this.load.text('pokemonDescriptions', 'pokemonDescriptions.txt')
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
let playerHealth = 0; let currentHealth = 0;
let playerDef = 0; let playerSpDef = 0;

function create(this: Phaser.Scene) {
  this.add.rectangle(0, 480, 1920, 240, 0x2c2c2c).setOrigin(0, 0);

  const text = this.cache.text.get('pokemonDescriptions');
  if (text) {
    const lines = text.split('\n').map((line: string) => line.trim()).filter(Boolean);

    for (let i = 0; i < lines.length - 1; i += 2) {
      const key = lines[i];
      const description = lines[i + 1];
      descriptionMap[key] = description;
    }
  }

  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 10; c++) {
      const x = 20 + c * 60;
      const y = 500 + r * 60;
      const button = this.add.image(x, y, `pokemon${r}${c}`).setOrigin(0, 0)
        .setInteractive({ userHandCursor: true, draggable: true }).setDisplaySize(55, 55);
        button.on('pointerdown', () => {
          showPopup(this, r, c, `pokemon${r}${c}`);
        });
        button.on('dragend', (pointer: Phaser.Input.Pointer) => {
          placeTower(this, pointer.worldX - 22.5, pointer.worldY - 22.5, `pokemon${r}${c}`);
          button.setPosition(x, y);
        })
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
          startRound(this);
        });
    }
  }

  enemiesGroup = this.physics.add.group();

  this.add.image(0, 0, 'bg')
  .setOrigin(0, 0)
  .setDisplaySize(1920, 480);

  areaLabel = this.add.text(10, 10, `${area}`, {
    fontSize: '24px',
    fontFamily: 'Arial',
    backgroundColor: '#ff474C',
    color: '#ffffff',
    padding: { x: 2, y: 1 },
  });
  healthLabel = this.add.text(1225, 10, `❤️${currentHealth}`, {
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
  const label = scene.add.text(boxX + 20, boxY + 10, description, {
    fontSize: '20px',
    color: '#ffffff',
    wordWrap: { width: 650 }
  });
  popupContainer.add(label);
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

function placeTower(scene: Phaser.Scene, x: number, y: number, key: string) {
  let tower = new Object();
  switch (key) {
    case "pokemon00":
      tower = new Rowlett(scene, x, y).setDisplaySize(50, 50).setOrigin(0, 0);
      playerHealth += 68; playerDef += 11; playerSpDef += 10;
      updateHealth(68, true);
      break;
    case "pokemon10":
      tower = new Oshawott(scene, x, y).setDisplaySize(50, 50).setOrigin(0, 0);
      playerHealth += 55; playerDef += 9; playerSpDef += 9;
      updateHealth(55, true);
      break;
    case "pokemon20":
      tower = new Cyndaquil(scene, x, y).setDisplaySize(50, 50).setOrigin(0, 0);
      playerHealth += 39; playerDef += 8.6; playerSpDef += 10;
      updateHealth(55, true);
      break;
  }
}

export function updateHealth(heal: integer, special: boolean) {
  if (currentHealth >= 0) {
    const reduce = special ? playerSpDef : playerDef;
    currentHealth = heal >= 0 ? playerHealth : currentHealth + Math.round(heal / reduce);
    healthLabel.setText(`❤️${currentHealth}   ⛊${Math.round(playerDef)}   ⛉${Math.round(playerSpDef)}`);
  }
}