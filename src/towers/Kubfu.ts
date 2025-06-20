import Phaser from 'phaser';
import { enemies, lowerState, takeDamage, } from '../round';
import { enemiesGroup } from '../index';

export class Kubfu extends Phaser.GameObjects.Image {
  private range: number = 400;
  private shootTimer?: Phaser.Time.TimerEvent;
  private static roundsPassed: number = -1;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
  ) {
    super(scene, x, y, 'pokemon29');
    this.setOrigin(0.5);
    scene.add.existing(this);
    Kubfu.roundsPassed++;
    this.startAttacking(scene);
  }

  private startAttacking(scene: Phaser.Scene) {
    this.shootTimer = scene.time.addEvent({
      delay: 1500,
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
    let damageDealt = false;
    const projectile = scene.physics.add.image(this.x, this.y, 'projectile11')
      .setDisplaySize(24, 24)
      .setDepth(1);
      scene.physics.moveToObject(projectile, target, 450);
      scene.physics.add.overlap(projectile, enemiesGroup, (proj, enemy) => {
        projectile.setPosition(target.x + 10, target.y);
        projectile.setVelocity(0, 0);
        scene.time.delayedCall(150, () => {
          if (projectile && projectile.active) {
            this.setAlpha(0);
            projectile.setTexture('pokemon29');
            scene.time.delayedCall(300, () => {
              projectile.destroy();
              scene.events.off('update', updateHandler);
              if (!damageDealt) {
                takeDamage((enemy as any), scene, "Fighting", "Physical", 108, 1/24);
                lowerState(scene, (enemy as any), "defense", 0.5)
                damageDealt = true;
              }
              this.setAlpha(1);
            });
          };
        });
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
