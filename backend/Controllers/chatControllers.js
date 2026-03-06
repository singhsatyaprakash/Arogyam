const ChatConnection = require("../Models/chatConnection.model");
const ChatHistory = require("../Models/chatHistory.model");
const Doctor = require("../Models/doctor.model");
const Patient = require("../Models/patient.model");

const newChatConnection = async (req, res) => {
  try {
    const { doctorId, patientId, fee, note } = req.body;
    console.log(req.body);

    // Validate required fields
    if (!doctorId || !patientId || fee === undefined) {
      return res.status(400).json({
        success: false,
        message: "Please provide doctorId, patientId, and fee"
      });
    }

    // Verify doctor exists
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found"
      });
    }

    // Verify patient exists
    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found"
      });
    }

    // Check if active connection already exists
    const existingConnection = await ChatConnection.findActiveChat(patientId, doctorId);
    if (existingConnection) {
      return res.status(400).json({
        success: false,
        message: "An active chat connection already exists with this doctor",
        // data: existingConnection.getPublicDetails()
      });
    }

    // Create new chat connection (10 days validity)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 10);

    const chatConnection = new ChatConnection({
      patient: patientId,
      doctor: doctorId,
      fee: Number(fee),
      status: "active",
      paymentStatus: "paid",
      startedAt: new Date(),
      expiresAt,
      messageCount: note ? 1 : 0,
      lastActivityAt: new Date()
    });

    await chatConnection.save();

    // Create chat history with initial note message if provided
    const chatHistory = new ChatHistory({
      connectionId: chatConnection._id,
      messages: note
        ? [
            {
              senderId: patientId,
              senderType: "patient",
              text: note || "Chat session started",
              meta: {
                isSystemMessage: true,
                type: "session_start"
              },
              createdAt: new Date()
            }
          ]
        : []
    });

    await chatHistory.save();

    // Populate doctor and patient details
    const populatedConnection = await ChatConnection.findById(chatConnection._id)
      .populate("doctor", "name email specialization consultationFee")
      .populate("patient", "name email phone");

    res.status(201).json({
      success: true,
      message: "Chat connection established successfully",
      data: {
        connection: populatedConnection.getPublicDetails(),
        chatHistoryId: chatHistory._id
      }
    });
  } catch (error) {
    console.error("New chat connection error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// Get all chat connections for a patient
const getPatientChats = async (req, res) => {
  try {
    const { patientId } = req.params;

    const connections = await ChatConnection.find({
      patient: patientId
    })
      .populate("doctor", "name email specialization consultationFee avatar")
      .sort({ lastActivityAt: -1 });

    res.status(200).json({
      success: true,
      data: connections.map(c => c.getPublicDetails())
    });
  } catch (error) {
    console.error("Get patient chats error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// Get all chat connections for a doctor
const getDoctorChats = async (req, res) => {
  try {
    const { doctorId } = req.params;

    const connections = await ChatConnection.find({
      doctor: doctorId
    })
      .populate("patient", "name email phone avatar")
      .sort({ lastActivityAt: -1 });

    res.status(200).json({
      success: true,
      data: connections.map(c => c.getPublicDetails())
    });
  } catch (error) {
    console.error("Get doctor chats error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// Get chat history
const getChatHistory = async (req, res) => {
  try {
    const { connectionId } = req.params;

    const chatHistory = await ChatHistory.findOne({ connectionId })
      .populate({
        path: "connectionId",
        populate: [
          { path: "doctor", select: "name email specialization avatar" },
          { path: "patient", select: "name email avatar" }
        ]
      });

    if (!chatHistory) {
      return res.status(404).json({
        success: false,
        message: "Chat history not found"
      });
    }

    res.status(200).json({
      success: true,
      data: chatHistory
    });
  } catch (error) {
    console.error("Get chat history error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// Close chat connection
const closeChatConnection = async (req, res) => {
  try {
    const { connectionId } = req.params;
    const { reason } = req.body;

    const connection = await ChatConnection.findById(connectionId);
    if (!connection) {
      return res.status(404).json({
        success: false,
        message: "Chat connection not found"
      });
    }

    connection.status = "closed";
    connection.closedAt = new Date();
    connection.closeReason = reason || "Manually closed";
    await connection.save();

    res.status(200).json({
      success: true,
      message: "Chat connection closed",
      data: connection.getPublicDetails()
    });
  } catch (error) {
    console.error("Close chat connection error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

module.exports = {
  newChatConnection,
  getPatientChats,
  getDoctorChats,
  getChatHistory,
  closeChatConnection
};