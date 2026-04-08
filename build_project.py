import os
import subprocess

def run_pulse():
    print("--- Auora Automated Build Initiated ---")
    try:
        from src.main import pulse
        pulse()
        print("[Success]: Core Python logic executed.")
    except Exception as e:
        print(f"[Error]: Build failed: {e}")

if __name__ == "__main__":
    run_pulse()
