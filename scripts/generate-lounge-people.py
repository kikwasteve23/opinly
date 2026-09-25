"""One-off: build lib/lounge-people.ts from a PaidSay-style user export.

Does not copy emails, phones, or IPs — only display name, first name, and country.
"""

from __future__ import annotations

import re
from pathlib import Path

import pycountry
from openpyxl import load_workbook

ROOT = Path("/workspace")
XLSX = Path("/home/ubuntu/.cursor/projects/workspace/uploads/user_export_20251118_091357_a9cc.xlsx")
OUT = ROOT / "lib" / "lounge-people.ts"

ALIASES = {
    "united states": "US",
    "usa": "US",
    "united states of america": "US",
    "uk": "GB",
    "united kingdom": "GB",
    "great britain": "GB",
    "russia": "RU",
    "south korea": "KR",
    "korea, republic of": "KR",
    "vietnam": "VN",
    "cote d'ivoire": "CI",
    "côte d'ivoire": "CI",
    "ivory coast": "CI",
    "tanzania": "TZ",
    "tanzania, united republic of": "TZ",
    "congo": "CG",
    "democratic republic of the congo": "CD",
    "congo, the democratic republic of the": "CD",
    "drc": "CD",
    "bolivia": "BO",
    "venezuela": "VE",
    "iran": "IR",
    "syria": "SY",
    "laos": "LA",
    "moldova": "MD",
    "palestine": "PS",
    "czech republic": "CZ",
    "czechia": "CZ",
    "swaziland": "SZ",
    "eswatini": "SZ",
    "cape verde": "CV",
    "cabo verde": "CV",
    "brunei": "BN",
    "macedonia": "MK",
    "north macedonia": "MK",
}


def iso_for(country: str) -> str | None:
    raw = (country or "").strip()
    if not raw:
        return None
    key = raw.lower()
    if key in ALIASES:
        return ALIASES[key]
    hit = pycountry.countries.get(name=raw)
    if hit:
        return hit.alpha_2
    hit = pycountry.countries.get(common_name=raw)
    if hit:
        return hit.alpha_2
    try:
        hit = pycountry.countries.search_fuzzy(raw)[0]
        return hit.alpha_2
    except Exception:
        return None


def js_escape(value: str) -> str:
    return value.replace("\\", "\\\\").replace('"', '\\"')


def main() -> None:
    wb = load_workbook(XLSX, read_only=True, data_only=True)
    ws = wb["User Details"]
    seen: set[str] = set()
    people: list[tuple[str, str, str]] = []
    skipped_country = 0
    for row in ws.iter_rows(min_row=2, values_only=True):
        full = str(row[2] or "").strip()
        first = str(row[3] or "").strip() or (full.split()[0] if full else "")
        country = str(row[6] or "").strip()
        if len(full.split()) < 2 or not country:
            continue
        if re.search(r"https?://|@|<|>", full, re.I):
            continue
        low = full.lower()
        if "admin" in low or low in {"support support", "test test", "user user"}:
            continue
        key = re.sub(r"\s+", " ", full).lower()
        if key in seen:
            continue
        iso = iso_for(country)
        if not iso:
            skipped_country += 1
            continue
        seen.add(key)
        people.append((full, first, iso))
    wb.close()

    # Keep a readable cap so the client bundle stays light; prefer geographic spread.
    # 3266 named rows is fine; write all unique mapped names.
    lines = [
        "export type LoungeRole = \"member\" | \"admin\";",
        "",
        "export type LoungePersona = {",
        "  id: string;",
        "  name: string;",
        "  firstName: string;",
        "  flag: string;",
        "  country: string;",
        "  color: string;",
        "  role: LoungeRole;",
        "};",
        "",
        "const COLORS = [",
        '  "bg-violet-500",',
        '  "bg-sky-500",',
        '  "bg-amber-500",',
        '  "bg-emerald-500",',
        '  "bg-rose-500",',
        '  "bg-indigo-500",',
        '  "bg-fuchsia-500",',
        '  "bg-teal-500",',
        '  "bg-orange-500",',
        '  "bg-cyan-600",',
        '  "bg-lime-600",',
        '  "bg-pink-500",',
        "];",
        "",
        "/** Full name, first name, ISO country — from the registered-user export. */",
        "const PEOPLE: [string, string, string][] = [",
    ]
    for full, first, iso in people:
        lines.append(f'  ["{js_escape(full)}", "{js_escape(first)}", "{iso}"],')
    lines.append("];")
    lines.append(
        """
export function flagEmoji(iso2: string) {
  const code = iso2.trim().toUpperCase();
  if (!/^[A-Z]{2}$/.test(code)) return "";
  return String.fromCodePoint(...[...code].map((c) => 127397 + c.charCodeAt(0)));
}

export function firstNameOf(persona: Pick<LoungePersona, "name" | "firstName">) {
  const first = persona.firstName?.trim();
  if (first) return first;
  return persona.name.trim().split(/\\s+/)[0] || persona.name;
}

export function loungeLabel(persona: LoungePersona) {
  if (persona.role === "admin") return persona.name;
  return `${persona.name}. ${persona.flag}`.trim();
}

export function loungeCrowd(): LoungePersona[] {
  return PEOPLE.map(([name, firstName, iso], i) => ({
    id: `m${i + 1}`,
    name,
    firstName,
    country: iso,
    flag: flagEmoji(iso),
    color: COLORS[i % COLORS.length]!,
    role: "member" as const,
  }));
}
"""
    )
    OUT.write_text("\n".join(lines), encoding="utf-8")
    print(f"wrote {len(people)} people to {OUT} (skipped country {skipped_country})")
    mamello = [p for p in people if "mamello" in p[0].lower()]
    print("mamello", mamello[:3])


if __name__ == "__main__":
    main()
