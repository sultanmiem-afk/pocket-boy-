export const OPCODE_NOP = 0x00;

import type { Register8Name } from "./registers";

// Register codes used by the SM83 register instructions.
// Code 6 denotes (HL), which is intentionally not implemented in this phase.
const OPCODE_REGISTERS: ReadonlyArray<Register8Name | "(HL)"> = [
  "B", "C", "D", "E", "H", "L", "(HL)", "A",
];

export type DecodedInstruction =
  | { kind: "NOP"; cycles: 4 }
  | { kind: "LD_R_R"; destination: Register8Name; source: Register8Name; cycles: 4 }
  | { kind: "INC_R"; register: Register8Name; cycles: 4 }
  | { kind: "DEC_R"; register: Register8Name; cycles: 4 };

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

  // INC r: opcodes 0x04, 0x0C, 0x14, 0x1C, 0x24, 0x2C, 0x3C.
  // DEC r: opcodes 0x05, 0x0D, 0x15, 0x1D, 0x25, 0x2D, 0x3D.
  const incRegisters: ReadonlyArray<Register8Name> = ["B", "C", "D", "E", "H", "L", "A"];
  const incOpcodes = [0x04, 0x0c, 0x14, 0x1c, 0x24, 0x2c, 0x3c];
  const incIndex = incOpcodes.indexOf(opcode);
  if (incIndex >= 0) {
    return { kind: "INC_R", register: incRegisters[incIndex], cycles: 4 };
  }

  const decOpcodes = [0x05, 0x0d, 0x15, 0x1d, 0x25, 0x2d, 0x3d];
  const decIndex = decOpcodes.indexOf(opcode);
  if (decIndex >= 0) {
    return { kind: "DEC_R", register: incRegisters[decIndex], cycles: 4 };
  }

  throw new InstructionDecodeError(`Unsupported opcode: 0x${opcode.toString(16).padStart(2, "0")}`);
}
