"""Bangla text-to-speech for voice alerts, fully local and free: Meta MMS-TTS (facebook/mms-tts-ben,
VITS). Licence CC-BY-NC 4.0 — fine for this non-commercial service; swap the model before any
commercial use. Output is OGG/Opus so Telegram shows it as a playable voice note.
"""

import hashlib
import io
import subprocess
import threading
import wave

import numpy as np

from app.core.config import settings

MODEL_ID = "facebook/mms-tts-ben"
CACHE = settings.data_dir / "processed" / "tts"
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


def bangla_voice_ogg(text: str) -> bytes:
    """OGG/Opus voice note for a Bangla text, cached by content."""
    CACHE.mkdir(parents=True, exist_ok=True)
    path = CACHE / f"{hashlib.sha256((MODEL_ID + text).encode()).hexdigest()[:24]}.ogg"
    if not path.exists():
        import imageio_ffmpeg
        out = subprocess.run([imageio_ffmpeg.get_ffmpeg_exe(), "-y", "-loglevel", "error", "-f", "wav", "-i", "pipe:0",
                              "-c:a", "libopus", "-b:a", "32k", "-ar", "48000", str(path)],
                             input=_wav(text), capture_output=True)
        if out.returncode != 0:
            raise RuntimeError(out.stderr.decode(errors="replace")[:500])
    return path.read_bytes()


def warm() -> None:
    _load()
