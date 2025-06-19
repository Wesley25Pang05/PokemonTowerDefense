import Phaser from 'phaser';
import { enemies, takeDamage, } from '../round';
import { enemiesGroup } from '../index';

export class Oshawott extends Phaser.GameObjects.Image {
  private range: number = 150;
  private shootTimer?: Phaser.Time.TimerEvent;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
  ) {
    super(scene, x, y, 'pokemon10');
    this.setDisplaySize(50, 50).setOrigin(0.5);
    scene.add.existing(this);

    this.startAttacking(scene);
  }

  private startAttacking(scene: Phaser.Scene) {
    this.shootTimer = scene.time.addEvent({
      delay: 300,
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
    const projectile = scene.physics.add.image(this.x, this.y, 'projectile1')
      .setDisplaySize(16, 16)
      .setDepth(1);
      scene.physics.moveToObject(projectile, target, 300);
      scene.time.delayedCall(450, () => {
        if (projectile && projectile.active) {
          projectile.destroy();
        }
      });
      scene.physics.add.overlap(projectile, enemiesGroup, (proj, enemy) => {
        takeDamage((enemy as any), scene, "Water", "Special", 22.68, 1/24);
        projectile.destroy();
    });
    const updateHandler = () => {
      if (!projectile.active) {
        scene.events.off('update', updateHandler);
        return;
      }

      if (projectile.y > 480) {
        projectile.destroy();
        scene.events.off('update', updateHandler);
      }
    };

    scene.events.on('update', updateHandler);
  }
}