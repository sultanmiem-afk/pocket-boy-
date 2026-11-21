import { Registers, type Register8Name } from "./registers";
import { decodeOpcode, InstructionDecodeError, type DecodedInstruction } from "./opcodes";

/** A small, incrementally implemented SM83 execution core. */
export class SM83 {
  readonly registers: Registers;

  constructor(registers: Registers = new Registers()) {
    this.registers = registers;
  }

  /** Execute one supplied opcode and return its duration in machine cycles. */
  executeOpcode(opcode: number): number {
    const instruction = decodeOpcode(opcode);
    this.execute(instruction);
    this.registers.PC = this.registers.PC + 1;
    return instruction.cycles;
  }

  private updateArithmeticFlags(previous: number, next: number, subtract: boolean): void {
    const carryBefore = this.registers.F & 0x10;
    const zero = (next & 0xff) === 0 ? 0x80 : 0;
    const subtractFlag = subtract ? 0x40 : 0;
    const halfCarry = subtract
      ? (previous & 0xf) === 0
      : (previous & 0xf) === 0xf;
    this.registers.F = zero | subtractFlag | (halfCarry ? 0x20 : 0) | carryBefore;
  }

  private execute(instruction: DecodedInstruction): void {
    switch (instruction.kind) {
      case "NOP":
        return;
      case "LD_R_R": {
        const value = this.registers.read8(instruction.source as Register8Name);
        this.registers.write8(instruction.destination as Register8Name, value);
        return;
      }
      case "INC_R": {
        const register = instruction.register;
        const previous = this.registers.read8(register);
        const next = (previous + 1) & 0xff;
        this.registers.write8(register, next);
        this.updateArithmeticFlags(previous, next, false);
        return;
      }
      case "DEC_R": {
        const register = instruction.register;
        const previous = this.registers.read8(register);
        const next = (previous - 1) & 0xff;
        this.registers.write8(register, next);
        this.updateArithmeticFlags(previous, next, true);
        return;
      }
      default: {
        const exhaustive: never = instruction;
        throw new InstructionDecodeError(`Unsupported instruction: ${String(exhaustive)}`);
      }
    }
  }
}

export { InstructionDecodeError } from "./opcodes";
