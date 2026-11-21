import type { Register8Name } from "./registers";

export const OPCODE_NOP = 0x00;

// Register codes used by the SM83 LD r,r opcode family.
// Code 6 denotes (HL), which is intentionally not implemented in this phase.
const OPCODE_REGISTERS: ReadonlyArray<Register8Name | "(HL)"> = [
  "B", "C", "D", "E", "H", "L", "(HL)", "A",
];

export type DecodedInstruction =
  | { kind: "NOP"; cycles: 4 }
  | { kind: "LD_R_R"; destination: Register8Name; source: Register8Name; cycles: 4 };

export class InstructionDecodeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InstructionDecodeError";
  }
}

/** Decode only the instruction subset implemented in this phase. */
export function decodeOpcode(opcode: number): DecodedInstruction {
  if (!Number.isInteger(opcode) || opcode < 0 || opcode > 0xff) {
    throw new InstructionDecodeError(`Invalid 8-bit opcode: ${opcode}`);
  }

  if (opcode === OPCODE_NOP) {
    return { kind: "NOP", cycles: 4 };
  }

  // 0x76 is HALT, not LD (HL),(HL), and is not implemented here.
  if (opcode >= 0x40 && opcode <= 0x7f && opcode !== 0x76) {
    const destination = OPCODE_REGISTERS[(opcode >> 3) & 0x07];
    const source = OPCODE_REGISTERS[opcode & 0x07];
    if (destination === "(HL)" || source === "(HL)") {
      throw new InstructionDecodeError("LD involving (HL) is not implemented");
    }
    return { kind: "LD_R_R", destination, source, cycles: 4 };
  }

  throw new InstructionDecodeError(`Unsupported opcode: 0x${opcode.toString(16).padStart(2, "0")}`);
}
