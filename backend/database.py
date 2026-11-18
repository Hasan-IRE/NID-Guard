# database.py
import sqlite3
import os
from datetime import datetime
from config import DATABASE_PATH


def get_connection():
    db_dir = os.path.dirname(DATABASE_PATH)
    if db_dir:
        os.makedirs(db_dir, exist_ok=True)
    conn = sqlite3.connect(DATABASE_PATH, timeout=10)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    with get_connection() as conn:
        conn.execute("PRAGMA journal_mode=WAL;")
        
        # Citizens / NID Records table
        conn.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nid TEXT UNIQUE NOT NULL,
                name TEXT NOT NULL,
                date_of_birth TEXT NOT NULL DEFAULT '',
                gender TEXT NOT NULL DEFAULT 'Other',
                address TEXT NOT NULL DEFAULT '',
                contact_number TEXT NOT NULL DEFAULT '',
                blood_group TEXT NOT NULL DEFAULT 'O+',
                fingerprint_id INTEGER UNIQUE NOT NULL,
                face_registered INTEGER DEFAULT 0,
                biometric_status TEXT DEFAULT 'Registered',
                account_status TEXT DEFAULT 'Active',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                access_count INTEGER DEFAULT 0,
                last_access TIMESTAMP
            )
        """)

        # Access & Biometric Verification Audit Logs
        conn.execute("""
            CREATE TABLE IF NOT EXISTS access_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nid TEXT,
                user_name TEXT,
                fingerprint_id INTEGER,
                face_matched INTEGER DEFAULT 0,
                fingerprint_matched INTEGER DEFAULT 0,
                result TEXT NOT NULL,
                reason TEXT NOT NULL,
                ip_address TEXT DEFAULT '127.0.0.1',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        # Security Events table
        conn.execute("""
            CREATE TABLE IF NOT EXISTS security_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                event_id TEXT UNIQUE,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                event_type TEXT NOT NULL,
                event_details TEXT NOT NULL,
                severity TEXT DEFAULT 'INFO',
                status TEXT NOT NULL,
                user TEXT DEFAULT 'system',
                device TEXT DEFAULT 'ESP32-S3-CAM-001',
                ip_address TEXT DEFAULT '127.0.0.1'
            )
        """)

        # Check if users table is empty; if so, seed demo records
        cursor = conn.execute("SELECT COUNT(*) AS cnt FROM users")
        if cursor.fetchone()["cnt"] == 0:
            seed_initial_records(conn)


def seed_initial_records(conn):
    demo_users = [
        (
            "7845129630",
            "Rahim Ahmed",
            "1998-05-14",
            "Male",
            "Sector 4, Uttara, Dhaka, Bangladesh",
            "+880 1711-234567",
            "A+",
            1,
            1,
            "Registered",
            "Active",
            12
        ),
        (
            "6382917450",
            "Nusrat Jahan",
            "2000-09-21",
            "Female",
            "GEC Circle, Chattogram, Bangladesh",
            "+880 1819-876543",
            "O+",
            2,
            1,
            "Registered",
            "Active",
            8
        ),
        (
            "4928173650",
            "Tanvir Hasan",
            "1997-02-11",
            "Male",
            "Kazihata, Rajshahi, Bangladesh",
            "+880 1912-345678",
            "B+",
            3,
            0,
            "Pending Verification",
            "Active",
            2
        ),
        (
            "5192837410",
            "Sadia Islam",
            "1999-11-03",
            "Female",
            "Zindabazar, Sylhet, Bangladesh",
            "+880 1613-987654",
            "AB+",
            4,
            1,
            "Registered",
            "Active",
            5
        ),
        (
            "8823719400",
            "Mahir Faisal",
            "1995-07-29",
            "Male",
            "Boyra, Khulna, Bangladesh",
            "+880 1515-567890",
            "O-",
            5,
            0,
            "Not Registered",
            "Disabled",
            1
        ),
    ]

    conn.executemany("""
        INSERT INTO users (
            nid, name, date_of_birth, gender, address, contact_number, blood_group,
            fingerprint_id, face_registered, biometric_status, account_status, access_count
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, demo_users)

    # Initial demo access logs
    demo_logs = [
        ("7845129630", "Rahim Ahmed", 1, 1, 1, "GRANTED", "BOTH_BIOMETRICS_VERIFIED", "192.168.1.100"),
        ("6382917450", "Nusrat Jahan", 2, 1, 1, "GRANTED", "BOTH_BIOMETRICS_VERIFIED", "192.168.1.100"),
        ("4928173650", "Tanvir Hasan", 3, 0, 1, "DENIED", "FACE_NOT_RECOGNIZED", "192.168.1.100"),
        ("8823719400", "Mahir Faisal", 5, 0, 0, "DENIED", "ACCOUNT_DISABLED", "192.168.1.100"),
        ("9999999999", "Unknown Subject", 99, 0, 0, "DENIED", "NID_NOT_REGISTERED", "192.168.1.100"),
    ]

    conn.executemany("""
        INSERT INTO access_logs (
            nid, user_name, fingerprint_id, face_matched, fingerprint_matched, result, reason, ip_address
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, demo_logs)


def register_user(nid, fingerprint_id, name="Unknown", date_of_birth="", gender="Other", address="", contact_number="", blood_group="O+"):
    with get_connection() as conn:
        conn.execute("""
            INSERT INTO users (
                nid, fingerprint_id, name, date_of_birth, gender, address, contact_number, blood_group,
                face_registered, biometric_status, account_status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, 'Pending Verification', 'Active')
        """, (nid, fingerprint_id, name, date_of_birth, gender, address, contact_number, blood_group))


def update_user(nid, name=None, address=None, contact_number=None, account_status=None, gender=None, blood_group=None):
    with get_connection() as conn:
        user = get_user_by_nid(nid)
        if not user:
            return False
        
        updates = []
        params = []
        if name is not None:
            updates.append("name = ?")
            params.append(name)
        if address is not None:
            updates.append("address = ?")
            params.append(address)
        if contact_number is not None:
            updates.append("contact_number = ?")
            params.append(contact_number)
        if account_status is not None:
            updates.append("account_status = ?")
            params.append(account_status)
        if gender is not None:
            updates.append("gender = ?")
            params.append(gender)
        if blood_group is not None:
            updates.append("blood_group = ?")
            params.append(blood_group)

        if updates:
            updates.append("updated_at = CURRENT_TIMESTAMP")
            params.append(nid)
            query = f"UPDATE users SET {', '.join(updates)} WHERE nid = ?"
            conn.execute(query, params)
        return True


def delete_user(nid):
    with get_connection() as conn:
        cursor = conn.execute("DELETE FROM users WHERE nid = ?", (nid,))
        return cursor.rowcount > 0


def mark_face_registered(nid):
    with get_connection() as conn:
        conn.execute("""
            UPDATE users
            SET face_registered = 1, biometric_status = 'Registered', updated_at = CURRENT_TIMESTAMP
            WHERE nid = ?
        """, (nid,))


def get_user_by_nid(nid):
    with get_connection() as conn:
        row = conn.execute("SELECT * FROM users WHERE nid = ?", (str(nid),)).fetchone()
        return dict(row) if row else None


def get_user_by_fingerprint(fingerprint_id):
    with get_connection() as conn:
        row = conn.execute("SELECT * FROM users WHERE fingerprint_id = ?", (fingerprint_id,)).fetchone()
        return dict(row) if row else None


def get_registered_users():
    with get_connection() as conn:
        rows = conn.execute("SELECT * FROM users WHERE face_registered = 1").fetchall()
        return [dict(r) for r in rows]


def get_all_users(search=None, status=None):
    with get_connection() as conn:
        query = "SELECT * FROM users WHERE 1=1"
        params = []
        if search:
            query += " AND (nid LIKE ? OR name LIKE ? OR address LIKE ?)"
            term = f"%{search}%"
            params.extend([term, term, term])
        if status and status != 'All':
            query += " AND biometric_status = ?"
            params.append(status)
        query += " ORDER BY id DESC"
        rows = conn.execute(query, params).fetchall()
        return [dict(r) for r in rows]


def log_access(nid, fingerprint_id, face_matched, fingerprint_matched, result, reason, user_name=None, ip_address="127.0.0.1"):
    with get_connection() as conn:
        if not user_name and nid:
            u = get_user_by_nid(nid)
            if u:
                user_name = u["name"]

        conn.execute("""
            INSERT INTO access_logs (
                nid, user_name, fingerprint_id, face_matched, fingerprint_matched, result, reason, ip_address
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            str(nid) if nid else None,
            user_name,
            fingerprint_id,
            int(face_matched),
            int(fingerprint_matched),
            result,
            reason,
            ip_address
        ))

        # Update access count and last_access on citizen record if granted
        if result == "GRANTED" and nid:
            conn.execute("""
                UPDATE users
                SET access_count = access_count + 1, last_access = CURRENT_TIMESTAMP
                WHERE nid = ?
            """, (str(nid),))


def get_logs(limit=100, result_filter=None, search=None):
    with get_connection() as conn:
        query = "SELECT * FROM access_logs WHERE 1=1"
        params = []
        if result_filter and result_filter != 'ALL':
            query += " AND result = ?"
            params.append(result_filter)
        if search:
            query += " AND (nid LIKE ? OR reason LIKE ? OR user_name LIKE ?)"
            term = f"%{search}%"
            params.extend([term, term, term])
        query += " ORDER BY id DESC LIMIT ?"
        params.append(limit)

        rows = conn.execute(query, params).fetchall()
        return [dict(r) for r in rows]


def get_dashboard_stats():
    with get_connection() as conn:
        total_records = conn.execute("SELECT COUNT(*) AS c FROM users").fetchone()["c"]
        face_count = conn.execute("SELECT COUNT(*) AS c FROM users WHERE face_registered = 1").fetchone()["c"]
        fingerprint_count = conn.execute("SELECT COUNT(*) AS c FROM users WHERE fingerprint_id IS NOT NULL AND fingerprint_id > 0").fetchone()["c"]
        total_granted = conn.execute("SELECT COUNT(*) AS c FROM access_logs WHERE result = 'GRANTED'").fetchone()["c"]
        total_denied = conn.execute("SELECT COUNT(*) AS c FROM access_logs WHERE result = 'DENIED'").fetchone()["c"]
        recent_logs = [dict(r) for r in conn.execute("SELECT * FROM access_logs ORDER BY id DESC LIMIT 5").fetchall()]

        return {
            "total_records": total_records,
            "face_enrolled_count": face_count,
            "fingerprint_enrolled_count": fingerprint_count,
            "total_granted": total_granted,
            "total_denied": total_denied,
            "recent_logs": recent_logs
        }
