import Phaser from 'phaser';
import { enemies, takeDamage, } from '../round';
import { enemiesGroup } from '../index';
import { Towers } from './Towers';

export class Rowlet extends Towers {
  private leafageTimer?: Phaser.Time.TimerEvent;
  private RLandLBTimer?: Phaser.Time.TimerEvent;

  private grassLevel: number = 0;
  private growl: boolean = false;
  private overgrow: number = 1;
  private ghostLevel: number = 0;
  private fightingLevel: number = 0;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
  ) {
    super(scene, x, y, 'pokemon00', 800, 55, 68, 11, 10, 100, "Physical", 3);
    this.startAttacking(scene);
  }

  private startAttacking(scene: Phaser.Scene) {
    this.leafageTimer = scene.time.addEvent({delay: 2000, loop: true, callback: () => {
      const target = this.findNearestEnemy();if (target && this.grassLevel == 0) this.leafage(scene, target);
    }});
    this.RLandLBTimer = scene.time.addEvent({delay: 1000, loop: true, callback: () => {
      const target = this.findNearestEnemy();if (target && this.grassLevel == 1) this.razorLeaf(scene, target);
    }});
  }

  private findNearestEnemy(): Phaser.GameObjects.PathFollower | null {
    let closestEnemy: Phaser.GameObjects.PathFollower | null = null;
    let closestDistance = this.getRange();
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

  private leafage(scene: Phaser.Scene, target: Phaser.GameObjects.PathFollower) {
    const projectile = scene.physics.add.image(this.x, this.y, 'projectile0')
      .setDisplaySize(16, 16)
      .setDepth(1);
      scene.physics.moveToObject(projectile, target, 600);
      scene.physics.add.overlap(projectile, enemiesGroup, (proj, enemy) => {
        takeDamage((enemy as any), scene, "Grass", this.getAttackType(), 40 * this.getPower() * 2000 / 50000, 1/24);
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

  private razorLeaf(scene: Phaser.Scene, target: Phaser.GameObjects.PathFollower) {
    let speed = 0;
    const projectile = scene.physics.add.image(this.x, this.y, 'projectile0')
      .setDisplaySize(24, 24)
      .setDepth(1);
      scene.physics.add.overlap(projectile, enemiesGroup, (proj, enemy) => {
        takeDamage((enemy as any), scene, "Grass", "Physical", 88, 1/24);
        projectile.destroy();
        scene.events.off('update', updateHandler);
      });
      const updateHandler = () => {
        if (!projectile.active) {
          scene.events.off('update', updateHandler);
          return;
        }
        speed++;
        scene.physics.moveToObject(projectile, target, Math.pow(speed, 2));
        if (projectile.y > 480 || projectile.y < 0 || projectile.x < 0 || projectile.x > 1920) {
          projectile.destroy();
          scene.events.off('update', updateHandler);
        }
      };

    scene.events.on('update', updateHandler);
  }

  public returnStats() {
    let stats = super.returnStats();
    if (this.grassLevel == 0) {
      stats += " | ⚔️2.000s 🎯40";
    }
    return stats;
  }
}
