const { Server } = require("socket.io");
const https = require("https");
//const server = require("https");
const fs = require("fs");

const certPath = "./certs/server_cert.pem"
const keyPath = "./certs/server_key.pem"
var httpsOptions = {
    key: fs.readFileSync(keyPath, 'utf8'),
    cert: fs.readFileSync(certPath, 'utf8')
  };
const express = require('express');
const app = express();
const redisConnectionHelper = require("../redisConnectionHelper");

const WEB_SERVER_PORT = 7057;
const httpsServer = https.createServer(httpsOptions,(req,res)=>{
    app.handle(req,res)
});
const io = new Server({ cors: { origin: "*" } });
var redisClient
const rediswork = async()=>{
    redisClient = await redisConnectionHelper()
}
const cors = require("cors");
app.use(cors({ origin: "*" }));
app.use(express.json());
rediswork()
app.get('/camera/:imei', async (req,res)=>{
    try{
        console.log(req.params?.imei)
        console.log(await redisClient.get(req.params?.imei))
        console.log(JSON.parse(await redisClient.get(req.params?.imei)))
        return res.status(200).send({data:JSON.parse(await redisClient.get(req.params.imei)), message:"camera data get", success:true})
    }catch(err){
        return res.status(200).send({ message:err.message, success:false})

    }
})
httpsServer.listen(WEB_SERVER_PORT, () => {
    console.log("Socket Server is running on port " + WEB_SERVER_PORT);
});
io.listen(httpsServer)
const clients = new Map()
io.on("connection", (socket) => {
    // let clientIp = socket.handshake.address; // Get the client's IP address
    // if (clientIp.startsWith("::ffff:")) {
    //     clientIp = clientIp.slice(7); // Remove the IPv6 prefix
    // }
    // console.log("A client connected:", socket.id, "IP:", clientIp, socket.handshake.query);

   console.log("A client connected:", socket.id,socket.handshake.headers.origin);
    setTimeout(()=>{

    },10000)
    // socket._onclose((e)=>{
    //     console.log(".....",e)
    // })
   
    
    socket.on("disconnect", (e)=>{
           // console.log("disconn", socket.handshake.headers.origin)
         })
});
// io.on("disconnect", (e)=>{
//     console.log("disconn", e)
// })

function emitdatatoSocket(payload) {
    const { clientId } = payload;
  // console.log("afcbsdjfcd", payload)
    io.fetchSockets().then((sockets) => {
        //console.log(sockets)
        
        sockets.forEach((socket) => {
           // console.log("====", socket.handshake.headers.origin)
            if (clientId == socket.handshake.query.clientId) {
               
            //    let progress = (payload.received_packages/payload.total_packages)*100
                socket.emit("message", payload);
            }
        });
    });
}

module.exports = emitdatatoSocket;
