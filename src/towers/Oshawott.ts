import Phaser from 'phaser';
import { enemies, path1, takeDamage, } from '../round';
import { enemiesGroup } from '../index';
import { Towers } from './Towers';

export class Oshawott extends Towers {
  private waterGunTimer?: Phaser.Time.TimerEvent;
  private waterPulseSurfTimer?: Phaser.Time.TimerEvent;
  private hydroPumpTimer?: Phaser.Time.TimerEvent;
  private hydroCannonTimer?: Phaser.Time.TimerEvent;
  private suckerPunchTimer?: Phaser.Time.TimerEvent;
  private ceaselessEdgeTimer?: Phaser.Time.TimerEvent;
  private ceaselessEdges: number;

  private focusEnergy: number = 1/24;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
  ) {
    super(scene, x, y, 'pokemon10', 'Oshawott', 150, 5, "Special", 3);
    this.ceaselessEdges = 0;
    this.startAttacking(scene);
  }

  private startAttacking(scene: Phaser.Scene) {
    this.waterGunTimer = scene.time.addEvent({delay: 300, loop: true, callback: () => {
      const target = this.findNearestEnemy(); if (target && this.getPath(true) == 0) this.waterGun(scene, target);
    }});
    this.waterPulseSurfTimer = scene.time.addEvent({delay: 1300, loop: true, callback: () => {
      const target = this.findNearestEnemy();
      if (target && this.getPath(true) == 1) this.waterPulse(scene, target);
      if (target && this.getPath(true) == 2 && this.getPath(false) < 3) this.surf(scene, target);
    }});
    this.hydroPumpTimer = scene.time.addEvent({delay: 2000, loop: true, callback: () => {
      const target = this.findNearestEnemy(); if (target && this.getPath(true) == 3) this.hydroPump(scene, target);
    }});
    this.hydroCannonTimer = scene.time.addEvent({delay: 3000, loop: true, callback: () => {
      const target = this.findNearestEnemy(); if (target && this.getPath(true) == 4) this.hydroCannon(scene, target);
    }});
    this.suckerPunchTimer = scene.time.addEvent({delay: 800, loop: true, callback: () => {
      const target = this.findNearestEnemy(); if (target && this.getPath(false) == 3) this.suckerPunch(scene, target);
    }});
    this.ceaselessEdgeTimer = scene.time.addEvent({delay: 1600, loop: true, callback: () => {
      let target = this.findNearestEnemy();
      if (target && this.getPath(false) == 4 && this.ceaselessEdges < 3) this.ceaselessEdge(scene, target);
      if (target && this.getPath(false) == 4 && this.ceaselessEdges < 9) scene.time.delayedCall(90, () => { this.ceaselessEdge(scene, target); })
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

  private waterGun(scene: Phaser.Scene, target: Phaser.GameObjects.PathFollower) {
    const projectile = scene.physics.add.image(this.x, this.y, 'projectile1')
      .setDisplaySize(16, 16)
      .setDepth(1);
      scene.physics.moveToObject(projectile, target, 300);
      scene.time.delayedCall(600, () => {
        if (projectile && projectile.active) {
          projectile.destroy();
          scene.events.off('update', updateHandler);
        }
      });
      scene.physics.add.overlap(projectile, enemiesGroup, (proj, enemy) => {
        const torrent = this.getPath(false) > 0 ? 1.25 : 1;
        takeDamage((enemy as any), scene, "Water", this.getAttackType(), 40 * this.getPower() * 300 * torrent, this.focusEnergy);
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

  private waterPulse(scene: Phaser.Scene, target: Phaser.GameObjects.PathFollower) {
    let speed = 0;
    const projectile = scene.physics.add.image(this.x, this.y, 'projectile15')
      .setDisplaySize(16, 16)
      .setDepth(1);
      scene.time.delayedCall(1300, () => {
        if (projectile && projectile.active) {
          projectile.destroy();
          scene.events.off('update', updateHandler);
        }
      });
      scene.physics.add.overlap(projectile, enemiesGroup, (proj, enemy) => {
        const torrent = this.getPath(false) > 0 ? 1.25 : 1;
        takeDamage((enemy as any), scene, "Water", this.getAttackType(), 60 * this.getPower() * 1300 * torrent, this.focusEnergy);
        projectile.destroy();
        scene.events.off('update', updateHandler);
    });
    const updateHandler = () => {
      if (!projectile.active) {
        scene.events.off('update', updateHandler);
        return;
      }
      speed++;
      const projectileSpeed = Math.sin(speed / 9) < 0 ? speed * Math.sin(speed / 18) : speed * 6 * Math.sin(speed / 9);
      projectile.setDisplaySize(16 + Math.sqrt(speed), 16 + Math.sqrt(speed));
      scene.physics.moveToObject(projectile, target, projectileSpeed);
      if (projectile.y > 480 || projectile.y < 0 || projectile.x < 0 || projectile.x > 1920) {
        projectile.destroy();
        scene.events.off('update', updateHandler);
      }
    };
    scene.events.on('update', updateHandler);
  }

  private surf(scene: Phaser.Scene, target: Phaser.GameObjects.PathFollower) {
    let speed = 0;
    const projectile = scene.physics.add.image(this.x, this.y, 'projectile16')
      .setDisplaySize(16, 16)
      .setDepth(1);
      scene.time.delayedCall(1300, () => {
        if (projectile && projectile.active) {
          projectile.destroy();
          scene.events.off('update', updateHandler);
        }
      });
      scene.physics.add.overlap(projectile, enemiesGroup, (proj, enemy) => {
        const torrent = this.getPath(false) > 0 ? 1.25 : 1;
        takeDamage((enemy as any), scene, "Water", this.getAttackType(), 90 * this.getPower() * 1300 * torrent, this.focusEnergy);
        projectile.destroy();
        scene.events.off('update', updateHandler);
    });
    const updateHandler = () => {
      if (!projectile.active) {
        scene.events.off('update', updateHandler);
        return;
      }
      speed++;
      const projectileSpeed = Math.sin(speed / 9) < 0 ? speed * Math.sin(speed / 18) : speed * 6 * Math.sin(speed / 9);
      projectile.setRotation(Phaser.Math.Angle.Between(projectile.x, projectile.y, target.x, target.y) + Math.PI / 2);
      projectile.setDisplaySize(24 + speed * 8, 16);
      scene.physics.moveToObject(projectile, target, projectileSpeed);
      if (projectile.y > 480 || projectile.y < 0 || projectile.x < 0 || projectile.x > 1920) {
        projectile.destroy();
        scene.events.off('update', updateHandler);
      }
    };
    scene.events.on('update', updateHandler);
  }

  private hydroPump(scene: Phaser.Scene, target: Phaser.GameObjects.PathFollower) {
    let rampUp = 100; const rotated = Math.random() * 2 * Math.PI;
    const projectile = scene.physics.add.image(this.x, this.y, 'projectile15')
      .setDisplaySize(10, 10)
      .setDepth(1);
      scene.time.delayedCall(2000, () => {
        if (projectile && projectile.active) {
          scene.physics.moveToObject(projectile, target, 1000);
        }
      });
      scene.physics.add.overlap(projectile, enemiesGroup, (proj, enemy) => {
        const torrent = this.getPath(false) > 0 ? 1.25 : 1;
        takeDamage((enemy as any), scene, "Water", this.getAttackType(), 110 * this.getPower() * 2000 * torrent, this.focusEnergy);
        projectile.destroy();
        scene.events.off('update', updateHandler);
    });
    const updateHandler = () => {
      if (!projectile.active) {
        scene.events.off('update', updateHandler);
        return;
      }
      rampUp += 2;
      projectile.setDisplaySize(Math.sqrt(rampUp), Math.sqrt(rampUp));
      projectile.setRotation(rotated + rampUp / 250);
      if (projectile.y > 480 || projectile.y < 0 || projectile.x < 0 || projectile.x > 1920) {
        projectile.destroy();
        scene.events.off('update', updateHandler);
      }
    };

    scene.events.on('update', updateHandler);
  }

  private hydroCannon(scene: Phaser.Scene, target: Phaser.GameObjects.PathFollower) {
    let rampUp = 100; const rotated = Math.random() * 2 * Math.PI;
    const projectile = scene.physics.add.image(this.x, this.y, 'projectile15')
      .setDisplaySize(10, 10)
      .setDepth(1);
      scene.time.delayedCall(3000, () => {
        if (projectile && projectile.active) {
          scene.physics.moveToObject(projectile, target, 1000);
        }
      });
      scene.physics.add.overlap(projectile, enemiesGroup, (proj, enemy) => {
        const torrent = this.getPath(false) > 0 ? 1.25 : 1;
        takeDamage((enemy as any), scene, "Water", this.getAttackType(), 150 * this.getPower() * 3000 * torrent, this.focusEnergy);
        projectile.destroy();
        scene.events.off('update', updateHandler);
    });
    const updateHandler = () => {
      if (!projectile.active) {
        scene.events.off('update', updateHandler);
        return;
      }
      rampUp += 3;
      projectile.setDisplaySize(Math.sqrt(rampUp), Math.sqrt(rampUp));
      projectile.setRotation(rotated + rampUp / 250);
      if (projectile.y > 480 || projectile.y < 0 || projectile.x < 0 || projectile.x > 1920) {
        projectile.destroy();
        scene.events.off('update', updateHandler);
      }
    };

    scene.events.on('update', updateHandler);
  }

  private suckerPunch(scene: Phaser.Scene, target: Phaser.GameObjects.PathFollower) {
      this.setAlpha(0); let inShadow = 0;
      const projectile = scene.physics.add.image(this.x, this.y, this.texture)
        .setDisplaySize(this.displayWidth, this.displayHeight)
        .setDepth(1);
        scene.physics.moveToObject(projectile, target, 600);
        scene.physics.add.overlap(projectile, enemiesGroup, (proj, enemy) => {
          takeDamage((enemy as any), scene, "Dark", this.getAttackType(), 70 * this.getPower() * 800, 1/24);
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

  private ceaselessEdge(scene: Phaser.Scene, target: Phaser.GameObjects.PathFollower) {
    let speed = 0; this.ceaselessEdges++;
    const projectile = scene.physics.add.image(this.x, this.y, 'projectile17')
      .setDisplaySize(30, 30)
      .setDepth(1)
      .setRotation(Math.PI * Math.random() * 2);
      scene.time.delayedCall(9000, () => {
        if (projectile && projectile.active) {
          projectile.destroy();
          this.ceaselessEdges--;
          scene.events.off('update', updateHandler);
        }
      });
      scene.physics.add.overlap(projectile, enemiesGroup, (proj, enemy) => {
        const torrent = this.getPath(false) > 0 ? 1.25 : 1;
        takeDamage((enemy as any), scene, "Dark", this.getAttackType(), 65 * this.getPower() * 1600 * torrent, this.focusEnergy);
        projectile.destroy();
        this.ceaselessEdges--;
        scene.events.off('update', updateHandler);
      });
    const updateHandler = () => {
      if (!projectile.active) {
        scene.events.off('update', updateHandler);
        return;
      }
      speed++;
      scene.physics.moveToObject(projectile, target, Math.max(300 - speed, 0));
      let currentPoint = path1.getPoint(0);
      let currentDistance = Phaser.Math.Distance.Between(projectile.x, projectile.y, currentPoint.x, currentPoint.y);
      for (let i = 1; i < 6000; i++) {
        const point = path1.getPoint(i / 600);
        if (!point) continue;
        const dist = Phaser.Math.Distance.Between(projectile.x, projectile.y, point.x, point.y);
        if (dist < currentDistance) {
          currentPoint = point; currentDistance = dist;
        }
      }
      if (currentDistance < 3) speed += 300;
      if (currentDistance < speed / 3) scene.physics.moveTo(projectile, currentPoint.x, currentPoint.y, Math.max(300 - speed, 30));
      if (projectile.y > 480 || projectile.y < 0 || projectile.x < 0 || projectile.x > 1920) {
        projectile.destroy();
        this.ceaselessEdges--;
        scene.events.off('update', updateHandler);
      }
    };
    scene.events.on('update', updateHandler);
  }

  public evolve(monName: string, evolvedInto: number, range: number, attacktype: string) {
    switch (evolvedInto) {
      case 0:
        if (this.getPath(false) == 2) {
          super.evolve('Dewott', 0, 0, 'Special');
        }
        else {
          super.evolve('Dewott', 0, 0, 'Physical');
        }
        break;
      case 1:
        super.evolve('Unovan Samurott', 1, 600, 'Special');
        break;
      case 2:
        super.evolve('Hisuian Samurott', 2, 600, 'Physical');
        break;
    }
  }

  public returnStats() {
    let stats = "";
    switch (this.getPath(true)) {
      case 0:
        stats = "⚔️0.300s 🎯40 Water Gun";
        break;
      case 1:
        stats = "⚔️1.300s 🎯60 Water Pulse";
        this.setRange(300);
        break;
      case 2:
        stats = "⚔️1.300s 🎯90 Surf";
        break;
      case 3:
        stats = "⚔️2.000s 🎯110 Hydro Pump";
        break;
      case 4:
        stats = "⚔️3.000s 🎯150 Hydro Cannon";
        break;
    }
    switch (this.getPath(false)) {
      case 3:
        stats = "⚔️0.800s 🎯70 Sucker Punch 💥1/8";
        break;
      case 4:
        stats = "⚔️0.400s 🎯65 Ceaseless Edge 💥1/8";
        break;
      case 2:
        this.focusEnergy = 1/8;
        stats += " 💥1/8";
    }
    return super.returnStats() + stats;
  }
}