from models.ocr import OcrRow
from services import convert_service, limits_service


def run_judge(rows: list[OcrRow], cf_db: float, limit_rows: list[dict]) -> dict:
    out_rows: list[dict] = []
    no = 0
    for r in rows:
        if r.status != "OK" or r.marker_freq_ghz is None or r.marker_power_uw is None:
            continue
        no += 1
        freq_mhz = r.marker_freq_ghz * 1000
        power_uw = r.marker_power_uw
        dbm = convert_service.uw_to_dbm(power_uw)
        dbuv = convert_service.dbm_to_dbuv(dbm)
        dbuv_m = convert_service.dbuv_to_dbuv_m(dbuv, cf_db)
        limit = limits_service.match(freq_mhz, limit_rows)

        if limit is None:
            margin = None
            verdict = "N/A"
        else:
            margin = limit - dbuv_m
            verdict = "PASS" if margin >= 0 else "FAIL"

        out_rows.append(
            {
                "no": no,
                "file": r.file,
                "freq_mhz": round(freq_mhz, 4),
                "power_uw": power_uw,
                "dbm": round(dbm, 4),
                "dbuv_m": round(dbuv_m, 4),
                "limit": limit,
                "margin": round(margin, 4) if margin is not None else None,
                "verdict": verdict,
            }
        )

    total = len(out_rows)
    pass_cnt = sum(1 for row in out_rows if row["verdict"] == "PASS")
    fail_cnt = sum(1 for row in out_rows if row["verdict"] == "FAIL")
    na_cnt = sum(1 for row in out_rows if row["verdict"] == "N/A")

    if fail_cnt >= 1:
        overall = "FAIL"
    elif na_cnt >= 1:
        overall = "INCOMPLETE"
    else:
        overall = "PASS"

    return {
        "rows": out_rows,
        "summary": {"total": total, "pass": pass_cnt, "fail": fail_cnt, "verdict": overall},
    }
