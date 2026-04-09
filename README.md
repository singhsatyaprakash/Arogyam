# Arogyam

## Live Deployment

- Frontend: [https://arogyam-swasthya.onrender.com](https://arogyam-swasthya.onrender.com)
- Backend: [https://arogyamserver.onrender.com](https://arogyamserver.onrender.com)

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

## Quick Start

### Prerequisites

- Node.js 18+
- npm
- MongoDB database (Atlas/local)

### 1. Clone the Repository

```bash
git clone https://github.com/singhsatyaprakash/Arogyam.git
cd Arogyam
```

### 2. Install Dependencies

Install backend dependencies:

```bash
cd server
npm install
```

Install frontend dependencies:

```bash
cd ../client
npm install
```

### 3. Configure Environment Variables

Create server env file at `server/.env`:

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

Create client env file at `client/.env`:

```env
VITE_SOCKET_URL=http://localhost:3000
VITE_API_URL=http://localhost:3000
```

### 4. Run the Application

Start backend in terminal 1:

```bash
cd server
npm start
```

Start frontend in terminal 2:

```bash
cd client
npm run dev
```

Open `http://localhost:5173` in your browser.

## Notes

- Backend default URL: `http://localhost:3000`
- Frontend default URL: `http://localhost:5173`
- Keep real secrets only in local `.env` files
