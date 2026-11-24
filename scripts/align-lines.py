#!/usr/bin/env python3
"""
Bitta audio ichida ketma-ket aytilgan jumlalarning chegaralari (Meta MMS forced aligner, lokal, bepul).
dev-docs loyihasidagi scripts/align.py usuli: matn ma'lum — har so'z audio'da qachon aytilgani topiladi.
Jumlalar orasiga `*` qo'yiladi: pauza va model qo'shgan ortiqcha tovushlarni o'sha yutadi.

    python scripts/align-lines.py audio.wav lines.json   # lines.json: ["Bir", "Ikki", ...]
    → stdout: [{"a0": 0.31, "a1": 0.72}, ...]  (soniya)

O'rnatish (bir marta, loyihadan tashqarida):
    python3 -m venv ~/.cache/mojiza-align/venv
    ~/.cache/mojiza-align/venv/bin/pip install torch torchaudio numpy
"""
import json
import os
import re
import subprocess
import sys

try:  # python.org Python'ida tizim sertifikatlari yo'q — model yuklab olinishi uchun
    import certifi

    os.environ.setdefault("SSL_CERT_FILE", certifi.where())
except ImportError:
    pass

import numpy as np
import torch
from torchaudio.pipelines import MMS_FA

SR = MMS_FA.sample_rate  # 16 kHz
APOSTROPHES = re.compile(r"[ʻʼ’‘`´]")

UNITS = {0: "nol", 1: "bir", 2: "ikki", 3: "uch", 4: "to'rt", 5: "besh", 6: "olti", 7: "yetti", 8: "sakkiz", 9: "to'qqiz"}
TENS = {10: "o'n", 20: "yigirma", 30: "o'ttiz", 40: "qirq", 50: "ellik", 60: "oltmish", 70: "yetmish", 80: "sakson", 90: "to'qson"}


def number(n: int) -> str:
    if n < 10:
        return UNITS[n]
    if n < 100:
        t, u = divmod(n, 10)
        return TENS[t * 10] + (" " + UNITS[u] if u else "")
    return str(n)


def tokens_of(text: str):
    text = re.sub(r"\b\d+\b", lambda m: number(int(m.group(0))), text)
    out = []
    for word in text.split():
        w = APOSTROPHES.sub("'", word.lower())
        w = re.sub(r"[^a-z']", "", w).strip("'")
        if w:
            out.append(w)
    return out


def load(path: str) -> torch.Tensor:
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-f", "s16le", "-ac", "1", "-ar", str(SR), "-"], check=True, capture_output=True).stdout
    return torch.from_numpy(np.frombuffer(raw, dtype=np.int16).astype(np.float32) / 32768.0).unsqueeze(0)


def main():
    audio, lines_file = sys.argv[1], sys.argv[2]
    lines = json.load(open(lines_file, encoding="utf-8"))
    model = MMS_FA.get_model(with_star=True)
    model.eval()
    tokenizer, aligner = MMS_FA.get_tokenizer(), MMS_FA.get_aligner()

    wave = load(audio)
    with torch.inference_mode():
        emission, _ = model(wave)
    frames = emission.shape[1]
    sec_per_frame = wave.shape[1] / frames / SR

    # (jumla raqami yoki None, token): boshida, jumlalar orasida va oxirida `*`
    units = [(None, "*")]
    for i, line in enumerate(lines):
        if i:
            units.append((None, "*"))
        toks = tokens_of(line)
        if not toks:
            # Faqat belgi/raqam — istalgan nutqni yutadigan `*`
            toks = ["*"]
        units += [(i, t) for t in toks]
    units.append((None, "*"))

    spans = aligner(emission[0], tokenizer([t for _, t in units]))
    result = [None] * len(lines)
    for (i, _), span in zip(units, spans):
        if i is None:
            continue
        a0 = max(0.0, span[0].start * sec_per_frame - 0.08)
        a1 = span[-1].end * sec_per_frame
        prev = result[i]
        result[i] = {"a0": round(min(a0, prev["a0"]), 3), "a1": round(max(a1, prev["a1"]), 3)} if prev else {"a0": round(a0, 3), "a1": round(a1, 3)}
    print(json.dumps(result))


if __name__ == "__main__":
    main()
