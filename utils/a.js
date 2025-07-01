const ffmpeg = require('fluent-ffmpeg');
const fs = require("fs");
const path = require("path");
const inputFile = '/home/eurosofttech/camera_server/cam_dev/downloads/864275073580543/1741083442000.h265'
//const inputFile = '/home/eurosofttech/camera_server/camera-footage/downloads/863719061653375/1731073507000.h265'
// const inputFile = '/home/eurosofttech/camera_server/camera-footage/downloads/863719061653375/1730975160000.h265';

const outputFile = '/home/eurosofttech/camera_server/cam_dev/downloads/864275073580543/1741083442000video.mp4';
// const data = fs.readFileSync(outputFile);
// fs.writeFileSync('/home/eurosofttech/camera_server/camera-footage/downloads/863719061653375/1731078866000new.h265',data );


const main =()=>{
    ffmpeg(inputFile)
    .outputOptions([
          '-c:v libx264',        // Use H.265 (HEVC) codec for compression
          '-crf 28',             // Set constant quality (0-51, 23 is default, higher means lower quality)
          '-preset slow',        // Slower encoding to get smaller file size          
          '-movflags +faststart' ,
      ])
      .on('error', (err) => {
        console.error('An error occurred:', err);
      })
      .on('end', () => {
        console.log('Conversion completed!');
      })
      .save(outputFile);
}
main()