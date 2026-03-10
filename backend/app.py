from flask import Flask, render_template, request, jsonify
import json
import time
import math
import os
import requests
from dotenv import load_dotenv
from supabase import create_client, Client

app = Flask(__name__)

# ======================================================
# CONFIGURATION
# ======================================================

load_dotenv()

MODEL_ID = "granite3.3:2b"
OLLAMA_URL = "http://localhost:11434/api/generate"

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

def get_supabase():
    if SUPABASE_URL and SUPABASE_KEY:
        try:
            return create_client(SUPABASE_URL, SUPABASE_KEY)
        except Exception as e:
            print(f"Failed to init Supabase: {e}")
            return None
    return None

print("=" * 70)
print("🏗️  Construction Planning System")
print("🤖 Model:", MODEL_ID)
print("📍 Running locally via Ollama")
if SUPABASE_URL and SUPABASE_KEY:
    print("🗄️  Supabase: Connected")
else:
    print("⚠️  Supabase credentials not configured. Please create backend/.env.")
    print("   Copy backend/.env.example to backend/.env and add your Supabase keys.")
    print("   The server will run, but database storage is disabled.")
print("=" * 70)

# ======================================================
# CALCULATION LOGIC
# ======================================================

class ConstructionCalculator:
    """Calculate construction requirements based on project parameters"""

    # Standard rates for India (INR)
    DAILY_WAGE_PER_WORKER = 500   # ₹500 per day
    COST_PER_SQ_YARD = 1500      # ₹1500 per sq yard
    OVERHEAD_PERCENTAGE = 10      # 10% overhead

    # Material rates per unit (INR)
    STEEL_RATE_PER_TON = 60000    # ₹60,000 per ton
    CEMENT_RATE_PER_BAG = 420     # ₹420 per 50kg bag
    SAND_RATE_PER_TON = 800       # ₹800 per ton

    # Standard thumb rules
    STEEL_PER_SQ_YARD = 3.5       # kg per sq yard (for RCC)
    CEMENT_PER_SQ_YARD = 0.4      # bags per sq yard
    SAND_PER_SQ_YARD = 0.6        # tons per sq yard
    WATER_PER_SQ_YARD = 500       # liters per sq yard

    def __init__(self, built_up_area, floors, days=None, workers=None, daily_wage=None, cost_per_sq_yard=None):
        """
        built_up_area: in square yards
        floors: total floors (e.g., "G+3" means 4 floors)
        days: construction days (optional)
        workers: number of workers (optional)
        daily_wage: custom daily wage per worker (optional)
        cost_per_sq_yard: custom cost per sq yard (optional)
        """
        self.built_up_area = float(built_up_area)
        self.num_floors = self._parse_floors(floors)
        self.days = days
        self.workers = workers
        self.DAILY_WAGE_PER_WORKER = daily_wage or self.DAILY_WAGE_PER_WORKER
        self.COST_PER_SQ_YARD = cost_per_sq_yard or self.COST_PER_SQ_YARD

    def _parse_floors(self, floors_str):
        """Parse floor format like 'G+3' to total floors"""
        if isinstance(floors_str, int):
            return floors_str
        floors_str = str(floors_str).upper().replace(" ", "")
        if "+" in floors_str:
            return int(floors_str.split("+")[1]) + 1
        return int(floors_str)

    def calculate_workers(self):
        """Calculate worker requirements based on area and floors"""
        base_workers_per_1000 = 30
        area_factor = self.built_up_area / 1000
        floor_factor = 1 + (self.num_floors - 1) * 0.3

        total_workers = max(10, math.ceil(base_workers_per_1000 * area_factor * floor_factor))

        if self.workers:
            total_workers = self.workers

        # Worker breakdown
        masons = max(2, math.ceil(total_workers * 0.25))
        helpers = max(3, math.ceil(total_workers * 0.30))
        steel_workers = max(1, math.ceil(total_workers * 0.15))
        carpenters = max(1, math.ceil(total_workers * 0.10))
        supervisors = max(1, math.ceil(total_workers * 0.05))

        return {
            "total_workers": total_workers,
            "masons": masons,
            "helpers": helpers,
            "steel_workers": steel_workers,
            "carpenters": carpenters,
            "supervisors": supervisors
        }

    def calculate_timeline(self):
        """Calculate construction timeline"""
        if self.days:
            total_days = self.days
        else:
            base_days = 28
            area_factor = self.built_up_area / 1000
            floor_factor = self.num_floors
            total_days = math.ceil(base_days * area_factor * floor_factor)

        weeks = math.ceil(total_days / 7)
        months = math.ceil(total_days / 30)

        return {
            "days": total_days,
            "weeks": weeks,
            "months": months
        }

    def calculate_costs(self):
        """Calculate cost breakdown"""
        timeline = self.calculate_timeline()
        workers = self.calculate_workers()

        # Labor cost
        labor_cost = workers["total_workers"] * self.DAILY_WAGE_PER_WORKER * timeline["days"]

        # Material cost
        total_area = self.built_up_area * self.num_floors
        material_cost = total_area * self.COST_PER_SQ_YARD

        # Overhead
        subtotal = labor_cost + material_cost
        overhead = subtotal * (self.OVERHEAD_PERCENTAGE / 100)

        total_cost = subtotal + overhead

        return {
            "labor_cost": labor_cost,
            "material_cost": material_cost,
            "overhead": overhead,
            "overhead_percentage": self.OVERHEAD_PERCENTAGE,
            "total_cost": total_cost,
            "cost_per_sq_yard": round(total_cost / total_area, 2) if total_area > 0 else 0
        }

    def calculate_materials(self):
        """Calculate material requirements"""
        total_area = self.built_up_area * self.num_floors

        steel_kg = total_area * self.STEEL_PER_SQ_YARD
        steel_tons = round(steel_kg / 1000, 1)
        cement_bags = math.ceil(total_area * self.CEMENT_PER_SQ_YARD)
        sand_tons = round(total_area * self.SAND_PER_SQ_YARD, 1)
        water_liters = math.ceil(total_area * self.WATER_PER_SQ_YARD)

        return {
            "steel_tons": steel_tons,
            "cement_bags": cement_bags,
            "sand_tons": sand_tons,
            "water_liters": water_liters
        }

    def generate_blueprint(self):
        """Generate architectural blueprint data with dynamic room sizing"""
        area_per_floor = self.built_up_area
        total_area_sqft = area_per_floor * 9

        # Room definitions with realistic percentages and aspect ratios
        # Row 1: Master Bedroom | Bedroom 2 | Living Room
        # Row 2: Kitchen | Bathroom | Balcony
        room_defs = [
            # Row 1
            {"name": "MASTER BEDROOM", "percentage": 0.18, "aspect": 1.2, "row": 0, "col": 0},
            {"name": "BEDROOM 2",      "percentage": 0.15, "aspect": 1.2, "row": 0, "col": 1},
            {"name": "LIVING ROOM",    "percentage": 0.25, "aspect": 1.4, "row": 0, "col": 2},
            # Row 2
            {"name": "KITCHEN",        "percentage": 0.10, "aspect": 1.1, "row": 1, "col": 0},
            {"name": "BATHROOM",       "percentage": 0.07, "aspect": 1.0, "row": 1, "col": 1},
            {"name": "BALCONY",        "percentage": 0.05, "aspect": 1.5, "row": 1, "col": 2},
        ]

        floor_plans = []
        for floor_num in range(self.num_floors):
            floor_name = "GROUND FLOOR" if floor_num == 0 else f"FLOOR {floor_num + 1}"

            # Step 1: Calculate initial (natural) dimensions for each room
            computed = []
            for rd in room_defs:
                room_area = total_area_sqft * rd["percentage"]
                w = math.sqrt(room_area * rd["aspect"])
                h = room_area / w
                computed.append({
                    "name": rd["name"],
                    "width": w,
                    "height": h,
                    "area": round(room_area, 1),
                    "row": rd["row"],
                    "col": rd["col"],
                })

            # Step 2: Group rooms by row
            rows = {}
            for rm in computed:
                rows.setdefault(rm["row"], [])
                rows[rm["row"]].append(rm)
            for r in rows:
                rows[r].sort(key=lambda rm: rm["col"])

            # Step 3: Determine a common total width for all rows
            # Use the maximum natural row width as the target
            row_natural_widths = {}
            for r, rms in rows.items():
                row_natural_widths[r] = sum(rm["width"] for rm in rms)
            target_width = max(row_natural_widths.values())

            # Step 4: Scale each row's room widths proportionally to fill the target width
            # Then recalculate heights to preserve each room's area
            for r, rms in rows.items():
                natural_total = row_natural_widths[r]
                scale = target_width / natural_total
                for rm in rms:
                    rm["width"] = rm["width"] * scale
                    rm["height"] = rm["area"] / rm["width"]  # preserve area

            # Step 5: Normalize heights within each row (all rooms in a row get the same height)
            row_heights = {}
            for r, rms in rows.items():
                max_h = max(rm["height"] for rm in rms)
                row_heights[r] = max_h
                for rm in rms:
                    rm["height"] = max_h

            # Step 6: Assign x, y positions (tightly packed, no gaps)
            floor_rooms = []
            for row_idx in sorted(rows.keys()):
                y = sum(row_heights[r] for r in range(row_idx))
                x = 0
                for rm in rows[row_idx]:
                    floor_rooms.append({
                        "name": rm["name"],
                        "width": round(rm["width"], 1),
                        "height": round(rm["height"], 1),
                        "area": rm["area"],
                        "x": round(x, 1),
                        "y": round(y, 1),
                    })
                    x += rm["width"]

            floor_plans.append({
                "floor_name": floor_name,
                "rooms": floor_rooms,
                "total_area": f"{area_per_floor} Sq. Yards",
                "total_area_sqft": round(total_area_sqft, 1),
            })

        return floor_plans

    def generate_schedule(self):
        """Generate week-by-week construction schedule"""
        timeline = self.calculate_timeline()
        total_weeks = timeline["weeks"]

        phases = [
            {"name": "Site Preparation", "percentage": 0.08,
             "activities": ["Site clearing", "Leveling", "Setting up temporary facilities"]},
            {"name": "Foundation Work", "percentage": 0.12,
             "activities": ["Excavation", "Foundation laying", "Concrete curing"]},
        ]

        # Add floor-specific phases
        for i in range(self.num_floors):
            floor_name = "Ground Floor" if i == 0 else f"Floor {i + 1}"
            phases.append({
                "name": f"{floor_name} Slab",
                "percentage": 0.15 / self.num_floors,
                "activities": ["Formwork preparation", "Reinforcement placement", "Concrete pouring", "Curing"]
            })

        phases.extend([
            {"name": "Brickwork & Masonry", "percentage": 0.10,
             "activities": ["Brick laying", "Wall plastering prep"]},
            {"name": "Plumbing & Electrical", "percentage": 0.10,
             "activities": ["Pipe laying", "Wiring", "Fixture points"]},
            {"name": "Plastering & Finishing", "percentage": 0.10,
             "activities": ["Internal plastering", "External plastering", "Curing"]},
            {"name": "Flooring & Tiling", "percentage": 0.08,
             "activities": ["Floor tiling", "Wall tiling", "Grouting"]},
            {"name": "Painting", "percentage": 0.08,
             "activities": ["Primer", "Putty", "Paint coats"]},
            {"name": "Doors & Windows", "percentage": 0.06,
             "activities": ["Frame installation", "Door fitting", "Window fitting"]},
            {"name": "Final Finishing", "percentage": 0.05,
             "activities": ["Cleaning", "Touch-ups", "Final inspection"]},
        ])

        schedule = []
        current_week = 1
        for phase in phases:
            phase_weeks = max(1, math.ceil(total_weeks * phase["percentage"]))
            schedule.append({
                "week": current_week,
                "phase": phase["name"],
                "activities": phase["activities"]
            })
            current_week += phase_weeks

        return schedule

    def get_full_result(self):
        """Get complete calculation result"""
        workers = self.calculate_workers()
        timeline = self.calculate_timeline()
        costs = self.calculate_costs()
        materials = self.calculate_materials()
        blueprint = self.generate_blueprint()
        schedule = self.generate_schedule()

        return {
            "input": {
                "built_up_area": self.built_up_area,
                "floors": self.num_floors,
                "num_floors": self.num_floors,
            },
            "workers": workers,
            "timeline": timeline,
            "costs": costs,
            "materials": materials,
            "blueprint": blueprint,
            "weekly_plan": schedule,
            "assumptions": {
                "location": "India",
                "daily_wage": self.DAILY_WAGE_PER_WORKER,
                "cost_per_sq_yard": self.COST_PER_SQ_YARD,
                "overhead_percentage": self.OVERHEAD_PERCENTAGE
            }
        }


# ======================================================
# AI ANALYSIS (Ollama / Granite)
# ======================================================

def get_ai_analysis(result_data, floor_label):
    """Get AI-powered analysis from Granite model via Ollama"""
    
    area = result_data["input"]["built_up_area"]
    floors = result_data["input"]["floors"]
    timeline_months = result_data["timeline"]["months"]
    
    w = result_data["workers"]
    m = result_data["materials"]
    c = result_data["costs"]
    
    schedule_str = ""
    for phase in result_data["weekly_plan"]:
        schedule_str += f"- Week {phase['week']}: {phase['phase']} ({', '.join(phase['activities'])})\n"
        
    prompt = f"""You are an expert civil engineer and construction planner.

Analyze the following construction project data and provide insights.

Project Data:
Built-up Area: {area} sq yards
Floors: {floor_label} ({floors} floors)
Estimated Timeline: {timeline_months} months

Calculated Results:
Workers Required:
- Masons: {w['masons']}
- Helpers: {w['helpers']}
- Steel Workers: {w['steel_workers']}
- Carpenters: {w['carpenters']}
- Supervisors: {w['supervisors']}

Materials:
- Cement: {m['cement_bags']} bags
- Steel: {m['steel_tons'] * 1000} kg
- Sand: {m['sand_tons']} tons
- Water: {m['water_liters']} liters

Costs:
- Labor Cost: {c['labor_cost']}
- Material Cost: {c['material_cost']}
- Overhead Cost: {c['overhead']}
- Total Cost: {c['total_cost']}

Construction Timeline:
{schedule_str}

Provide:

1. Project Overview (2 sentences)
2. Key Risks (3 bullet points)
3. Cost Optimization Suggestions (3 bullet points)
4. Quality Control Recommendations (3 bullet points)"""

    try:
        response = requests.post(OLLAMA_URL, json={
            "model": MODEL_ID,
            "prompt": prompt,
            "system": "You are an expert construction planner. Be concise and practical.",
            "stream": False,
            "options": {"temperature": 0.7, "num_predict": 512}
        }, timeout=60)

        if response.status_code == 200:
            return {
                "available": True,
                "analysis": response.json().get("response", ""),
                "model": MODEL_ID
            }
    except Exception:
        pass

    return {
        "available": False,
        "analysis": f"""1. Project Overview
This is a {floor_label} building project covering {area} sq yards per floor, requiring significant material and labor coordination over {timeline_months} months. The {w['total_workers']} workers and structured scheduling ensure steady progress.

2. Key Risks
- Weather delays, especially during foundation and structural phases.
- Material price fluctuations for cement and steel over the {timeline_months}-month period.
- Labor shortages affecting the critical path schedule.

3. Cost Optimization Suggestions
- Procure steel and cement in bulk to lock in current market prices.
- Optimize worker allocation during overlapping phases.
- Minimize material wastage through strict on-site supervision.

4. Quality Control Recommendations
- Enforce strict curing periods for concrete work.
- Perform thorough inspections of steel reinforcement before pouring slabs.
- Ensure proper levelling and alignment during brickwork and plastering.""",
        "model": "fallback"
    }


# ======================================================
# ROUTES
# ======================================================

@app.route("/")
def index():
    return render_template("index.html")


@app.route("/api/calculate", methods=["POST"])
def api_calculate():
    """Main calculation endpoint"""
    try:
        data = request.json

        # Validate inputs
        built_up_area = float(data.get("built_up_area", 0))
        floors = data.get("floors", "G+2")
        days = int(data.get("days", 0)) if data.get("days") else None
        workers = int(data.get("workers", 0)) if data.get("workers") else None
        daily_wage = float(data.get("daily_wage", 500)) if data.get("daily_wage") else 500
        cost_per_sq_yard = float(data.get("cost_per_sq_yard", 1500)) if data.get("cost_per_sq_yard") else 1500

        if built_up_area <= 0:
            return jsonify({"error": "Built-up area must be positive"}), 400

        # Create calculator
        calc = ConstructionCalculator(
            built_up_area=built_up_area,
            floors=floors,
            days=days,
            workers=workers,
            daily_wage=daily_wage,
            cost_per_sq_yard=cost_per_sq_yard
        )

        result = calc.get_full_result()

        # Add AI analysis
        floor_label = str(floors) if isinstance(floors, str) else f"G+{floors - 1}"
        result["ai_analysis"] = get_ai_analysis(result, floor_label)

        return jsonify(result), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/health")
def health():
    return jsonify({
        "status": "healthy",
        "system": "Construction Planning System",
        "supabase": "connected" if SUPABASE_URL else "not configured",
        "timestamp": time.time()
    })


@app.route("/api/save", methods=["POST"])
def save_project():
    """Save calculation results to Supabase"""
    try:
        supabase = get_supabase()
        if not supabase:
            return jsonify({"success": True, "data": []}), 201
            
        data = request.json
        response = supabase.table("projects").insert(data).execute()
        return jsonify({"success": True, "data": response.data}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/projects", methods=["GET"])
def get_projects():
    """Fetch all saved projects from Supabase"""
    try:
        supabase = get_supabase()
        if not supabase:
            return jsonify({"projects": []}), 200
            
        response = supabase.table("projects").select("*").order("created_at", desc=True).execute()
        return jsonify({"projects": response.data}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/projects/<project_id>", methods=["GET"])
def get_project(project_id):
    """Fetch a single project by ID from Supabase"""
    try:
        supabase = get_supabase()
        if not supabase:
            return jsonify({"error": "Database not configured"}), 404
            
        response = supabase.table("projects").select("*").eq("id", project_id).single().execute()
        return jsonify({"project": response.data}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/projects/<project_id>", methods=["DELETE"])
def delete_project(project_id):
    """Delete a project from Supabase"""
    try:
        supabase = get_supabase()
        if not supabase:
            return jsonify({"success": True}), 200
            
        response = supabase.table("projects").delete().eq("id", project_id).execute()
        return jsonify({"success": True}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ======================================================
# MAIN
# ======================================================

if __name__ == "__main__":
    print("🚀 Construction Planning System running")
    print("🔗 http://localhost:5000")
    print("❤️ Health: /health")
    app.run(host="0.0.0.0", port=5000, debug=True)
