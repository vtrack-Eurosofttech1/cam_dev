const { exec } = require("child_process");

exports.ConvertVideoFile=(directory, frameratevideo, filename, extension)=>{
    return new Promise((resolve, reject) => {
    
      console.log("SD", `${directory}/${filename}${extension}`);
  
     const form_command = `ffmpeg -hide_banner -loglevel quiet -r ${frameratevideo} -i "${directory}/${filename}${extension}" -ss 00:00:0.9 -c:a copy -c:v libx264 -preset ultrafast  "${directory}/${filename}.mp4"`;
     // let form_command = `ffmpeg -hide_banner -loglevel quiet -r " ${frameratevideo} " -i \"" "${directory}//${filename}${extension}" -ss 00:00:0.9 -c:a copy -c:v libx264 \"" "${directory}/${filename}.mp4"`;
   console.log(form_command)
      exec(form_command, (error, stdout, stderr) => {
        if (error) {
          console.log(error)
           console.log(`Error: ${error.message}`);
          return   reject(`Error: ${error.message}`);
        }
        if (stderr) {
          //console.log(`Stderr: ${stderr}`);
        }
        console.log(
          `Conversion completed successfully. "${filename}${extension}"`
        );
        return resolve(`Stderr: ${stderr}`);
  
      });
    });
  } 
/*
//wine installed    
 exports.ConvertVideoFile = (directory, frameratevideo, filename, extension) => {
      return new Promise((resolve, reject) => {
        // Assuming videoconverter.exe takes input and output file paths as arguments
        const inputFilePath = `${directory}/${filename}${extension}`;
        const outputFilePath = `${directory}/${filename}.mp4`;
    
        // Command to execute videoconverter.exe
        const command = `wine ./VideoConverter.exe "${inputFilePath}" "${outputFilePath}"`;
    
        exec(command, (error, stdout, stderr) => {
          if (error) {
            console.error(`Error executing videoconverter.exe: ${error}`);
            return reject(error);
          }
          if (stderr) {
            console.error(`Stderr from videoconverter.exe: ${stderr}`);
          }
          console.log(`Conversion completed successfully: ${filename}${extension} -> ${filename}.mp4`);
          resolve(outputFilePath); // Resolve with the path to the converted file
        });
      });
    }; */

