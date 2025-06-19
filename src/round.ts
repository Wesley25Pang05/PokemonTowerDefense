import Phaser from 'phaser';
import { award, changeLabel, enemiesGroup, updateHealth } from './index';

export let area = "Pallet Town";
export let enemies: Phaser.GameObjects.PathFollower[] = [];
let areaIndex = 0;
let areaList = ["Route 1: Round 1/5", "Viridian City", "Route 2: Round 1/6", "Back to Viridian City for a break.",
    "Viridian Forest: Round 1/11", "Pewter City: Gym Incoming", "Gym 1: Brock | Round 1/3", "Pewter City: Boulder Badge Acquired"];
let path1: Phaser.Curves.Path;
let path2: Phaser.Curves.Path;
let spawning = false;

export function paths(scene: Phaser.Scene) {
  path1 = scene.add.path(240, 480);
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

function spawnEnemy(scene: Phaser.Scene, mon: String, type1: String, type2: String, trainer: String,
    hp: integer, atk: integer, def: integer, spa: integer, spd: integer, spe: integer, experience: integer) {
  const enemy = scene.add.follower(path1, 240, 480, `${mon}`);
  scene.physics.add.existing(enemy);
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
  enemiesGroup.add(enemy);
  (enemy as any).health = hp;
  (enemy as any).attack = atk;
  (enemy as any).defense = def;
  (enemy as any).specialatk = spa;
  (enemy as any).specialdef = spd;
  (enemy as any).typeOne = type1;
  (enemy as any).typeTwo = type2;
  (enemy as any).status = "None";
  (enemy as any).statusDelay = 0;
  (enemy as any).xp = experience;
  enemy.setScale(0.2);

  enemy.startFollow({
    duration: 296000 / spe,
    onComplete: () => {
      if (enemy.active) {
        dealDamage(Math.min((enemy as any).attack, (enemy as any).specialatk),
        (enemy as any).attack, (enemy as any).specialatk, true);
        enemy.setPosition(168, 40);
        enemy.path = path2;
        enemy.startFollow({
          duration: 404600 / spe,
          onComplete: () => {
            dealDamage(Math.max((enemy as any).attack, (enemy as any).specialatk),
            (enemy as any).attack, (enemy as any).specialatk, false);
              if (enemy.active) {
                enemy.destroy();
                enemies = enemies.filter(e => e !== enemy);
                if (enemies.length == 0 && !spawning) {
                  changeArea(scene);
                }
              }
          }
        });
      }
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
      if ((enemy as any).status != "None") {
        if ((enemy as any).statusDelay > 1000) {
          switch ((enemy as any).status) {
            case "Burn":
              const predictedBurnDMG = (enemy as any).health * 0.04;
              const predictedBurnReduce = (enemy as any).attack * 0.04;
              (enemy as any).health -= (enemy as any).health - predictedBurnDMG > 1 ? predictedBurnDMG : 0;
              (enemy as any).attack -= (enemy as any).attack - predictedBurnReduce > 1 ? predictedBurnReduce : 0;
              label.setColor('#FF4500');
              break;
            case "Freeze":
              enemy.pauseFollow();
              scene.time.delayedCall(600, () => {
                enemy.resumeFollow();
              });
              (enemy as any).status = "None";
              break;
            case "Paralysis":
              (enemy as any).attack /= 2;
              (enemy as any).spatk /= 2;
              (enemy as any).status = "Para Done";
              label.setColor('#FFFF00');
              break;
            case "Poison":
              const predictedPoisonDmg = (enemy as any).health * 0.04;
              (enemy as any).health -= (enemy as any).health > predictedPoisonDmg ? predictedPoisonDmg : 0;
              label.setColor('#CBC3E3');
              break;
            case "Badly Poison":
              const predictedBadlyPoisonDmg = (enemy as any).health * 0.08;
              (enemy as any).health -= (enemy as any).health > predictedBadlyPoisonDmg ? predictedBadlyPoisonDmg : 0;
              label.setColor('#A020F0');
              break;
            case "Sleep":
              enemy.pauseFollow();
              scene.time.delayedCall(600, () => {
                enemy.resumeFollow();
              });
              (enemy as any).status = "None";
              break;
            default:
              break;
          }
          (enemy as any).statusDelay = 0;
        }
        else {
          (enemy as any).statusDelay++;
        }
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

export function dealDamage(amount: number, atk: number, spatk: number, cave: boolean) {
  if (cave == atk < spatk) {
    updateHealth(Math.round(amount * -100) - 1, false);
  }
  else {
    updateHealth(Math.round(amount * -100) - 1, true);
  }
}

export function takeDamage(enemy: Phaser.GameObjects.PathFollower, scene: Phaser.Scene, type: string, amount: number) {
  const data = enemy as any;
  const dmgEFF = effectiveness(type, (enemy as any).typeOne, (enemy as any).typeTwo);
  let dmgTotal = Math.ceil((amount * dmgEFF) / data.defense);
  data.health -= dmgTotal;
  showDamageText(scene, enemy.x, enemy.y, dmgTotal, dmgEFF);

  if (data.health <= 0) {
    enemy.destroy();
    award((enemy as any).xp);
    enemies = enemies.filter(e => e !== enemy);
    if (enemies.length == 0 && !spawning) {
        changeArea(scene);
    }
  }
}

export function statusPossibility(en: Phaser.GameObjects.PathFollower, possibleStatus: string, possibility: number) {
  const statusConfirmed = (en as any).status == "None" && Math.random() < possibility;
  (en as any).status = statusConfirmed ? possibleStatus : (en as any).status;
  (en as any).statusDelay = statusConfirmed ? 1000 : 0;
}

function effectiveness(type: string, typeOne: string, typeTwo: string) {
  let typeList = ["Normal", "Fire", "Water", "Electric", "Grass", "Ice", "Fighting", "Poison", "Ground",
    "Flying", "Psychic", "Bug", "Rock", "Ghost", "Dragon", "Dark", "Steel", "Fairy"];
  let typeChart = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0.625, 0.39, 1, 1, 0.625, 1],
    [1, 0.625, 0.625, 1, 1.6, 1.6, 1, 1, 1, 1, 1, 1.6, 0.625, 1, 0.625, 1, 1.6, 1],
    [1, 1.6, 0.625, 1, 0.625, 1, 1, 1, 1.6, 1, 1, 1, 1.6, 1, 0.625, 1, 1, 1],
    [1, 1, 1.6, 0.625, 0.625, 1, 1, 1, 0.39, 1.6, 1, 1, 1, 1, 0.625, 1, 1, 1],
    [1, 0.625, 1.6, 1, 0.625, 1, 1, 0.625, 1.6, 0.625, 1, 0.625, 1.6, 1, 0.625, 1, 0.625, 1],
    [1, 0.625, 0.625, 1, 1.6, 0.625, 1, 1, 1.6, 1.6, 1, 1, 1, 1, 1.6, 1, 0.625, 1],
    [1.6, 1, 1, 1, 1, 1.6, 1, 0.625, 1, 0.625, 0.625, 0.625, 1.6, 0.39, 1, 1.6, 1.6, 0.625],
    [1, 1, 1, 1, 1.6, 1, 1, 0.625, 0.625, 1, 1, 1, 0.625, 0.625, 1, 1, 0.39, 1.6],
    [1, 1.6, 1, 1.6, 0.625, 1, 1, 1.6, 1, 0.39, 1, 0.625, 1.6, 1, 1, 1, 1.6, 1],
    [1, 1, 1, 0.625, 1.6, 1, 1.6, 1, 1, 1, 1, 1.6, 0.625, 1, 1, 1, 0.625, 1],
    [1, 1, 1, 1, 1, 1, 1.6, 1.6, 1, 1, 0.625, 1, 1, 1, 1, 0.39, 0.625, 1],
    [1, 0.625, 1, 1, 1.6, 1, 0.625, 0.625, 1, 0.625, 1.6, 1, 1, 0.625, 1, 1.6, 0.625, 0.625],
    [1, 1.6, 1, 1, 1, 1.6, 0.625, 1, 0.625, 1.6, 1, 1.6, 1, 1, 1, 1, 0.625, 1],
    [0.39, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1.6, 1, 1, 1.6, 1, 0.625, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1.6, 1, 0.625, 0.39],
    [1, 1, 1, 1, 1, 1, 0.625, 1, 1, 1, 1.6, 1, 1, 1.6, 1, 0.625, 1, 0.625],
    [1, 0.625, 0.625, 0.625, 1, 1.6, 1, 1, 1, 1, 1, 1, 1.6, 1, 1, 1, 0.625, 1.6],
    [1, 0.625, 1, 1, 1, 1, 1.6, 0.625, 1, 1, 1, 1, 1, 1, 1.6, 1.6, 0.625, 1]
  ]
  let typeInt = typeList.indexOf(type); let typeIntOne = typeList.indexOf(typeOne); let typeIntTwo = typeList.indexOf(typeTwo);
  let multiplier = typeChart[typeInt][typeIntOne]; multiplier *= typeIntTwo != -1 ? typeChart[typeInt][typeIntTwo] : multiplier; return multiplier;
}

function showDamageText(scene: Phaser.Scene, x: number, y: number, damage: number, eff: number) {
  let color = '#ffffff';
  if (eff < 0.5) {
    color = '#00008B';
  }
  else if (eff < 0.9) {
    color = '#ADD8E6';
  }
  else if (eff > 2) {
    color = '#8B0000';
  }
  else if (eff > 1.1) {
    color = '#FF0000';
  }
  const text = scene.add.text(x, y, damage.toString(), {
    fontSize: '14px',
    color: `${color}`,
    stroke: '#000000',
    strokeThickness: 2
  }).setOrigin(0.5);

  scene.tweens.add({
    targets: text,
    y: y - 30,
    alpha: 0,
    scale: { from: 1, to: 1.5 },
    duration: 3000,
    ease: 'Cubic.easeOut',
    onComplete: () => text.destroy()
  });
}

export async function startRound(scene: Phaser.Scene) {
  if (enemies.length == 0) {
    switch (area) {
        case "Route 1: Round 1/5":
            spawnEnemy(scene, "Pidgey", "Normal", "Flying", "Wild", 16, 8, 8, 8, 8, 9, 50);
            break;
        case "Route 1: Round 2/5":
            spawnEnemy(scene, "Rattata", "Normal", "None", "Wild", 15, 9, 8, 7, 8, 10, 51);
            break;
        case "Route 1: Round 3/5":
            spawnEnemy(scene, "Oddish", "Grass", "Poison", "Wild", 16, 8, 9, 10, 9, 7, 64);
            break;
        case "Route 1: Round 4/5":
            spawnEnemy(scene, "Bellsprout", "Grass", "Poison", "Wild", 16, 10, 8, 10, 7, 8, 60);
            break;
        case "Route 1: Round 5/5":
            spawnEnemy(scene, "Rattata", "Normal", "None", "Youngster Ronny's", 17, 11, 9, 9, 9, 12, 51*2);
            break;
        case "Route 2: Round 1/6":
            spawnEnemy(scene, "Pidgey", "Normal", "Flying", "Wild", 16, 8, 8, 8, 8, 9, 50);
            break;
        case "Route 2: Round 2/6":
            spawnEnemy(scene, "Rattata", "Normal", "None", "Wild", 15, 9, 8, 7, 8, 10, 51);
            break;
        case "Route 2: Round 3/6":
            spawnEnemy(scene, "Oddish", "Grass", "Poison", "Wild", 16, 8, 9, 10, 9, 7, 64);
            break;
        case "Route 2: Round 4/6":
            spawnEnemy(scene, "Bellsprout", "Grass", "Poison", "Wild", 16, 10, 8, 10, 7, 8, 60);
            break;
        case "Route 2: Round 5/6":
            spawnEnemy(scene, "Caterpie", "Bug", "None", "Wild", 16, 7, 8, 7, 7, 8, 39);
            break;
        case "Route 2: Round 6/6":
            spawnEnemy(scene, "Weedle", "Bug", "Poison", "Wild", 16, 8, 7, 7, 7, 8, 39);
            break;
        case "Viridian Forest: Round 1/11":
            spawnEnemy(scene, "Pikachu", "Electric", "None", "Wild", 16, 9, 8, 8, 8, 11, 112);
            break;
        case "Viridian Forest: Round 2/11":
            spawnEnemy(scene, "Butterfree", "Bug", "Flying", "Wild", 17, 8, 8, 11, 10, 10, 178);
            break;
        case "Viridian Forest: Round 3/11":
            spawnEnemy(scene, "Beedrill", "Bug", "Poison", "Wild", 17, 11, 8, 8, 10, 10, 178);
            break;
        case "Viridian Forest: Round 4/11":
            spawnEnemy(scene, "Bulbasaur", "Grass", "Poison", "Wild", 16, 8, 8, 9, 9, 8, 64);
            break;
        case "Viridian Forest: Round 5/11":
            spawnEnemy(scene, "Weedle", "Bug", "Poison", "Bug Catcher Brian's", 18, 9, 9, 9, 9, 10, 39*2);
            break;
        case "Viridian Forest: Round 6/11":
            spawnEnemy(scene, "Rattata", "Normal", "None", "Lass Joana's", 20, 13, 11, 10, 11, 14, 51*2);
            break;
        case "Viridian Forest: Round 7/11":
            spawnEnemy(scene, "Caterpie", "Bug", "None", "Bug Catcher Rick's", 18, 9, 9, 9, 9, 10, 39*2);
            break;
        case "Viridian Forest: Round 8/11":
            spawnEnemy(scene, "NidoranF", "Poison", "None", "Lass Brittany's", 22, 12, 12, 11, 11, 12, 55*2);
            break;
        case "Viridian Forest: Round 9/11":
            spawnEnemy(scene, "Kakuna", "Bug", "Poison", "Bug Catcher Doug's", 18, 9, 10, 9, 9, 9, 72*2);
            break;
        case "Viridian Forest: Round 10/11":
            spawnEnemy(scene, "Pidgey", "Normal", "Flying", "Lass Jocelyn's", 20, 12, 11, 11, 11, 13, 50*2);
            break;
        case "Viridian Forest: Round 11/11":
            spawnEnemy(scene, "Metapod", "Bug", "None", "Bug Catcher Sammy's", 18, 9, 11, 9, 9, 9, 72*2);
            break;
        case "Gym 1: Brock | Round 1/3":
            spawnEnemy(scene, "Geodude", "Rock", "Ground", "Picnicker Amara's", 29, 22, 25, 15, 15, 14, 60*2);
            break;
        case "Gym 1: Brock | Round 2/3":
            spawnEnemy(scene, "Geodude", "Rock", "Ground", "Camper Liam's", 29, 22, 25, 15, 15, 14, 60*2);
            break;
        case "Gym 1: Brock | Round 3/3":
            spawning = true;
            spawnEnemy(scene, "Geodude", "Rock", "Ground", "Brock's", 40, 32, 37, 21, 21, 19, 60*5);
            await new Promise(resolve => setTimeout(resolve, 1000));
            spawnEnemy(scene, "Onix", "Rock", "Ground", "Brock's", 41, 27, 54, 23, 27, 33, 77*5);
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
        updateHealth(0, true);
        areaIndex++;
    }
    changeLabel(area);
}