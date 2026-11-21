import { describe, expect, it } from "vitest";
import { SM83 } from "../src/cpu/SM83";
import { Registers, type Register8Name } from "../src/cpu/registers";

const registers8: Register8Name[] = ["A", "B", "C", "D", "E", "H", "L"];
const registerCode: Record<Register8Name, number> = {
  B: 0, C: 1, D: 2, E: 3, H: 4, L: 5, A: 7, F: 0,
};

describe("SM83 NOP and register-to-register LD", () => {
  it("executes NOP without changing registers and consumes 4 cycles", () => {
    const registers = new Registers();
    registers.A = 0x12;
    registers.F = 0xb0;
    registers.B = 0x34;
    registers.PC = 0x200;
    registers.SP = 0xfffe;
    const cpu = new SM83(registers);

    expect(cpu.executeOpcode(0x00)).toBe(4);
    expect(registers.A).toBe(0x12);
    expect(registers.F).toBe(0xb0);
    expect(registers.B).toBe(0x34);
    expect(registers.SP).toBe(0xfffe);
    expect(registers.PC).toBe(0x201);
  });

  it("copies every supported 8-bit register to every other register in 4 cycles", () => {
    for (const destination of registers8) {
      for (const source of registers8) {
        const registers = new Registers();
        registers.write8(source, 0xa5);
        registers.write8(destination, 0x3c);
        registers.PC = 0x1234;
        const cpu = new SM83(registers);
        const opcode = 0x40 | (registerCode[destination] << 3) | registerCode[source];

        expect(cpu.executeOpcode(opcode), `${destination} <- ${source}`).toBe(4);
        expect(registers.read8(destination), `${destination} <- ${source}`).toBe(0xa5);
        expect(registers.PC).toBe(0x1235);
      }
    }
  });

  it("wraps PC at 16 bits after an instruction", () => {
    const registers = new Registers();
    registers.PC = 0xffff;
    new SM83(registers).executeOpcode(0x00);
    expect(registers.PC).toBe(0);
  });

  it("rejects unsupported opcodes without advancing PC", () => {
    const registers = new Registers();
    registers.PC = 0x100;
    const cpu = new SM83(registers);
    expect(() => cpu.executeOpcode(0x76)).toThrow("Unsupported opcode");
    expect(registers.PC).toBe(0x100);
  });
});
