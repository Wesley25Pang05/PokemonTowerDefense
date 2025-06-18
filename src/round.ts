import Phaser from 'phaser';
import { changeLabel } from './index';

export let area = "Pallet Town";
let areaIndex = 0;
let areaList = ["Route 1: Round 1/5", "Viridian City", "Route 2: Round 1/6", "Back to Viridian City for a break.",
    "Viridian Forest: Round 1/11", "Pewter City: Gym Incoming", "Gym 1: Brock | Round 1/3", "Pewter City: Boulder Badge Acquired"];
let path1: Phaser.Curves.Path;
let path2: Phaser.Curves.Path;
let enemies: Phaser.GameObjects.PathFollower[] = [];
let spawning = false;

export function paths(scene: Phaser.Scene) {
  path1 = scene.add.path(240, 500);
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

  path2 = scene.add.path(168, 40);
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

  const graphics = scene.add.graphics();
  graphics.lineStyle(1, 0x000000, 1);
  path1.draw(graphics);
  path2.draw(graphics);
}

function spawnEnemy(scene: Phaser.Scene, mon: String, trainer: String,
    hp: integer, atk: integer, def: integer, spa: integer, spd: integer, spe: integer) {
  const enemy = scene.add.follower(path1, 240, 500, `${mon}`);
  const label = scene.add.text(enemy.x, enemy.y - 40, `${trainer} ${mon}`, {
    fontSize: '14px',
    color: '#ffffff',
    stroke: '#000000',
    strokeThickness: 2,
    padding: { x: 4, y: 2 },
  }).setOrigin(0.5);
  const healthLabel = scene.add.text(enemy.x, enemy.y - 25, "", {
    fontSize: '7px',
    stroke: '#000000',
    strokeThickness: 2,
    padding: { x: 4, y: 2 },
  }).setOrigin(0.5);
  enemy.setData('label', label);
  enemy.setData('healthLabel', healthLabel);
  enemies.push(enemy);
  (enemy as any).health = hp;
  enemy.setScale(0.2);

  enemy.startFollow({
    duration: 148000 / spe,
    onComplete: () => {
      enemy.setPosition(168, 40);
      enemy.path = path2;
      enemy.startFollow({
        duration: 202300 / spe,
        onComplete: () => {
            enemy.destroy();
            enemies = enemies.filter(e => e !== enemy);
            if (enemies.length == 0 && !spawning) {
                changeArea(scene);
            }
        }
      });
    }
  });
  scene.time.addEvent({
    loop: true,
    delay: 1,
    callback: () => {
      if (!enemy.active) {
        label.destroy();
        healthLabel.destroy();
        return;
      }
      label.setPosition(enemy.x, enemy.y - 40);
      healthLabel.setPosition(enemy.x, enemy.y - 25);
      let tempLabel = "";
      for (let h = 0; h < 20 * (enemy as any).health / hp; h++) {
        tempLabel += "█";
      }
      healthLabel.setText(tempLabel);
      if ((enemy as any).health > hp / 2) {
        healthLabel.setColor('#90EE90');
      }
      else if ((enemy as any).health > hp / 5) {
        healthLabel.setColor('#FFFF00');
      }
      else {
        healthLabel.setColor('#FF0000');
      }
    },
    callbackScope: scene
  });

  return enemy;
}

function takeDamage(enemy: Phaser.GameObjects.PathFollower, scene: Phaser.Scene, amount: number) {
  const data = enemy as any;
  data.health -= amount;

  if (data.health <= 0) {
    enemy.destroy();
    enemies = enemies.filter(e => e !== enemy);
    if (enemies.length == 0 && !spawning) {
        changeArea(scene);
    }
  }
}

export async function startRound(scene: Phaser.Scene) {
  if (enemies.length == 0) {
    switch (area) {
        case "Route 1: Round 1/5":
            spawnEnemy(scene, "Pidgey", "Wild", 16, 8, 8, 8, 8, 9);
            break;
        case "Route 1: Round 2/5":
            spawnEnemy(scene, "Rattata", "Wild", 15, 9, 8, 7, 8, 10);
            break;
        case "Route 1: Round 3/5":
            spawnEnemy(scene, "Oddish", "Wild", 16, 8, 9, 10, 9, 7);
            break;
        case "Route 1: Round 4/5":
            spawnEnemy(scene, "Bellsprout", "Wild", 16, 10, 8, 10, 7, 8);
            break;
        case "Route 1: Round 5/5":
            spawnEnemy(scene, "Rattata", "Youngster Ronny's", 17, 11, 9, 9, 9, 12);
            break;
        case "Route 2: Round 1/6":
            spawnEnemy(scene, "Pidgey", "Wild", 16, 8, 8, 8, 8, 9);
            break;
        case "Route 2: Round 2/6":
            spawnEnemy(scene, "Rattata", "Wild", 15, 9, 8, 7, 8, 10);
            break;
        case "Route 2: Round 3/6":
            spawnEnemy(scene, "Oddish", "Wild", 16, 8, 9, 10, 9, 7);
            break;
        case "Route 2: Round 4/6":
            spawnEnemy(scene, "Bellsprout", "Wild", 16, 10, 8, 10, 7, 8);
            break;
        case "Route 2: Round 5/6":
            spawnEnemy(scene, "Caterpie", "Wild", 16, 7, 8, 7, 7, 8);
            break;
        case "Route 2: Round 6/6":
            spawnEnemy(scene, "Weedle", "Wild", 16, 8, 7, 7, 7, 8);
            break;
        case "Viridian Forest: Round 1/11":
            spawnEnemy(scene, "Pikachu", "Wild", 16, 9, 8, 8, 8, 11);
            break;
        case "Viridian Forest: Round 2/11":
            spawnEnemy(scene, "Butterfree", "Wild", 17, 8, 8, 11, 10, 10);
            break;
        case "Viridian Forest: Round 3/11":
            spawnEnemy(scene, "Beedrill", "Wild", 17, 11, 8, 8, 10, 10);
            break;
        case "Viridian Forest: Round 4/11":
            spawnEnemy(scene, "Bulbasaur", "Wild", 16, 8, 8, 9, 9, 8);
            break;
        case "Viridian Forest: Round 5/11":
            spawnEnemy(scene, "Weedle", "Bug Catcher Brian's", 18, 9, 9, 9, 9, 10);
            break;
        case "Viridian Forest: Round 6/11":
            spawnEnemy(scene, "Rattata", "Lass Joana's", 20, 13, 11, 10, 11, 14);
            break;
        case "Viridian Forest: Round 7/11":
            spawnEnemy(scene, "Caterpie", "Bug Catcher Rick's", 18, 9, 9, 9, 9, 10);
            break;
        case "Viridian Forest: Round 8/11":
            spawnEnemy(scene, "NidoranF", "Lass Brittany's", 22, 12, 12, 11, 11, 12);
            break;
        case "Viridian Forest: Round 9/11":
            spawnEnemy(scene, "Kakuna", "Bug Catcher Doug's", 18, 9, 10, 9, 9, 9);
            break;
        case "Viridian Forest: Round 10/11":
            spawnEnemy(scene, "Pidgey", "Lass Jocelyn's", 20, 12, 11, 11, 11, 13);
            break;
        case "Viridian Forest: Round 11/11":
            spawnEnemy(scene, "Metapod", "Bug Catcher Sammy's", 18, 9, 11, 9, 9, 9);
            break;
        case "Gym 1: Brock | Round 1/3":
            spawnEnemy(scene, "Geodude", "Picnicker Amara's", 29, 22, 25, 15, 15, 14);
            break;
        case "Gym 1: Brock | Round 2/3":
            spawnEnemy(scene, "Geodude", "Camper Liam's", 29, 22, 25, 15, 15, 14);
            break;
        case "Gym 1: Brock | Round 3/3":
            spawning = true;
            spawnEnemy(scene, "Geodude", "Brock's", 40, 32, 37, 21, 21, 19);
            await new Promise(resolve => setTimeout(resolve, 1000));
            spawnEnemy(scene, "Onix", "Brock's", 41, 27, 54, 23, 27, 33);
            spawning = false;
            break;
        default:
            changeArea(scene);
            startRound(scene);
            break;
    }
  }
}

function changeArea(scene: Phaser.Scene) {
    if (area.indexOf("Round") != -1 && area.substring(area.indexOf("Round")+6, area.indexOf("/")) != area.substring(area.indexOf("/")+1)) {
        const slash = area.indexOf("/");
        area = area.substring(0, slash - 1) + (parseInt(area.charAt(slash-1))+1) + area.substring(area.indexOf("/"));
        startRound(scene);
    }
    else {
        area = areaList[areaIndex];
        areaIndex++;
    }
    changeLabel(area);
}