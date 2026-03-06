const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');

dotenv.config();

const app = express();
const server = http.createServer(app);

// socket import
const { initSocket } = require('./Services/socket');

// database connection
const connectDB = require('./Config/db');
connectDB();

// CORS
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

// routes
const doctorRoutes = require('./Routes/doctorRoutes');
const patientRoutes = require('./Routes/patientRoutes');
const appointmentRoutes = require('./Routes/appointmentRoutes');
const chatRoutes = require('./Routes/chatRoutes');

app.use('/patients', patientRoutes);
app.use('/doctors', doctorRoutes);
app.use('/appointments', appointmentRoutes);
app.use('/chats', chatRoutes);

// initialize socket
initSocket(server);

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});