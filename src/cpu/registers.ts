export type Register8Name = "A" | "F" | "B" | "C" | "D" | "E" | "H" | "L";
export type Register16Name = "PC" | "SP";
export type RegisterName = Register8Name | Register16Name;

/** CPU register file for the original DMG's SM83 processor. */
export class Registers {
  private a = 0;
  private f = 0;
  private b = 0;
  private c = 0;
  private d = 0;
  private e = 0;
  private h = 0;
  private l = 0;
  private pc = 0;
  private sp = 0;

  get A(): number { return this.a; }
  set A(value: number) { this.a = value & 0xff; }

  /** The low nibble of F is always zero on SM83. */
  get F(): number { return this.f; }
  set F(value: number) { this.f = value & 0xf0; }

  get B(): number { return this.b; }
  set B(value: number) { this.b = value & 0xff; }
  get C(): number { return this.c; }
  set C(value: number) { this.c = value & 0xff; }
  get D(): number { return this.d; }
  set D(value: number) { this.d = value & 0xff; }
  get E(): number { return this.e; }
  set E(value: number) { this.e = value & 0xff; }
  get H(): number { return this.h; }
  set H(value: number) { this.h = value & 0xff; }
  get L(): number { return this.l; }
  set L(value: number) { this.l = value & 0xff; }

  get PC(): number { return this.pc; }
  set PC(value: number) { this.pc = value & 0xffff; }
  get SP(): number { return this.sp; }
  set SP(value: number) { this.sp = value & 0xffff; }

  read8(name: Register8Name): number {
    return this[name];
  }

  write8(name: Register8Name, value: number): void {
    this[name] = value;
  }

  update8(name: Register8Name, update: (value: number) => number): number {
    const next = update(this.read8(name));
    this.write8(name, next);
    return this.read8(name);
  }

  read16(name: Register16Name): number {
    return this[name];
  }

  write16(name: Register16Name, value: number): void {
    this[name] = value;
  }

  update16(name: Register16Name, update: (value: number) => number): number {
    const next = update(this.read16(name));
    this.write16(name, next);
    return this.read16(name);
  }
}
