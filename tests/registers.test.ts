import { describe, expect, it } from "vitest";
import { Registers, type Register8Name, type Register16Name } from "../src/cpu/registers";

describe("Registers", () => {
  it("stores and reads all 8-bit registers", () => {
    const registers = new Registers();
    const values: Record<Register8Name, number> = {
      A: 0x12, F: 0xa0, B: 0x34, C: 0x56,
      D: 0x78, E: 0x9a, H: 0xbc, L: 0xde,
    };

    for (const [name, value] of Object.entries(values) as [Register8Name, number][]) {
      registers.write8(name, value);
      expect(registers.read8(name)).toBe(value);
    }
  });

  it("wraps 8-bit values and always clears the low nibble of F", () => {
    const registers = new Registers();
    registers.A = 0x123;
    registers.F = 0xaf;
    expect(registers.A).toBe(0x23);
    expect(registers.F).toBe(0xa0);
    registers.write8("F", 0x0f);
    expect(registers.read8("F")).toBe(0);
  });

  it("stores and reads PC and SP as 16-bit values", () => {
    const registers = new Registers();
    const values: Record<Register16Name, number> = { PC: 0x1234, SP: 0xabcd };
    for (const [name, value] of Object.entries(values) as [Register16Name, number][]) {
      registers.write16(name, value);
      expect(registers.read16(name)).toBe(value);
    }
    registers.PC = 0x12345;
    registers.SP = -1;
    expect(registers.PC).toBe(0x2345);
    expect(registers.SP).toBe(0xffff);
  });

  it("updates registers through the read-modify-write helpers", () => {
    const registers = new Registers();
    registers.write8("B", 0xff);
    expect(registers.update8("B", (value) => value + 1)).toBe(0);
    registers.write8("F", 0x10);
    expect(registers.update8("F", (value) => value | 0x0f)).toBe(0x10);
    registers.write16("PC", 0xffff);
    expect(registers.update16("PC", (value) => value + 1)).toBe(0);
  });
});
