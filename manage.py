#!/usr/bin/env python
import os
import sys
from pathlib import Path

if __name__ == "__main__":
    # Add 'src' directory to Python path
    sys.path.insert(0, str(Path(__file__).resolve().parent / "src"))

    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
    try:
        from django.core.management import execute_from_command_line
    except ImportError:
        raise
    execute_from_command_line(sys.argv)

