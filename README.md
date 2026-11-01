# 🚚 Logistics Tracking — Backend

> **WebSocket tracking <1s + REST routing split — fix for 30s map freeze on warehouse tablets.**

**Frontend:** https://github.com/dedikusniadi2026/logistics-tracking-fe  
**Portfolio:** https://www.dedikusniadi.my.id/

---

### 🔥 Why This BE Exists

Frontend complained map froze when routing service slow — because tracking + routing were in one WebSocket.

**Fix:**
- `WS /ws/tracking` → live location only (<1s)
- `REST /api/parcels` → routing, history, auth (doesn't block live map)

This is sanitized rebuild — no company code, mock data by default.

---

### ✅ What I Fixed → Result

- 30s → <1s live tracking (WS split + Web Worker on FE)
- Routing slow doesn't block map (REST separate)
- 6 squads conflict → NestJS modular + Zustand per domain on FE

---

### 🏗 Architecture

```
Edge CDN / WAF
   ↓
API Gateway (REST + WS)
   ├─ Tracking Service (NestJS WebSocket Gateway)
   ├─ Routing Service (REST)
   └─ PostgreSQL + Redis cache
        ↓
Frontend: React SPA → Web Worker (tracking) + Leaflet (lazy)
```

---

### 🚀 How to Run

```bash
git clone https://github.com/dedikusniadi2026/logistics-tracking-be.git
cd logistics-tracking-be
npm install
npm run start:dev
# BE: http://localhost:3000
# WS: ws://localhost:3000/ws/tracking
```

**With mock data (no DB needed for portfolio demo):**
```bash
MODE=mock npm run start:dev
```

**With free Postgres (Neon.tech):**
```bash
DATABASE_URL=postgresql://user:pass@ep-xxx.neon.tech/db?sslmode=require npm run start:dev
```

**.env.example**
```
MODE=mock
PORT=3000
DATABASE_URL=postgresql://dev:dev@localhost:5432/logistics
```

---

### 📂 Key Files To Review (30 seconds)

- `src/tracking/tracking.gateway.ts` - WS split, live <1s
- `src/parcels/parcels.service.ts` - mock vs DB mode
- `docker-compose.yml` - FE + BE + Postgres local

---

### 🛠 Stack

NestJS, TypeScript, PostgreSQL, TypeORM, WebSocket Gateway, Docker

---

### 👤 Author — Open for Remote

**Dedi Kusniadi — Senior Frontend Engineer | 13+ Years**  
Ex-Axiata Digital Labs (2020-2023)

- Portfolio: https://www.dedikusniadi.my.id/
- LinkedIn: https://www.linkedin.com/in/dedi-kusniadi/
- Email: dedikusniadi.bisnis@gmail.com

> Note: Personal rebuild for portfolio. No proprietary code or real data.

---

**For HRD / Hiring Manager:** This BE shows how I split concerns to fix live tracking freeze. FE repo shows the other half. I can walk through both in 15 min interview.
