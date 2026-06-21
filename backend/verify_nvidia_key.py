#!/usr/bin/env python
"""
Quick test script to verify NVIDIA API key and connectivity.
Usage: python verify_nvidia_key.py
"""

import os
import sys
import json

try:
    import requests
except ImportError:
    print("ERROR: requests module not found. Install with: pip install requests")
    sys.exit(1)


def test_nvidia_api() -> int:
    api_key = os.environ.get("NV_API_KEY")
    if not api_key:
        print("❌ ERROR: NV_API_KEY environment variable is not set")
        print("\nSet it with:")
        print('  $env:NV_API_KEY = "nvapi-YOUR_KEY_HERE"    # PowerShell')
        print('  export NV_API_KEY="nvapi-YOUR_KEY_HERE"    # bash')
        return 10

    if not api_key.startswith("nvapi-"):
        print("⚠️  WARNING: API key doesn't start with 'nvapi-' - it may be invalid")

    print(f"✓ API key found (starts with: {api_key[:10]}...)")

    # Test connectivity
    url = "https://integrate.api.nvidia.com/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": "minimaxai/minimax-m3",
        "messages": [
            {"role": "system", "content": "You are SEB, an eco-friendly assistant."},
            {"role": "user", "content": "Hello"},
        ],
        "max_tokens": 256,
        "temperature": 0.6,
    }

    try:
        print(f"\nConnecting to {url}...")
        resp = requests.post(url, headers=headers, json=payload, timeout=10)

        if resp.status_code == 200:
            print("✓ Successfully connected to NVIDIA API!")
            data = resp.json()
            if data.get("choices") and len(data["choices"]) > 0:
                msg = data["choices"][0].get("message", {}).get("content", "")
                print(f"✓ Model response: {msg[:100]}...")
                return 0
            else:
                print("⚠️  API returned 200 but no message in response")
                print(json.dumps(data, indent=2))
                return 20
        else:
            print(f"❌ API returned {resp.status_code}")
            try:
                error_data = resp.json()
                print(f"Error details: {json.dumps(error_data, indent=2)}")
            except Exception:
                print(f"Response text: {resp.text}")
            return 30

    except requests.exceptions.Timeout:
        print("❌ Request timed out - check your internet connection or NVIDIA is down")
        return 40
    except requests.exceptions.ConnectionError as e:
        print(f"❌ Connection error: {e}")
        return 41
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return 99


if __name__ == "__main__":
    sys.exit(test_nvidia_api())

