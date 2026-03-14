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

// Allowed origins
const allowedOrigins = [
  process.env.FRONTEND_URL,
  "https://arogyam-swasthya.onrender.com",
  "http://localhost:5173"
];

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("CORS not allowed"));
    }
  },
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());

// routes
const doctorRoutes = require('./Routes/doctorRoutes');
const patientRoutes = require('./Routes/patientRoutes');
const appointmentRoutes = require('./Routes/appointmentRoutes');
const chatRoutes = require('./Routes/chatRoutes');
const videoRoutes = require('./Routes/videoRoutes');

app.get('/',(req,res)=>{
  res.send("<h1><a href='https://arogyam-swasthya.onrender.com/'>Click Here...</a><p>@abhiyanta_cse</p></h1>");
});
app.use('/patients', patientRoutes);
app.use('/doctors', doctorRoutes);
app.use('/appointments', appointmentRoutes);
app.use('/chats', chatRoutes);
app.use('/videos', videoRoutes);

// initialize socket
initSocket(server);

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});