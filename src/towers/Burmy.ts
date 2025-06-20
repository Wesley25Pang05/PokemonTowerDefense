import Phaser from 'phaser';
import { enemies, statusPossibility, takeDamage, } from '../round';
import { enemiesGroup } from '../index';

export class Burmy extends Phaser.GameObjects.Image {
  private range: number = 800;
  private shootTimer?: Phaser.Time.TimerEvent;
  private static roundsPassed: number = -1;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
  ) {
    super(scene, x, y, 'pokemon16');
    this.setOrigin(0.5);
    scene.add.existing(this);
    Burmy.roundsPassed++;
    this.startAttacking(scene);
  }

  private startAttacking(scene: Phaser.Scene) {
    this.shootTimer = scene.time.addEvent({
      delay: 8000,
      loop: true,
      callback: () => {
        const target = this.findNearestEnemy();
        for (let b = 0; b < 7 && target; b++) {
          this.shoot(scene, target, this.x + Math.random() * 80 - 40, this.y + Math.random() * 80 - 40);
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

  private shoot(scene: Phaser.Scene, target: Phaser.GameObjects.PathFollower, dx: number, dy: number) {
    const projectile = scene.physics.add.image(dx, dy, 'pokemon16')
      .setDisplaySize(16, 16)
      .setDepth(1);
      scene.time.delayedCall(8000, () => {
        if (projectile && projectile.active) {
          projectile.destroy();
          scene.events.off('update', updateHandler);
        }
      });
      scene.physics.add.overlap(projectile, enemiesGroup, (proj, enemy) => {
        takeDamage((enemy as any), scene, "Bug", "Special", (enemy as any).health, 1/24);
        projectile.destroy();
        scene.events.off('update', updateHandler);
    });
    const updateHandler = () => {
      if (!projectile.active) {
        scene.events.off('update', updateHandler);
        return;
      }
      scene.physics.moveToObject(projectile, target, 80);
    };

    scene.events.on('update', updateHandler);
  }

  public static updateRounds() {
    if (this.roundsPassed != -1) {
      this.roundsPassed++;
    }
  }
}