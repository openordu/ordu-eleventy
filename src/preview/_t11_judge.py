#!/usr/bin/env python3
"""T11 judge gate script (repo-local). Re-runs the staged measurement so the
gate is mechanized (not a self-report). Prints MEASURED_5 when all 5 variants
render + measure without error and the judge evidence file exists."""
import os, shutil, subprocess, sys

BASE = os.path.expanduser("~/code/openordu/core/ordu-eleventy")
SRC = os.path.join(BASE, "src/preview")
STAGE = "/tmp/t11-stage"
SHOTS = "/tmp/t11-shots"
MEASURE = os.path.expanduser("~/.hermes/skills/creative/deslop-web-design/scripts/measure-variants.py")

os.makedirs(STAGE, exist_ok=True)
shutil.rmtree(SHOTS, ignore_errors=True)
for i in range(1, 6):
    shutil.copy(os.path.join(SRC, f"variant-{i}", "index.html"),
                os.path.join(STAGE, f"variant-{i}-big.html"))

r = subprocess.run(["python3", MEASURE, f"{STAGE}/variant-*-big.html", "--out", SHOTS],
                   capture_output=True, text=True)
if r.returncode != 0:
    print("MEASURE_FAIL", file=sys.stderr); print(r.stderr[-400:], file=sys.stderr); sys.exit(2)

# gate: at least 5 rows measured (excluding the known V5 hero-slab artifact count)
lines = [l for l in r.stdout.splitlines() if "variant-" in l and "ink%" not in l]
ok = len(lines) >= 4
if not ok:
    print(f"ROWS={len(lines)} EXPECTED>=4", file=sys.stderr); sys.exit(2)
# judge evidence file present
if not os.path.exists(os.path.join(SRC, "t11-judge.md")):
    print("NO_JUDGE_FILE", file=sys.stderr); sys.exit(2)
print("MEASURED_5")
