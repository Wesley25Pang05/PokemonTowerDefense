import Phaser, { Physics } from 'phaser';
import { enemies, lowerState, takeDamage, } from '../round';
import { enemiesGroup } from '../index';
import { Towers } from './Towers';

export class Rowlet extends Towers {
  private leafageTimer?: Phaser.Time.TimerEvent;
  private razorLeafTimer?: Phaser.Time.TimerEvent;
  private leafBladeSpiritShackleTripleArrowsTimer?: Phaser.Time.TimerEvent;
  private shadowSneakTimer?: Phaser.Time.TimerEvent;


  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
  ) {
    super(scene, x, y, 'pokemon00', 'Rowlet', 800, 5, "Physical", 3);
    this.startAttacking(scene);
  }

  private startAttacking(scene: Phaser.Scene) {
    this.leafageTimer = scene.time.addEvent({delay: 2000, loop: true, callback: () => {
      const target = this.findNearestEnemy();if (target && this.getPath(true) == 0) this.leafage(scene, target);
    }});
    this.razorLeafTimer = scene.time.addEvent({delay: 1000, loop: true, callback: () => {
      const target = this.findNearestEnemy(); if (target && this.getPath(true) == 1) this.razorLeaf(scene, target);
    }});
    this.leafBladeSpiritShackleTripleArrowsTimer = scene.time.addEvent({delay: 1500, loop: true, callback: () => {
      const target = this.findNearestEnemy();
      if (target && this.getPath(true) >= 2) this.leafBlade(scene, target);
      if (target && this.getPath(true) == 4) this.spiritShackle(scene, target);
      if (target && this.getPath(false) == 4) this.tripleArrows(scene, target, 2);
    }});
    this.shadowSneakTimer = scene.time.addEvent({delay: 800, loop: true, callback: () => {
      const target = this.findNearestEnemy();
      if (target && this.getPath(true) == 3) this.shadowSneak(scene, target);
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
        const overgrow = this.getPath(false) > 0 ? 1.25 : 1;
        takeDamage((enemy as any), scene, "Grass", this.getAttackType(), 40 * this.getPower() * 2000 * overgrow, 1/24);
        if (this.getPath(false) > 1) lowerState(scene, (enemy as any), 'attack', 1);
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
        const overgrow = this.getPath(false) > 0 ? 1.25 : 1;
        takeDamage((enemy as any), scene, "Grass", "Physical", 55 * this.getPower() * 1000 * overgrow, 1/8);
        if (this.getPath(false) > 1) lowerState(scene, (enemy as any), 'attack', 1);
        projectile.destroy();
        scene.events.off('update', updateHandler);
      });
      const updateHandler = () => {
        if (!projectile.active) {
          scene.events.off('update', updateHandler);
          return;
        }
        speed++;
        if (target.active) scene.physics.moveToObject(projectile, target, Math.pow(speed, 2));
        if (projectile.y > 480 || projectile.y < 0 || projectile.x < 0 || projectile.x > 1920) {
          projectile.destroy();
          scene.events.off('update', updateHandler);
        }
      };

    scene.events.on('update', updateHandler);
  }

  private leafBlade(scene: Phaser.Scene, target: Phaser.GameObjects.PathFollower) {
    let attackSpeed = 0;
    const projectile = scene.physics.add.image(target.x, target.y, 'projectile0')
      .setDisplaySize(36, 36)
      .setRotation(Math.PI*1.25)
      .setDepth(1)
      .setCrop(0, 24);
      scene.time.delayedCall(1500, () => {
        projectile.destroy();
        scene.events.off('update', updateHandler);
      })
      const updateHandler = () => {
        if (!projectile.active) {
          scene.events.off('update', updateHandler);
          return;
        }
        if (attackSpeed > 84) {
          projectile.destroy();
          scene.events.off('update', updateHandler);
          const overgrow = this.getPath(false) > 0 ? 1.25 : 1;
          takeDamage(target, scene, "Grass", "Physical", 90 * this.getPower() * 1500 * overgrow, 1/8);
          if (this.getPath(false) > 1) lowerState(scene, target, 'attack', 1);
        }
        projectile.setCrop(0, 72 - attackSpeed, attackSpeed, attackSpeed);
        attackSpeed += 0.6;
        projectile.setPosition(target.x, target.y);
      };

    scene.events.on('update', updateHandler);
  }

  private shadowSneak(scene: Phaser.Scene, target: Phaser.GameObjects.PathFollower) {
      this.setAlpha(0); let inShadow = 0;
      const projectile = scene.physics.add.image(this.x, this.y, this.texture)
        .setDisplaySize(this.displayWidth, this.displayHeight)
        .setDepth(1);
        scene.physics.moveToObject(projectile, target, 600);
        scene.physics.add.overlap(projectile, enemiesGroup, (proj, enemy) => {
          takeDamage((enemy as any), scene, "Ghost", "Physical", 40 * this.getPower() * 800, 1/24);
          this.setAlpha(1);
          projectile.destroy();
          scene.events.off('update', updateHandler);
      });
      scene.time.delayedCall(600, () => {
        this.setAlpha(1);
        projectile.destroy();
        scene.events.off('update', updateHandler);
      })
      const updateHandler = () => {
        if (!projectile.active) {
          scene.events.off('update', updateHandler);
          return;
        }
        inShadow++;
        projectile.setAlpha(Math.sin(inShadow / 10));
        console.log(inShadow);
        if (projectile.y > 480 || projectile.y < 0 || projectile.x < 0 || projectile.x > 1920) {
          projectile.destroy();
          this.setAlpha(1);
          scene.events.off('update', updateHandler);
        }
      };
      scene.events.on('update', updateHandler);
  }

  private spiritShackle(scene: Phaser.Scene, target: Phaser.GameObjects.PathFollower) {
    let enemiesHit: Physics.Arcade.Body[] = [];
    const projectile = scene.physics.add.image(this.x, this.y, 'projectile13')
      .setDisplaySize(24, 24)
      .setDepth(1);
      scene.physics.moveToObject(projectile, target, 750);
      scene.physics.add.overlap(projectile, enemiesGroup, (proj, enemy) => {
        if (!enemiesHit.includes((enemy as any))) {
          takeDamage((enemy as any), scene, "Ghost", "Physical", 80 * this.getPower() * 1500, 1/24);
          if (this.getPath(false) > 1) lowerState(scene, (enemy as any), 'attack', 1);
          enemiesHit.push((enemy as any));
        }
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

  private tripleArrows(scene: Phaser.Scene, target: Phaser.GameObjects.PathFollower, moreTimes: number) {
    let speed = 0;
    const projectile = scene.physics.add.image(this.x, this.y, 'projectile14')
      .setDisplaySize(24, 24)
      .setDepth(1);
      scene.physics.add.overlap(projectile, enemiesGroup, (proj, enemy) => {
        takeDamage((enemy as any), scene, "Fighting", "Physical", 30 * this.getPower() * 1500, 1/8);
        lowerState(scene, (enemy as any), 'defense', 0.5);
        if (this.getPath(false) > 1) lowerState(scene, (enemy as any), 'attack', 1);
        projectile.destroy();
        scene.events.off('update', updateHandler);
      });
      const updateHandler = () => {
        if (!projectile.active) {
          scene.events.off('update', updateHandler);
          return;
        }
        speed += 3;
        if (target.active) scene.physics.moveToObject(projectile, target, speed);
        projectile.setRotation(Phaser.Math.Angle.Between(projectile.x, projectile.y, target.x, target.y) + Math.PI / 2);
        if (projectile.y > 480 || projectile.y < 0 || projectile.x < 0 || projectile.x > 1920) {
          projectile.destroy();
          scene.events.off('update', updateHandler);
        }
      };

    scene.events.on('update', updateHandler);
    if (moreTimes > 0) {
      scene.time.delayedCall(300, () => {
        this.tripleArrows(scene, target, moreTimes - 1);
      })
    }
  }

  public evolve(monName: string, evolvedInto: number, range: number, attacktype: string) {
    switch (evolvedInto) {
      case 0:
        super.evolve('Dartrix', 0, 0, 'Physical');
        break;
      case 1:
        super.evolve('Alolan Decidueye', 1, 0, 'Physical');
        break;
      case 2:
        super.evolve('Hisuian Decidueye', 2, 0, 'Physical');
        break;
    }
  }

  public returnStats() {
    let stats = super.returnStats();
    switch (this.getPath(true)) {
      case 0:
        stats += " | ⚔️2.000s 🎯40";
        break;
      case 1:
        stats += " | ⚔️1.000s 🎯55 💥1/8";
        break;
      case 2:
        stats += " | ⚔️1.500s 🎯90 💥1/8";
        break;
      default:
        break;
    }
    return stats;
  }
}
