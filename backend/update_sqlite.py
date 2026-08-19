import sqlite3

for db_path in ['agentx_2026.db', '../agentx_2026.db']:
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        cursor.execute("UPDATE event_settings SET upi_id = ?, upi_display_name = ?, official_email = ? WHERE id = 1", 
                       ('9618164396-3@ybl', 'agentx2026', 'sivaramakrishna54599@gmail.com'))
        conn.commit()
        conn.close()
        print(f"Successfully updated {db_path}")
    except Exception as e:
        print(f"Notice for {db_path}: {e}")
