// const fs = require("fs");
// const path = require("path");
// const { uploadToS3 } = require("./uploadToS3.js");
// const { ConvertVideoFile } = require("./ConvertVideoFile.js");
// const protocol = require("./protocol.js");


// const readJSONFile = (filePath) => {
//   if (fs.existsSync(filePath)) {
//       const data = fs.readFileSync(filePath, 'utf-8');
//       return JSON.parse(data);
//   }
//   return null; // Return null if the file doesn't exist
// };

// // Function to write the JSON file
// const writeJSONFile = (filePath, data) => {
//  // console.log("ss",filePath, data)
//   fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
// };
// // Function to update the JSON file with new values
// const updateJSONFile = (newValues,filePath) => {
//   // Read the existing data
//   const jsonData = readJSONFile(filePath) || {}; // Read existing data or use an empty object
//   let newObj = {
//     IMEI: newValues.imei || jsonData.imei,
//     timestamp: newValues.timestamp || jsonData.timestamp,
//     totalPackages: (jsonData.totalPackages || 0) + (newValues.totalPackages || 0),
//     receivedPackages: (jsonData.receivedPackages || 0) + (newValues.receivedPackages || 0),
//     lastCrc: newValues.lastCrc || jsonData.lastCrc,
//     uploadedToS3: newValues.uploadedToS3 || jsonData.uploadedToS3,
//     ReceivedAllPackets: newValues.ReceivedAllPackets || jsonData.ReceivedAllPackets        ,
//     lastReceivedPackages: (jsonData.lastReceivedPackages || 0) + (newValues.lastReceivedPackages || 0),
//     camera_type: newValues.camera_type || jsonData.camera_type,
//     clientId: newValues.clientId || jsonData.clientId,
//     vehicle: newValues.vehicle || jsonData.vehicle,
//     framerate: newValues.framerate || jsonData.framerate,
//   }
//   Object.assign(jsonData,newObj)
//   // Update attributes with new values
//   // jsonData.IMEI = newValues.imei || jsonData.imei;
//   // jsonData.timestamp = newValues.timestamp || jsonData.timestamp;
//   // jsonData.totalPackages = (jsonData.totalPackages || 0) + (newValues.totalPackages || 0);
//   // jsonData.receivedPackages = (jsonData.receivedPackages || 0) + (newValues.receivedPackages || 0);
//   // jsonData.lastCrc = newValues.lastCrc || jsonData.lastCrc;
//   // jsonData.uploadedToS3 = newValues.uploadedToS3 || jsonData.uploadedToS3;
//   // jsonData.ReceivedAllPackets = newValues.ReceivedAllPackets || jsonData.ReceivedAllPackets;         
//   // jsonData.lastReceivedPackages = (jsonData.lastReceivedPackages || 0) + (newValues.lastReceivedPackages || 0);
//   // jsonData.camera_type = newValues.camera_type || jsonData.camera_type;
//   // jsonData.clientId = newValues.clientId || jsonData.clientId;
//   // jsonData.vehicle = newValues.vehicle || jsonData.vehicle;
//   // jsonData.framerate = newValues.framerate || jsonData.framerate
//   // Append new values to the buffer
//   if (newValues.buffer) {
//       jsonData.buffer = jsonData.buffer || []; // Initialize buffer if it doesn't exist
//       jsonData.buffer.push(...newValues.buffer); // Spread new values into the existing buffer
//   }
//   if (newValues.packets && Array.isArray(newValues.packets)) {
//       jsonData.packets = jsonData.packets || []; // Initialize packets if it doesn't exist
//       jsonData.packets.push(...newValues.packets); // Spread new packet objects into the existing packets array
//   }
//   // Write the updated data back to the file
//   writeJSONFile(filePath, jsonData);
// };



// async function processVideoFile(device_info_directory, timestamp, frameratevideo, extension,getFileToDL,device_info) {
//     // let device_info = new protocol.DeviceDescriptor();
//     const IMEI = device_info_directory;
//     const fileName = `${timestamp}.mp4`;
//     const filePath = path.join(__dirname, IMEI, fileName);
  
//     try {
//       await ConvertVideoFile(
//         device_info_directory,
//         frameratevideo,
//         timestamp,
//          extension
//         ).then(async(d)=>{
// console.log("convert", d);
    
//     try {
//   await fs.readFile(filePath,async(err,data)=>{

//     if(err){
//       console.log("err err", err);
//     }

//     let directory = IMEI.split("/").pop();
//     let params = {
//         Bucket: "vtracksolutions/media", // pass your bucket name
//         Key: directory + "/" + `${timestamp}` + ".mp4",
//         Body: data,
//         ContentType: "video/mp4"
//       };
  
//         console.log("Video conversion successful",params);
    
//         await uploadToS3(params, {
//           fileType: 2,
//           fileName: fileName,
//           deviceIMEI: IMEI.split("/").pop(),
//           filePath: filePath,
//           cameraType: getFileToDL
//         });
//         device_info.setUploadedToS3(true);
//         let filePath1 = path.join(__dirname, device_info.getDeviceDirectory(), `${timestamp}` + '.json');
        
//         let newData = {
            
//           uploadedToS3: true,
          
//           }
//           await updateJSONFile(newData, filePath1);
//         device_info.setUploadedToS3(true);
//   });
//     } catch (e) {
//       console.error('Error reading video file:', e.message);
//       return;
//     }
    

//       }).catch((err)=>{
//         console.log("Error: ",err)
//       })
  
//     } catch (error) {
//       console.error("Error converting or uploading video:", error);
//     }
//   }

  
//   async function processImageFile(timestamp,device_info) {
//     // let device_info = new protocol.DeviceDescriptor();
//     const IMEI = device_info.getDeviceDirectory();
  
//     const fileName = `${timestamp}.jpeg`;
//     const filePath = path.join(__dirname, IMEI, fileName);
//     console.log(__dirname, IMEI, fileName)
//   console.log("afa", filePath)
//   let deviceInfo = device_info.getDeviceDirectory();
//       let directory = deviceInfo.split("/").pop();
//     let fileContent;
//     try {
//       fs.readFile(filePath,async (e,d)=>{
//         fileContent=d
//         const params = {
//           Bucket: "vtracksolutions/media", // pass your bucket name
//           Key: directory + "/" + `${timestamp}` + ".jpeg",
//         Body: fileContent
//       };
//     console.log(params)
//       try {
//         await uploadToS3(params, {
//           fileType: 1,
//           fileName: fileName,
//           deviceIMEI: IMEI.split("/").pop(),
//           filePath: filePath,

//           cameraType: device_info.getFileToDL()
//         });
    
//         device_info.setUploadedToS3(true);
//         let filePath1 = path.join(__dirname, device_info.getDeviceDirectory(), `${timestamp}` + '.json');
        
//         let newData = {
            
//           uploadedToS3: true,
          
//           }
//           await updateJSONFile(newData, filePath1);
//       } catch (error) {
//         console.error("Error uploading image:", error);
//       }
//       });
//     } catch (err) {
//       console.error('Error reading image file:', err.message);
//       return;
//     }
  
    
//   }
//   module.exports = {
//     processVideoFile,
//     processImageFile
//   };




const fs = require("fs");
const path = require("path");
const { uploadToS3 } = require("./uploadToS3.js");
const { ConvertVideoFile } = require("./ConvertVideoFile.js");
const protocol = require("./protocol.js");


const readJSONFile = (filePath) => {
  if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(data);
  }
  return null; // Return null if the file doesn't exist
};

// Function to write the JSON file
const writeJSONFile = (filePath, data) => {
 // console.log("ss",filePath, data)
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
};
// Function to update the JSON file with new values
const updateJSONFile = (newValues,filePath) => {
  // Read the existing data
  const jsonData = readJSONFile(filePath) || {}; // Read existing data or use an empty object
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
  // Update attributes with new values
  // jsonData.IMEI = newValues.imei || jsonData.imei;
  // jsonData.timestamp = newValues.timestamp || jsonData.timestamp;
  // jsonData.totalPackages = (jsonData.totalPackages || 0) + (newValues.totalPackages || 0);
  // jsonData.receivedPackages = (jsonData.receivedPackages || 0) + (newValues.receivedPackages || 0);
  // jsonData.lastCrc = newValues.lastCrc || jsonData.lastCrc;
  // jsonData.uploadedToS3 = newValues.uploadedToS3 || jsonData.uploadedToS3;
  // jsonData.ReceivedAllPackets = newValues.ReceivedAllPackets || jsonData.ReceivedAllPackets;         
  // jsonData.lastReceivedPackages = (jsonData.lastReceivedPackages || 0) + (newValues.lastReceivedPackages || 0);
  // jsonData.camera_type = newValues.camera_type || jsonData.camera_type;
  // jsonData.clientId = newValues.clientId || jsonData.clientId;
  // jsonData.vehicle = newValues.vehicle || jsonData.vehicle;
  // jsonData.framerate = newValues.framerate || jsonData.framerate
  // Append new values to the buffer
  if (newValues.buffer) {
      jsonData.buffer = jsonData.buffer || []; // Initialize buffer if it doesn't exist
      jsonData.buffer.push(...newValues.buffer); // Spread new values into the existing buffer
  }
  if (newValues.packets && Array.isArray(newValues.packets)) {
      jsonData.packets = jsonData.packets || []; // Initialize packets if it doesn't exist
      jsonData.packets.push(...newValues.packets); // Spread new packet objects into the existing packets array
  }
  // Write the updated data back to the file
  writeJSONFile(filePath, jsonData);
};


const updateData = (filePath, uploadedToS3 = false)=>{
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
          console.error('Error reading the file:', err);
          return;
        }
    
        // Parse the JSON data
        let jsonData;
        try {
          jsonData = JSON.parse(data);
        } catch (parseErr) {
          console.error('Error parsing JSON:', parseErr);
          return;
        }
    
        // Check if the key 'receivedPackages' exists
        if (jsonData.hasOwnProperty('uploadedToS3')) {
          // if (uploadedToS3) {
          //   // Increment the 'receivedPackages' value by 1
          //   jsonData['uploadedToS3'] = true;
          // //  console.log('Incremented receivedPackages by 1');
          // } 
          if(jsonData.totalPackages == jsonData.receivedPackages){
            jsonData['ReceivedAllPackets'] = true;
            jsonData['uploadedToS3'] = true;
          }
    
          // Write the updated JSON data back to the file
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
      Bucket: "vtracksolutions", // pass your bucket name
          Key: "media/" + directory + "/" + `${timestamp}` + ".mp4",
      
        Body: data,
        ContentType: "video/mp4"
      };
  
        console.log("Video conversion successful",params);
    
        await uploadToS3(params, {
          fileType: 2,
          fileName: fileName,
          deviceIMEI: IMEI.split("/").pop(),
          filePath: filePath,
          cameraType: getFileToDL
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
          Bucket: "vtracksolutions", // pass your bucket name
          Key: "media/" + directory + "/" + `${timestamp}` + ".jpeg",
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