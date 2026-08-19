import sqlite3
import os

for path in ['d:/hackthon/agentx_2026.db', 'd:/hackthon/backend/agentx_2026.db']:
    if not os.path.exists(path):
        continue
    try:
        conn = sqlite3.connect(path)
        c = conn.cursor()
        
        # Check columns in event_settings
        c.execute("PRAGMA table_info(event_settings)")
        cols = [r[1] for r in c.fetchall()]
        if 'upi_id' not in cols:
            c.execute("ALTER TABLE event_settings ADD COLUMN upi_id VARCHAR DEFAULT '9618164396-3@ybl'")
        if 'upi_display_name' not in cols:
            c.execute("ALTER TABLE event_settings ADD COLUMN upi_display_name VARCHAR DEFAULT 'agentx2026'")
            
        c.execute("""
            UPDATE event_settings 
            SET upi_id = '9618164396-3@ybl', 
                upi_display_name = 'agentx2026', 
                official_email = 'sivaramakrishna54599@gmail.com',
                fee_per_team = 199.0
        """)
        conn.commit()
        print(f"Successfully updated database at: {path} (rows affected: {c.rowcount})")
        conn.close()
    except Exception as e:
        print(f"Error updating {path}: {e}")
