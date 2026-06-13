# Xeno Copilot — AI-Native Marketing CRM

Xeno Copilot is a full-stack marketing CRM that allows you to upload customer data, segment audiences using natural language (AI-powered), generate personalized marketing messages (AI-powered), simulate message delivery across channels, and track real-time analytics.

## Tech Stack

- **Frontend:** React, Vite, Tailwind CSS v4, React Router, Recharts
- **Backend:** Node.js, Express, Prisma ORM, PostgreSQL (Neon)
- **AI Integration:** Hugging Face Inference API (`mistralai/Mistral-7B-Instruct-v0.3`)
- **Services:** Separate Channel Service for delivery simulation

## Architecture

The project is split into three separate parts:

1. `frontend/` - React application
2. `Backend/` - Core CRM REST API
3. `channel-service/` - Microservice simulating WhatsApp/SMS/Email delivery and sending webhooks back to the CRM.

## Getting Started

### Prerequisites
- Node.js (v18+)
- Postgres Database (Neon recommended)
- Hugging Face API Key (for AI features)

### 1. Backend Setup

```bash
cd Backend
npm install
```

Create `.env` file from example:
```bash
cp .env.example .env
```
Update `.env` with your `DATABASE_URL`, `JWT_SECRET`, and `HUGGINGFACE_API_KEY`.

Push the schema to the database and generate Prisma client:
```bash
npx prisma db push
npx prisma generate
```

Start the backend:
```bash
npm run dev
# Runs on http://localhost:3000
```

### 2. Channel Service Setup

```bash
cd channel-service
npm install
```

Create `.env` file (defaults are fine for local testing):
```bash
cp .env.example .env
```

Start the service:
```bash
npm run dev
# Runs on http://localhost:3001
```

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:5173
```

## Features & Usage

1. **Upload Data:** Go to "Upload Data". Upload a `customers.csv` and then an `orders.csv`.
2. **Build Audience:** Go to "Audience Builder". Type a natural language query like: *"Find customers from Mumbai who spent more than ₹5000"*. AI will extract the filters and query the database.
3. **Generate Campaign:** From the builder, click "Create Campaign". Use the AI button to automatically write a personalized message template.
4. **Analytics:** Once launched, head to "Analytics". The CRM pushes requests to the Channel Service, which simulates a delivery flow (`sent -> delivered -> opened -> clicked` or `failed`) and fires webhook receipts back to the CRM. Watch the metrics update in real-time.

## Sample CSV Formats

**customers.csv**
```csv
name,email,phone,city
Alice,alice@example.com,1234567890,Mumbai
Bob,bob@example.com,0987654321,Delhi
```

**orders.csv**
```csv
customerEmail,amount,date
alice@example.com,6000,2023-10-01
bob@example.com,2000,2023-10-05
```