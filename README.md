# BuildWise: AI-Powered Construction Planning System

BuildWise is an intelligent project planning platform that leverages IBM's **Granite 3.3 2B AI model** (via Ollama) to provide comprehensive construction project analysis and planning recommendations. 

The platform addresses the challenge of accurate construction estimation by delivering AI-powered insights, detailed architectural blueprints, resource allocation, cost analysis, and week-by-week construction schedules.

![BuildWise Dashboard Showcase](https://via.placeholder.com/1000x500?text=BuildWise+Dashboard)

## 🌟 Key Features

* **AI-Powered Project Estimation**: Analyzes project parameters (built-up area, floors, timeline constraints) to generate accurate worker requirements, cost breakdowns, and material estimations.
* **Architectural Blueprint Generation**: Dynamically creates professional architectural blueprints with room layouts, dimensions, and realistic visual grids corresponding to the construction scale.
* **Cost Analysis & Budget Planning**: Delivers detailed cost breakdowns including labor, materials, and overhead. Offers customizable wage rates and localized material costs.
* **Detailed Construction Schedule**: Generates comprehensive week-by-week plans including all phases from site prep to final finishing.
* **Persistent Project History**: Safely saves all generated project plans, blueprints, and data to your dashboard for future reference using Supabase.

## 🏗️ Architecture & Technologies

BuildWise is a modern, full-stack application separating a robust AI backend from a highly responsive, modern frontend interface:

### Frontend
* **Next.js & React**: Modern, responsive frontend application framework.
* **Tailwind CSS & Glassmorphism**: Premium dark-mode user interface with dynamic CSS-grid blueprints and beautiful neon accents.

### Backend
* **Flask**: Lightweight Python web framework processing routing and calculation logic.
* **Ollama (IBM Granite 3.3 2B)**: Local LLM runtime used for intelligent text generation, ensuring high-quality planning advice without external cloud API dependencies or costs.
* **Supabase**: PostgreSQL database and API service for securely storing your construction project history.

## 🚀 Getting Started

### Prerequisites
* **Node.js** (v18+)
* **Python** (3.8+)
* **Ollama**: Download and install from [ollama.ai](https://ollama.ai)
* **Supabase Account**: Setup your PostgreSQL database keys

### 1. Setup the AI Model
Ensure Ollama is running, then pull the required Granite model:
```bash
ollama pull granite:3.3-2b
```

### 2. Backend Setup (Flask)
```bash
cd backend
python -m venv venv
source venv/Scripts/activate  # On Windows
pip install -r requirements.txt
```

Create a `.env` file in the `/backend` directory with your Supabase credentials:
```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_anon_key
```

Run the backend server:
```bash
python app.py
```
*(Runs on http://localhost:5000)*

### 3. Frontend Setup (Next.js)
```bash
cd frontend
npm install
npm run dev
```
*(Runs on http://localhost:3000)*

---

## 💡 Scenarios Supported
* **Custom Timeline Planning:** Calculate the required workforce, material adjustments, and cost implications for rendering an accelerated timeline.
* **Resource Cost Projections:** Understand cost structures for multi-story buildings, calculating cost-per-sq-yard alongside overhead and contingencies.
* **Activity Dependencies:** See the exact worker flow required for electrical, plumbing, painting, and finalizing tasks.

## 📄 License
Mit License.
