import Phaser from 'phaser';
import { currentMon, currentTower, updateUserHP } from '..';
import { Stats } from '../Stats';
import { badges } from '../round';

export class Towers extends Phaser.GameObjects.Image {
  private id: string; private pokemonName: string;
  private range: number;
  private power: number;
  private HP: number; private DEF: number; private SPDEF: number;
  private upgradePathTop: number; private upgradePathBottom: number;
  private roundsPassed: number; private attackType: string; private stages: number;
  private static allTowers: Towers[] = [];

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    pokemon: string,
    pokemonName: string,
    range: number,
    roundsPassed: number,
    attackType: string,
    stages: number
  ) {
    super(scene, x, y, pokemon);
    Towers.allTowers.push(this);
    scene.add.existing(this);
    this.id = pokemon;
    this.pokemonName = pokemonName;
    this.range = range;
    this.upgradePathTop = 0; this.upgradePathBottom = 0;
    this.HP = 0; this.DEF = 0; this.SPDEF = 0; this.power = 0;
    this.roundsPassed = roundsPassed;
    this.attackType = attackType;
    this.stages = stages;
    this.setOrigin(0.5);
    this.setInteractive();
    this.setDisplaySize(30, 30);
  }

  public getRange() {
    return this.range;
  }

  public getPower() {
    return this.power;
  }

  public getAttackType() {
    return this.attackType;
  }

  public getRounds() {
    return this.roundsPassed;
  }

  public getPath(topPath: boolean) {
    if (topPath) {
        return this.upgradePathTop;
    }
    else {
        return this.upgradePathBottom;
    }
  }

  public upgradeFirstPath(topPath: boolean) {
    if (topPath) {
        this.upgradePathTop++;
    }
    else {
        this.upgradePathBottom++;
    }
    this.setDisplaySize(30 + this.upgradePathTop * 5 + this.upgradePathBottom * 5,
    30 + this.upgradePathTop * 5 + this.upgradePathBottom * 5);
    if (this.stages == 2) {
        if (this.upgradePathTop > 2) this.evolve(this.pokemonName, 1, -1, this.attackType);
        else if (this.upgradePathBottom > 2) this.evolve(this.pokemonName, 2, -1, this.attackType);
    }
    else {
        if (this.upgradePathTop == 3 || this.upgradePathBottom == 3) this.evolve(this.pokemonName, 0, -1, this.attackType);
        else if (this.upgradePathTop == 4) this.evolve(this.pokemonName, 1, -1, this.attackType);
        else if (this.upgradePathBottom == 4) this.evolve(this.pokemonName, 2, -1,this.attackType);
    }
    Towers.updateAllStats(this.scene);
  }

  public evolve(monName: string, evolvedInto: number, range: number, attacktype: string) {
    this.pokemonName = monName; this.range += range; this.attackType = attacktype; this.setTexture(this.id + '' + evolvedInto);
    Towers.updateAllStats(this.scene);
  }

  public returnStats() {
    let stats = "";
    if (this.attackType == "Physical") {
        stats = `🌟${this.roundsPassed} ❤️${this.HP} ⛊${this.DEF} ⛉${this.SPDEF} 🥊${this.power} 🏹${this.range}`;
    }
    else if (this.attackType == "Special") {
        stats = `🌟${this.roundsPassed} ❤️${this.HP} ⛊${this.DEF} ⛉${this.SPDEF} ✨${this.power} 🏹${this.range}`;
    }
    else {
        stats = `THERES A BUG TO THIS POKEMON PLEASE REPORT THIS TO ME`;
    }
    return stats;
  }

  public static allHP() {
    let num = 0;
    for (const tow of Towers.allTowers) {
        num += tow.HP
    }
    return num;
  }

  public static allDEF() {
    let num = 0;
    for (const tow of Towers.allTowers) {
        num += tow.DEF
    }
    return num;
  }

  public static allSPDEF() {
    let num = 0;
    for (const tow of Towers.allTowers) {
        num += tow.SPDEF
    }
    return num;
  }

  public static updateRounds(scene: Phaser.Scene) {
    for (const tow of Towers.allTowers) {
        tow.roundsPassed++;
        if (tow.roundsPassed > badges * 10 + 20) {
            tow.roundsPassed = badges * 10 + 20;
        }
        this.updateAllStats(scene);
    }
  }

  public static async updateAllStats(scene: Phaser.Scene) {
    for (const tow of Towers.allTowers) {
      let allTheStats = Stats.getPokemon(tow.pokemonName, tow.roundsPassed, 'wild'); tow.HP = (await allTheStats).stats.HP;
      tow.power = tow.attackType == 'Physical' ? (await allTheStats).stats.Attack : (await allTheStats).stats['Sp. Atk'];
      tow.DEF = (await allTheStats).stats.Defense / 5; tow.SPDEF = (await allTheStats).stats['Sp. Def'] / 5;
    }
    updateUserHP(scene, currentTower, currentMon);
  }
}
