import { readFileSync, writeFileSync } from "fs";

// Cartelle che vogliamo misurare
const BUCKETS = [
  "app",
  "actions",
  "data",
  "components",
  "hooks",
  "lib",
  "prisma",
  "public",
  "schemas",
  "middleware",
  "routes-auth"
];

function bucketOf(file) {
  const f = file.replace(/\\/g, "/");
  for (const b of BUCKETS) {
    if (b === "routes-auth") {
      if (/(^|\/)(routes\.ts|auth\.config\.ts)$/i.test(f)) return "routes-auth";
    } else if (b === "middleware") {
      if (/(^|\/)middleware\.ts$/i.test(f)) return "middleware";
    } else if (f.startsWith(b + "/")) {
      return b;
    }
  }
  return null;
}

(function main() {
  const inputFile = process.argv[2] || "deps.json";

  // ✅ gestione BOM/UTF-16
  const buf = readFileSync(inputFile);
let text = buf.toString("utf8").replace(/^\uFEFF/, "").trim();
const dep = JSON.parse(text);

  const idx = new Map(BUCKETS.map((b, i) => [b, i]));
  const N = BUCKETS.length;
  const M = Array.from({ length: N }, () => Array(N).fill(0));

  for (const m of dep.modules || []) {
    const fromB = bucketOf(m.source || "");
    if (!fromB) continue;
    for (const d of m.dependencies || []) {
      const toB = bucketOf(d.resolved || d.module || "");
      if (!toB) continue;
      M[idx.get(fromB)][idx.get(toB)] += 1;
    }
  }

  // CSV
  let csv = ["Bucket," + BUCKETS.join(",")];
  BUCKETS.forEach((r, i) => csv.push([r, ...M[i]].join(",")));
  writeFileSync("deps-matrix.csv", csv.join("\n"));

  // LaTeX
  const header = `\\begin{table}[h]
\\centering
\\small
\\begin{tabular}{|l|${"c|".repeat(N)}}
\\hline
\\textbf{Modulo} & ${BUCKETS.map(b => `\\textbf{${b}}`).join(" & ")} \\\\ \\hline
`;
  let rows = "";
  BUCKETS.forEach((r, i) => {
    rows += `${r} & ${M[i].join(" & ")} \\\\ \\hline\n`;
  });
  const footer = `\\end{tabular}
\\caption{Matrice delle dipendenze (conteggi import) per Evently a livello di cartelle.}
\\end{table}
`;
  writeFileSync("deps-matrix.tex", header + rows + footer);

  console.log("✅ Generati: deps-matrix.csv, deps-matrix.tex");
})();
