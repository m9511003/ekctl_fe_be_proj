import json
from pathlib import Path

from models.limits import LimitRow

LIMITS_FILE = Path(__file__).resolve().parent.parent / "limits.json"

# PRD §3.1 — FCC Part 15 Subpart B Class B, 측정거리 3 m, 검출기 QP 기준
DEFAULT_LIMITS: list[dict] = [
    {"freq_min_mhz": 30, "freq_max_mhz": 88, "limit_dbuv_m": 40.0},
    {"freq_min_mhz": 88, "freq_max_mhz": 216, "limit_dbuv_m": 43.5},
    {"freq_min_mhz": 216, "freq_max_mhz": 960, "limit_dbuv_m": 46.0},
    {"freq_min_mhz": 960, "freq_max_mhz": 6000, "limit_dbuv_m": 54.0},
]


def _write(rows: list[dict], source: str) -> None:
    LIMITS_FILE.write_text(
        json.dumps({"rows": rows, "source": source}, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )


def ensure_initialized() -> None:
    if not LIMITS_FILE.exists():
        _write(DEFAULT_LIMITS, "default")


def load() -> tuple[list[dict], str]:
    ensure_initialized()
    data = json.loads(LIMITS_FILE.read_text(encoding="utf-8"))
    return data["rows"], data["source"]


def validate(rows: list[LimitRow]) -> str | None:
    if len(rows) == 0:
        return "Limit 테이블은 최소 1행 이상이어야 합니다."
    for i, row in enumerate(rows, start=1):
        if row.freq_min_mhz <= 0 or row.freq_max_mhz <= 0 or row.limit_dbuv_m is None:
            return f"{i}행 : 주파수 값은 0보다 커야 합니다."
        if row.freq_min_mhz >= row.freq_max_mhz:
            return f"{i}행 : freq_min_mhz는 freq_max_mhz보다 작아야 합니다."

    sorted_rows = sorted(rows, key=lambda r: r.freq_min_mhz)
    for i in range(len(sorted_rows) - 1):
        cur, nxt = sorted_rows[i], sorted_rows[i + 1]
        if cur.freq_max_mhz > nxt.freq_min_mhz:
            return f"구간이 중복됩니다 : {cur.freq_min_mhz}-{cur.freq_max_mhz} ↔ {nxt.freq_min_mhz}-{nxt.freq_max_mhz}"
    return None


def save(rows: list[LimitRow]) -> list[dict]:
    sorted_rows = sorted(rows, key=lambda r: r.freq_min_mhz)
    dicts = [r.model_dump() for r in sorted_rows]
    _write(dicts, "user")
    return dicts


def reset() -> list[dict]:
    _write(DEFAULT_LIMITS, "default")
    return DEFAULT_LIMITS


def match(freq_mhz: float, rows: list[dict]) -> float | None:
    for row in rows:
        if row["freq_min_mhz"] <= freq_mhz < row["freq_max_mhz"]:
            return row["limit_dbuv_m"]
    return None
