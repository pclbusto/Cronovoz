
import updater
import os

print("--- Testing Check Updates ---")
try:
    has_updates, msg = updater.check_updates()
    print(f"Has updates: {has_updates}")
    print(f"Message: {msg}")
except Exception as e:
    print(f"Check failed: {e}")

if has_updates:
    print("\n--- Testing Perform Update ---")
    try:
        success, update_msg = updater.perform_update()
        print(f"Update success: {success}")
        print(f"Update message: {update_msg}")
    except Exception as e:
        print(f"Update failed: {e}")
else:
    print("\nNo updates to perform, skipping pull.")
