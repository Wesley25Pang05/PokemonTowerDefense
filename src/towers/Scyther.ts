import Phaser from 'phaser';
import { enemies, takeDamage, } from '../round';
import { enemiesGroup } from '../index';

export class Scyther extends Phaser.GameObjects.Image {
  private range: number = 700;
  private shootTimer?: Phaser.Time.TimerEvent;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
  ) {
    super(scene, x, y, 'pokemon02');
    this.setOrigin(0.5);
    scene.add.existing(this);

    this.startAttacking(scene);
  }

  private startAttacking(scene: Phaser.Scene) {
    this.shootTimer = scene.time.addEvent({
      delay: 5000,
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
    this.setAlpha(0);
    const projectile = scene.physics.add.image(this.x, this.y, 'pokemon02')
      .setDisplaySize(this.displayWidth, this.displayHeight)
      .setDepth(1);
      scene.physics.moveToObject(projectile, target, 500);
      scene.physics.add.overlap(projectile, enemiesGroup, (proj, enemy) => {
        scene.physics.moveToObject(projectile, target, 250);
        scene.time.delayedCall(500, () => {
          if (projectile && projectile.active) {
            takeDamage((enemy as any), scene, "Bug", "Physical", 220, 1/24);
            takeDamage((enemy as any), scene, "Bug", "Physical", 220, 1/24);
            this.setAlpha(1);
            projectile.destroy();
          }
        });
      });
      const updateHandler = () => {
        if (!projectile.active) {
          scene.events.off('update', updateHandler);
          return;
        }

        if (projectile.y > 480 || projectile.y < 0 || projectile.x < 0 || projectile.x > 1920) {
          this.setAlpha(1);
          projectile.destroy();
          scene.events.off('update', updateHandler);
        }
      };

    scene.events.on('update', updateHandler);
  }

  public static rowletUpgrade() {
    
  }
}
