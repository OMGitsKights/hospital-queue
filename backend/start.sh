#!/bin/bash
# CareFlo backend startup script
# Uses Python 3.14 which supports scrypt password hashing
PYTHON3_14="/Library/Frameworks/Python.framework/Versions/3.14/bin/python3"

if [ ! -f "$PYTHON3_14" ]; then
  echo "❌ Python 3.14 not found at $PYTHON3_14"
  echo "   Try: python3 app.py (if your python3 is 3.14+)"
  exit 1
fi

echo "✅ Starting CareFlo backend with Python 3.14..."
cd "$(dirname "$0")"
$PYTHON3_14 app.py
