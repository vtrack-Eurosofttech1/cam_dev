const fs = require("fs");
const path = require("path");
const { uploadToS3 } = require("./utils/uploadToS3.js");
const { ConvertVideoFile } = require("./utils/ConvertVideoFile.js");
const redisConnectionHelper = require('./redisConnectionHelper.js');
var redisClient
const rediswork = async()=>{
    redisClient = await redisConnectionHelper()
}
rediswork()


const readJSONFile = (filePath) => {
  if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(data);
  }
  return null; 
};

const writeJSONFile = (filePath, data) => {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
};
const updateJSONFile = (newValues,filePath) => {
  
  const jsonData = readJSONFile(filePath) || {};
  let newObj = {
    IMEI: newValues.imei || jsonData.imei,
    timestamp: newValues.timestamp || jsonData.timestamp,
    totalPackages: (jsonData.totalPackages || 0) + (newValues.totalPackages || 0),
    receivedPackages: (jsonData.receivedPackages || 0) + (newValues.receivedPackages || 0),
    lastCrc: newValues.lastCrc || jsonData.lastCrc,
    uploadedToS3: newValues.uploadedToS3 || jsonData.uploadedToS3,
    ReceivedAllPackets: newValues.ReceivedAllPackets || jsonData.ReceivedAllPackets        ,
    lastReceivedPackages: (jsonData.lastReceivedPackages || 0) + (newValues.lastReceivedPackages || 0),
    camera_type: newValues.camera_type || jsonData.camera_type,
    clientId: newValues.clientId || jsonData.clientId,
    vehicle: newValues.vehicle || jsonData.vehicle,
    framerate: newValues.framerate || jsonData.framerate,
  }
  Object.assign(jsonData,newObj)
  
  if (newValues.buffer) {
      jsonData.buffer = jsonData.buffer || []; 
      jsonData.buffer.push(...newValues.buffer); 
  }
  if (newValues.packets && Array.isArray(newValues.packets)) {
      jsonData.packets = jsonData.packets || [];
      jsonData.packets.push(...newValues.packets); 
  }
  writeJSONFile(filePath, jsonData);
};


const updateData = (filePath, uploadedToS3)=>{
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
          console.error('Error reading the file:', err);
          return;
        }
    
        let jsonData;
        try {
          jsonData = JSON.parse(data);
        } catch (parseErr) {
          console.error('Error parsing JSON:', parseErr);
          return;
        }
    
        if (jsonData.hasOwnProperty('uploadedToS3')) {          
          if(jsonData.totalPackages == jsonData.receivedPackages){
            jsonData['ReceivedAllPackets'] = true;           
          }
          jsonData['uploadedToS3'] = true;
          redisClient.set(jsonData.vehicle,JSON.stringify(jsonData))
          // if (uploadedToS3 && (jsonData.totalPackages !== jsonData.receivedPackages)) {
          // } 
    
          fs.writeFile(filePath, JSON.stringify(jsonData, null, 2), 'utf8', (writeErr) => {
            if (writeErr) {
              console.error('Error writing to file:', writeErr);
            } else {
              console.log('Successfully updated the "receivedPackages" value');
            }
          });
        } else {
          //console.log('Key "receivedPackages" does not exist in the JSON data');
        }
      });
}


async function processVideoFile(device_info_directory, timestamp, frameratevideo, extension,getFileToDL,device_info) {
    // let device_info = new protocol.DeviceDescriptor();
    const IMEI = device_info_directory;
    const fileName = `${timestamp}.mp4`;
    const filePath = path.join(__dirname, IMEI, fileName);
  
    try {
      await ConvertVideoFile(
        device_info_directory,
        frameratevideo,
        timestamp,
         extension
        ).then(async(d)=>{
console.log("convert", d);
    
    try {
  await fs.readFile(filePath,async(err,data)=>{

    if(err){
      console.log("err err", err);
    }

    let directory = IMEI.split("/").pop();
    let params = {
        Bucket: "vtracksolutions/media", // pass your bucket name
        Key: directory + "/" + `${timestamp}` + ".mp4",
        Body: data,
        ContentType: "video/mp4"
      };
  
        console.log("Video conversion successful",params);
    
        await uploadToS3(params, {
          fileType: 2,
          fileName: fileName,
          deviceIMEI: IMEI.split("/").pop(),
          filePath: filePath,
          cameraType: getFileToDL,
        });
      //  device_info.setUploadedToS3(true);
        let filePath1 = path.join(__dirname, device_info.getDeviceDirectory(), `${timestamp}` + '.json');
        updateData(filePath1, true)
     
      //  device_info.setUploadedToS3(true);
  });
    } catch (e) {
      console.error('Error reading video file:', e.message);
      return;
    }
    

      }).catch((err)=>{
        console.log("Error: ",err)
      })
  
    } catch (error) {
      console.error("Error converting or uploading video:", error);
    }
  }

  
  async function processImageFile(timestamp,device_info) {
    // let device_info = new protocol.DeviceDescriptor();
    const IMEI = device_info.getDeviceDirectory();
  
    const fileName = `${timestamp}.jpeg`;
    const filePath = path.join(__dirname, IMEI, fileName);
    console.log(__dirname, IMEI, fileName)
  console.log("afa", filePath)
  let deviceInfo = device_info.getDeviceDirectory();
      let directory = deviceInfo.split("/").pop();
    let fileContent;
    try {
      fs.readFile(filePath,async (e,d)=>{
        fileContent=d
        const params = {
          Bucket: "vtracksolutions/media", // pass your bucket name
          Key: directory + "/" + `${timestamp}` + ".jpeg",
        Body: fileContent
      };
    console.log(params)
      try {
        await uploadToS3(params, {
          fileType: 1,
          fileName: fileName,
          deviceIMEI: IMEI.split("/").pop(),
          filePath: filePath,

          cameraType: device_info.getFileToDL()
        });
    
      //  device_info.setUploadedToS3(true);
        let filePath1 = path.join(__dirname, device_info.getDeviceDirectory(), `${timestamp}` + '.json');
        updateData(filePath1, true)
        
      } catch (error) {
        console.error("Error uploading image:", error);
      }
      });
    } catch (err) {
      console.error('Error reading image file:', err.message);
      return;
    }
  
    
  }
  module.exports = {
    processVideoFile,
    processImageFile
  };