
# DoctorConnect Backend (Node.js + Express + MongoDB)

REST API + Socket.IO backend for DoctorConnect.

## Tech stack

- Node.js + Express
- MongoDB + Mongoose
- JWT auth (`Authorization: Bearer <token>`)
- Socket.IO (realtime chat + WebRTC signaling + notifications)

## Project structure

```
backend/
	server.js
	package.json
	Config/
		db.js
	Controllers/
		adminController.js
		appointmentContoller.js
		doctorController.js
		patientController.js
	middlewares/
		adminMiddleware.js
		appointmentMiddleware.js
		doctorMiddleware.js
		patientMiddleware.js
	Models/
		appointment.model.js
		bookingHistoryDoctorModel.js
		CallSchedule.js
		chatConnection.model.js
		ChatMessage.js
		ChatRoom.js
		doctor.model.js
		patient.model.js
	Routes/
		adminRoutes.js
		appointmentRoutes.js
		callRoutes.js
		chatRoutes.js
		doctorRoutes.js
		patientRoutes.js
	Services/
		socket.js
```

## Setup

### 1) Install dependencies

```bash
npm install
```

### 2) Environment variables

Create `backend/.env`:

```env
# Mongo
MONGODB_URI=mongodb://127.0.0.1:27017/doctorconnect
# or MONGO_URI=...

# Auth
JWT_SECRET=change_me

# Server
PORT=3000
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

### 3) Start the server

```bash
node server.js
```

Server prints:

- API health check: `GET http://localhost:<PORT>/api/health`
- Allowed CORS origin: `FRONTEND_URL` (defaults to `http://localhost:5173`)

## Database configuration

MongoDB connection is configured in `Config/db.js`:

- Reads `MONGODB_URI` first, then `MONGO_URI`
- Trims wrapping quotes from the URI
- Connects using `mongoose.connect(uri)`

If neither env var exists, the server logs: `MONGODB_URI / MONGO_URI not defined (checked backend/.env)`.

## Authentication

Protected endpoints require a JWT token in the request header:

```http
Authorization: Bearer <token>
```

Tokens are returned from:

- `POST /doctors/login`
- `POST /patients/login`

## Base URLs

Default local base URL:

- `http://localhost:3000`

Routes are mounted as:

- `/doctors` (doctor features)
- `/patients` (patient features)
- `/appointments` (search/availability/booking + chat booking + doctor-side appointment ops)
- `/api/chat` (prototype REST chat)
- `/api/calls` (prototype REST call schedule)

## Health check

### GET `/api/health`

Response:

```json
{ "ok": true, "ts": "2026-02-20T10:20:30.000Z" }
```

---

# REST API

## Doctor API (`/doctors`)

### POST `/doctors/register`

Registers a doctor.

Request body:

```json
{
	"name": "Dr. Alice",
	"email": "alice@example.com",
	"phone": "9999999999",
	"password": "Pass@123",
	"specialization": "Cardiology",
	"experience": 6,
	"qualifications": ["MBBS", "MD"],
	"languages": ["English", "Hindi"],
	"chatFee": 100,
	"voiceFee": 150,
	"videoFee": 200,
	"fromTime": "09:00",
	"toTime": "17:00"
}
```

Success response (201):

```json
{
	"success": true,
	"message": "Doctor registered successfully",
	"data": {
		"doctor": {
			"_id": "65d4...",
			"name": "Dr. Alice",
			"email": "alice@example.com",
			"phone": "9999999999",
			"specialization": "Cardiology",
			"experience": 6,
			"consultationFee": { "chat": 100, "voice": 150, "video": 200 },
			"availability": { "from": "09:00", "to": "17:00" },
			"isVerified": false,
			"isOnline": false,
			"role": "doctor",
			"createdAt": "2026-02-20T10:20:30.000Z",
			"updatedAt": "2026-02-20T10:20:30.000Z"
		},
		"token": "<jwt>",
		"redirectTo": "/doctor/dashboard"
	}
}
```

Common error responses:

- 400 `Doctor with this email already exists`
- 400 `Please fill all required fields`

### POST `/doctors/login`

Request body:

```json
{ "email": "alice@example.com", "password": "Pass@123" }
```

Success response (200):

```json
{
	"success": true,
	"message": "Login successful",
	"data": {
		"doctor": { "_id": "65d4...", "email": "alice@example.com", "role": "doctor" },
		"token": "<jwt>",
		"redirectTo": "/doctor/dashboard"
	}
}
```

### GET `/doctors/available`

Returns *online + verified* doctors. Optional query:

- `specialization` (string)

Example:

`GET /doctors/available?specialization=cardio`

Response:

```json
{
	"success": true,
	"data": [
		{
			"_id": "65d4...",
			"name": "Dr. Alice",
			"specialization": "Cardiology",
			"experience": 6,
			"rating": 0,
			"profileImage": "",
			"consultationFee": { "chat": 100, "voice": 150, "video": 200 }
		}
	]
}
```

### GET `/doctors/profile` (protected)

Headers:

```http
Authorization: Bearer <doctorToken>
```

Response:

```json
{ "success": true, "data": { "_id": "65d4...", "email": "alice@example.com" } }
```

### PUT `/doctors/profile` (protected)

Updates allowed fields on the doctor profile.

Notes from implementation:

- `email`, `_id`, `password` are ignored if provided.
- To change password, send `currentPassword` + `newPassword`.

Example request body:

```json
{
	"bio": "Heart specialist",
	"languages": ["English", "Hindi"],
	"currentPassword": "Pass@123",
	"newPassword": "Pass@456"
}
```

Success response:

```json
{ "success": true, "message": "Profile updated successfully", "data": { "_id": "65d4..." } }
```

### POST `/doctors/slots` (protected)

Creates appointment slots for a doctor. Two body formats are supported.

#### A) Explicit slots

```json
{
	"slots": [
		{ "date": "2026-03-01", "time": "10:00", "type": "video" },
		{ "date": "2026-03-01", "time": "10:15", "type": "video" }
	]
}
```

#### B) Generate slots in a date range

```json
{
	"fromDate": "2026-03-01",
	"toDate": "2026-03-07",
	"times": ["10:00", "10:15", "10:30"],
	"type": "video",
	"skipWeekends": true
}
```

Success response (201):

```json
{
	"success": true,
	"message": "Slots created successfully",
	"data": { "created": 12 }
}
```

### GET `/doctors/:doctorId/slots`

Returns available slot calendar from `Doctor.slots` for a date range.

Query params:

- `from` (optional, `YYYY-MM-DD`, default: today)
- `to` (optional, `YYYY-MM-DD`, default: from + 30 days)
- `type` (optional, `video|chat|voice|in-person`)

Example:

`GET /doctors/65d4.../slots?from=2026-03-01&to=2026-03-03&type=video`

Response:

```json
{
	"success": true,
	"data": {
		"doctorId": "65d4...",
		"from": "2026-03-01",
		"to": "2026-03-03",
		"type": "video",
		"days": [
			{
				"date": "2026-03-01",
				"slots": [
					{ "_id": "65d4...", "date": "2026-03-01T00:00:00.000Z", "time": "10:00", "type": "video", "isBooked": false }
				]
			}
		]
	}
}
```

### GET `/doctors/all` (protected)

Lists doctors with pagination/search (currently protected by doctor auth in this codebase).

Query params:

- `page` (default `1`)
- `limit` (default `10`)
- `search` (default empty)

Example:

`GET /doctors/all?page=1&limit=10&search=cardio`

Response:

```json
{
	"success": true,
	"data": [{ "_id": "65d4...", "email": "alice@example.com" }],
	"pagination": { "page": 1, "limit": 10, "total": 1, "pages": 1 }
}
```

### GET `/doctors/test`

Response:

```json
{ "success": true, "message": "Doctor routes are working!", "timestamp": "2026-02-20T10:20:30.000Z" }
```

### GET `/doctors/:doctorId`

Public-safe doctor details.

Response:

```json
{ "success": true, "data": { "_id": "65d4...", "name": "Dr. Alice" } }
```

---

## Patient API (`/patients`)

### POST `/patients/register`

Request body:

```json
{
	"name": "Bob",
	"email": "bob@example.com",
	"phone": "8888888888",
	"password": "Pass@123",
	"age": 28
}
```

Success response (201):

```json
{
	"success": true,
	"message": "Patient registered",
	"data": {
		"patient": { "_id": "65d5...", "email": "bob@example.com", "role": "patient" },
		"token": "<jwt>",
		"redirectTo": "/patient/dashboard"
	}
}
```

### POST `/patients/login`

Request body:

```json
{ "email": "bob@example.com", "password": "Pass@123" }
```

Success response (200):

```json
{
	"success": true,
	"message": "Login successful",
	"data": {
		"patient": { "_id": "65d5...", "email": "bob@example.com" },
		"token": "<jwt>",
		"redirectTo": "/patient/dashboard"
	}
}
```

### GET `/patients/profile` (protected)

Headers:

```http
Authorization: Bearer <patientToken>
```

Response:

```json
{ "success": true, "data": { "_id": "65d5...", "email": "bob@example.com" } }
```

### POST `/patients/logout` (protected)

Response:

```json
{ "success": true, "message": "Logged out successfully" }
```

### GET `/patients/test`

Response:

```json
{
	"success": true,
	"message": "Patient routes are working!",
	"timestamp": "2026-02-20T10:20:30.000Z"
}
```

---

## Appointments API (`/appointments`)

> This router contains doctor search + availability + booking, plus chat booking and some doctor-side appointment operations.

### GET `/appointments/search`

Search doctors with optional filters:

- `specialization` (string)
- `minFee` (number)
- `maxFee` (number)
- `verified` (`true|false`)

Example:

`GET /appointments/search?specialization=Cardiology&minFee=50&maxFee=250&verified=true`

Response:

```json
{ "success": true, "data": [{ "_id": "65d4...", "name": "Dr. Alice", "consultationFee": { "video": 200 } }] }
```

### GET `/appointments/doctor/:id`

Returns public-safe doctor details (similar to `/doctors/:doctorId`).

Response:

```json
{ "success": true, "data": { "_id": "65d4...", "name": "Dr. Alice" } }
```

### GET `/appointments/availability`

Computes availability for **a single day** using booking history (`BookingHistoryDoctor`) and doctor configuration.

Query params:

- `doctorId` (Mongo ObjectId, required)
- `date` (`YYYY-MM-DD`, required)
- `type` (`video|chat|voice|in-person`, optional; default: `video`)

Example:

`GET /appointments/availability?doctorId=65d4...&date=2026-03-01&type=video`

Success response:

```json
{
	"success": true,
	"data": {
		"doctorId": "65d4...",
		"date": "2026-03-01",
		"type": "video",
		"slotDurationMinutes": 15,
		"slots": [
			{ "time": "09:00", "type": "video", "fee": 200 },
			{ "time": "09:15", "type": "video", "fee": 200 }
		],
		"bookedSlots": [
			{ "time": "09:30", "type": "video", "fee": 200, "bookingRef": "65d9..." }
		]
	}
}
```

### POST `/appointments/confirm-payment`

Books a **slot-based** appointment (video or in-person). This endpoint **rejects `type=chat`**.

Request body:

```json
{
	"patientId": "65d5...",
	"doctorId": "65d4...",
	"date": "2026-03-01",
	"type": "video",
	"time": "09:00"
}
```

Success response:

```json
{
	"success": true,
	"data": {
		"_id": "65d9...",
		"patient": "65d5...",
		"doctor": "65d4...",
		"type": "video",
		"scheduledAt": "2026-03-01T09:00:00.000Z",
		"date": "2026-03-01",
		"startTime": "09:00",
		"endTime": "09:15",
		"fee": 200,
		"status": "booked",
		"paymentStatus": "paid",
		"createdAt": "2026-02-20T10:20:30.000Z",
		"updatedAt": "2026-02-20T10:20:30.000Z"
	}
}
```

Possible errors:

- 409 `Slot already booked`
- 400 `Use /confirm-payment-chat endpoint for chat bookings`

### POST `/appointments/confirm-payment-chat`

Creates a **chat connection** (valid for 10 days) instead of booking a calendar slot.

Request body:

```json
{ "patientId": "65d5...", "doctorId": "65d4...", "type": "chat" }
```

Success response:

```json
{
	"success": true,
	"message": "Chat connection created",
	"data": {
		"_id": "65da...",
		"patient": "65d5...",
		"doctor": "65d4...",
		"fee": 100,
		"status": "active",
		"paymentStatus": "paid",
		"startedAt": "2026-02-20T10:20:30.000Z",
		"expiresAt": "2026-03-02T10:20:30.000Z"
	}
}
```

Possible errors:

- 409 `Active chat already exists with this doctor`

### GET `/appointments/chat/:patientId`

Lists chat connections for a patient, with populated doctor info.

Response:

```json
{
	"success": true,
	"data": [
		{
			"_id": "65da...",
			"status": "active",
			"expiresAt": "2026-03-02T10:20:30.000Z",
			"doctor": {
				"_id": "65d4...",
				"name": "Dr. Alice",
				"specialization": "Cardiology",
				"isVerified": false,
				"isOnline": false,
				"rating": 0
			}
		}
	]
}
```

### POST `/appointments/chat/:chatId/close`

Closes a chat connection.

Request body:

```json
{ "patientId": "65d5...", "reason": "Issue resolved" }
```

Success response:

```json
{ "success": true, "data": { "_id": "65da...", "status": "closed", "closedAt": "2026-02-20T10:20:30.000Z" } }
```

### Doctor-side appointment endpoints (protected)

All endpoints below require doctor JWT:

```http
Authorization: Bearer <doctorToken>
```

#### GET `/appointments/doctor/me?status=all|booked|cancelled|completed`

Lists appointments for the authenticated doctor. Patient is populated with limited fields.

Response:

```json
{ "success": true, "data": [{ "_id": "65d9...", "status": "booked", "patient": { "name": "Bob" } }] }
```

#### GET `/appointments/doctor/me/upcoming`

Lists upcoming booked appointments (max 50).

#### POST `/appointments/:appointmentId/doctor-cancel`

Body:

```json
{ "reason": "Not available" }
```

Response:

```json
{ "success": true, "data": { "_id": "65d9...", "status": "cancelled" } }
```

#### POST `/appointments/:appointmentId/doctor-reschedule`

Body:

```json
{ "date": "2026-03-02", "time": "10:00" }
```

Response:

```json
{ "success": true, "data": { "_id": "65d9...", "date": "2026-03-02", "startTime": "10:00" } }
```

### Routes present but not implemented

These routes exist in the router, but the handler is missing in `Controllers/appointmentContoller.js`, so the server responds:

```json
{ "success": false, "message": "Handler not implemented" }
```

- `GET /appointments/patient/:patientId`
- `POST /appointments/:appointmentId/cancel`
- `POST /appointments/cancel-slot`
- `POST /appointments/:appointmentId/reschedule`

---

## Prototype REST Chat API (`/api/chat`)

> Prototype mode is hard-restricted to these IDs:
>
> - doctorId: `doctor@gmail.com`
> - patientId: `patient@gmail.com`

### POST `/api/chat/room`

Body:

```json
{ "doctorId": "doctor@gmail.com", "patientId": "patient@gmail.com" }
```

Response:

```json
{ "roomId": "chat_doctor@gmail.com_patient@gmail.com" }
```

### GET `/api/chat/:roomId/messages`

Query params:

- `limit` (default 50, max 200)
- `before` (optional ISO date string)

Example:

`GET /api/chat/chat_doctor@gmail.com_patient@gmail.com/messages?limit=50`

Response:

```json
{ "roomId": "chat_doctor@gmail.com_patient@gmail.com", "messages": [{ "text": "hello" }] }
```

---

## Prototype REST Calls API (`/api/calls`)

> Prototype mode is hard-restricted.
>
> - doctorId: `doctor@gmail.com`
> - patientId: `patient@gmail.com`
> - roomId: `call_doctor@gmail.com_patient@gmail.com`

### POST `/api/calls/schedule`

Body:

```json
{
	"roomId": "call_doctor@gmail.com_patient@gmail.com",
	"doctorId": "doctor@gmail.com",
	"patientId": "patient@gmail.com",
	"scheduledFor": "2026-03-01T10:00:00.000Z"
}
```

Response (201):

```json
{
	"_id": "65db...",
	"roomId": "call_doctor@gmail.com_patient@gmail.com",
	"doctorId": "doctor@gmail.com",
	"patientId": "patient@gmail.com",
	"scheduledFor": "2026-03-01T10:00:00.000Z",
	"status": "scheduled"
}
```

### POST `/api/calls/cancel`

Body:

```json
{ "id": "65db..." }
```

Response:

```json
{ "_id": "65db...", "status": "cancelled" }
```

### GET `/api/calls/schedule`

Requires at least one of the following query params to be allowed in prototype mode:

- `roomId=call_doctor@gmail.com_patient@gmail.com`
- `doctorId=doctor@gmail.com`
- `patientId=patient@gmail.com`

Response:

```json
{ "items": [{ "_id": "65db...", "scheduledFor": "2026-03-01T10:00:00.000Z" }] }
```

---

# Socket.IO (Realtime)

Socket.IO is initialized in `server.js` and implemented in `Services/socket.js`.

## Prototype access restriction

Realtime is allowlisted to two users only:

- doctor: `doctor@gmail.com`
- patient: `patient@gmail.com`

## Connect

Connection requires query parameters:

- `userId`
- `userType` (`doctor|patient`)
- `userData` (optional JSON string)

Example (client):

```js
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000', {
	transports: ['websocket', 'polling'],
	query: {
		userId: 'doctor@gmail.com',
		userType: 'doctor',
		userData: JSON.stringify({ name: 'Dr. Prototype' })
	}
});
```

## Key events

### Server → client

- `connection-established` `{ message, socketId, userId, userType, timestamp }`
- `user-online` / `user-offline` `{ userId, userType?, timestamp, reason? }`

### Chat rooms

Client → server:

- `join-chat-room` `{ roomId, timestamp? }`
- `leave-chat-room` `{ roomId, timestamp? }`
- `send-message` `{ roomId, message: { id?, text, ... } }`
- `typing` `{ roomId, isTyping }`
- `mark-read` `{ roomId, messageId }`

Server → client:

- `room-joined` `{ roomId, participants, timestamp }`
- `user-joined-chat` `{ roomId, userId, userType, timestamp }`
- `user-left-chat` `{ roomId, userId, timestamp, reason? }`
- `receive-message` `{ roomId, message, from }`
- `message-sent` `{ messageId, timestamp }`
- `message-read` `{ roomId, messageId, readBy, timestamp }`

Persistence (best-effort): messages are stored in `ChatMessage`, and rooms are upserted in `ChatRoom`.

### WebRTC video signaling

Client → server:

- `join-video-room` `{ roomId, timestamp? }` (joins `video-<roomId>`)
- `leave-video-room` `{ roomId, userId?, timestamp? }`
- `offer` `{ roomId, offer, targetSocketId }`
- `answer` `{ roomId, answer, targetSocketId }`
- `ice-candidate` `{ roomId, candidate, targetSocketId }`

Server → client:

- `user-joined-video` `{ roomId, userId, userType, userData, socketId, timestamp }`
- `video-room-participants` `{ roomId, participants, timestamp }`
- `user-left-video` `{ roomId, userId, socketId, timestamp }`

### Calls

Client → server:

- `schedule-call` `{ roomId, doctorId, patientId, scheduledFor }`
- `call-start` `{ roomId, timestamp? }`
- `call-end` `{ roomId, userId?, timestamp? }`

Server → client:

- `incoming-call` `{ roomId, callerId, callerData, timestamp }`
- `call-ended` `{ roomId, endedBy, timestamp }`
- `call-scheduled` `<CallSchedule doc>`

### Notifications

Client → server:

- `subscribe-notifications` `{ userId }` (joins `notifications-<userId>`)
- `send-notification` `{ targetUserId, title, message, type? }`

Server → client:

- `notification` `{ title, message, type, timestamp, read }`

### Presence

Client → server:

- `presence` `{ userId, status: 'online'|'offline', timestamp? }`
- `get-online-users` (no payload)

Server → client:

- `presence-update` `{ userId, status, timestamp }`
- `online-users` `{ users, count, timestamp }`

### Health ping

Client → server: `ping`

Server → client: `pong` `{ timestamp }`

---

# Database Models (MongoDB)

## Relationships overview

- `Doctor` (collection: `doctors`)
- `Patient` (collection: `patients`)
- `Appointment` references `Doctor` + `Patient`
- `BookingHistoryDoctor` stores per-doctor/day free + booked slots (used for `/appointments/availability` and booking)
- `ChatConnection` references `Doctor` + `Patient` (chat validity window)
- Prototype chat/call persistence uses string IDs (`doctor@gmail.com`, etc.):
	- `ChatRoom`, `ChatMessage`, `CallSchedule`

## Doctor (`Models/doctor.model.js`)

Key fields:

- `name`, `email` (unique), `phone`, `password`
- `specialization`, `experience`
- `qualifications[]`, `languages[]`
- `consultationFee`: `{ chat, voice, video }`
- `availability`: `{ from, to }` (HH:mm)
- `slotDurationMinutes` (default 15)
- `slots[]`: `{ date, time, type, isBooked }`
- `isVerified`, `isOnline`, `rating`, `totalReviews`
- `profileImage`, `bio`
- `role` (default `doctor`), `isBlocked`, `token`, `lastLogin`

Public profile helper:

- `doctor.getPublicProfile()` removes `password`, `token`, `__v`.

## Patient (`Models/patient.model.js`)

Key fields:

- `name`, `email` (unique), `phone`, `password`
- `age`, `gender`
- optional health info: `bloodGroup`, `height`, `weight`, `allergies[]`, `existingConditions[]`
- `emergencyContact`: `{ name, phone, relation }`
- `profileImage`
- `role` (default `patient`), `isBlocked`, `token`, `lastLogin`

## Appointment (`Models/appointment.model.js`)

Represents a booked appointment slot.

Key fields:

- `patient` (ObjectId → `Patient`, required)
- `doctor` (ObjectId → `Doctor`, required)
- `type`: `in-person|video|chat|voice`
- `scheduledAt` (Date)
- `date` (`YYYY-MM-DD`), `startTime` (`HH:mm`), `endTime` (`HH:mm`) for stable UI
- `slotId` (ObjectId, optional)
- `fee` (Number)
- `status`: `booked|cancelled|completed`
- cancellation metadata: `cancelledAt`, `cancelReason`
- `notes`
- `paymentStatus`: `pending|paid|waived`

Indexes include:

- `{ patient: 1, scheduledAt: -1 }`
- `{ doctor: 1, scheduledAt: -1 }`
- `{ doctor: 1, status: 1, scheduledAt: 1 }`
- `{ doctor: 1, date: 1, startTime: 1, status: 1 }`

Helpers:

- `appointment.getPublicDetails()` removes `__v`.

## BookingHistoryDoctor (`Models/bookingHistoryDoctorModel.js`)

Per doctor per date schedule record.

Key fields:

- `doctor` (ObjectId → `Doctor`, required)
- `date` (`YYYY-MM-DD`, required)
- `slotDurationMinutes`
- `freeSlots[]`: `{ time, type?, fee? }` (type is optional for legacy support)
- `bookedSlots[]`: `{ time, type, fee, bookingRef?, patient?, bookedAt }`

Unique index:

- `{ doctor: 1, date: 1 }` (one doc per doctor per day)

## ChatConnection (`Models/chatConnection.model.js`)

Represents a paid chat validity window between a patient and doctor.

Key fields:

- `patient` (ObjectId → `Patient`)
- `doctor` (ObjectId → `Doctor`)
- `fee`
- `status`: `active|closed|expired`
- `paymentStatus`: `pending|paid|refunded`
- `startedAt`, `expiresAt`
- `messageCount`, `lastActivityAt`
- `closeReason`, `closedAt`

Helpers:

- `isActive()` true if status is active and not expired.

## Prototype realtime persistence

### ChatRoom (`Models/ChatRoom.js`)

- `roomId` (unique)
- `doctorId` (string)
- `patientId` (string)
- `lastActiveAt`

### ChatMessage (`Models/ChatMessage.js`)

- `roomId`, `senderId`, `senderType`, `text`
- `clientMessageId` (optional)
- `meta` (object)
- `createdAt`

### CallSchedule (`Models/CallSchedule.js`)

- `roomId`, `doctorId`, `patientId`
- `scheduledFor`
- `status`: `scheduled|in_progress|ended|cancelled`
- `startedAt`, `endedAt`
- `createdByUserId`, `lastUpdatedAt`

---

## Notes / limitations

- Login “rate limiters” in `middlewares/doctorMiddleware.js` and `middlewares/patientMiddleware.js` are placeholders.
- Realtime chat/calls and `/api/chat` + `/api/calls` are **prototype-only** and restricted to fixed IDs.
- JWT secret falls back to `your_jwt_secret_key_here` if `JWT_SECRET` is missing (not recommended for production).

