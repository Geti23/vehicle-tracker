from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List

import models
import schemas
from database import get_db

app = FastAPI(title="Vehicle Tracker API")

# Enable CORS for Next.js app
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Vehicles Endpoints ---

@app.get("/api/vehicles", response_model=List[schemas.VehicleResponse])
def get_vehicles(db: Session = Depends(get_db)):
    return db.query(models.Vehicle).order_by(models.Vehicle.createdAt.desc()).all()


@app.get("/api/vehicles/{vehicle_id}", response_model=schemas.VehicleDetailResponse)
def get_vehicle(vehicle_id: str, db: Session = Depends(get_db)):
    vehicle = db.query(models.Vehicle).filter(models.Vehicle.id == vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    
    # Order services descending by date
    vehicle.services.sort(key=lambda x: x.date, reverse=True)
    return vehicle


@app.post("/api/vehicles", response_model=schemas.VehicleResponse, status_code=status.HTTP_201_CREATED)
def create_vehicle(vehicle_in: schemas.VehicleCreate, db: Session = Depends(get_db)):
    user = db.query(models.User).first()
    if not user:
        user = models.User(email="test@example.com", name="Test User")
        db.add(user)
        db.commit()
        db.refresh(user)

    db_vehicle = models.Vehicle(
        **vehicle_in.model_dump(),
        userId=user.id
    )
    db.add(db_vehicle)
    db.commit()
    db.refresh(db_vehicle)
    return db_vehicle


@app.put("/api/vehicles/{vehicle_id}", response_model=schemas.VehicleResponse)
def update_vehicle(vehicle_id: str, vehicle_in: schemas.VehicleUpdate, db: Session = Depends(get_db)):
    db_vehicle = db.query(models.Vehicle).filter(models.Vehicle.id == vehicle_id).first()
    if not db_vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")

    for key, value in vehicle_in.model_dump(exclude_unset=True).items():
        setattr(db_vehicle, key, value)

    db.commit()
    db.refresh(db_vehicle)
    return db_vehicle


@app.delete("/api/vehicles/{vehicle_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_vehicle(vehicle_id: str, db: Session = Depends(get_db)):
    db_vehicle = db.query(models.Vehicle).filter(models.Vehicle.id == vehicle_id).first()
    if not db_vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    db.delete(db_vehicle)
    db.commit()
    return None

# --- Service Records Endpoints ---

@app.get("/api/services/{service_id}", response_model=schemas.ServiceRecordResponse)
def get_service_record(service_id: str, db: Session = Depends(get_db)):
    service = db.query(models.ServiceRecord).filter(models.ServiceRecord.id == service_id).first()
    if not service:
        raise HTTPException(status_code=404, detail="Service record not found")
    return service


@app.post("/api/services", response_model=schemas.ServiceRecordResponse, status_code=status.HTTP_201_CREATED)
def create_service_record(service_in: schemas.ServiceRecordCreate, db: Session = Depends(get_db)):
    db_service = models.ServiceRecord(**service_in.model_dump())
    db.add(db_service)
    db.commit()
    db.refresh(db_service)
    return db_service


@app.put("/api/services/{service_id}", response_model=schemas.ServiceRecordResponse)
def update_service_record(service_id: str, service_in: schemas.ServiceRecordUpdate, db: Session = Depends(get_db)):
    db_service = db.query(models.ServiceRecord).filter(models.ServiceRecord.id == service_id).first()
    if not db_service:
        raise HTTPException(status_code=404, detail="Service record not found")

    for key, value in service_in.model_dump(exclude_unset=True).items():
        setattr(db_service, key, value)

    db.commit()
    db.refresh(db_service)
    return db_service


@app.delete("/api/services/{service_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_service_record(service_id: str, db: Session = Depends(get_db)):
    db_service = db.query(models.ServiceRecord).filter(models.ServiceRecord.id == service_id).first()
    if not db_service:
        raise HTTPException(status_code=404, detail="Service record not found")
    db.delete(db_service)
    db.commit()
    return None