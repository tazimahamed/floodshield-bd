"""Monitoring: pings for Healthchecks.io and failure messages to the owner's Telegram."""

import logging

import httpx

from app.core.config import settings

log = logging.getLogger(__name__)


def ping(url: str, failed: bool = False) -> None:
    if not url:
        return
    try:
        httpx.get(url + ("/fail" if failed else ""), timeout=10)
    except httpx.HTTPError:
        log.warning("Healthchecks ping failed")


def notify_admin(text: str) -> None:
    if not (settings.telegram_bot_token and settings.admin_chat_id):
        return
    try:
        httpx.post(f"https://api.telegram.org/bot{settings.telegram_bot_token}/sendMessage",
                   json={"chat_id": settings.admin_chat_id, "text": f"⚠️ FloodShield: {text}"}, timeout=10)
    except httpx.HTTPError:
        log.warning("Admin alert failed")
