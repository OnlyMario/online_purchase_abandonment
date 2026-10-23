import csv
import json
from pathlib import Path

# Find the folder containing this Python script.
base_dir = Path(__file__).resolve().parent

# Read the original dataset.
csv_path = base_dir / "online_shoppers_intention.csv"

# Save the JSON where the website expects it.
output_path = base_dir / "data" / "analytics.json"


def to_bool(value):
    """Convert CSV True/False values into Python booleans."""
    return str(value).strip().lower() == "true"


sessions = []

with csv_path.open("r", encoding="utf-8-sig", newline="") as file:
    reader = csv.DictReader(file)

    for session_number, row in enumerate(reader, start=1):
        sessions.append({
            "session": session_number,
            "visitor": row["VisitorType"],
            "weekend": to_bool(row["Weekend"]),
            "month": row["Month"],
            "productPages": int(float(row["ProductRelated"])),
            "purchased": to_bool(row["Revenue"])
        })

# Calculate summary statistics from the actual records.
total_sessions = len(sessions)
purchase_sessions = sum(
    1 for session in sessions if session["purchased"]
)
sessions_without_purchase = total_sessions - purchase_sessions

purchase_rate = (
    round(purchase_sessions / total_sessions * 100, 2)
    if total_sessions else 0
)

no_purchase_rate = (
    round(sessions_without_purchase / total_sessions * 100, 2)
    if total_sessions else 0
)

# Include BOTH summary statistics and individual sessions.
analytics = {
    "totalSessions": total_sessions,
    "purchaseSessions": purchase_sessions,
    "sessionsWithoutPurchase": sessions_without_purchase,
    "purchaseRate": purchase_rate,
    "noPurchaseRate": no_purchase_rate,
    "sessions": sessions
}

# Create the data folder if it does not exist.
output_path.parent.mkdir(parents=True, exist_ok=True)

# Write the complete JSON file.
with output_path.open("w", encoding="utf-8") as file:
    json.dump(analytics, file, indent=2)

print(f"Total sessions: {total_sessions:,}")
print(f"Purchase sessions: {purchase_sessions:,}")
print(f"Saved complete JSON to: {output_path}")
print(f"Individual records saved: {len(sessions):,}")