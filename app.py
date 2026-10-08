import streamlit as st
import pandas as pd
from datetime import datetime
import os
from database import SessionLocal
import models
from dotenv import load_dotenv

load_dotenv()

# --- Database Session ---
def get_db():
    db = SessionLocal()
    try:
        return db
    finally:
        db.close()

db = get_db()

if "edit_service_id" not in st.session_state:
    st.session_state.edit_service_id = None
if "delete_service_id" not in st.session_state:
    st.session_state.delete_service_id = None

# Ensure a default user exists
user = db.query(models.User).first()
if not user:
    user = models.User(email="owner@garage.com", name="Owner")
    db.add(user)
    db.commit()
    db.refresh(user)

# --- State Management & Authentication ---
if "authenticated" not in st.session_state:
    st.session_state.authenticated = False
if "current_vehicle_id" not in st.session_state:
    st.session_state.current_vehicle_id = None

def navigate_to_garage():
    st.session_state.current_vehicle_id = None

st.set_page_config(page_title="Vehicle Tracker", layout="wide")


def get_vehicle_image_url(make, model):
    make_clean = make.lower().strip()
    model_clean = model.lower().strip()
    
    if make_clean == "audi" and model_clean == "a4 1.9 tdi":
        return "https://i.pinimg.com/474x/41/5d/42/415d42d692b3411e57d7cbc2b6b31fbc.jpg"
    elif make_clean in ["vw", "volkswagen"] and model_clean == "passat 1.9 tdi":
        return "https://www.edmunds.com/assets/m2/for-sale/8b-WVWTH63B52P176607/img-1-600x400.jpg"
    else:
        return "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcROMfJbTn5qyvM842K9opn8fhlG9JVbpCu4Ept4ZF-Ai6z_UEdus-ieJ1A&s=10"

# ==========================================
# VIEW: LOGIN SCREEN
# ==========================================
if not st.session_state.authenticated:
    st.title("🔐 Garage Access")
    with st.form("login_form"):
        pwd = st.text_input("Enter Master Password", type="password")
        if st.form_submit_button("Unlock"):
            if pwd == os.getenv("APP_PASSWORD"): # cite: 3
                st.session_state.authenticated = True
                st.rerun()
            else:
                st.error("Incorrect password.")
    st.stop()

# ==========================================
# VIEW: GARAGE (ALL VEHICLES)
# ==========================================
if st.session_state.current_vehicle_id is None:
    st.title("🚗 My Garage")
    
    with st.expander("➕ Add a New Vehicle", expanded=False):
        with st.form("add_vehicle_form"):
            col1, col2 = st.columns(2)
            make = col1.text_input("Make (e.g. Toyota)")
            model = col2.text_input("Model (e.g. Tacoma)")
            year = col1.number_input("Year", min_value=1900, max_value=2100, step=1, value=2018)
            current_mileage = col2.number_input("Current Mileage", min_value=0, step=1)
            
            if st.form_submit_button("Save Vehicle"):
                new_vehicle = models.Vehicle(userId=user.id, make=make, model=model, year=year, currentMileage=current_mileage)
                db.add(new_vehicle)
                db.commit()
                st.success(f"Added {year} {make} {model}!")
                st.rerun()

    vehicles = db.query(models.Vehicle).order_by(models.Vehicle.createdAt.desc()).all()
    
    if not vehicles:
        st.info("No vehicles added yet. Add your first one above!")
    else:
        for v in vehicles:
            with st.container(border=True):
                # Adjust column widths to make room for the picture (e.g., 2 parts image, 3 parts text, 2 parts buttons)
                col_img, col_info, col2, col3 = st.columns([2, 3, 1, 1])
                
                with col_img:
                    img_url = get_vehicle_image_url(v.make, v.model)
                    st.image(img_url, use_container_width=True)
                
                with col_info:
                    st.subheader(f"{v.year} {v.make} {v.model}")
                    st.write(f"**Current Mileage:** {v.currentMileage:,} km")
                
                # Prepare CSV data specific to this vehicle
                export_data = []
                if not v.services: # Uses the SQLAlchemy relationship to get services[cite: 2]
                    export_data.append({
                        "Vehicle Year": v.year, "Vehicle Make": v.make, "Vehicle Model": v.model,
                        "Vehicle Current Mileage": v.currentMileage, "Service Date": None,
                        "Service Type": None, "Service Mileage": None, "Cost": None,
                        "Shop Name": None, "Notes": None
                    })
                else:
                    for s in sorted(v.services, key=lambda x: x.date, reverse=True):
                        export_data.append({
                            "Vehicle Year": v.year, "Vehicle Make": v.make, "Vehicle Model": v.model,
                            "Vehicle Current Mileage": v.currentMileage, "Service Date": s.date.strftime("%Y-%m-%d"),
                            "Service Type": s.serviceType, "Service Mileage": s.mileageAtService,
                            "Cost": s.cost, "Shop Name": s.shopName, "Notes": s.description
                        })
                
                df_export = pd.DataFrame(export_data)
                csv = df_export.to_csv(index=False).encode('utf-8')
                
                # Download Button
                with col2:
                    st.download_button(
                        label="📥 CSV",
                        data=csv,
                        file_name=f"{v.make}_{v.model}_history.csv",
                        mime="text/csv",
                        key=f"export_{v.id}",
                        use_container_width=True
                    )
                
                # View/Edit Button
                with col3:
                    if st.button("↩️ View / Edit", key=f"view_{v.id}", use_container_width=True):
                        st.session_state.current_vehicle_id = v.id
                        st.rerun()

# ==========================================
# VIEW: VEHICLE DETAILS & SERVICES
# ==========================================
else:
    vehicle = db.query(models.Vehicle).filter(models.Vehicle.id == st.session_state.current_vehicle_id).first()
    
    st.button("← Back to Garage", on_click=navigate_to_garage)
    
    # Create columns for the header
    header_col1, header_col2 = st.columns([1, 2])
    
    with header_col1:
        img_url = get_vehicle_image_url(vehicle.make, vehicle.model)
        st.image(img_url, use_container_width=True)
        
    with header_col2:
        st.title(f"{vehicle.year} {vehicle.make} {vehicle.model}")
        st.write(f"**Current Mileage:** {vehicle.currentMileage:,} km")
    
    # Edit Vehicle Expander
    with st.expander("✏️ Edit Vehicle Details", expanded=False):
        with st.form("edit_vehicle_form"):
            col1, col2 = st.columns(2)
            edit_make = col1.text_input("Make", value=vehicle.make)
            edit_model = col2.text_input("Model", value=vehicle.model)
            edit_year = col1.number_input("Year", min_value=1900, max_value=2100, step=1, value=vehicle.year)
            edit_mileage = col2.number_input("Current Mileage", min_value=0, step=1, value=vehicle.currentMileage)
            
            if st.form_submit_button("Update Vehicle"):
                vehicle.make = edit_make
                vehicle.model = edit_model
                vehicle.year = edit_year
                vehicle.currentMileage = edit_mileage
                db.commit()
                st.success("Vehicle updated!")
                st.rerun()

    st.divider()

    # Add Service Record
    with st.expander("🔧 Log New Service Record"):
        with st.form("add_service_form"):
            col1, col2 = st.columns(2)
            date = col1.date_input("Date of Service", value=datetime.today())
            service_type = col2.text_input("Service Type (e.g., Oil Change)")
            mileage = col1.number_input("Mileage at Service (km)", min_value=0, step=1, value=vehicle.currentMileage)
            cost = col2.number_input("Total Cost (€)", min_value=0.0, step=0.01)
            shop_name = st.text_input("Shop Name / Location (Optional)")
            description = st.text_area("Notes or Detailed Description (Optional)")
            
            if st.form_submit_button("Save Service Record"):
                new_service = models.ServiceRecord(
                    vehicleId=vehicle.id, date=date, serviceType=service_type,
                    mileageAtService=mileage, cost=cost if cost > 0 else None,
                    shopName=shop_name if shop_name else None, description=description if description else None
                )
                db.add(new_service)
                db.commit()
                st.success("Service logged!")
                st.rerun()

    # Service Cards
    st.subheader("Service History")
    services = db.query(models.ServiceRecord).filter(models.ServiceRecord.vehicleId == vehicle.id).order_by(models.ServiceRecord.date.desc()).all()
    
    if not services:
        st.info("No services logged for this vehicle yet.")
    else:
        for s in services:
            # Keep the expander open automatically if we are currently editing or deleting it
            is_active = (st.session_state.edit_service_id == s.id) or (st.session_state.delete_service_id == s.id)
            
            # The title of the expandable card
            card_title = f"🔧 {s.serviceType} ( {s.date.strftime('%b %d, %Y')} )"
            
            with st.expander(card_title, expanded=is_active):
                
                # --- EDIT MODE ---
                if st.session_state.edit_service_id == s.id:
                    with st.form(key=f"edit_form_{s.id}"):
                        st.markdown("#### Edit Service Record")
                        col1, col2 = st.columns(2)
                        edit_date = col1.date_input("Date", value=s.date)
                        edit_type = col2.text_input("Service Type", value=s.serviceType)
                        edit_mil = col1.number_input("Mileage", value=s.mileageAtService, min_value=0, step=1)
                        edit_cost = col2.number_input("Cost (€)", value=s.cost if s.cost else 0.0, step=0.01)
                        edit_shop = st.text_input("Shop", value=s.shopName if s.shopName else "")
                        edit_notes = st.text_area("Notes", value=s.description if s.description else "")
                        
                        btn_col1, btn_col2 = st.columns(2)
                        if btn_col1.form_submit_button("💾 Save Changes"):
                            s.date = edit_date
                            s.serviceType = edit_type
                            s.mileageAtService = edit_mil
                            s.cost = edit_cost if edit_cost > 0 else None
                            s.shopName = edit_shop if edit_shop else None
                            s.description = edit_notes if edit_notes else None
                            db.commit()
                            st.session_state.edit_service_id = None
                            st.success("Record updated!")
                            st.rerun()
                            
                        if btn_col2.form_submit_button("❌ Cancel"):
                            st.session_state.edit_service_id = None
                            st.rerun()
                            
                # --- VIEW MODE ---
                else:
                    col_cost, col_mil = st.columns(2)
                    if s.cost:
                        col_cost.write(f"💰 **Cost:** €{s.cost:.2f}")
                    else:
                        col_cost.write("💰 **Cost:** -")
                        
                    col_mil.write(f"🛣️ **Mileage:** {s.mileageAtService:,} km")
                    
                    if s.shopName:
                        st.write(f"🏢 **Shop:** {s.shopName}")
                    
                    if s.description:
                        st.info(s.description)
                        
                    # Action Buttons
                    st.divider()
                    act_col1, act_col2, _ = st.columns([1, 1, 4])
                    
                    if act_col1.button("✏️ Edit", key=f"edit_btn_{s.id}"):
                        st.session_state.edit_service_id = s.id
                        st.session_state.delete_service_id = None
                        st.rerun()
                        
                    if act_col2.button("🗑️ Delete", key=f"del_btn_{s.id}"):
                        st.session_state.delete_service_id = s.id
                        st.session_state.edit_service_id = None
                        st.rerun()
                        
                    # --- DELETE CONFIRMATION ---
                    if st.session_state.delete_service_id == s.id:
                        st.warning("⚠️ Are you sure you want to permanently delete this record?")
                        conf_col1, conf_col2, _ = st.columns([1, 1, 3])
                        
                        if conf_col1.button("✔️ Yes, Delete", key=f"confirm_del_{s.id}"):
                            db.delete(s)
                            db.commit()
                            st.session_state.delete_service_id = None
                            st.success("Record deleted.")
                            st.rerun()
                            
                        if conf_col2.button("❌ Cancel", key=f"cancel_del_{s.id}"):
                            st.session_state.delete_service_id = None
                            st.rerun()
