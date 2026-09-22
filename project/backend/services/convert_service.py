import math


def uw_to_dbm(uw: float) -> float:
    return 10 * math.log10(uw / 1000)


def dbm_to_dbuv(dbm: float) -> float:
    return dbm + 107  # 50 Ω 기준


def dbuv_to_dbuv_m(dbuv: float, cf_db: float) -> float:
    return dbuv + cf_db
