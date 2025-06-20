import Phaser from 'phaser';
import { enemies, statusPossibility, takeDamage, } from '../round';
import { enemiesGroup } from '../index';

export class MimeJr extends Phaser.GameObjects.Image {
  private range: number = 900;
  private shootTimer?: Phaser.Time.TimerEvent;
  private static roundsPassed: number = -26;
  private static confusion: boolean = false;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
  ) {
    super(scene, x, y, 'Egg');
    this.setOrigin(0.5);
    scene.add.existing(this);
    MimeJr.roundsPassed++;
    this.startAttacking(scene);
  }

  private startAttacking(scene: Phaser.Scene) {
    this.shootTimer = scene.time.addEvent({
      delay: 900,
      loop: true,
      callback: () => {
        const target = this.findNearestEnemy();
        if (MimeJr.roundsPassed >= 0) {
          this.setTexture("pokemon04");
        }
        if (target && MimeJr.confusion) {
          this.shoot(scene, target, -20);
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

  private shoot(scene: Phaser.Scene, target: Phaser.GameObjects.PathFollower, dy: number) {
    const projectile = scene.physics.add.image(this.x, this.y, 'projectile7')
      .setDisplaySize(16, 16)
      .setDepth(1);
      scene.physics.moveToObject(projectile, target, 600);
      scene.time.delayedCall(900, () => {
        if (projectile && projectile.active) {
          scene.physics.moveToObject(projectile, target, 1200);
          scene.time.delayedCall(1500, () => {
            if (projectile && projectile.active) {
              projectile.destroy();
              scene.events.off('update', updateHandler);
            }
          });
        }
      });
      scene.physics.add.overlap(projectile, enemiesGroup, (proj, enemy) => {
        takeDamage((enemy as any), scene, "Psychic", "Special", 63, 1/24);
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
    if (this.roundsPassed >= 0) {
      this.confusion = true;
    }
    else if (this.roundsPassed > -26) {
      this.roundsPassed++;
    }
  }
}