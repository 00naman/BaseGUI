import React, { useState, useEffect } from 'react';

interface ImageGalleryProps {
    // Define any props your component might take, if necessary
}

const ImageGallery: React.FC<ImageGalleryProps> = () => {
  const [folderIndex, setFolderIndex] = useState<number>(1);
  const [images, setImages] = useState<string[]>([]);
  const [clickedImageData, setClickedImageData] = useState({
    counter: '',
    latitude: '',
    longitude: '',
    alt: '',
    yaw: '',
    x_coordinate: 0,
    y_coordinate: 0
  });

  useEffect(() => {
    fetchImages(folderIndex);
  }, [folderIndex]);

  const fetchImages = async (index: number): Promise<void> => {
    try {
      const response = await fetch(`http://localhost:5000/images/${index}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const imageUrls = await response.json() as string[];
      setImages(imageUrls);
    } catch (error) {
      console.error("Failed to load images:", error);
      setImages([]);
    }
  };

  const handleImageClick = async (imageName: string): Promise<void> => {
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

  return (
    <div className='p-1 flex flex-row gap-2'>
      {images.map((src, index) => (
        <img key={index} src={src} alt={`Folder ${folderIndex} Image ${index}`}
             onClick={() => handleImageClick(src)}
             style={{ maxWidth: '100%' }} />
      ))}
      {/* Optionally display the received data */}
      <div>
        <p>Counter: {clickedImageData.counter}</p>
        <p>Latitude: {clickedImageData.latitude}</p>
        <p>Longitude: {clickedImageData.longitude}</p>
        <p>Altitude: {clickedImageData.alt}</p>
        <p>Yaw: {clickedImageData.yaw}</p>
        <p>X Coordinate: {clickedImageData.x_coordinate.toFixed(2)}</p>
        <p>Y Coordinate: {clickedImageData.y_coordinate.toFixed(2)}</p>
      </div>
    </div>
  );
};

export default ImageGallery;
