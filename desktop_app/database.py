from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
import os

# Determinar la ruta absoluta de la base de datos para evitar errores de ruta relativa
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
# La base de datos está en ../backend/db.sqlite3 respecto a este archivo
DB_PATH = os.path.join(BASE_DIR, '..', 'backend', 'db.sqlite3')

DATABASE_URL = f"sqlite:///{DB_PATH}"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
