"""
Test-environment support for the Support module regression suite.

The project's PostgreSQL test database runs against a Supabase managed
PostgreSQL reached through the Supavisor connection pooler (host configured as
``DB_HOST`` in ``.env``). Supavisor keeps a pooled server connection alive to the
test database, so Django's default teardown ``DROP DATABASE "test_postgres"``
fails with `OperationalError('database "test_postgres" is being accessed by
other users')` and leaves the database behind. The next test session then fails
at setup with `SystemExit(2): database "test_postgres" already exists`.

This conftest cleans up any leftover ``test_postgres`` at the start of every
pytest session, before pytest-django creates it, so the documented run
command works reliably across repeated runs without manual intervention. The
cleanup only runs for the postgres backend and only targets the dedicated test
database, so it does not affect the real database.
"""
import os
import time

import pytest


POSTGRES = 'django.db.backends.postgresql'


def _is_postgres() -> bool:
    from django.conf import settings
    from django.db import connections
    engine = settings.DATABASES.get('default', {}).get('DATABASE_ENGINE') \
        or connections['default'].settings_dict.get('ENGINE', '')
    return POSTGRES in engine


def _drop_test_postgres() -> bool:
    """
    Terminate lingering sessions on and drop the ``test_postgres`` database.

    Returns True if a database connection is available for maintenance work,
    False if psycopg2 is unavailable (so the suite can fall back to normal
    creation/destruction and fail loudly if it must).
    """
    try:
        import psycopg2
        from psycopg2 import errors
    except ImportError:  # pragma: no cover - psycopg2 is a Django postgres dep
        return False

    from dotenv import dotenv_values, find_dotenv
    env = dotenv_values(find_dotenv())

    conn = psycopg2.connect(
        host=os.getenv('DB_HOST') or env.get('DB_HOST'),
        port=int(os.getenv('DB_PORT') or env.get('DB_PORT') or 5432),
        dbname='postgres',
        user=os.getenv('DB_USER') or env.get('DB_USER'),
        password=os.getenv('DB_PASSWORD') or env.get('DB_PASSWORD'),
        connect_timeout=15,
    )
    conn.autocommit = True
    cur = conn.cursor()

    for _ in range(20):
        cur.execute(
            "SELECT pg_terminate_backend(pid) FROM pg_stat_activity "
            "WHERE datname = 'test_postgres' AND pid != pg_backend_pid()"
        )
        killed = cur.rowcount
        try:
            cur.execute('DROP DATABASE IF EXISTS test_postgres')
            cur.close()
            conn.close()
            return True
        except errors.ObjectInUse:
            time.sleep(0.2)
    else:
        cur.close()
        conn.close()
        return True


@pytest.fixture(scope='session', autouse=True)
def _clean_test_database():
    """
    Run before pytest-django creates the test database.

    Drops any leftover ``test_postgres`` left behind by a previous session's
    failed teardown (Supabase pooler holding a session). pytest-django's own
    ``django_db_setup`` runs later on the first test that needs DB access, so
    this runs first and guarantees a fresh creation.
    """
    if not _is_postgres():
        yield
        return
    _drop_test_postgres()
    yield
