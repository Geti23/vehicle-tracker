import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class User(Base):
    __tablename__ = "User"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String, unique=True, nullable=False)
    name = Column(String, nullable=True)
    createdAt = Column(DateTime, default=datetime.utcnow, nullable=False)

    vehicles = relationship("Vehicle", back_populates="user", cascade="all, delete-orphan")


class Vehicle(Base):
    __tablename__ = "Vehicle"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    userId = Column(String, ForeignKey("User.id", ondelete="CASCADE"), nullable=False)
    make = Column(String, nullable=False)
    model = Column(String, nullable=False)
    year = Column(Integer, nullable=False)
    vin = Column(String, nullable=True)
    currentMileage = Column(Integer, nullable=False)
    createdAt = Column(DateTime, default=datetime.utcnow, nullable=False)

    user = relationship("User", back_populates="vehicles")
    services = relationship("ServiceRecord", back_populates="vehicle", cascade="all, delete-orphan")


class ServiceRecord(Base):
    __tablename__ = "ServiceRecord"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    vehicleId = Column(String, ForeignKey("Vehicle.id", ondelete="CASCADE"), nullable=False)
    date = Column(DateTime, nullable=False)
    mileageAtService = Column(Integer, nullable=False)
    serviceType = Column(String, nullable=False)
    description = Column(String, nullable=True)
    cost = Column(Float, nullable=True)
    shopName = Column(String, nullable=True)
    createdAt = Column(DateTime, default=datetime.utcnow, nullable=False)

    vehicle = relationship("Vehicle", back_populates="services")