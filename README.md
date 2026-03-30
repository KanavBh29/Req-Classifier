# ReqTrace — ML-Based Requirement Classification & Traceability Tool

A production-ready full-stack application for software teams to **analyze**, **classify**, and **trace** requirements using machine learning.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔐 Auth | JWT-secured signup/login with bcrypt password hashing |
| 🤖 ML Classification | TF-IDF + Logistic Regression (FR / NFR) with confidence scores |
| ⚠️ Ambiguity Detection | NLP-powered detection of vague terms with scoring |
| 📊 Dashboard | Real-time KPI cards, pie/bar/line charts |
| ⬆️ Upload | Drag & drop .txt file upload or manual entry |
| ⟁ Traceability | Requirement → Test Case matrix with visual grid |
| 🧪 Test Cases | Create/manage test cases with status tracking |
| 📈 Analytics | Radar chart, trend lines, coverage metrics |
| 📋 Reports | Export SRS, Traceability, KPI as JSON/CSV |
| 🔴 Real-time | Socket.io live updates on upload/classification/traceability |
| 🌓 Theme | Dark/light theme toggle |

---

## 🏗️ Architecture

```
reqtrace/
├── backend/          # Node.js + Express + MongoDB
│   ├── controllers/  # Business logic
│   ├── models/       # Mongoose schemas
│   ├── routes/       # API routes
│   ├── middleware/   # Auth, error handling
│   ├── sockets/      # Socket.io setup
│   └── config/       # DB connection, seed
│
├── ml/               # Python FastAPI ML service
│   ├── api.py        # FastAPI endpoints
│   ├── inference.py  # Classification + ambiguity
│   ├── train_model.py# TF-IDF + LogReg training
│   └── model/        # Saved .pkl model
│
└── frontend/         # React + Vite + TailwindCSS + DaisyUI
    └── src/
        ├── pages/    # Route pages
        ├── components/
        ├── context/  # Auth, Socket, Theme
        └── services/ # API layer
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Python 3.10+

---

### 1. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret

# Run server
npm run dev       # Development
npm start         # Production

# Seed demo data
npm run seed
# → demo@reqtrace.com / demo1234
```

---

### 2. ML Service Setup

```bash
cd ml

# Create virtual environment
python -m venv venv
source venv/bin/activate      # Linux/Mac
# venv\Scripts\activate.bat   # Windows

# Install dependencies
pip install -r requirements.txt

# Download spaCy model
python -m spacy download en_core_web_sm

# Train the ML model (first time only)
python train_model.py

# Start FastAPI service
uvicorn api:app --host 0.0.0.0 --port 8000 --reload
```

---

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
# → http://localhost:5173

# Production build
npm run build
```

---

## 🔑 Environment Variables

### Backend `.env`

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/reqtrace
JWT_SECRET=your_super_secret_jwt_key_min_32_chars
JWT_EXPIRE=7d
ML_SERVICE_URL=http://localhost:8000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

---

## 📡 API Reference

### Authentication
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/signup` | Register new user |
| POST | `/api/auth/login` | Login (returns JWT) |
| GET | `/api/auth/me` | Get current user |

### Requirements
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/requirements/upload` | Upload & classify requirements |
| GET | `/api/requirements` | List with pagination/filtering |
| DELETE | `/api/requirements/:id` | Delete requirement |
| POST | `/api/requirements/classify` | Classify single text |

### Traceability
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/traceability/link` | Create req → test link |
| GET | `/api/traceability` | Get full matrix |
| PUT | `/api/traceability/:id` | Update link status |
| DELETE | `/api/traceability/:id` | Remove link |

### Test Cases
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/testcases` | Create test case |
| GET | `/api/testcases` | List test cases |
| PUT | `/api/testcases/:id` | Update test case |
| DELETE | `/api/testcases/:id` | Delete test case |

### Analytics & Reports
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/kpi` | KPI metrics |
| GET | `/api/reports/srs` | SRS report data |
| GET | `/api/reports/traceability` | Traceability report |

### ML Service (Port 8000)
| Method | Endpoint | Description |
|---|---|---|
| POST | `/classify` | Classify FR/NFR |
| POST | `/analyze` | Full analysis (classify + ambiguity) |
| POST | `/ambiguity` | Detect ambiguous terms |
| POST | `/batch` | Batch analyze multiple texts |

---

## 🤖 ML Pipeline

```
Input Text
    ↓
Preprocessing (lowercase, strip, normalize)
    ↓
TF-IDF Vectorizer (ngram 1-3, 5000 features)
    ↓
Logistic Regression Classifier
    ↓
{ type: "FR"|"NFR", confidence: 0.92 }
    +
Ambiguity Detection (keyword matching)
    ↓
{ ambiguityFlag: true, ambiguousTerms: ["fast", "efficient"] }
```

The model is trained on ~60 labeled requirement examples. Fallback rule-based classification is used if the ML service is unavailable.

---

## 🔴 Socket.io Events

| Event | Direction | Trigger |
|---|---|---|
| `requirements:uploaded` | Server → Client | New requirements uploaded |
| `traceability:linked` | Server → Client | New link created |
| `traceability:updated` | Server → Client | Link status changed |
| `kpi:refresh` | Server → Client | KPI data changed |
| `join:room` | Client → Server | User connects |

---

## 🛡️ Security

- JWT authentication on all protected routes
- bcrypt password hashing (salt rounds: 12)
- Helmet security headers
- Rate limiting (200 req/15min, 20 auth/15min)
- MongoDB query sanitization (mongo-sanitize)
- Input validation via express-validator
- CORS restricted to frontend origin

---

## 🌐 Deployment

### Docker (recommended)

```bash
# Copy and edit environment
cp backend/.env.example backend/.env

# Build and run
docker-compose up --build
```

### Manual Production

```bash
# Backend
cd backend && npm start

# ML Service
cd ml && uvicorn api:app --host 0.0.0.0 --port 8000

# Frontend (build & serve)
cd frontend && npm run build
# Serve dist/ with nginx or similar
```

### MongoDB Atlas
Replace `MONGODB_URI` with your Atlas connection string:
```
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/reqtrace
```

---

## 🎨 Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 18, Vite, TailwindCSS, DaisyUI, Recharts |
| Backend | Node.js, Express.js, MongoDB, Mongoose |
| Auth | JWT, bcryptjs |
| Real-time | Socket.io |
| ML Service | Python, FastAPI, scikit-learn, TF-IDF, LogReg |
| UI Theme | Dark/light, glassmorphism, Syne font |

---

## 📝 Demo

After seeding, login with:
- **Email**: demo@reqtrace.com
- **Password**: demo1234

This creates 12 sample requirements (FR + NFR), 6 test cases, and 4 traceability links.
