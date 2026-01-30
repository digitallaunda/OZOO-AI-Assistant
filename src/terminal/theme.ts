import chalk, { Chalk } from "chalk";

import { OZZO_PALETTE } from "./palette.js";

const hasForceColor =
  typeof process.env.FORCE_COLOR === "string" &&
  process.env.FORCE_COLOR.trim().length > 0 &&
  process.env.FORCE_COLOR.trim() !== "0";

const baseChalk = process.env.NO_COLOR && !hasForceColor ? new Chalk({ level: 0 }) : chalk;

const hex = (value: string) => baseChalk.hex(value);

export const theme = {
  accent: hex(OZZO_PALETTE.accent),
  accentBright: hex(OZZO_PALETTE.accentBright),
  accentDim: hex(OZZO_PALETTE.accentDim),
  info: hex(OZZO_PALETTE.info),
  success: hex(OZZO_PALETTE.success),
  warn: hex(OZZO_PALETTE.warn),
  error: hex(OZZO_PALETTE.error),
  muted: hex(OZZO_PALETTE.muted),
  heading: baseChalk.bold.hex(OZZO_PALETTE.accent),
  command: hex(OZZO_PALETTE.accentBright),
  option: hex(OZZO_PALETTE.warn),
} as const;

export const isRich = () => Boolean(baseChalk.level > 0);

export const colorize = (rich: boolean, color: (value: string) => string, value: string) =>
  rich ? color(value) : value;
