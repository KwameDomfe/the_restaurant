import os
import django
from pathlib import Path

# Setup Django
BASE_DIR = Path(__file__).resolve().parent
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'therestaurant.settings')
django.setup()

from django.db import connection

def test_connection():
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT version();")
            version = cursor.fetchone()
            print("✓ Database connection successful!")
            print(f"  Database: {connection.settings_dict['ENGINE']}")
            print(f"  Host: {connection.settings_dict['HOST']}")
            print(f"  Database name: {connection.settings_dict['NAME']}")
            print(f"  User: {connection.settings_dict['USER']}")
            if 'postgresql' in connection.settings_dict['ENGINE']:
                print(f"  PostgreSQL version: {version[0]}")
            return True
    except Exception as e:
        print("✗ Database connection failed!")
        print(f"  Error: {str(e)}")
        print(f"  Engine: {connection.settings_dict['ENGINE']}")
        print(f"  Host: {connection.settings_dict.get('HOST', 'N/A')}")
        return False

if __name__ == '__main__':
    test_connection()
