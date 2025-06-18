import Phaser from 'phaser';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 1920,
  height: 720,
  scene: {
    preload,
    create,
    update
  }
};

const game = new Phaser.Game(config);

let path1: Phaser.Curves.Path;
let path2: Phaser.Curves.Path;
let enemies: Phaser.GameObjects.PathFollower[] = [];

function preload(this: Phaser.Scene) {
  this.load.image('enemy', 'pokeball.png');
  this.load.image('bg', 'hoenn3.png');
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 10; c++) {
      const key = 'pokemon${row}$col}';
      const path = 'towers/${key}.png';
      this.load.image(key, path);
    }
  }
}

function create(this: Phaser.Scene) {
  this.add.rectangle(0, 480, 1920, 240, 0x2c2c2c).setOrigin(0, 0);

  const pokemonButtonWidth = 50;
  const pokemonButtonHeight = 50;
  const spacing = 15;
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 10; c++) {
      const x = 20 + c * (pokemonButtonWidth + spacing);
      const y = 500 + r * (pokemonButtonHeight + spacing);
      const button = this.add.image(x, y, 'pokemon/${row}${col}.png').setOrigin(0, 0)
        .setInteractive({ userHandCursor: true }).setDisplaySize(pokemonButtonWidth, pokemonButtonHeight);
    }
  }

  this.add.image(0, 0, 'bg')
  .setOrigin(0, 0)
  .setDisplaySize(1920, 480);

  path1 = this.add.path(240, 500);
  path1.lineTo(240, 410);
  path1.lineTo(170, 410);
  path1.lineTo(170, 360);
  path1.lineTo(120, 360);
  path1.lineTo(120, 330);
  path1.lineTo(210, 330);
  path1.lineTo(210, 270);
  path1.lineTo(310, 270);
  path1.lineTo(310, 236);
  path1.lineTo(362, 236);
  path1.lineTo(362, 260);
  path1.lineTo(1092, 260);
  path1.lineTo(1092, 160);
  
  path2 = this.add.path(168, 40);
  path2.lineTo(168, 118);
  path2.lineTo(260, 118);
  path2.lineTo(260, 192);
  path2.lineTo(432, 192);
  path2.lineTo(432, 216);
  path2.lineTo(1192, 216);
  path2.lineTo(1192, 263);
  path2.lineTo(1270, 263);
  path2.lineTo(1270, 284);
  path2.lineTo(1365, 284);
  path2.lineTo(1365, 311);
  path2.lineTo(1920, 311);

  const graphics = this.add.graphics();
  graphics.lineStyle(1, 0x000000, 1);
  path1.draw(graphics);
  path2.draw(graphics);
  
  const enemy = this.add.follower(path1, 240, 500, 'enemy');
  enemy.setScale(0.5);

  enemy.startFollow({
    duration: 3000,
    rotateToPath: true,
    onComplete: () => {
      enemy.setPosition(168, 40);
      enemy.path = path2;
      enemy.startFollow({
        duration: 3000,
        rotateToPath: true,
      })
    }
  })
}

function update(this: Phaser.Scene, time: number, delta: number) {
  enemies = enemies.filter(enemy => {
    if (enemy.isFollowing()) return true;
    enemy.destroy();
    return false;
  });
}
