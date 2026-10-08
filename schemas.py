from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict

# --- Service Record Schemas ---
class ServiceRecordBase(BaseModel):
    serviceType: str
    mileageAtService: int
    date: datetime
    cost: Optional[float] = None
    shopName: Optional[str] = None
    description: Optional[str] = None

class ServiceRecordCreate(ServiceRecordBase):
    vehicleId: str

class ServiceRecordUpdate(ServiceRecordBase):
    pass

class ServiceRecordResponse(ServiceRecordBase):
    id: str
    vehicleId: str
    createdAt: datetime

    model_config = ConfigDict(from_attributes=True)

# --- Vehicle Schemas ---
class VehicleBase(BaseModel):
    make: str
    model: str
    year: int
    currentMileage: int
    vin: Optional[str] = None

class VehicleCreate(VehicleBase):
    pass

class VehicleUpdate(VehicleBase):
    pass

class VehicleResponse(VehicleBase):
    id: str
    userId: str
    createdAt: datetime

    model_config = ConfigDict(from_attributes=True)

class VehicleDetailResponse(VehicleResponse):
    services: List[ServiceRecordResponse] = []