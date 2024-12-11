
const { ObjectId } = require("mongodb");
require("dotenv").config();

const fs = require('fs');
var MongoClient = require("mongodb").MongoClient;
const url =
  "mongodb+srv://Wrapper:D2zQcgJvtnKS4Jkr@vtracksolutions.nih4b.mongodb.net/VtrackV1?retryWrites=true&w=majority";

/* exports.uploadToS3 =(params,payload)=>{
  return new Promise((resolve, reject) => {
    let {fileName,fileType,deviceIMEI}=payload
   
    try{
        s3.upload(params, function (s3Err, fileContent) {
            if (s3Err) {
                console.log("Error",s3Err)
                reject(s3Err);
                return 
            }

            uploadedPath = fileContent.Location;
          //    fs.unlink(filePath, (err) => {
          //     if (err) {
          //         console.error("Error deleting file:", err);
          //     } else {
          //         console.log("File deleted successfully");
          //     }
          // }); 
            

            MongoClient.connect(url, function (err, db) {
              
              if (err) {return };
              var dbo = db.db("VtrackV1");
              dbo
                .collection("devices")
                .findOne(
                  { deviceIMEI},
                  function (err, fetchedDevice) {
                   
                    if (fetchedDevice != null && fetchedDevice != undefined) {
                      dbo
                        .collection("deviceassigns")
                        .findOne(
                          { DeviceId: fetchedDevice._id.toString() },
                          function (err, fetchedDeviceassign) {
                    

                            if (
                              fetchedDeviceassign != null &&
                              fetchedDeviceassign != undefined
                            ) {
                              dbo.collection("vehicles").findOne(
                                {
                                  _id: ObjectId(fetchedDeviceassign.VehicleId),
                                },
                                function (err, fetchedVehicle) {
                    

                                  if (
                                    fetchedVehicle != null &&
                                    fetchedVehicle != undefined
                                  ) {
                                    var videoListObject = {};
                                    videoListObject["clientId"] =
                                      fetchedDeviceassign.clientId;
                                    videoListObject["dateTime"] = new Date();

                                    videoListObject["fileType"] = fileType;
                                    videoListObject["fileName"] = fileName;
                                    videoListObject["Vehicle"] =
                                      fetchedVehicle.vehicleReg;
                                    videoListObject["path"] = uploadedPath;
                                    videoListObject["isSeen"] = false;

                                    dbo
                                      .collection("videolists")
                                      .insertOne(
                                        videoListObject,
                                        function (err, res) {
                                          if (err) {}
                                          console.log("1 document inserted");
                                          resolve("Upload completed successfully");
                                          // db.close();
                                        }
                                      );
                                  }
                                }
                              );
                            }
                          }
                        );
                    }
                  }
                );
            });
          });
    }catch(e){
      
    }
   } )
}
 */

/* exports.uploadToS3 = (params, payload) => {
  return new Promise((resolve, reject) => {
      let { fileName, fileType, deviceIMEI } = payload;

      s3.upload(params, function (s3Err, fileContent) {
          if (s3Err) {
              console.error("Error", s3Err);
              reject(s3Err);
              return;
          }

          uploadedPath = fileContent.Location;

          MongoClient.connect(url, function (err, db) {
              if (err) {
                  reject(err);
                  return;
              }
              var dbo = db.db("VtrackV1");
              dbo.collection("vehicles").findOneAndUpdate(
                  { path: uploadedPath },
                  {
                      $set: {
                          dateTime: new Date(),
                          fileType: fileType,
                          fileName: fileName,
                          Vehicle: deviceIMEI, // Assuming deviceIMEI is the vehicle attribute value
                          path: uploadedPath,
                          isSeen: false
                      }
                  },
                  { upsert: true }, // Creates a new document if not found
                  function (err, res) {
                      if (err) {
                          reject(err);
                          return;
                      }
                      console.log("Document updated or inserted");
                      resolve("Upload completed successfully");
                  }
              );
          });
      });
  });
};
 */



//correct work but old sdk
// exports.uploadToS3 =(params,payload)=>{
//   return new Promise((resolve, reject) => {
//     let {fileName,fileType,deviceIMEI,cameraType,filePath}=payload
//    console.log("111111111111111",fileName,fileType,deviceIMEI,cameraType);
//     try{
//         s3.upload(params, function (s3Err, fileContent) {
//             if (s3Err) {
//                 console.log("Error",s3Err)
//                 reject(s3Err);
//                 return 
//             }

//             uploadedPath = fileContent.Location;
//             MongoClient.connect(url, function (err, db) {
              
//               if (err) {return };
//               var dbo = db.db("VtrackV1");
//               dbo
//                 .collection("devices")
//                 .findOne(
//                   { deviceIMEI},
//                   function (err, fetchedDevice) {
                   
//                     if (fetchedDevice != null && fetchedDevice != undefined) {
//                       dbo
//                         .collection("deviceassigns")
//                         .findOne(
//                           { DeviceId: fetchedDevice._id.toString() },
//                           function (err, fetchedDeviceassign) {
                    

//                             if (
//                               fetchedDeviceassign != null &&
//                               fetchedDeviceassign != undefined
//                             ) {
//                               dbo.collection("vehicles").findOne(
//                                 {
//                                   _id: ObjectId(fetchedDeviceassign.VehicleId),
//                                 },
//                                 function (err, fetchedVehicle) {
                    

//                                   if (
//                                     fetchedVehicle != null &&
//                                     fetchedVehicle != undefined
//                                   ) {
//                                     var videoListObject = {};
//                                     videoListObject["clientId"] =
//                                       fetchedDeviceassign.clientId;
//                                     videoListObject["dateTime"] = new Date();

//                                     videoListObject["fileType"] = fileType;
//                                     videoListObject["fileName"] = fileName;
//                                     videoListObject["Vehicle"] =
//                                       fetchedVehicle.vehicleReg;
//                                     videoListObject["path"] = uploadedPath;
//                                     videoListObject["isSeen"] = false;
//                                     videoListObject["cameraType"] =  cameraType

//                                     dbo
//                                       .collection("videolists")
//                                       .findOneAndUpdate(
//                                         { path: uploadedPath, clientId:fetchedDeviceassign.clientId, Vehicle:videoListObject.Vehicle },
//                                         {
//                                             $set: {
//                                                 dateTime: new Date(),
//                                                 fileType: fileType,
//                                                 fileName: fileName,
//                                                 Vehicle: videoListObject.Vehicle, // Assuming deviceIMEI is the vehicle attribute value
//                                                 path: uploadedPath,
//                                                 isSeen: false,
//                                                 cameraType:cameraType
//                                             }
//                                         },
//                                         { upsert: true },
//                                         function (err, res) {
//                                           if (err) {}
//                                           // fs.unlink(filePath,(err)=>{
//                                           //   console.log(err)
//                                           // })
//                                           console.log("1 document inserted");
//                                           resolve("Upload completed successfully");
//                                           // db.close();
//                                         }
//                                       );
//                                   }
//                                 }
//                               );
//                             }
//                           }
//                         );
//                     }
//                   }
//                 );
//             });
//           });
//     }catch(e){
      
//     }
//    } )
// }
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWSREGION,
  credentials: {
    accessKeyId: process.env.ACCESSKEY,
    secretAccessKey: process.env.SECRETACCESS,
  },
});

exports.uploadToS3 = async (params, payload) => {
  return new Promise(async (resolve, reject) => {
    let { fileName, fileType, deviceIMEI, cameraType, filePath } = payload;
    console.log("Uploading:", fileName, fileType, deviceIMEI, cameraType);

    try {
      // Upload file to S3
      const command = new PutObjectCommand(params);
      const fileContent = await s3Client.send(command);
      const uploadedPath = `https://${params.Bucket}.s3.${s3Client.config.region}.amazonaws.com/${params.Key}`;
      console.log("File uploaded successfully:", uploadedPath);

      // MongoDB operations
      MongoClient.connect(url, async (err, db) => {
        if (err) {
          console.error("MongoDB connection error:", err);
          reject(err);
          return;
        }
        const dbo = db.db("VtrackV1");

        try {
          const fetchedDevice = await dbo.collection("devices").findOne({ deviceIMEI });
          if (!fetchedDevice) {
            console.error("Device not found for IMEI:", deviceIMEI);
            reject(new Error("Device not found"));
            return;
          }

          const fetchedDeviceAssign = await dbo
            .collection("deviceassigns")
            .findOne({ DeviceId: fetchedDevice._id.toString() });

          if (!fetchedDeviceAssign) {
            console.error("Device assign not found for DeviceId:", fetchedDevice._id);
            reject(new Error("Device assign not found"));
            return;
          }

          const fetchedVehicle = await dbo.collection("vehicles").findOne({
            _id: ObjectId(fetchedDeviceAssign.VehicleId),
          });

          if (!fetchedVehicle) {
            console.error("Vehicle not found for VehicleId:", fetchedDeviceAssign.VehicleId);
            reject(new Error("Vehicle not found"));
            return;
          }

          const videoListObject = {
            clientId: fetchedDeviceAssign.clientId,
            dateTime: new Date(),
            fileType,
            fileName,
            Vehicle: fetchedVehicle.vehicleReg,
            path: uploadedPath,
            isSeen: false,
            cameraType,
          };

          await dbo.collection("videolists").findOneAndUpdate(
            { path: uploadedPath, clientId: fetchedDeviceAssign.clientId, Vehicle: videoListObject.Vehicle },
            { $set: videoListObject },
            { upsert: true }
          );

          console.log("Database updated successfully");
          resolve("Upload and database update completed successfully");
        } catch (dbErr) {
          console.error("Error during database operations:", dbErr);
          reject(dbErr);
        } finally {
          db.close();
        }
      });
    } catch (s3Err) {
      console.error("Error uploading file to S3:", s3Err);
      reject(s3Err);
    }
  });
};
