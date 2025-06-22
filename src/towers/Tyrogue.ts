import Phaser from 'phaser';
import { enemies, statusPossibility, takeDamage, } from '../round';
import { enemiesGroup } from '../index';

export class Tyrogue extends Phaser.GameObjects.Image {
  private range: number = 200;
  private shootTimer?: Phaser.Time.TimerEvent;
  private static roundsPassed: number = -26;
  private static machpunch: boolean = false;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
  ) {
    super(scene, x, y, 'Egg');
    this.setOrigin(0.5);
    scene.add.existing(this);
    Tyrogue.roundsPassed++;
    this.startAttacking(scene);
  }

  private startAttacking(scene: Phaser.Scene) {
    this.shootTimer = scene.time.addEvent({
      delay: 800,
      loop: true,
      callback: () => {
        const target = this.findNearestEnemy();
        if (Tyrogue.roundsPassed >= 0) {
          this.setTexture("pokemon14");
        }
        if (target && Tyrogue.machpunch) {
          this.shoot(scene, target);
        }
      }
    });
  }

  private findNearestEnemy(): Phaser.GameObjects.PathFollower | null {
    let closestEnemy: Phaser.GameObjects.PathFollower | null = null;
    let closestDistance = this.range;
    for (const enemy of enemies) {
      if (!enemy.active) continue;

      const dist = Phaser.Math.Distance.Between(this.x, this.y, enemy.x, enemy.y);
      if (dist < closestDistance) {
        closestDistance = dist;
        closestEnemy = enemy;
      }
    }
    return closestEnemy;
  }

  private shoot(scene: Phaser.Scene, target: Phaser.GameObjects.PathFollower) {
    this.setAlpha(0);
    const projectile = scene.physics.add.image(this.x, this.y, 'pokemon14')
      .setDisplaySize(this.displayWidth, this.displayHeight)
      .setDepth(1);
      scene.physics.moveToObject(projectile, target, 800);
      scene.physics.add.overlap(projectile, enemiesGroup, (proj, enemy) => {
        takeDamage((enemy as any), scene, "Fighting", "Physical", 22.5, 1/24);
        this.setAlpha(1);
        projectile.destroy();
        scene.events.off('update', updateHandler);
    });
    const updateHandler = () => {
      if (!projectile.active) {
        scene.events.off('update', updateHandler);
        return;
      }

      if (projectile.y > 480 || projectile.y < 0 || projectile.x < 0 || projectile.x > 1920) {
        projectile.destroy();
        this.setAlpha(1);
        scene.events.off('update', updateHandler);
      }
    };

    scene.events.on('update', updateHandler);
  }

  public static updateRounds() {
    if (this.roundsPassed >= 0) {
      this.machpunch = true;
    }
    else if (this.roundsPassed > -26) {
      this.roundsPassed++;
    }
  }
}