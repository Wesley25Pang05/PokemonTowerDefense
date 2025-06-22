import Phaser from 'phaser';
import { award, changeLabel, currentHealth, enemiesGroup, lastPopUp, popupContainer, showPopup, updateHealth } from './index';
import { Stats } from './Stats';
import { Towers } from './towers/Towers';

export let area = "Pallet Town";
export let enemies: Phaser.GameObjects.PathFollower[] = [];
let areaIndex = 0;
let areaList = ["Route 1: Round 1/5", "Viridian City", "Route 2: Round 1/6", "Back to Viridian City for a break.",
    "Viridian Forest: Round 1/18", "Pewter City: Gym Incoming", "Gym 1: Brock | Round 1/3", "Pewter City: Boulder Badge Acquired",
    "Route 3: Round 1/13", "Back to Pewter City for a break.", "Mount Moon: Round 1/14", "Outside Mount Moon", "Route 4: Round 1/11",
    "Cerulean City", "Route 24: Round 1/18", "Back to Cerulean City for a break", "Route 25: Round 1/20", "Cerulean City: Gym Incoming",
    "Gym 2: Misty | Round 1/4"];
export let path1: Phaser.Curves.Path;
export let path2: Phaser.Curves.Path;
let spawning = false;
export let badges = 0;
badges = 8; //Changed for testing

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

async function spawnEnemy(scene: Phaser.Scene, mon: string, trainer: string,
    lvl: number) {
  const enemy = scene.add.follower(path1, 240, 480, `${mon}`).setScale(0.2 + lvl * 0.0005);
  scene.physics.add.existing(enemy);
  const label = scene.add.text(enemy.x, enemy.y - 40, `${trainer} LvL${lvl} ${mon}`, {
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
  const allStats = Stats.getPokemon(mon, lvl, trainer);
  (enemy as any).health = (await allStats).stats.HP;
  (enemy as any).attack = (await allStats).stats.Attack;
  (enemy as any).defense = (await allStats).stats.Defense;
  (enemy as any).specialatk = (await allStats).stats['Sp. Atk'];
  (enemy as any).specialdef = (await allStats).stats['Sp. Def'];
  (enemy as any).attackStages = 1;
  (enemy as any).defenseStages = 1;
  (enemy as any).specialatkStages = 1;
  (enemy as any).specialdefStages = 1;
  (enemy as any).typeOne = (await allStats).types[0];
  (enemy as any).typeTwo = (await allStats).types[1];
  (enemy as any).status = "None";
  (enemy as any).statusDelay = 0;
  (enemy as any).xp = (await allStats).stats.EXP * lvl / 5;
  if (trainer.indexOf("Wild") == -1) {
    (enemy as any).xp *= 1.5;
  }
  if (trainer.indexOf("Gym Leader") > -1) {
    (enemy as any).xp *= 5;
  }

  enemy.startFollow({
    duration: 148000 / Math.pow((await allStats).stats.Speed, 0.65),
    onComplete: async () => {
      if (enemy.active) {
        dealDamage(Math.min((enemy as any).attack, (enemy as any).specialatk),
        (enemy as any).attack, (enemy as any).specialatk, true);
        enemy.setPosition(168, 40);
        enemy.path = path2;
        enemy.startFollow({
          duration: 202300 / Math.pow((await allStats).stats.Speed, 0.65),
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
    callback: async () => {
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
              scene.time.delayedCall(100, () => {
                enemy.resumeFollow();
              });
              (enemy as any).status = "None";
              break;
            case "Paralysis":
              enemy.pauseFollow();
              scene.time.delayedCall(100, () => {
                enemy.resumeFollow();
              });
              (enemy as any).status = "None";
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
              scene.time.delayedCall(100, () => {
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
      for (let h = 0; h < 20 * (enemy as any).health / (await allStats).stats.HP; h++) {
        tempLabel += "█";
      }
      healthLabel.setText(tempLabel);
      if ((enemy as any).health > (await allStats).stats.HP / 2) {
        healthLabel.setColor('#90EE90');
      }
      else if ((enemy as any).health > (await allStats).stats.HP / 5) {
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

export function takeDamage(enemy: Phaser.GameObjects.PathFollower, scene: Phaser.Scene, type: string, category: string, amount: number, cc: number) {
  const data = enemy as any; const cd = cc > Math.random() ? 1.5 : 1;
  const dmgEFF = effectiveness(type, (enemy as any).typeOne, (enemy as any).typeTwo);
  const defenseCategory = category == "Physical" ? data.defense / data.defenseStages : data.specialdef / data.specialdefStages;
  let dmgTotal = Math.ceil((amount * dmgEFF * cd) / defenseCategory / 50000);
  if (data.health < dmgTotal) {
    award(data.health);
  }
  else {
    award(dmgTotal);
  }
  data.health -= dmgTotal;
  showDamageText(scene, enemy.x, enemy.y, dmgTotal.toString(), dmgEFF, cd > 1);

  if (data.health <= 0) {
    enemy.destroy();
    award((enemy as any).xp);
    enemies = enemies.filter(e => e !== enemy);
    if (enemies.length == 0 && !spawning) {
        changeArea(scene);
    }
  }

  return dmgTotal;
}

export function statusPossibility(en: Phaser.GameObjects.PathFollower, possibleStatus: string, possibility: number) {
  const statusConfirmed = (en as any).status == "None" && Math.random() < possibility;
  (en as any).status = statusConfirmed ? possibleStatus : (en as any).status;
  switch ((en as any).status) {
    case "Burn":
      (en as any).status = (en as any).typeOne == "Fire" || (en as any).typeTwo == "Fire" ? "None" : (en as any).status;
      break;
    case "Freeze":
      (en as any).status = (en as any).typeOne == "Ice" || (en as any).typeTwo == "Ice" ? "None" : (en as any).status;
      break;
    case "Paralysis":
      (en as any).status = (en as any).typeOne == "Electric" || (en as any).typeTwo == "Electric" ? "None" : (en as any).status;
      (en as any).status = (en as any).typeOne == "Ground" || (en as any).typeTwo == "Ground" ? "None" : (en as any).status;
      break;
    case "Poison":
    case "Badly Poison":
      (en as any).status = (en as any).typeOne == "Poison" || (en as any).typeTwo == "Poison" ? "None" : (en as any).status;
      break;
    case "Sleep":
      (en as any).status = (en as any).typeOne == "Grass" || (en as any).typeTwo == "Grass" ? "None" : (en as any).status;
      break;
    default:
      break;
  }
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
  let multiplier = typeChart[typeInt][typeIntOne]; multiplier *= typeIntTwo != -1 ? typeChart[typeInt][typeIntTwo] : 1; return multiplier;
}

export function lowerState(scene: Phaser.Scene, en: Phaser.GameObjects.PathFollower, state: string, chance: number) {
  if (Math.random() < chance) {
    switch (state) {
      case "attack":
        (en as any).attackStages += (en as any).attackStages >= 2 ? 0 : 0.25;
        showDamageText(scene, en.x, en.y, "🥊", 1, false);
        break;
      case "defense":
        (en as any).defenseStages += (en as any).defenseStages >= 2 ? 0 : 0.25;
        showDamageText(scene, en.x, en.y, "⛊", 1, false);
        break;
      case "specialatk":
        (en as any).specialatkStages += (en as any).specialatkStages >= 2 ? 0 : 0.25;
        showDamageText(scene, en.x, en.y, "✨", 1, false);
        break;
      case "specialdef":
        (en as any).specialdefStages += (en as any).specialdefStages >= 2 ? 0 : 0.25;
        showDamageText(scene, en.x, en.y, "⛉", 1, false);
        break;
    }
  }
}

function showDamageText(scene: Phaser.Scene, x: number, y: number, damage: string, eff: number, cd: boolean) {
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
  const showCrit = cd ? "💥" : ""
  const text = scene.add.text(x - Math.random() * 50 + 25, y - Math.random() * 50 + 25, damage + showCrit, {
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
            spawnEnemy(scene, "Pidgey", "Wild", 3);
            break;
        case "Route 1: Round 2/5":
            spawnEnemy(scene, "Rattata", "Wild", 3);
            break;
        case "Route 1: Round 3/5":
            spawnEnemy(scene, "Oddish", "Wild", 3);
            break;
        case "Route 1: Round 4/5":
            spawnEnemy(scene, "Bellsprout", "Wild", 3);
            break;
        case "Route 1: Round 5/5":
            spawnEnemy(scene, "Rattata", "Youngster Ronny's", 3);
            break;
        case "Route 2: Round 1/6":
            spawnEnemy(scene, "Pidgey", "Wild", 3);
            break;
        case "Route 2: Round 2/6":
            spawnEnemy(scene, "Rattata", "Wild", 3);
            break;
        case "Route 2: Round 3/6":
            spawnEnemy(scene, "Oddish", "Wild", 3);
            break;
        case "Route 2: Round 4/6":
            spawnEnemy(scene, "Bellsprout", "Wild", 3);
            break;
        case "Route 2: Round 5/6":
            spawnEnemy(scene, "Caterpie", "Wild", 3);
            break;
        case "Route 2: Round 6/6":
            spawnEnemy(scene, "Weedle", "Wild", 3);
            break;
        case "Viridian Forest: Round 1/18":
            spawnEnemy(scene, "Caterpie", "Wild", 3);
            break;
        case "Viridian Forest: Round 2/18":
            spawnEnemy(scene, "Weedle", "Wild", 3);
            break;
        case "Viridian Forest: Round 3/18":
            spawnEnemy(scene, "Pidgey", "Wild", 3);
            break;
        case "Viridian Forest: Round 4/18":
            spawnEnemy(scene, "Metapod", "Wild", 3);
            break;
        case "Viridian Forest: Round 5/18":
            spawnEnemy(scene, "Kakuna", "Wild", 3);
            break;
        case "Viridian Forest: Round 6/18":
            spawnEnemy(scene, "Oddish", "Wild", 3);
            break;
        case "Viridian Forest: Round 7/18":
            spawnEnemy(scene, "Bellsprout", "Wild", 3);
            break;
        case "Viridian Forest: Round 8/18":
            spawnEnemy(scene, "Pikachu", "Wild", 3);
            break;
        case "Viridian Forest: Round 9/18":
            spawnEnemy(scene, "Butterfree", "Wild", 3);
            break;
        case "Viridian Forest: Round 10/18":
            spawnEnemy(scene, "Beedrill", "Wild", 3);
            break;
        case "Viridian Forest: Round 11/18":
            spawnEnemy(scene, "Bulbasaur", "Wild", 3);
            break;
        case "Viridian Forest: Round 12/18":
            spawnEnemy(scene, "Weedle", "Bug Catcher Brian's", 3);
            break;
        case "Viridian Forest: Round 13/18":
            spawnEnemy(scene, "Rattata", "Lass Joana's", 4);
            break;
        case "Viridian Forest: Round 14/18":
            spawnEnemy(scene, "Caterpie", "Bug Catcher Rick's", 3);
            break;
        case "Viridian Forest: Round 15/18":
            spawnEnemy(scene, "NidoranF", "Lass Brittany's", 4);
            break;
        case "Viridian Forest: Round 16/18":
            spawnEnemy(scene, "Kakuna", "Bug Catcher Doug's", 3);
            break;
        case "Viridian Forest: Round 17/18":
            spawnEnemy(scene, "Pidgey", "Lass Jocelyn's", 4);
            break;
        case "Viridian Forest: Round 18/18":
            spawnEnemy(scene, "Metapod", "Bug Catcher Sammy's", 3);
            break;
        case "Gym 1: Brock | Round 1/3":
            spawnEnemy(scene, "Geodude", "Picnicker Amara's", 7);
            break;
        case "Gym 1: Brock | Round 2/3":
            spawnEnemy(scene, "Geodude", "Camper Liam's", 7);
            break;
        case "Gym 1: Brock | Round 3/3":
            spawning = true;
            spawnEnemy(scene, "Geodude", "Gym Leader Brock's", 11);
            await new Promise(resolve => setTimeout(resolve, 5000));
            spawnEnemy(scene, "Onix", "Gym Leader Brock's", 11);
            spawning = false;
            break;
        case "Gym 2: Misty | Round ?/?":
            spawning = true;
            spawnEnemy(scene, "Psyduck", "Gym Leader Misty's", 18);
            await new Promise(resolve => setTimeout(resolve, 5000));
            spawnEnemy(scene, "Starmie", "Gym Leader Misty's", 19);
            spawning = false;
            break;
        case "Gym 3: Lt. Surge | Round ?/?":
            spawning = true;
            spawnEnemy(scene, "Voltorb", "Gym Leader Lt. Surge's", 25);
            await new Promise(resolve => setTimeout(resolve, 5000));
            spawnEnemy(scene, "Magnemite", "Gym Leader Lt. Surge's", 25);
            await new Promise(resolve => setTimeout(resolve, 5000));
            spawnEnemy(scene, "Raichu", "Gym Leader Lt. Surge's", 26);
            spawning = false;
            break;
        case "Elite Four: Round 1/5":
            spawning = true;
            spawnEnemy(scene, "Dewgong", "Lorelei's ", 51);
            await new Promise(resolve => setTimeout(resolve, 5000));
            spawnEnemy(scene, "Jynx", "Lorelei's ", 51);
            await new Promise(resolve => setTimeout(resolve, 5000));
            spawnEnemy(scene, "Cloyster", "Lorelei's ", 51);
            await new Promise(resolve => setTimeout(resolve, 5000));
            spawnEnemy(scene, "Slowbro", "Lorelei's ", 51);
            await new Promise(resolve => setTimeout(resolve, 5000));
            spawnEnemy(scene, "Lapras", "Lorelei's ", 51);
            spawning = false;
        default:
            changeArea(scene);
            startRound(scene);
            break;
    }
  }
}

function changeArea(scene: Phaser.Scene) {
    if (currentHealth < 0) {
      area = "Failed " + areaList[areaIndex - 1];
    }
    else if (area.indexOf("Round") != -1 && area.substring(area.indexOf("Round")+6, area.indexOf("/")) != area.substring(area.indexOf("/")+1)) {
        const slash = area.indexOf("/");
        area = area.substring(0, slash - 1) + (parseInt(area.charAt(slash-1))+1) + area.substring(area.indexOf("/"));
        Towers.updateRounds(scene);
        startRound(scene);
    }
    else {
        if (area.indexOf("Gym") != -1 && area.indexOf(": Gym") == -1) badges++;
        area = areaList[areaIndex];
        // area = "Elite Four: Round 1/5"; //Changed for testing
        // area = "Gym 1: Brock | Round 3/3";
        // area = "Gym 2: Misty | Round ?/?";
        // area = "Gym 3: Lt. Surge | Round ?/?";
        updateHealth(0, true);
        areaIndex++;
    }
    showPopup(lastPopUp.scene, lastPopUp.r, lastPopUp.c, lastPopUp.pokemon, lastPopUp.customMessage, lastPopUp.pokemonActive);
    changeLabel(area);
}