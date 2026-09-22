import base64
import json
import os

from openai import OpenAI

MODEL = os.environ.get("OPENAI_MODEL", "gpt-5.6-luna")

PROMPT = (
    "스펙트럼 아날라이저 화면 캡처 이미지에서 다음 4개 값만 추출하세요: "
    "Center 주파수(GHz 단위 숫자), Mkr1 주파수(GHz 단위 숫자), "
    "Mkr1 전력(µW 단위 숫자), 화면에 표시된 타임스탬프 문자열. "
    "반드시 화면에 표시된 값만 사용하고, 단위 텍스트나 설명 없이 지정된 JSON 스키마로만 응답하세요."
)

SCHEMA = {
    "name": "spectrum_reading",
    "schema": {
        "type": "object",
        "properties": {
            "center_freq_ghz": {"type": "number"},
            "marker_freq_ghz": {"type": "number"},
            "marker_power_uw": {"type": "number"},
            "timestamp": {"type": "string"},
        },
        "required": ["center_freq_ghz", "marker_freq_ghz", "marker_power_uw", "timestamp"],
        "additionalProperties": False,
    },
    "strict": True,
}


def _fail(filename: str) -> dict:
    return {
        "file": filename,
        "center_freq_ghz": None,
        "marker_freq_ghz": None,
        "marker_power_uw": None,
        "timestamp": None,
        "status": "OCR_FAIL",
    }


def extract(image_bytes: bytes, filename: str) -> dict:
    client = OpenAI()
    data_url = f"data:image/png;base64,{base64.b64encode(image_bytes).decode()}"

    for _ in range(2):  # 최초 시도 + 1회 재질의
        try:
            resp = client.chat.completions.create(
                # gpt-5.6-luna는 reasoning 계열 모델로 temperature 커스텀 값을 지원하지 않음(기본값 1 고정)
                model=MODEL,
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {"type": "text", "text": PROMPT},
                            {"type": "image_url", "image_url": {"url": data_url}},
                        ],
                    }
                ],
                response_format={"type": "json_schema", "json_schema": SCHEMA},
            )
            parsed = json.loads(resp.choices[0].message.content)
            return {
                "file": filename,
                "center_freq_ghz": parsed["center_freq_ghz"],
                "marker_freq_ghz": parsed["marker_freq_ghz"],
                "marker_power_uw": parsed["marker_power_uw"],
                "timestamp": parsed["timestamp"],
                "status": "OK",
            }
        except (json.JSONDecodeError, KeyError, TypeError):
            continue
        except Exception:
            # API 호출 자체 실패(네트워크/모델 오류)는 재질의 없이 즉시 실패 처리
            return _fail(filename)

    return _fail(filename)
