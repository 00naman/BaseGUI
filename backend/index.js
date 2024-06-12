// index.js (backend)

const express = require('express');
const net = require('net');
const path = require('path')
const fs = require('fs');
const cors = require('cors');


require('dotenv').config()

const app = express();
app.use(express.json());
app.use(cors());




const imagesFolderPath = path.join(__dirname, "../frontend/src/images");


app.get('/images/:folder', (req, res) => {
  const folder = req.params.folder;
  // Correctly construct the path to the directory
  const directoryPath = path.join(__dirname,'..','frontend', 'public', 'boundingbox', folder);

  // Check if directory exists
  if (!fs.existsSync(directoryPath)) {
      return res.status(404).send({ message: "Directory not found!" });
  }

  // Attempt to read the directory
  fs.readdir(directoryPath, (err, files) => {
      if (err) {
          console.error(err); // Log the error to the console
          return res.status(500).send({ message: "Unable to scan files!" });
      }
      const imageFiles = files.filter(file => /\.(jpg|jpeg|png|gif)$/i.test(file))
                             .map(file => `/boundingbox/${folder}/${file}`);
      res.send(imageFiles);
  });
});


// Endpoint to get the URL of the latest image
app.get("/api/latestImage", (req, res) => {
  try {
    // Assuming the latest image is the most recently modified file in the images folder
    const latestImage = getLatestImage(imagesFolderPath);

    // If the latest image exists, send its URL in the response
    if (latestImage) {
      res.json({ imageUrl: latestImage });
    } else {
      res.status(404).json({ error: "No images found" });
    }
  } catch (error) {
    console.error("Error fetching latest image:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Function to get the most recently modified image in the folder
function getLatestImage(folderPath) {
  const fs = require("fs");
  const files = fs.readdirSync(folderPath);

  // Filter out only image files (you may adjust the regex pattern as needed)
  const imageFiles = files.filter(file =>
    /\.(jpg|jpeg|png|gif)$/i.test(file)
  );

  // Sort the image files by modified time (descending order)
  imageFiles.sort((a, b) => {
    return (
      fs.statSync(path.join(folderPath, b)).mtime.getTime() -
      fs.statSync(path.join(folderPath, a)).mtime.getTime()
    );
  });

  // Return the path of the latest image
  return imageFiles.length > 0 ? path.join(folderPath, imageFiles[0]) : null;
}


app.post('/api/imageDetails', (req, res) => {
    // Assuming you want to print the request body
    const { imageName, pixelX, pixelY } = req.body;
    const oldName = imageName.replace('/static/media/','');
    const parts = oldName.split('.');
    // Keep the first five parts and join them back together with dot as the separator
    const newName = parts.slice(0, 5).join('.');
    const [counter,latitude,longitude,alt,yaw] = newName.split('_');
    console.log({counter,latitude,longitude,alt,yaw})
    pixel_offset_x = pixelX - (3984/2)
    pixel_offset_y = pixelY - (2656/2)
    x_coordinate = pixel_offset_x * 0.0071
    y_coordinate = pixel_offset_y * -0.0071
    // Assuming you want to send a response back to the client

    res.json({ counter, latitude, longitude, alt, yaw, x_coordinate, y_coordinate});
});

app.post('/image-click', (req, res) => {
  const { imageName } = req.body;
  newName = imageName.replace(/\.jpg$/, '');
  const [counter,latitude,longitude,alt,yaw,notneed,notneed2,notneed3,pixelX,pixelY] = newName.split('_');
  pixel_offset_x = pixelX - (3984/2)
  pixel_offset_y = pixelY - (2656/2)
  x_coordinate = pixel_offset_x * 0.0071
  y_coordinate = pixel_offset_y * -0.0071
  console.log(x_coordinate,y_coordinate)
  res.json({ counter, latitude, longitude, alt, yaw, x_coordinate, y_coordinate});
});

app.post('/api/processImageDetails', (req, res) => {
  const imageDetailsArray = req.body;

  // Establish a TCP connection to the Python server
  const client = new net.Socket();
  const portnumber = process.env.PORTNUM || 7000
  const ipadd = process.env.IPADD || '192.168.88.131'
  console.log(imageDetailsArray)
  client.connect(portnumber, ipadd, () => {
      console.log(`Connected to Python server at`,{portnumber},);
      client.write(JSON.stringify(imageDetailsArray)); // Send the image details array
  });

  // Handle data received from the Python server
  client.on('data', (data) => {
      console.log('Received data from Python server:', data.toString());
  });

  // Handle connection closed
  client.on('close', () => {
      console.log('Connection closed');
  });

  // Handle errors
  client.on('error', (error) => {
      console.error('Error:', error.message);
  });

  res.send('Data received and forwarded to Python server');
});

// Define the port for the server to listen on
const port = process.env.PORT || 5000;

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
