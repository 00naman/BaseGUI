import React, { useState, useEffect } from 'react';

interface ImageGalleryProps {
    // Define any props your component might take, if necessary
}

const ImageGallery: React.FC<ImageGalleryProps> = () => {
  const [folderIndex, setFolderIndex] = useState<number>(1);
  const [images, setImages] = useState<string[]>([]);

  // Load images when folder index changes
  useEffect(() => {
    fetchImages(folderIndex);
  }, [folderIndex]);

  const fetchImages = async (index: number): Promise<void> => {
    try {
      const response = await fetch(`http://localhost:5000/images/${index}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const imageUrls = await response.json() as string[]; // Ensure the response is treated as an array of strings
      setImages(imageUrls);
    } catch (error) {
      console.error("Failed to load images:", error);
      setImages([]); // Ensures 'images' is always an array
    }
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight') {
        setFolderIndex(prev => prev + 1); // Increment folder index
      } else if (event.key === 'ArrowLeft') {
        setFolderIndex(prev => Math.max(prev - 1, 1)); // Decrement folder index but not below 1
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className='p-1 flex flex-row gap-2'>
      {images.map((src, index) => (
        <img key={index} src={src} alt={`Folder ${folderIndex} Image ${index}`} style={{ maxWidth: '100%' }} />
      ))}
    </div>
  );
};

export default ImageGallery;
