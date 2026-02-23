from sqlalchemy import Column, Integer, String, Date, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from database import Base
import datetime

class Paciente(Base):
    __tablename__ = 'gestion_paciente'

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), nullable=False)
    apellido = Column(String(100), nullable=False)
    dni = Column(String(20), unique=True, nullable=False)
    fecha_nacimiento = Column(Date, nullable=False)
    email = Column(String(254), nullable=True)
    telefono = Column(String(20), nullable=True)
    obra_social = Column(String(100), nullable=True)
    fecha_creacion = Column(DateTime, default=datetime.datetime.utcnow)

    # Relación inversa (opcional en este lado, pero útil)
    evoluciones = relationship("Evolucion", back_populates="paciente")

    def __repr__(self):
        return f"<Paciente(nombre={self.nombre}, apellido={self.apellido}, dni={self.dni})>"


class Evolucion(Base):
    __tablename__ = 'gestion_evolucion'

    id = Column(Integer, primary_key=True, index=True)
    paciente_id = Column(Integer, ForeignKey('gestion_paciente.id'), nullable=False)
    fecha_registro = Column(DateTime, default=datetime.datetime.utcnow)
    informe = Column(Text, nullable=False)
    audio = Column(String(100), nullable=True) # Django guarda el path relativo como string en FileField
    archivos_adjuntos = Column(String(100), nullable=True)

    paciente = relationship("Paciente", back_populates="evoluciones")

    def __repr__(self):
        return f"<Evolucion(paciente_id={self.paciente_id}, fecha={self.fecha_registro})>"
