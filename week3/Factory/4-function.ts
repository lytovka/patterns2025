"use strict";

type Severity = "info" | "warning" | "error";

const COLORS: Record<Severity, string> = {
  warning: "\x1b[1;33m",
  error: "\x1b[0;31m",
  info: "\x1b[1;37m",
};

type LoggerOptions =
  | { level: Severity; color?: never }
  | { color: Severity; level?: never };

type Logger = (option: LoggerOptions) => (message: string) => void;

const logger: Logger = (options) => (message) => {
  const date = new Date().toISOString();
  const key = options.level ?? options.color;
  const currColor = COLORS[key];
  console.log(`${currColor}${date}\t${message}`);
};

const warning = logger({ level: "warning" });
warning("Hello warning");

const error = logger({ color: "error" });
error("Hello error");

const info = logger({ color: "info" });
info("Hello info");
