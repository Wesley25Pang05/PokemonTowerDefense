import Phaser from 'phaser';
import { enemies, takeDamage, } from '../round';
import { enemiesGroup } from '../index';

export class Bergmite extends Phaser.GameObjects.Image {
  private range: number = 400;
  private shootTimer?: Phaser.Time.TimerEvent;
  private static roundsPassed: number = -1;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
  ) {
    super(scene, x, y, 'pokemon27');
    this.setOrigin(0.5);
    scene.add.existing(this);
    Bergmite.roundsPassed++;
    this.startAttacking(scene);
  }

  private startAttacking(scene: Phaser.Scene) {
    this.shootTimer = scene.time.addEvent({
      delay: 2000,
      loop: true,
      callback: () => {
        const target = this.findNearestEnemy();
        if (target) {
          const attacks = Math.random();
          this.shoot(scene, target);
          scene.time.delayedCall(200, () => {
            this.shoot(scene, target);;
            scene.time.delayedCall(200, () => {
              if (attacks > 0.375) this.shoot(scene, target);
              scene.time.delayedCall(200, () => {
                if (attacks > 0.75) this.shoot(scene, target);
                scene.time.delayedCall(200, () => {
                  if (attacks > 0.875) this.shoot(scene, target);
                })
              })
            })
          });
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
    const size = this.displayWidth + this.displayHeight; let time = 0; const direction = Math.random() > 0.5 ? -0.1 : 0.1;
    const projectile = scene.physics.add.image(this.x + Math.random() * size - size / 2, this.y  + Math.random() * size - size / 2, 'projectile10')
      .setDisplaySize(16, 16)
      .setDepth(1);
      scene.time.delayedCall(1200, () => {
        if (projectile && projectile.active) {
          projectile.destroy();
          scene.events.off('update', updateHandler);
        }
      });
      scene.physics.add.overlap(projectile, enemiesGroup, (proj, enemy) => {
        if (projectile && projectile.active) {
          takeDamage((enemy as any), scene, "Ice", "Physical", 69, 1/24);
          projectile.destroy();
          scene.events.off('update', updateHandler);
        }
      });
      const updateHandler = () => {
        if (!projectile.active) {
          scene.events.off('update', updateHandler);
          return;
        }
        if (time > 100) {
          scene.physics.moveToObject(projectile, target, 800);
        }
        projectile.setRotation(Math.pow(time, 1.2) * direction);
        time++;
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
