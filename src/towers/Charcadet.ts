import Phaser from 'phaser';
import { enemies, statusPossibility, takeDamage, } from '../round';
import { enemiesGroup } from '../index';

export class Charcadet extends Phaser.GameObjects.Image {
  private range: number = 480;
  private shootTimer?: Phaser.Time.TimerEvent;
  private static roundsPassed: number = -1;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
  ) {
    super(scene, x, y, 'pokemon28');
    this.setOrigin(0.5);
    scene.add.existing(this);
    Charcadet.roundsPassed++;
    this.startAttacking(scene);
  }

  private startAttacking(scene: Phaser.Scene) {
    this.shootTimer = scene.time.addEvent({
      delay: 600,
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
    const projectile = scene.physics.add.image(this.x, this.y, 'projectile2')
      .setDisplaySize(16, 16)
      .setDepth(1);
      scene.physics.moveToObject(projectile, target, 400);
      scene.time.delayedCall(800, () => {
        if (projectile && projectile.active) {
          projectile.destroy();
          scene.events.off('update', updateHandler);
        }
      });
      scene.physics.add.overlap(projectile, enemiesGroup, (proj, enemy) => {
        takeDamage((enemy as any), scene, "Fire", "Special", 24, 1/24);
        statusPossibility((enemy as any), "Burn", 0.1);
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