"""Bangla text-to-speech for voice alerts. Output is OGG/Opus so Telegram shows a voice note.

1. Microsoft "Nabanita" (bn-BD female neural voice) through the free edge-tts endpoint — the
   most natural voice, but an unofficial endpoint that could stop working at any time.
2. Fallback, fully local: Meta MMS-TTS (facebook/mms-tts-ben, single male voice, CC-BY-NC 4.0),
   so a voice note is always produced even without that endpoint.
"""

import hashlib
import logging
import io
import subprocess
import threading
import wave
from pathlib import Path

import numpy as np

from app.core.config import settings

MODEL_ID = "facebook/mms-tts-ben"
EDGE_VOICE = "bn-BD-NabanitaNeural"
EDGE_RATE = "-8%"  # a little slower than default: easier to follow for elderly listeners
CACHE = settings.data_dir / "processed" / "tts"
log = logging.getLogger(__name__)
_lock = threading.Lock()
_model = None


def _load():
    global _model
    with _lock:
        if _model is None:
            from transformers import AutoTokenizer, VitsModel
            _model = (VitsModel.from_pretrained(MODEL_ID).eval(), AutoTokenizer.from_pretrained(MODEL_ID))
    return _model


def _wav(text: str) -> bytes:
    import torch
    model, tok = _load()
    chunks = [s.strip() for s in text.replace("।", "।\n").splitlines() if s.strip()]
    pause = np.zeros(int(model.config.sampling_rate * 0.35), dtype=np.float32)
    audio = []
    with torch.no_grad():
        torch.manual_seed(0)  # same text -> same voice
        for c in chunks:
            audio += [model(**tok(c, return_tensors="pt")).waveform[0].numpy(), pause]
    pcm = (np.clip(np.concatenate(audio), -1, 1) * 32767).astype(np.int16)
    buf = io.BytesIO()
    with wave.open(buf, "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(model.config.sampling_rate)
        w.writeframes(pcm.tobytes())
    return buf.getvalue()


def _edge_mp3(text: str) -> bytes:
    import asyncio

    import edge_tts

    async def run() -> bytes:
        out = bytearray()
        async for chunk in edge_tts.Communicate(text, EDGE_VOICE, rate=EDGE_RATE).stream():
            if chunk["type"] == "audio":
                out += chunk["data"]
        return bytes(out)

    audio = asyncio.run(run())
    if not audio:
        raise RuntimeError("edge-tts returned no audio")
    return audio


def _to_ogg(audio: bytes, fmt: str, path) -> None:
    """Convert via a temp file: reading MP3 from a pipe on Windows truncated the audio."""
    import tempfile

    import imageio_ffmpeg
    with tempfile.TemporaryDirectory() as tmp:
        src = Path(tmp) / f"in.{fmt}"
        src.write_bytes(audio)
        out = subprocess.run([imageio_ffmpeg.get_ffmpeg_exe(), "-y", "-loglevel", "error", "-i", str(src),
                              "-c:a", "libopus", "-b:a", "32k", "-ar", "48000", str(path)], capture_output=True)
    if out.returncode != 0:
        raise RuntimeError(out.stderr.decode(errors="replace")[:500])


def bangla_voice_ogg(text: str) -> bytes:
    """OGG/Opus voice note for a Bangla text: female Nabanita voice, local MMS voice as fallback."""
    CACHE.mkdir(parents=True, exist_ok=True)
    key = lambda v: CACHE / f"{hashlib.sha256((v + text).encode()).hexdigest()[:24]}.ogg"  # noqa: E731
    edge_path = key(EDGE_VOICE + EDGE_RATE)
    if edge_path.exists():
        return edge_path.read_bytes()
    try:
        _to_ogg(_edge_mp3(text), "mp3", edge_path)
        return edge_path.read_bytes()
    except Exception:
        log.warning("Nabanita voice unavailable, using the local MMS voice", exc_info=True)
    mms_path = key(MODEL_ID)
    if not mms_path.exists():
        _to_ogg(_wav(text), "wav", mms_path)
    return mms_path.read_bytes()


def warm() -> None:
    _load()
