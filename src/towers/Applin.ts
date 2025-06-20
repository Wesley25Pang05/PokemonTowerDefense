import Phaser from 'phaser';
import { enemies, takeDamage, } from '../round';
import { enemiesGroup } from '../index';

export class Applin extends Phaser.GameObjects.Image {
  private range: number = 2000;
  private shootTimer?: Phaser.Time.TimerEvent;
  private static roundsPassed: number = -1;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
  ) {
    super(scene, x, y, 'pokemon18');
    this.setOrigin(0.5);
    scene.add.existing(this);
    Applin.roundsPassed++;
    this.startAttacking(scene);
  }

  private startAttacking(scene: Phaser.Scene) {
    this.shootTimer = scene.time.addEvent({
      delay: 3000,
      loop: true,
      callback: () => {
        const target = this.findNearestEnemy();
        if (target) {
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
    this.setAlpha(0); let speed = 230;
    const projectile = scene.physics.add.image(this.x, this.y, 'pokemon18')
      .setDisplaySize(this.displayWidth, this.displayHeight)
      .setDepth(1);
      scene.time.delayedCall(2300, () => {
        this.setAlpha(1);
        projectile.destroy();
      })
      scene.physics.add.overlap(projectile, enemiesGroup, (proj, enemy) => {
        if (projectile && projectile.active) {
          takeDamage((enemy as any), scene, "Grass", "Physical", 132, 1/24);
          this.setAlpha(1);
          projectile.destroy();
          scene.events.off('update', updateHandler);
        }
      });
      const updateHandler = () => {
        if (!projectile.active) {
          scene.events.off('update', updateHandler);
          return;
        }
        speed--;
        if (speed < 0) {
          scene.physics.moveToObject(projectile, target, 0);
          projectile.setDisplaySize(-1 * speed + this.displayWidth, -1 * speed + this.displayHeight)
        }
        else {
          scene.physics.moveToObject(projectile, target, speed);
        }
        if (projectile.y > 480 || projectile.y < 0 || projectile.x < 0 || projectile.x > 1920) {
          this.setAlpha(1);
          projectile.destroy();
          scene.events.off('update', updateHandler);
        }
      };

    scene.events.on('update', updateHandler);
  }

  public static updateRounds() {
    if (this.roundsPassed != -1) {
      this.roundsPassed++;
    }
  }
}
