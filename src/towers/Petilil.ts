import Phaser from 'phaser';
import { enemies, statusPossibility, takeDamage, } from '../round';
import { enemiesGroup } from '../index';

export class Petilil extends Phaser.GameObjects.Image {
  private range: number = 600;
  private shootTimer?: Phaser.Time.TimerEvent;
  private static roundsPassed: number = -1;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
  ) {
    super(scene, x, y, 'pokemon26');
    this.setOrigin(0.5);
    scene.add.existing(this);
    Petilil.roundsPassed++;
    this.startAttacking(scene);
  }

  private startAttacking(scene: Phaser.Scene) {
    this.shootTimer = scene.time.addEvent({
      delay: 1600,
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
    let size = 0;
    const projectile = scene.physics.add.image(this.x, this.y, 'projectile0')
      .setDisplaySize(0, 0)
      .setDepth(1);
      scene.time.delayedCall(60000, () => {
        if (projectile && projectile.active) {
          projectile.destroy();
          scene.events.off('update', updateHandler);
        }
      });
      scene.physics.add.overlap(projectile, enemiesGroup, (proj, enemy) => {
        takeDamage((enemy as any), scene, "Grass", "Special", 84, 1/24);
        projectile.destroy();
        scene.events.off('update', updateHandler);
    });
    const updateHandler = () => {
      if (!projectile.active) {
        scene.events.off('update', updateHandler);
        return;
      }
      size++;
      projectile.setDisplaySize(Math.sqrt(size), Math.sqrt(size))
      projectile.setRotation(Math.sqrt(size));
      scene.physics.moveToObject(projectile, target, 60);
      if (!target.active) {
        projectile.setVelocity(0, 0);
        size -= Math.ceil(Math.random() + 0.5);
        if (size < 0) {
          projectile.destroy();
          scene.events.off('update', updateHandler);
        }
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