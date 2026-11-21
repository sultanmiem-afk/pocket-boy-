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

  private execute(instruction: DecodedInstruction): void {
    switch (instruction.kind) {
      case "NOP":
        return;
      case "LD_R_R": {
        const value = this.registers.read8(instruction.source as Register8Name);
        this.registers.write8(instruction.destination as Register8Name, value);
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
