# ATS.OPTIMA | AI-Powered MERN ATS Resume Analyzer Platform

ATS.Optima is a production-level, futuristic Software-as-a-Service (SaaS) platform built with the MERN stack (MongoDB, Express, React, Node.js), Google Gemini AI embeddings, Pinecone Vector database indexes, and advanced Retrieval-Augmented Generation (RAG) pipelines. It performs deep semantic comparison audits between candidates' resumes and job descriptions.

---

## 🚀 Architectural Blueprint

```
                      +---------------------------------------+
                      |         React / Vite Client           |
                      | (Futuristic Neo-Glassmorphism UI)     |
                      +-------------------|-------------------+
                                          |
                                    HTTPS REST API
                                          |
                                          v
                      +---------------------------------------+
                      |       Node.js / Express Server        |
                      +---|---------------|---------------|---+
                          |               |               |
               Multer / PDF Extraction    |         Mongoose ODM
                          |               |               |
                          v               v               v
                +-------------+    +-------------+  +-------------+
                | Parser      |    | Vector RAG  |  | MongoDB     |
                | (PDF/Docx)  |    | Engine      |  | Atlas DB    |
                +-------------+    +------|------+  +-------------+
                                          |
                              +-----------+-----------+
                              |                       |
                              v                       v
                      +---------------+       +---------------+
                      | Gemini AI LLM |       | Pinecone DB / |
                      | (Embeddings)  |       | Local Cosine  |
                      +---------------+       +---------------+
```

---

## ⚡ Key SaaS Capacities

1. **Dual-Mode AI Operations**:
   - **Sandbox Mode (Out-of-the-Box)**: Computes accurate mathematical cosine similarity vectors locally in JavaScript using term frequencies (TF-IDF matrices) and applies deep parsing heuristics. No API keys are required to test!
   - **Production Mode**: Integrates live Gemini generative models (`gemini-1.5-flash` and `text-embedding-004`) alongside remote Pinecone database instances.
2. **Deep Scans & Audit breakdown (40-30-15-10-5 Equation)**:
   - **40% Keywords density**: Keyword match frequency counts.
   - **30% Semantic similarity**: Embedding vector cosine alignments.
   - **15% Project impact**: Action verb counts and quantified metric evaluations.
   - **10% Formatting rules**: Contact information and section headers checklists.
   - **5% Experience duration**: Seniority levels overlap calculations.
3. **Interactive AI Copilot Panel**:
   - **AI Bullet Point Optimizer**: Input sentences and receive high-impact optimizations modeled on Google's X-Y-Z formula.
   - **Simulated Interview Prep**: HR and system design questioning sets with expandable, STAR-formatted suggestions.
   - **Speech TTS Simulator**: Click voice prompts to have questions read aloud via Web Speech Synthesis APIs!
4. **Recruiter Panel**:
   - **Batch parser**: Upload up to 15 resumes simultaneously.
   - **Leaderboard sheets**: Dynamically ranks applicants based on aggregate suitability indexes.

---

## 📂 Codebase Directory Layout

```
ATS/
├── backend/
│   ├── config/          # Database connection handlers
│   ├── controllers/     # Authentication and profile routing stubs
│   ├── middleware/      # Protected JWT checks and API limiters
│   ├── models/          # MongoDB Schema blueprints (User, Resume, Report)
│   ├── services/        # Parsers, Scoring, RAG systems, Vector models
│   ├── routes/          # Express REST endpoint maps
│   ├── server.js        # Main Entry Point bootstrapping Express
│   ├── package.json     
│   └── Dockerfile
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/  # Sleek retreat sidebar navigations
│   │   ├── context/     # Global state handlers (Auth contexts)
│   │   ├── pages/       # Glassmorphic views (Dashboard, Recruiter, Upload)
│   │   ├── services/    # Axios API central clients
│   │   ├── App.jsx      
│   │   ├── main.jsx
│   │   └── index.css    # Neo-glassmorphic styling tokens
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── Dockerfile
├── docker-compose.yml   # Multi-service integration composition
└── README.md
```

---

## 🛠️ Step-by-Step Installation Guides

### Local Execution (Prerequisites: Node.js >= 18, MongoDB Atlas)

#### 1. Setup Backend Node Server
```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create environment configuration file from model
cp .env.example .env
```
Update `.env` with your MongoDB URI. Live keys (Gemini, Pinecone) are optional. If undefined, Sandbox Mode activates instantly.

### Gemini / Google AI Studio setup
If you want live LLM responses instead of sandbox fallbacks:

1. Create a Gemini API key in Google AI Studio or the Google Cloud Generative Language API console.
2. Enable the Generative Language API on that project.
3. Paste the key into `backend/.env` as `GEMINI_API_KEY=...`.
4. Validate it from `backend` with:
```bash
node scripts/check_genai_key.js
```

If the key is invalid, the backend will stay up and return sandbox suggestions instead of failing the request.

#### 2. Run Backend
```bash
# Start server in development mode
npm run dev
```
The server spins up cleanly on `http://localhost:5000`.

#### 3. Setup Frontend React Client
```bash
# In another terminal window, navigate to frontend
cd frontend

# Install package sets
npm install

# Launch development environment
npm run dev
```
The application loads on `http://localhost:3000`.

---

## 🐳 Docker Orchestration Setup

Spins up MongoDB database alongside frontend and backend containers automatically:

```bash
# From workspace root directory, run build
docker-compose up --build
```
Containers will map ports:
- Frontend Client: `http://localhost:3000`
- Backend API: `http://localhost:5000`
- MongoDB: `mongodb://localhost:27017`

---

## 🛡️ Premium UI Aesthetics

The user interface uses a custom **Neo-Glassmorphic Dark Theme** engineered with:
- Outfit typography hierarchy
- Glowing radial backgrounds
-retractable sidebars and scanning animation visualizers
- Active path gradients and smooth card translations.
- Light/Dark toggling switches built directly in state.

---

## ✉️ Security and Rate Limiting

- Secure passwords storage using dynamic salt hashes (`bcryptjs`).
- State-preserving token authorisations (`jsonwebtoken`).
- Requests shielding via API rate limiters (`express-rate-limit`).
