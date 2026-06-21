"""
Minimal, robust NVIDIA Minimax chat client.

Usage:
  # set your API key in the environment
  $env:NV_API_KEY = "nvapi-..."    # PowerShell
  export NV_API_KEY="nvapi-..."    # bash

  # non-streaming (default)
  python nvidia_chat.py --message "How do I recycle plastic bottles?"

  # streaming output
  python nvidia_chat.py --message "Tell me about composting" --stream

Notes:
- Make sure the network where this runs can reach https://integrate.api.nvidia.com
- The script uses an explicit system prompt to keep the assistant focused on eco-friendly
  and family-friendly topics. Adjust the system prompt below if needed.
"""

from __future__ import annotations

import argparse
import json
import os
import sys
import time
from typing import Any, Dict, Optional

import requests
from requests.exceptions import RequestException

INVOKE_URL = "https://integrate.api.nvidia.com/v1/chat/completions"

# Default system instruction to keep the assistant on-topic and family-friendly
DEFAULT_SYSTEM_PROMPT = (
    "You are SEB, an eco-friendly assistant. Only answer questions about recycling, sustainable "
    "living, and environmental topics. If the user asks about unrelated topics, politely decline "
    "and steer them to an eco-friendly subject. Use family-friendly language suitable for all ages."
)


def make_headers(api_key: str, stream: bool) -> Dict[str, str]:
    return {
        "Authorization": f"Bearer {api_key}",
        "Accept": "text/event-stream" if stream else "application/json",
        "Content-Type": "application/json",
    }


def build_payload(message: str, system_prompt: Optional[str] = None, stream: bool = False) -> Dict[str, Any]:
    system_text = system_prompt or DEFAULT_SYSTEM_PROMPT
    return {
        "model": "minimaxai/minimax-m3",
        "messages": [
            {"role": "system", "content": system_text},
            {"role": "user", "content": message},
        ],
        # Limit tokens reasonably for interactive use; adjust if you need more.
        "max_tokens": 2048,
        "temperature": 0.6,
        "top_p": 0.95,
        "stream": stream,
    }


def print_json(obj: Any) -> None:
    print(json.dumps(obj, ensure_ascii=False, indent=2))


def run_once(api_key: str, payload: Dict[str, Any], stream: bool, timeout: int = 60) -> int:
    headers = make_headers(api_key, stream)

    try:
        resp = requests.post(INVOKE_URL, headers=headers, json=payload, stream=stream, timeout=timeout)
    except RequestException as e:
        print(f"Request failed: {e}", file=sys.stderr)
        return 2

    if stream:
        # Server-sent events style streaming -- print lines as they come
        try:
            for line in resp.iter_lines(decode_unicode=True):
                if not line:
                    continue
                # Many SSE streams prefix events, or use JSON lines.
                try:
                    text = line
                    # If the line is JSON, pretty-print the JSON 'delta' or message
                    if line.startswith("{") or line.startswith("["):
                        try:
                            obj = json.loads(line)
                            print_json(obj)
                        except Exception:
                            print(line)
                    else:
                        print(line)
                except Exception:
                    # Fallback to raw print
                    print(line)
            return 0
        except RequestException as e:
            print(f"Streaming request error: {e}", file=sys.stderr)
            return 3
    else:
        # Non-streaming
        try:
            if resp.status_code >= 400:
                # try to extract JSON body
                try:
                    body = resp.json()
                except Exception:
                    body = resp.text
                print(f"Upstream error {resp.status_code}:", file=sys.stderr)
                print_json(body) if isinstance(body, (dict, list)) else print(body)
                return 4

            data = resp.json()
            print_json(data)
            return 0
        except ValueError as e:
            print(f"Failed to parse JSON response: {e}", file=sys.stderr)
            print(resp.text)
            return 5


def main() -> int:
    parser = argparse.ArgumentParser(description="NVIDIA Minimax chat client (focused on eco-friendly topics)")
    parser.add_argument("--message", "-m", type=str, help="User message to send to the model")
    parser.add_argument("--stream", action="store_true", help="Enable streaming output")
    parser.add_argument("--system", type=str, default=None, help="Optional custom system prompt")
    parser.add_argument("--timeout", type=int, default=60, help="Request timeout in seconds")

    args = parser.parse_args()

    api_key = os.environ.get("NV_API_KEY")
    if not api_key:
        print("Environment variable NV_API_KEY is not set. Set it to your NVIDIA API key.", file=sys.stderr)
        return 10

    message = args.message
    if not message:
        # If no message passed, read from stdin
        if sys.stdin.isatty():
            print("No message provided. Use --message or pipe text into the script.")
            return 11
        message = sys.stdin.read().strip()
        if not message:
            print("Empty message provided.", file=sys.stderr)
            return 12

    payload = build_payload(message, system_prompt=args.system, stream=args.stream)
    return run_once(api_key, payload, args.stream, timeout=args.timeout)


if __name__ == "__main__":
    raise SystemExit(main())


