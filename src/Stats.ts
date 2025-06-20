export class Stats {
  private static pokedex: any[] | null = null;

  private static parseTXT(text: string): any[] {
    const lines = text.trim().split('\n');
    const headers = lines.shift()!.split(',').map(h => h.trim().replace(/^\uFEFF/, '')); // remove BOM

    return lines.map(line => {
      const values = line.split(',');
      const obj: Record<string, string> = {};
      headers.forEach((header, i) => {
        obj[header] = values[i]?.trim() ?? '';
      });
      return obj;
    });
  }

  public static async loadPokedex(): Promise<void> {
    if (this.pokedex) return;
    const response = await fetch('/data/pokedex.txt');
    const text = await response.text();
    this.pokedex = this.parseTXT(text);
  }

  private static calcStat(base: number, iv: number, ev: number, level: number, isHP = false): number {
    if (isHP) {
      return Math.floor(((2 * base + iv + Math.floor(ev / 4)) * level) / 100) + level + 10;
    } else {
      return Math.floor(((2 * base + iv + Math.floor(ev / 4)) * level) / 100) + 5;
    }
  }

  public static async getPokemon(name: string, level: number, trainer: string) {
    if (!this.pokedex) await this.loadPokedex();
    console.log(Object.keys(this.pokedex?.[0] || {}));

    const entry = this.pokedex!.find(
      (row) => row.Name && row.Name.toLowerCase() === name.toLowerCase()
    );

    if (!entry) throw new Error(`Pokémon "${name}" not found.`);

    const IV = 31;
    const EV = trainer.toLowerCase() === 'wild' ? 0 : 252;

    const stats = {
      HP: this.calcStat(+entry.HP, IV, EV, level, true),
      Attack: this.calcStat(+entry.Attack, IV, EV, level),
      Defense: this.calcStat(+entry.Defense, IV, EV, level),
      'Sp. Atk': this.calcStat(+entry['Sp. Atk'], IV, EV, level),
      'Sp. Def': this.calcStat(+entry['Sp. Def'], IV, EV, level),
      Speed: this.calcStat(+entry.Speed, IV, EV, level),
      EXP: +entry['EXP'] || +entry.Generation || 0,
    };

    const types = [entry['Type 1'], entry['Type 2']].filter(Boolean);

    return {
      name: entry.Name,
      level,
      trainer,
      types,
      stats,
      IV,
      EV,
    };
  }
}