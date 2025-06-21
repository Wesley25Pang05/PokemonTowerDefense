import Phaser from 'phaser';
import { enemies, takeDamage, } from '../round';
import { enemiesGroup } from '../index';

export class Towers extends Phaser.GameObjects.Image {
  private id: string;
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
    range: number,
    power: number,
    hp: number,
    def: number,
    spdef: number,
    roundsPassed: number,
    attackType: string,
    stages: number
  ) {
    super(scene, x, y, pokemon);
    Towers.allTowers.push(this);
    scene.add.existing(this);
    this.id = pokemon;
    this.range = range;
    this.power = power;
    this.HP = hp; this.DEF = def; this.SPDEF = spdef;
    this.upgradePathTop = 0; this.upgradePathBottom = 0;
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
        if (this.upgradePathTop > 2) this.setTexture(this.id + "1");
        else if (this.upgradePathBottom > 2) this.setTexture(this.id + "2");
    }
    else {
        if (this.upgradePathTop == 3 || this.upgradePathBottom == 3) this.setTexture(this.id + "0");
        else if (this.upgradePathTop == 4) this.setTexture(this.id + "1");
        else if (this.upgradePathBottom == 4) this.setTexture(this.id + "2");
    }
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

  public static updateRounds() {
    for (const tow of Towers.allTowers) {
        tow.roundsPassed++;
        if (tow.roundsPassed > 100) {
            tow.roundsPassed = 100;
        }
    }
  }
}