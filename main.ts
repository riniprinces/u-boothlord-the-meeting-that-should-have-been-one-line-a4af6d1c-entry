// The Meeting That Should Have Been One Line — make.fun entry.
//
// The program writes exactly one sentence to /output/entry.txt: the single
// line that could have replaced an entire pointless meeting. It is office
// humor that stands alone, needs no context, and ends the meeting on the
// spot: a verdict, a fact, and the kill.
//
// How it works: the winning line is assembled from three clauses — the
// verdict ("the answer is no"), the unchanged fact ("the deadline hasn't
// moved"), and the kill ("this meeting never needed to exist"). A small
// bench of alternates is kept so the program can compare and pick, but the
// output is always exactly one sentence of 1-200 characters.

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

const OUT_FILE = "/output/entry.txt";
const MAX_CHARS = 200;

// --- the line, built from its three clauses --------------------------------

const VERDICT = "The answer is no";
const FACT = "the deadline hasn't moved";
const KILL = "this meeting never needed to exist";

// The three clauses read as one sentence when joined with commas and a
// final "and" before the kill clause.
function buildWinner(): string {
  return `${VERDICT}, ${FACT}, and ${KILL}.`;
}

// --- alternates, for comparison only ---------------------------------------

const ALTERNATES = [
  "We just burned an hour of nine people's lives to agree that we'll meet again next week to agree on nothing.",
  "This meeting has achieved its only possible outcome: scheduling the next meeting.",
  "If this meeting had a purpose, it left the room twenty minutes ago and took the agenda with it.",
  "We could have settled this in one email, but then nine people wouldn't have had an excuse to avoid real work for an hour.",
];

// --- judging the candidates the way the brief asks --------------------------
// A line wins when it is one sentence, kills the meeting outright, feels
// like real office life, and lands with a sting at the end.

const DECISIVE = ["never needed", "no,", "agree on nothing", "left the room"];
const OFFICE = ["meeting", "deadline", "agenda", "email", "hour", "work"];

function countSentenceEnds(text: string): number {
  return (text.match(/[.!?]/g) ?? []).length;
}

function valid(text: string): boolean {
  const line = text.trim();
  return (
    line.length >= 1 &&
    line.length <= MAX_CHARS &&
    countSentenceEnds(line) === 1 &&
    /[.!?]$/.test(line) &&
    line === text // no leading/trailing whitespace sneaking in
  );
}

function rate(text: string): number {
  const lower = text.toLowerCase();
  let score = 0;
  if (valid(text)) score += 50;
  if (text.length <= 100) score += 15; // short lines land harder
  if (text.length <= 90) score += 5;
  for (const word of DECISIVE) if (lower.includes(word)) score += 10;
  for (const word of OFFICE) if (lower.includes(word)) score += 4;
  // A sting at the end: the last clause should carry the joke.
  if (/never needed to exist\.$/.test(text)) score += 10;
  if (/agree on nothing\.$/.test(text)) score += 8;
  return score;
}

function choose(lines: string[]): string {
  let winner = lines[0];
  let top = -Infinity;
  for (const line of lines) {
    const score = rate(line);
    if (score > top) {
      top = score;
      winner = line;
    }
  }
  return winner;
}

// --- run ---------------------------------------------------------------------

function run(): void {
  const contenders = [buildWinner(), ...ALTERNATES];
  const line = choose(contenders);
  if (!valid(line)) {
    throw new Error(`Chosen line is not a valid single sentence: ${JSON.stringify(line)}`);
  }
  mkdirSync(dirname(OUT_FILE), { recursive: true });
  writeFileSync(OUT_FILE, line, "utf8");
}

run();
