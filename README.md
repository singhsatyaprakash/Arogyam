# Arogyam

Arogyam is a healthcare web platform focused on connecting patients and doctors through appointment booking, chat, and video consultation workflows.

## Author

SatyaPrakashSingh

## Overview

- Client: React + Vite application for patient and doctor experiences
- Server: Node.js/Express backend with routes, controllers, models, and socket services
- Core capabilities: appointments, chat, and video consultation support

## Repository Structure

- `client/` - Frontend source code and UI components
- `server/` - Backend APIs, business logic, and realtime services
- `Documentation.pdf` - Detailed project documentation
- `HLDImage.png` - High-level design architecture diagram

## Documentation

📄 [View Project Documentation (PDF)](Documentation.pdf)

## High Level Design (HLD)

Architecture preview:

<p align="center">
	<img src="HLDImage.png" alt="Arogyam High Level Design" width="520" />
</p>

Open full image: [HLDImage.png](HLDImage.png)

## Getting Started

## Prerequisites

- Node.js 18+ installed
- npm installed

## Environment Variables

Create these files before running the app.

### Server env file

Create `server/.env` with:

```env
PORT=3000
MONGODB_URI=your_mongodb_connection_string
FRONTEND_URL=http://localhost:5173
JWT_SECRET=your_jwt_secret

CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=your_admin_password
```

### Client env file

Create `client/.env` with:

```env
VITE_SOCKET_URL=http://localhost:3000
VITE_API_URL=http://localhost:3000
```

## Run Locally

1. Install backend dependencies:

```bash
cd server
npm install
```

2. Start backend server:

```bash
npm start
```

3. Open a new terminal and install frontend dependencies:

```bash
cd client
npm install
```

4. Start frontend app:

```bash
npm run dev
```

5. Open the URL shown by Vite (usually `http://localhost:5173`).

## Notes

- Backend runs on `http://localhost:3000`
- Frontend runs on `http://localhost:5173`
- Do not commit real secrets in `.env` files
