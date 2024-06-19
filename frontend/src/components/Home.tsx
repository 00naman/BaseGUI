import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Button from './Button';
import Modal from './Modal';
import ImageGallery from './Scroll';

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
    const [folderIndex, setFolderIndex] = useState<number>(1); // New state for managing folder index
    const [images2, setImages2] = useState<string[]>([]); // Store image file paths
    const [images, setImages] = useState<string[]>([]); // Store image file paths
    const [selectedIndex, setSelectedIndex] = useState<number>(0); // Store the index of the selected image
    const [imageDetails, setImageDetails] = useState<ImageDetails|null>(null); // Store image details
    const [imageDetailsArray, setImageDetailsArray] = useState<ImageDetails[]>([]);    
    const [lastSelectedIndex, setLastSelectedIndex] = useState<number>(0); // Store the index of the last selected image
    const [pinNumber, setPinNumber] = useState<string>(''); // Store the selected number
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [modalMessage, setModalMessage] = useState<string>('');
    const [currentFolder, setCurrentFolder] = useState<string>('images'); // Store the current image folder\
    const [lastUpdated, setLastUpdated] = useState<'imageDetails' | 'clickedImageData'>();  // This will track which data was last updated
    const [clickedImageData, setClickedImageData] = useState({
      counter: '',
      latitude: '',
      longitude: '',
      alt: '',
      yaw: '',
      x_coordinate: '',
      y_coordinate: '',
    });

    useEffect(() => {
      if (imageDetails && Object.keys(imageDetails).length > 0) {
          setLastUpdated('imageDetails');
      }
  }, [imageDetails]);
  
  useEffect(() => {
      if (clickedImageData && clickedImageData.counter !== '') { // Assuming counter being empty means not initialized
          setLastUpdated('clickedImageData');
      }
  }, [clickedImageData]);


    useEffect(() => {
      async function fetchImages() {
          try {
              const response = await fetch(`http://localhost:5000/images/${folderIndex}`);
              if (!response.ok) {
                  throw new Error('Network response was not ok');
              }
              const imageUrls = await response.json() as string[];
              setImages2(imageUrls);
          } catch (error) {
              console.error("Failed to load images:", error);
              setImages2([]);
          }
      }

      fetchImages();
  }, [folderIndex]);

  const handleImageClick2 = async (imageName: string): Promise<void> => {
    try {
      const response = await fetch('http://localhost:5000/image-click', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ imageName: imageName.split('/').pop() || '' })
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setClickedImageData({
        counter: data.counter,
        latitude: data.latitude,
        longitude: data.longitude,
        alt: data.alt,
        yaw: data.yaw,
        x_coordinate: data.x_coordinate,
        y_coordinate: data.y_coordinate
      });
    } catch (error) {
      console.error('Failed to send image name and receive data:', error);
    }
  };


  useEffect(() => {
      const handleKeyDown = (event: KeyboardEvent) => {
          if (event.key === 'ArrowRight') {
              setFolderIndex(prev => prev + 1);
          } else if (event.key === 'ArrowLeft') {
              setFolderIndex(prev => Math.max(prev - 1, 1));
          }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);



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
      const confirm = window.confirm(`You have selected pin number ${pinNumber}`);
      if (!confirm) {
          return; // If user does not confirm, do not proceed
      }
      if (lastUpdated === 'imageDetails' && imageDetails) {
          // Append the selected number to the image details
          const updatedDetails = { ...imageDetails, pinNumber };
          setImageDetailsArray(prevArray => [...prevArray, updatedDetails]);
      } else if (lastUpdated === 'clickedImageData' && clickedImageData) {
        const updatedDetails2 = { ...clickedImageData, pinNumber };
          setImageDetailsArray(prevArray => [...prevArray, updatedDetails2]);
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
        // Confirmation dialog
        const confirm = window.confirm("Are you sure you want to send the details? This action cannot be undone.");
        if (confirm) {
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
    // window.alert(`You selected pin number ${newPinNumber}`);
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
              <div className='flex flex-row gap-2'>
            {images2.map((src, index) => (
            <img key={index} src={src} alt={`Folder ${folderIndex} Image ${index}`}
             onClick={() => handleImageClick2(src)}
             style={{ maxWidth: '100%' }} />  
              ))}
              </div>
            <div>
        <p>Counter: {clickedImageData.counter}</p>
        <p>Latitude: {clickedImageData.latitude}</p>
        <p>Longitude: {clickedImageData.longitude}</p>
        {/* <p>Altitude: {clickedImageData.alt}</p> */}
        <p>Yaw: {clickedImageData.yaw}</p>
        <p>X offset: {clickedImageData.x_coordinate}</p>
        <p>Y offset: {clickedImageData.y_coordinate}</p>
      </div>
          </div>
            <div className='flex flex-row'>
            <Button onClick={handleYoloClick} label = "YOLO" className='mr-2 mt-4'/>
            <Button onClick={handleClick} label="Append" className="mt-4 mr-2" />
            <Button onClick={handleZero} label="Send Zero" className='mt-4 mr-2'/>
            </div>
            <div className='flex flex-row'>
            <Button onClick={handleDelete} label="Delete Latest" className="mt-2 mr-4" />
            <Button onClick={handleCenter} label="Click for centering" className="mt-2 mr-4"/>
            <Button onClick={handlePrevImage} label="Prev" className="mt-2 mr-4" />
            <Button onClick={handleNextImage} label="Next" className="mt-2" />
            </div>
            <div>
            <p>Pin Number:<select  value={pinNumber} onChange={handlePinChange} className="block w-full mt-1 p-2 bg-gray-200">
              <option value="0">CLICK</option>
              <option value="10">10</option>
              <option value="11">11</option>
              <option value="12">12</option>
              <option value="13">13</option>
              <option value="14">14</option>
         </select> </p>
            <Modal isOpen={isModalOpen} onClose={closeModal} message={modalMessage} />
            </div>
            {imageDetails && ( 
          <div>
            <p>Counter: {imageDetails.counter}</p>
            <p>Latitude: {imageDetails.latitude}</p>
            <p>Longitude: {imageDetails.longitude}</p>
            <p>Yaw: {imageDetails.yaw}</p>
            <p>X offset: {imageDetails.x_coordinate}</p>
            <p>Y offset: {imageDetails.y_coordinate}</p>
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
