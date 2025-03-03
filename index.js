const net = require('net');
const commandLineArgs = require('command-line-args');
const tls = require('tls');
const fs = require('fs');
const protocol = require('./protocol.js');
const cliProgress = require('cli-progress');
const _colors = require('colors');
const dbg = require('./debug.js')
const { v4: uuidv4 } = require("uuid");
const path = require('path')
const { processVideoFile, processImageFile } = require("./setparamsofS3.js");
process.setMaxListeners(0);
dbg.logAndPrint("Camera Transfer Server (Copyright © 2022, \x1b[34mTeltonika\x1b[0m), version 0.2.13");
const optionDefinitions = [
    { name: 'help', alias: 'h', type: Boolean },
    { name: 'tls', alias: 't', type: Boolean },
    { name: 'port', alias: 'p', type: Number },
    { name: 'cert', alias: 'c' },
    { name: 'key', alias: 'k' },
    { name: 'cam', alias: 'r', type: Number },
    { name: 'meta', alias: 'm', type: String },
]
const args = commandLineArgs(optionDefinitions);

if (args.help == true) {
    dbg.logAndPrint(`usage: cts-win.exe [-h/--help] [--tls] [-p/--port <port>] [-c/--cert <path>] [-k/--key <key>] [-r/--cam <camera id>] [-m/--meta <meta id>]

    Argument usage:
       --help, -h        Bring up help menu
       --tls             Enables TLS mode (if this parameter is passed, then cert and key must be provided, otherwise the server works in non-TLS mode)
       --port, -p        Port to listen to
       --cert, -c        Path to root certificate file
       --key, -k         Path to private key file
       --cam, -r         Camera type (0 - Auto, 1 - ADAS, 2 - DualCam, 3 - DSM)
       --meta, -m        Metadata (0 - No metadata, 1 - Before file download)`
       );
    process.exit();
}

/* Check arguments for port */
let port = 0;
if (args.port > 0) {
    port = args.port;
} else {
    dbg.error("Port provided incorrectly / not provided in arguments!");
    process.exit();
}

let camera_option = 0;
if (typeof(args.cam) != "undefined") {
    if (args.cam >= 0 && args.cam < protocol.camera_type.LAST) {
        if (args.cam == protocol.camera_type.AUTO) {
            dbg.logAndPrint("Chosen auto camera type detection");
        }
        if (args.cam == protocol.camera_type.ADAS) {
           
            dbg.logAndPrint("Chosen ADAS camera type");
        }
        if (args.cam == protocol.camera_type.DUALCAM) {
            console.log("DualCam")
            dbg.logAndPrint("Chosen DualCam camera type");
        }
        if (args.cam == protocol.camera_type.DSM) {
            console.log("DSM")
            dbg.logAndPrint("Chosen DSM camera type");
        }
        camera_option = args.cam;
    } else {
        dbg.error("Camera type provided incorrectly! " + args.cam);
        process.exit();
    }
} else {
    dbg.logAndPrint("No camera type chosen. Defaulting to auto camera type detection");
}

let metadata_option = 0;
if (typeof(args.meta) != "undefined") {
    if (args.meta == 0 || args.meta == 1) {
        if (args.meta == 0) {
            metadata_option = protocol.metadata_type.NO_METADATA;
            dbg.logAndPrint("No metadata requests will be made");
        }
        if (args.meta == 1) {
            metadata_option = protocol.metadata_type.AT_START;
            dbg.logAndPrint("Metadata will be requested at the start of the file transfer");
        }
    } else {
        dbg.error("Metadata request parameter provided incorrectly!");
        process.exit();
    }
} else {
    dbg.logAndPrint("No metadata requests will be made");
}

let server;
if (args.tls && typeof args.key !== "undefined" && typeof args.cert !== "undefined") {
    dbg.logAndPrint('Starting TLS mode');
    var options = {
        key: fs.readFileSync(args.key),
        cert: fs.readFileSync(args.cert),
    };
    server = tls.createServer(options, handleConnection);
} else {
    dbg.logAndPrint('Starting REGULAR mode');
    var options;
    server = net.createServer(options, handleConnection);
}

//  Start listening to port
server.listen(port, function () {
    dbg.logAndPrint('Listening to ' + server.address()["port"] + ' port');
});

//  Network handler
const buffer_size = 69000;

const activeSessions = new Map();
function handleConnection(connection) {
    const progress_bar = new cliProgress.SingleBar({
        format: '[\x1b[34mSERVER\x1b[0m] Download Progress |' + _colors.blue('{bar}') + '| {percentage}% || {value}/{total} Chunks || ETA: {eta} seconds',
        barsize: 30,
        hideCursor: true
    }, cliProgress.Presets.shades_grey);

    connection.id = uuidv4();

    let tcp_buffer = Buffer.alloc(0);
    let remoteAddress = connection.remoteAddress + ':' + connection.remotePort;
    let current_state = protocol.fsm_state.INIT;
    let cmd_size = 0;
    let cmd_id = 0;

    let device_info = new protocol.DeviceDescriptor();
    let metadata = new protocol.MetaDataDescriptor();
    dbg.logAndPrint('Client connected: ' + remoteAddress);

    let lastActivityTime = Date.now(); 
 // dbg.logAndPrint("Client connected: " + remoteAddress);
  const INACTIVITY_TIMEOUT = 30000; 

  // Timer to check inactivity
  const inactivityTimer = setInterval(() => {
    if (Date.now() - lastActivityTime > INACTIVITY_TIMEOUT) {
      console.log("aaaa")
      connection.destroy(); // Close the connection
      clearInterval(inactivityTimer); // Clear the interval timer
    }
  }, 1000); // Check every second

    connection.on('data', onConnData);
    connection.once('close', onConnClose);
    connection.on('error', onConnError);
    connection.on('timeout', onConnTimeout);

    function repeatSyncRequest() {
        current_state = protocol.run_fsm(protocol.fsm_state.REPEAT_PACKET, connection, cmd_id.NONE, tcp_buffer, device_info, metadata, progress_bar, camera_option, metadata_option);
    }
    
    function lookForSyncPacket(data) {
        let indexOfSync = data.toString('hex').indexOf("00030004");
        if (indexOfSync > 0) {
            data = data.slice(indexOfSync / 2, data.length);
        }
        return data
    }

    function onConnData(data) {
        //connection.end();
        dbg.log("state" + current_state);
        dbg.log("[packets]: [" + data.toString('hex') + "]");
        lastActivityTime = Date.now();

        // Check if there is a TCP buffer overflow
        if (data.length >= buffer_size) {
            dbg.error("Too much data: " + data.length + " >= " + buffer_size);
            return;
        }

        if (current_state == protocol.fsm_state.REPEAT_PACKET) {

            // try string search the sync cmd and drop unsynced packet data
            data = lookForSyncPacket(data);

            cmd_id = protocol.ParseCmd(data);
            if (cmd_id != protocol.cmd_id.SYNC) {
                dbg.log("Waiting for sync, cmd id: " + cmd_id);
                dbg.log("[RX]: [" + data.toString('hex') + "]");

                let repeat_interval = (device_info.repeat_count > 9) ? 4000 : 2000;
                if ((Date.now() - device_info.repeat_sent_ts) > repeat_interval) {
                    repeatSyncRequest();
                }
                return;
            } else {
                tcp_buffer = Buffer.alloc(0);
            }
        }
            // Add new data to buffer
            tcp_buffer = Buffer.concat([tcp_buffer, data]);
         
            dbg.log("[tcp]: [" + tcp_buffer.toString('hex')  + "]");


        if (current_state === protocol.fsm_state.INIT) {
         
                const imei = protocol.extractIMEI(tcp_buffer); // Extract IMEI from initialization packet
                if (!imei) {
                    dbg.log("IMEI not found in initialization packet!");
                    connection.end();
                    return;
                }

               // Check for duplicate sessions
                if (activeSessions.has(imei)) {
                    tcp_buffer = Buffer.alloc(0);
                    console.log("c",connection.id)
                    dbg.logAndPrint(`Duplicate session detected for IMEI: ${imei}. Terminating connection.`);
                   connection.end();
                    // const query = Buffer.from([0, 0, 0, 0]);
                    // connection.write(query);
                    return;
                }

                // Register new session
                activeSessions.set(imei, {
                    connectionId: connection.id,
                    startTime: Date.now(),
                });
                console.log("n",connection.id)
                dbg.logAndPrint(`Session started for IMEI: ${imei}`);
            }
        

     
        
        // A loop to handle case where a packet contains more than one command
        repeat_cycle = true;
        while (repeat_cycle == true) {
            repeat_cycle = false;

            if (tcp_buffer.length < 4) {
                dbg.log("[galat]: [" + tcp_buffer  + "]");
                dbg.log("Invalid received data len: " + tcp_buffer);
                return;
            }

            // Log RX buffer contents
          //  dbg.log("[RX]: [" + tcp_buffer.toString('hex') + "]");

            // Check CMD validity
            cmd_id = protocol.ParseCmd(tcp_buffer);
            dbg.log("cmd_id : " + cmd_id);
            if (protocol.IsCmdValid(cmd_id) == false) {
                dbg.log("Invalid CMD ID: " + cmd_id);
                tcp_buffer = Buffer.alloc(0);
                return;
            }

            // Get CMD data size
            if (protocol.CmdHasLengthField(cmd_id) == true) {
              
                cmd_size = tcp_buffer.readUInt16BE(2) + 4;
                dbg.log("cmd_size if: " + cmd_size);
            } else {
                cmd_size = protocol.GetExpectedCommandLength(cmd_id);
                dbg.log("cmd_size else: " + cmd_size);
            }

            // If there is not enough data for buffer - return and wait another TCP packet
            if (tcp_buffer.length < cmd_size) {
                dbg.log("not enough data " + tcp_buffer);
                return;
            }

            current_state = protocol.run_fsm(current_state, connection, cmd_id, tcp_buffer, device_info, metadata, progress_bar, camera_option, metadata_option);
            if (current_state == protocol.fsm_state.REPEAT_PACKET) {
                tcp_buffer = Buffer.alloc(0);
            } else {
                dbg.log("Invalid CMD ID: " + cmd_id);
                tcp_buffer = tcp_buffer.slice(cmd_size, tcp_buffer.length);
                dbg.log("[tcpslice]: [" + tcp_buffer.toString('hex')  + "]");
                repeat_cycle = true;
            }
        }
        
    }

    function onConnClose() {
       console.log("close")
       clearInterval(inactivityTimer);
       tcp_buffer = Buffer.alloc(0);
        dbg.logAndPrint('Connection from ' + remoteAddress + ' closed');
        activeSessions.forEach((session, imei) => {
            if (session.connectionId === connection.id) {
                activeSessions.delete(imei);
                dbg.logAndPrint(`Session ended for IMEI: ${imei}`);
                const filePath2 = path.join(__dirname, device_info.getDeviceDirectory(), metadata.getTimestamp() + '.json');
                const filePath3 = path.join(__dirname, device_info.getDeviceDirectory(), metadata.getTimestamp() + device_info.getExtension());
                if(fs.existsSync(filePath2)){
                    console.log("close if")
                    const jsondata = JSON.parse(fs.readFileSync(filePath2, 'utf8'));
                    if((jsondata?.uploadedToS3 === false || jsondata?.uploadedToS3 == null  || jsondata?.uploadedToS3 == undefined)&& (fs.existsSync(filePath3)) && (jsondata?.receivedPackages > 5)){
                        
                        if (device_info.getExtension() == ".h265") {
                            processVideoFile(device_info.getDeviceDirectory(), metadata.getTimestamp(),metadata.getFramerate(),device_info.getExtension(),device_info.getFileToDL() ,device_info)
                            }
                            else {
                                console.log("close if in" ) 
                                processImageFile(metadata.getTimestamp(),device_info)
                            }
        
                    
                       
                    }
                }
           
           
           
           
            }
        });
        // try {
        //     const filePath2 = path.join(__dirname, device_info.getDeviceDirectory(), metadata.getTimestamp() + '.json');
        //    console.log("file", filePath2)
        //     const jsondata = JSON.parse(fs.readFileSync(filePath2, 'utf8'));
        //     if((jsondata?.uploadedToS3 === false || jsondata?.uploadedToS3 == null  || jsondata?.uploadedToS3 == undefined)&& fs.existsSync(filePath2)){
                
        //         if (device_info.getExtension() == ".h265") {
        //             processVideoFile(device_info.getDeviceDirectory(), metadata.getTimestamp(),metadata.getFramerate(),device_info.getExtension(),device_info.getFileToDL() ,device_info)
        //             }
        //             else {
        //                 processImageFile(metadata.getTimestamp(),device_info)
        //             }

            
               
        //     }
            
        // } catch (error) {
        //     console.log("er",error );
        // }
        // activeSessions.forEach((session, imei) => {
        //     if (session.connectionId === connection.id) {
        //         activeSessions.delete(imei);
        //         dbg.logAndPrint(`Session ended for IMEI: ${imei}`);
        //     }
           
        // });
    }

    function onConnError(err) {
        // activeSessions.forEach((session, imei) => {
        //     if (session.connectionId === connection.id) {
        //         activeSessions.delete(imei);
        //         dbg.logAndPrint(`Session ended for IMEI: ${imei}`);
        //     }
        // });
        dbg.logAndPrint('Connection ' + remoteAddress + ' error: ' + err.message);
    }

    function onConnTimeout() {
        // activeSessions.forEach((session, imei) => {
        //     if (session.connectionId === connection.id) {
        //         activeSessions.delete(imei);
        //         dbg.logAndPrint(`Session ended for IMEI: ${imei}`);
        //     }
        // });
      
        dbg.logAndPrint('Connection from ' + remoteAddress + ' timeouted');
    }
}