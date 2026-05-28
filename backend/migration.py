import os
from sqlalchemy import create_engine, text

# Get the db URL from the same place as database.py
DB_USER = os.getenv("POSTGRES_USER", "postgres")
DB_PASSWORD = os.getenv("POSTGRES_PASSWORD", "postgres")
DB_HOST = os.getenv("POSTGRES_HOST", "localhost")
DB_PORT = os.getenv("POSTGRES_PORT", "5432")
DB_NAME = os.getenv("POSTGRES_DB", "restoran_stok")

SQLALCHEMY_DATABASE_URL = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

try:
    engine = create_engine(SQLALCHEMY_DATABASE_URL)
    with engine.connect() as conn:
        print("Adding category to products...")
        try:
            conn.execute(text("ALTER TABLE products ADD COLUMN category VARCHAR DEFAULT 'Diğer';"))
            print("Successfully added category.")
        except Exception as e:
            print(f"Category column might already exist or error: {e}")

        print("Adding critical_threshold to products...")
        try:
            conn.execute(text("ALTER TABLE products ADD COLUMN critical_threshold FLOAT DEFAULT 5.0;"))
            print("Successfully added critical_threshold.")
        except Exception as e:
            print(f"critical_threshold column might already exist or error: {e}")

        print("Adding last_unit_price to products...")
        try:
            conn.execute(text("ALTER TABLE products ADD COLUMN last_unit_price FLOAT DEFAULT 0.0;"))
            print("Successfully added last_unit_price.")
        except Exception as e:
            print(f"last_unit_price column might already exist or error: {e}")
            
        print("Adding unit to recipe_ingredients...")
        try:
            conn.execute(text("ALTER TABLE recipe_ingredients ADD COLUMN unit VARCHAR DEFAULT 'kg';"))
            print("Successfully added unit.")
        except Exception as e:
            print(f"unit column might already exist or error: {e}")
            
        conn.commit()
    print("Migration complete!")
except Exception as e:
    print(f"Database connection failed. Are you sure Postgres is running? {e}")
