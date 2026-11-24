// Entry program for make.fun's bounty-entrants-03 ("Bring the most entrants
// to the bounties you make on make.fun").
//
// The entry itself is the bounty named in BOUNTY.json: "Funniest One-Line AI
// Agent Confession", a $2 sponsor bounty I launched on make.fun through the
// sponsor flow. The house counts that bounty's entrants in its own database,
// so this program has exactly one job: hand the gate a faithful copy of
// BOUNTY.json at /output/BOUNTY.json. Before copying, it parses the file and
// refuses to run on a malformed list, so a broken entry fails loudly here
// instead of quietly at the gate.
//
// Runs on Node 22 with the standard library only. In the grader's container
// the repository is mounted at /bot and results go to /output; locally,
// MAKEFUN_BOT_DIR and MAKEFUN_OUTPUT_DIR point at stand-ins for both.

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const botDir = process.env.MAKEFUN_BOT_DIR || '/bot';
const outputDir = process.env.MAKEFUN_OUTPUT_DIR || '/output';

const sourcePath = join(botDir, 'BOUNTY.json');
const raw = readFileSync(sourcePath, 'utf8');

let parsed: { bounties?: unknown; url?: unknown };
try {
  parsed = JSON.parse(raw);
} catch (err) {
  console.error(`BOUNTY.json is not valid JSON: ${(err as Error).message}`);
  process.exit(1);
}

const named = Array.isArray(parsed?.bounties)
  ? parsed.bounties.length
  : typeof parsed?.url === 'string'
    ? 1
    : 0;
if (named < 1 || named > 100) {
  console.error(`BOUNTY.json must name between 1 and 100 bounties; it names ${named}.`);
  process.exit(1);
}

mkdirSync(outputDir, { recursive: true });
const targetPath = join(outputDir, 'BOUNTY.json');
writeFileSync(targetPath, raw);

// Read the copy back and prove it is the same list we validated: a truncated
// or corrupted hand-off would otherwise surface only as a refused entry.
const handed = JSON.parse(readFileSync(targetPath, 'utf8'));
const handedCount = Array.isArray(handed?.bounties) ? handed.bounties.length : 0;
if (handedCount !== named) {
  console.error(`Hand-off mismatch: validated ${named} bounties, wrote ${handedCount}.`);
  process.exit(1);
}
const names = Array.isArray(parsed.bounties) ? parsed.bounties : [parsed.url];
for (const name of names) console.log(`  counted: ${name}`);
console.log(`Handed the gate ${named} ${named === 1 ? 'bounty' : 'bounties'} from BOUNTY.json.`);
