import { describe, expect, it } from "vitest";
import { SM83 } from "../src/cpu/SM83";
import { Registers, type Register8Name } from "../src/cpu/registers";

const cases: ReadonlyArray<{ register: Register8Name; inc: number; dec: number }> = [
  { register: "B", inc: 0x04, dec: 0x05 },
  { register: "C", inc: 0x0c, dec: 0x0d },
  { register: "D", inc: 0x14, dec: 0x15 },
  { register: "E", inc: 0x1c, dec: 0x1d },
  { register: "H", inc: 0x24, dec: 0x25 },
  { register: "L", inc: 0x2c, dec: 0x2d },
  { register: "A", inc: 0x3c, dec: 0x3d },
];

describe("SM83 INC and DEC", () => {
  it("increments an 8-bit register and updates Z, N, H while preserving C", () => {
    const registers = new Registers();
    registers.B = 0x0f;
    registers.F = 0x10;
    const cpu = new SM83(registers);

    expect(cpu.executeOpcode(0x04)).toBe(4);
    expect(registers.B).toBe(0x10);
    expect(registers.F).toBe(0x30);
  });

  it("sets Z and clears N and C on INC wrapping 255 to 0", () => {
    const registers = new Registers();
    registers.C = 0xff;
    registers.F = 0x10;
    const cpu = new SM83(registers);

    cpu.executeOpcode(0x0c);
    expect(registers.C).toBe(0);
    expect(registers.F).toBe(0x90);
  });

  it("decrements an 8-bit register and updates Z, N, H while preserving C", () => {
    const registers = new Registers();
    registers.D = 0x10;
    registers.F = 0x10;
    const cpu = new SM83(registers);

    expect(cpu.executeOpcode(0x15)).toBe(4);
    expect(registers.D).toBe(0x0f);
    expect(registers.F).toBe(0x70);
  });

  it("sets Z on DEC wrapping 0 to 255", () => {
    const registers = new Registers();
    registers.E = 0;
    registers.F = 0x10;
    const cpu = new SM83(registers);

    cpu.executeOpcode(0x1d);
    expect(registers.E).toBe(0xff);
    expect(registers.F).toBe(0x50);
  });

  it("supports INC and DEC opcodes for all 8-bit general registers", () => {
    for (const { register, inc, dec } of cases) {
      const incRegisters = new Registers();
      incRegisters.write8(register, 0x7e);
      incRegisters.F = 0x10;
      const incCpu = new SM83(incRegisters);
      expect(incCpu.executeOpcode(inc)).toBe(4);
      expect(incRegisters.read8(register)).toBe(0x7f);
      expect(incRegisters.F & 0x10).toBe(0x10);

      const decRegisters = new Registers();
      decRegisters.write8(register, 0x7f);
      decRegisters.F = 0x10;
      const decCpu = new SM83(decRegisters);
      expect(decCpu.executeOpcode(dec)).toBe(4);
      expect(decRegisters.read8(register)).toBe(0x7e);
      expect(decRegisters.F & 0x10).toBe(0x10);
    }
  });

  it("advances PC once and does not change carry for normal INC/DEC", () => {
    const registers = new Registers();
    registers.PC = 0x1234;
    registers.F = 0x10;
    const cpu = new SM83(registers);

    cpu.executeOpcode(0x04);
    expect(registers.PC).toBe(0x1235);
    expect(registers.F & 0x10).toBe(0x10);
  });
});
