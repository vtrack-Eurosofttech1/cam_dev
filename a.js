const fs = require('fs');

function splitFileIntoChunks(filePath, chunkSize = 1024) {
    // Step 1: Read the file and convert it to a buffer
    fs.readFile(filePath, (err, data) => {
        if (err) {
            console.error("Error reading file:", err);
            return;
        }

        // Step 2: Calculate the number of chunks
        const totalChunks = Math.ceil(data.length / chunkSize);
        console.log(`Total file size: ${data.length} bytes`);
        console.log(`Total chunks: ${totalChunks}`);

        // Step 3: Split the buffer into chunks
        const chunks = [];
        for (let i = 0; i < totalChunks; i++) {
            const chunkStart = i * chunkSize;
            const chunkEnd = Math.min((i + 1) * chunkSize, data.length); // To handle the last chunk if smaller than chunkSize
            const chunk = data.slice(chunkStart, chunkEnd);
            chunks.push(chunk);
            console.log(`Chunk ${i + 1}: Start: ${chunkStart} End: ${chunkEnd} Size: ${chunk.length} bytes`);
        }

        // Return the chunks if needed for further processing
        return chunks;
    });
}

// Example usage
const filePath = '/home/eurosofttech/camera_server/new_work/downloads/866907056700205/1733834773000.jpeg'; // Provide the path to your .jpeg file
splitFileIntoChunks(filePath);
