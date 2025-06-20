import Phaser from 'phaser';
import { enemies, statusPossibility, takeDamage, } from '../round';
import { enemiesGroup } from '../index';

export class Goomy extends Phaser.GameObjects.Image {
  private range: number = 600;
  private shootTimer?: Phaser.Time.TimerEvent;
  private static roundsPassed: number = -1;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
  ) {
    super(scene, x, y, 'pokemon17');
    this.setOrigin(0.5);
    scene.add.existing(this);
    Goomy.roundsPassed++;
    this.startAttacking(scene);
  }

  private startAttacking(scene: Phaser.Scene) {
    this.shootTimer = scene.time.addEvent({
      delay: 600,
      loop: true,
      callback: () => {
        for (let db = 0; db < enemies.length; db++) {
          const target = enemies[db];
          const dist = Phaser.Math.Distance.Between(this.x, this.y, target.x, target.y);
          if (target && dist < this.range) {
            this.shoot(scene, target, enemies.length);
          }
        }
      }
    });
  }

  private shoot(scene: Phaser.Scene, target: Phaser.GameObjects.PathFollower, curEnemies: number) {
    const projectile = scene.physics.add.image(this.x, this.y, 'projectile9')
      .setDisplaySize(16, 16)
      .setDepth(1);
      scene.physics.moveToObject(projectile, target, 600);
      scene.time.delayedCall(1500, () => {
        if (projectile && projectile.active) {
          projectile.destroy();
          scene.events.off('update', updateHandler);
        }
      });
      scene.physics.add.overlap(projectile, enemiesGroup, (proj, enemy) => {
        takeDamage((enemy as any), scene, "Dragon", "Special", 39.6 / Math.sqrt(curEnemies), 1/24);
        statusPossibility((enemy as any), "Paralysis", 0.3);
        projectile.destroy();
        scene.events.off('update', updateHandler);
    });
    const updateHandler = () => {
      if (!projectile.active) {
        scene.events.off('update', updateHandler);
        return;
      }
      if (target.active) {
        scene.physics.moveToObject(projectile, target, 600);
      }
      else {
        projectile.setVelocity(0, 0);
        projectile.setRotation(projectile.rotation - 0.5 + Math.random());
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