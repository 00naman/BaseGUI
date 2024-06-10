import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Button from './Button';
import Modal from './Modal';

interface ImageDetails {
    latitude: string;
    longitude: string;
    alt: string;
    yaw: string;
    y_coordinate : string;
    x_coordinate : string;
    counter: string;
}


const imagesContext = (require as any).context('../images', false, /\.(jpg|jpeg|png|gif)$/);
const yoloImagesContext = (require as any).context('../yoloimages', false, /\.(jpg|jpeg|png|gif)$/);



const Home: React.FC = () => {
    const [images, setImages] = useState<string[]>([]); // Store image file paths
    const [selectedIndex, setSelectedIndex] = useState<number>(0); // Store the index of the selected image
    const [imageDetails, setImageDetails] = useState<ImageDetails|null>(null); // Store image details
    const [imageDetailsArray, setImageDetailsArray] = useState<ImageDetails[]>([]);    
    const [lastSelectedIndex, setLastSelectedIndex] = useState<number>(0); // Store the index of the last selected image
    const [pinNumber, setPinNumber] = useState<string>(''); // Store the selected number
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [modalMessage, setModalMessage] = useState<string>('');
    const [currentFolder, setCurrentFolder] = useState<string>('images'); // Store the current image folder



    useEffect(() => {
      const importImages = () => {
        const requireWithContext = currentFolder === 'images' ? imagesContext : yoloImagesContext;
        const imagesArray: string[] = requireWithContext.keys().map((key: string) => requireWithContext(key));
        setImages(imagesArray);
        setLastSelectedIndex(imagesArray.length - 1);
    };
    

        importImages();

        const intervalId = setInterval(importImages, 5000); // Check every 5 seconds for changes in the images folder

        return () => clearInterval(intervalId); // Cleanup function to clear the interval on component unmount
    }, [currentFolder]);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'ArrowRight' && selectedIndex < images.length - 1) {
                setSelectedIndex((prevIndex) => prevIndex + 1);
            } else if (event.key === 'ArrowLeft' && selectedIndex > 0) {
                setSelectedIndex((prevIndex) => prevIndex - 1);
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [selectedIndex, images.length]);

    

    const handleImageClick = async (event: React.MouseEvent<HTMLDivElement>) => {
        const imageDiv = event.currentTarget;
        const rect = imageDiv.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        // Calculate pixel coordinates relative to the image
        const image = document.querySelector('.max-w-full') as HTMLImageElement;
        const imageWidth = image.naturalWidth;
        const imageHeight = image.naturalHeight;
        const pixelX = Math.floor((x / rect.width) * imageWidth);
        const pixelY = Math.floor((y / rect.height) * imageHeight);

        const imageName = images[selectedIndex];
        try {
            // Send image name and pixel coordinates to the server
            const response = await axios.post('/api/imageDetails', { imageName, pixelX, pixelY });
            // Update image details state with the response from the server
            setImageDetails(response.data);
            console.log('Data sent successfully');
        } catch (error) {
            console.error('Error sending data to server:', error);
        }

    
    };

    const handleClick = () => {
      if (imageDetails) {
          // Append the selected number to the image details
          const updatedDetails = { ...imageDetails, pinNumber };
          setImageDetailsArray(prevArray => [...prevArray, updatedDetails]);
      }
  };


  const handleZero = () => {
    const zeroDetails: ImageDetails = {
        latitude: '0',
        longitude: '0',
        alt: '0',
        yaw: '0',
        y_coordinate: '0',
        x_coordinate: '0',
        counter: '0'
    };
    setImageDetailsArray(prevArray => [...prevArray, zeroDetails]);
};

  

      const handleDelete = () => {
        setImageDetailsArray(prevArray => {
          const newArray = [...prevArray];
          newArray.pop(); // Remove the last element
          return newArray;
        });
      };

      const handleSend = async () => {
        try {
          console.log(imageDetailsArray);
          // Send the imageDetailsArray to the server
          const response = await axios.post('/api/processImageDetails', imageDetailsArray);
          console.log('Image details sent successfully:', response.data);
          // Clear the imageDetailsArray after sending
          setImageDetailsArray([]);
        } catch (error) {
          console.error('Error sending image details to server:', error);
        }
      };
      
      const handleCenter = () => {
        setSelectedIndex(lastSelectedIndex);
    };
    
    const handleNextImage = () => {
      setSelectedIndex((prevIndex) => (prevIndex < images.length - 1 ? prevIndex + 1 : prevIndex));
  };

  const handlePrevImage = () => {
      setSelectedIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : prevIndex));
  };

  const handleYoloClick = () => {
    setCurrentFolder((prevFolder) => (prevFolder === 'images' ? 'yoloimages' : 'images'));
};



  const handlePinChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newPinNumber = e.target.value;
    setModalMessage(`You selected pin number ${newPinNumber}`);
    setIsModalOpen(true);
    setPinNumber(newPinNumber);
};

  const closeModal = () => {
      setIsModalOpen(false);
  };
  
  
    return (
        <div className="flex">
            <div className="w-3/4" onClick={handleImageClick}>
                {/* Display the selected image */}
                {images.length > 0 && (
                    <img src={images[selectedIndex]} alt="Selected Image" className="max-w-full" />
                )}
            </div>
            
            <div className="w-1/4 p-4">
            <div className='pl-3'>Image No: {selectedIndex+1}
            <Button onClick={handlePrevImage} label="Prev" className="ml-2" />
                    <Button onClick={handleNextImage} label="Next" className="ml-2" />
                    <Button onClick={handleYoloClick} label = "YOLO" className='ml-2'/></div>
            <Button onClick={handleCenter} label="Click For Centering" className="mt-2"/>
            {imageDetails && (
          <div>
    
            <p>Latitude: {imageDetails.latitude}</p>
            <p>Longitude: {imageDetails.longitude}</p>
            <p>Yaw: {imageDetails.yaw}</p>
            <p>X offset: {imageDetails.x_coordinate}</p>
            <p>Y offset: {imageDetails.y_coordinate}</p>
            <p>Counter: {imageDetails.counter}</p>
            <p>Pin Number:<select  value={pinNumber} onChange={handlePinChange} className="block w-full mt-1 p-2 bg-gray-200">
              <option value="0">CLICK</option>
              <option value="10">10</option>
              <option value="11">11</option>
              <option value="12">12</option>
              <option value="13">13</option>
              <option value="14">14</option>
         </select> </p>
         <div>
            <Button onClick={handleClick} label="Append" className="mt-4 mr-2" />
            <Button onClick={handleZero} label="Send Zero" className='mt-4 mr-2'/>
            <Button onClick={handleDelete} label="Delete Latest" className="mt-2" />
            <Modal isOpen={isModalOpen} onClose={closeModal} message={modalMessage} />
            </div>
          </div>
        )}
        {imageDetailsArray.length > 0 && (
          <div className="mt-4 ">
            <h2>Appended Details:</h2>
            <ul>
              {imageDetailsArray.map((details, index) => (
                <li key={index}  className="border border-gray-300 p-2 mr-2">
                  Latitude: {details.latitude}, Longitude: {details.longitude}, Yaw: {details.yaw}, 
                  X offset: {details.x_coordinate}, Y offset: {details.y_coordinate}
                </li>
              ))}
            </ul>
          </div>
        )}     
        <div className='flex flex-col'>
        <Button onClick={handleSend} label="DONT CLICK UNTIL DONE" className="mt-2" />
        </div>

      </div>
        </div>
    );
};

export default Home;
