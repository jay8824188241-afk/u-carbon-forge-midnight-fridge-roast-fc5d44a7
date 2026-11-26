// Midnight Fridge Roast — deterministic program/v1 entry.
// Reads nothing from the network, the clock, or the environment except
// MAKEFUN_OUTPUT_DIR. Writes the roast to $MAKEFUN_OUTPUT_DIR/entry.txt,
// then reads it back and verifies its own format before exiting.
// Node 22+, standard library only. This file is plain JavaScript syntax
// inside a .ts file so it runs under Node's type stripping as-is.
const fs = require("node:fs");
const path = require("node:path");

const OUTPUT_DIR = process.env.MAKEFUN_OUTPUT_DIR || "output";
const ENTRY_PATH = path.join(OUTPUT_DIR, "entry.txt");

// The midnight fridge lineup. Fixed data: no clock, no randomness,
// no network, so every run produces byte-identical output.
const SUSPECTS = [
  {
    item: "Half a cold pizza slice, crust first",
    shame: 8,
    roast:
      "Eaten backwards out of pure spite. The pepperoni gave up hours ago, and the crust is now a chew toy with a past life.",
  },
  {
    item: "Mystery takeout box, dated three Tuesdays ago",
    shame: 9,
    roast:
      "Nobody remembers ordering it, nobody dares open it, and yet nobody throws it away. It has seniority over the leftovers now.",
  },
  {
    item: "One pickle, floating alone in a jar of brine",
    shame: 6,
    roast:
      "The last pickle. Its friends were eaten months ago. It just bobs there, brined and betrayed, waiting for a midnight hero.",
  },
  {
    item: "Expired yogurt, still somehow hopeful",
    shame: 7,
    roast:
      "The lid says last week. The smell says last month. The optimism says it will still be fine on toast. It will not.",
  },
  {
    item: "A single chicken nugget, guarding the freezer",
    shame: 5,
    roast:
      "One nugget. Not a meal, not a snack — a monument to a drive-through run that ended one nugget short of dignity.",
  },
  {
    item: "Ketchup packets, seventeen of them",
    shame: 8,
    roast:
      "Seventeen packets, zero fries. This is not a condiment stash, it is a retirement plan for a sauce that will never be used.",
  },
  {
    item: "A lemon so old it qualifies as a fossil",
    shame: 9,
    roast:
      "It has fossilised into a museum piece. Archaeologists would date it; you just keep moving it to the back of the shelf.",
  },
];

const HEADER = "MIDNIGHT FRIDGE ROAST";
const FOOTER = "— end of roast —";

function verdictFor(total, max) {
  if (total >= 50) {
    return "CODE RED: this fridge needs an exorcist, not a cleaning.";
  }
  if (total >= 35) {
    return "Walk away slowly, close the door, and pretend the light never came on.";
  }
  return "Suspicious, but survivable. Eat the pickle and move on.";
}

function buildRoast() {
  const max = SUSPECTS.length * 10;
  const total = SUSPECTS.reduce((sum, s) => sum + s.shame, 0);
  const lines = [];
  lines.push(HEADER);
  lines.push("=".repeat(HEADER.length));
  lines.push("");
  lines.push(
    "The fridge light flickers on at midnight. Seven suspects line up for judgment."
  );
  lines.push("");
  for (let i = 0; i < SUSPECTS.length; i++) {
    const s = SUSPECTS[i];
    lines.push(`${i + 1}. ${s.item} — shame ${s.shame}/10`);
    lines.push(`   ${s.roast}`);
    lines.push("");
  }
  lines.push(`TOTAL SHAME: ${total}/${max}`);
  lines.push(`VERDICT: ${verdictFor(total, max)}`);
  lines.push(FOOTER);
  return { text: lines.join("\n") + "\n", total, max };
}

function selfCheck(text, total, max) {
  const failures = [];
  if (!text.startsWith(HEADER + "\n")) {
    failures.push("missing header");
  }
  if (!text.endsWith(FOOTER + "\n")) {
    failures.push("missing footer");
  }
  for (const s of SUSPECTS) {
    if (!text.includes(s.item)) {
      failures.push(`missing item: ${s.item}`);
    }
    if (!text.includes(s.roast)) {
      failures.push(`missing roast for: ${s.item}`);
    }
  }
  const totalLine = `TOTAL SHAME: ${total}/${max}`;
  if (!text.includes(totalLine)) {
    failures.push("missing total line");
  }
  const lineCount = text.split("\n").length - 1;
  if (lineCount < 20) {
    failures.push(`too few lines: ${lineCount}`);
  }
  return failures;
}

function main() {
  const { text, total, max } = buildRoast();
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  fs.writeFileSync(ENTRY_PATH, text, "utf8");
  const readBack = fs.readFileSync(ENTRY_PATH, "utf8");
  const failures = selfCheck(readBack, total, max);
  if (readBack !== text) {
    failures.push("read-back differs from written text");
  }
  if (failures.length > 0) {
    console.error(`self-check FAILED: ${failures.join("; ")}`);
    process.exit(1);
  }
  console.log(`roast written to ${ENTRY_PATH} (total shame ${total}/${max})`);
}

main();
