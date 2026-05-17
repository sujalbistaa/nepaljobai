#!/usr/bin/env python3
"""
migrate_sqlite_to_postgres.py
One-shot migration: reads all data from the local nepaljobai.db SQLite file
and inserts it into the Neon PostgreSQL database specified by DATABASE_URL.

Usage:
    DATABASE_URL=postgresql://user:pass@host/db python scripts/migrate_sqlite_to_postgres.py
    DATABASE_URL=postgresql://user:pass@host/db python scripts/migrate_sqlite_to_postgres.py --sqlite-path /path/to/nepaljobai.db
"""

import argparse
import os
import sqlite3
import sys
from typing import Any

import psycopg2
import psycopg2.extras


TABLES_IN_ORDER: list[str] = [
    "users",
    "profiles",
    "jobs",
    "matches",
    "roadmaps",
]


def get_postgres_url(raw: str) -> str:
    """Normalise Neon-style postgres:// to postgresql://."""
    if raw.startswith("postgres://"):
        return raw.replace("postgres://", "postgresql://", 1)
    # Strip async driver prefix if someone copy-pastes the SQLAlchemy URL
    for prefix in ("postgresql+asyncpg://", "postgresql+psycopg2://"):
        if raw.startswith(prefix):
            return raw.replace(prefix, "postgresql://", 1)
    return raw


def fetch_all_rows(sqlite_conn: sqlite3.Connection, table: str) -> tuple[list[str], list[tuple[Any, ...]]]:
    cursor = sqlite_conn.cursor()
    cursor.execute(f"SELECT * FROM {table}")  # noqa: S608
    columns = [desc[0] for desc in cursor.description]
    rows = cursor.fetchall()
    return columns, rows


# SQLite stores booleans as integers (0/1); PostgreSQL requires true/false.
_BOOLEAN_COLUMNS: set[str] = {"is_startup", "is_active"}


def _cast_row(columns: list[str], row: tuple[Any, ...]) -> tuple[Any, ...]:
    """Convert SQLite integer booleans to Python bool for PostgreSQL."""
    result = []
    for col, val in zip(columns, row):
        if col in _BOOLEAN_COLUMNS and isinstance(val, int):
            result.append(bool(val))
        else:
            result.append(val)
    return tuple(result)


def upsert_rows(
    pg_conn: psycopg2.extensions.connection,
    table: str,
    columns: list[str],
    rows: list[tuple[Any, ...]],
) -> int:
    if not rows:
        return 0

    cast_rows = [_cast_row(columns, row) for row in rows]
    cursor = pg_conn.cursor()
    col_list = ", ".join(f'"{c}"' for c in columns)
    placeholders = ", ".join(["%s"] * len(columns))
    # ON CONFLICT DO NOTHING — safe to re-run
    sql = (
        f'INSERT INTO "{table}" ({col_list}) VALUES ({placeholders})'
        " ON CONFLICT DO NOTHING"
    )
    psycopg2.extras.execute_batch(cursor, sql, cast_rows, page_size=200)
    pg_conn.commit()
    return len(cast_rows)


def migrate(sqlite_path: str, postgres_url: str) -> None:
    if not os.path.exists(sqlite_path):
        print(f"[ERROR] SQLite file not found: {sqlite_path}")
        sys.exit(1)

    print(f"Source : {sqlite_path}")
    print(f"Target : {postgres_url[:postgres_url.index('@') + 1]}***")
    print()

    sqlite_conn = sqlite3.connect(sqlite_path)
    sqlite_conn.row_factory = None  # return tuples

    pg_conn = psycopg2.connect(get_postgres_url(postgres_url))

    total = 0
    for table in TABLES_IN_ORDER:
        try:
            columns, rows = fetch_all_rows(sqlite_conn, table)
        except sqlite3.OperationalError:
            print(f"  {table:<12}  SKIP (table not found in SQLite)")
            continue

        migrated = upsert_rows(pg_conn, table, columns, rows)
        total += migrated
        print(f"  {table:<12}  {migrated:>6} rows migrated")

    sqlite_conn.close()
    pg_conn.close()

    print()
    print(f"Done. {total} total rows migrated.")


def main() -> None:
    parser = argparse.ArgumentParser(description="Migrate SQLite → Neon PostgreSQL")
    parser.add_argument(
        "--sqlite-path",
        default=os.path.join(os.path.dirname(__file__), "..", "nepaljobai.db"),
        help="Path to the SQLite .db file (default: ../nepaljobai.db relative to this script)",
    )
    args = parser.parse_args()

    database_url = os.environ.get("DATABASE_URL", "")
    if not database_url:
        print("[ERROR] DATABASE_URL environment variable is not set.")
        print("  Example: DATABASE_URL=postgresql://user:pass@host/db python scripts/migrate_sqlite_to_postgres.py")
        sys.exit(1)

    if database_url.startswith("sqlite"):
        print("[ERROR] DATABASE_URL must point to PostgreSQL, not SQLite.")
        sys.exit(1)

    migrate(sqlite_path=os.path.abspath(args.sqlite_path), postgres_url=database_url)


if __name__ == "__main__":
    main()
