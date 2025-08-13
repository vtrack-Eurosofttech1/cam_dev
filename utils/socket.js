const fs = require("fs");
const https = require("https");
const express = require("express");
const { Server } = require("socket.io");
const cors = require("cors");
const redisConnectionHelper = require("../redisConnectionHelper");

const certPath = "./certs/server_cert.pem";
const keyPath = "./certs/server_key.pem";

const httpsOptions = {
  key: fs.readFileSync(keyPath, "utf8"),
  cert: fs.readFileSync(certPath, "utf8"),
};

const app = express();
const WEB_SERVER_PORT = 7057;

app.use(cors({ origin: "*" }));
app.use(express.json());

let redisClient;
const rediswork = async () => {
  redisClient = await redisConnectionHelper();
};
rediswork();

app.get("/camera/:imei", async (req, res) => {
  try {
    const data = await redisClient.get(req.params.imei);
    return res.status(200).send({
      data: JSON.parse(data),
      message: "camera data get",
      success: true,
    });
  } catch (err) {
    return res.status(500).send({ message: err.message, success: false });
  }
});

const httpsServer = https.createServer(httpsOptions, app);

// ✅ ATTACH Socket.IO to https server here
const io = new Server(httpsServer, {
  cors: {
    origin: "*", // Replace with actual frontend origin in production
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log(
    "Client connected:",
    socket.id,
    "Client ID:",
    socket.handshake.query.clientId
  );

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

httpsServer.listen(WEB_SERVER_PORT, () => {
  console.log(`HTTPS server with socket.io listening on port ${WEB_SERVER_PORT}`);
});

function emitdatatoSocket(payload) {
  const { clientId } = payload;
  io.fetchSockets().then((sockets) => {
    sockets.forEach((socket) => {
      if (clientId === socket.handshake.query.clientId) {
        socket.emit("message", payload);
      }
    });
  });
}

module.exports = emitdatatoSocket;
