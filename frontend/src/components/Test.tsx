import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";

// Assuming DSC_0097.jpeg is located in the parent directory
import backgroundImage from "../DSC_0097.jpeg";

const Test = () => {
  const [backgroundPosition, setBackgroundPosition] = useState("center 20%");

  useEffect(() => {
    let startTime = Date.now();
    const intervalId = setInterval(() => {
      const currentTime = Date.now();
      const elapsedTime = currentTime - startTime;
      let percentage = (elapsedTime / 6000) * 100; // 20 seconds interval

      // If elapsed time exceeds 20 seconds, reset startTime and percentage
      if (elapsedTime >= 20000) {
        startTime = currentTime;
        percentage = 0;
      }

      setBackgroundPosition(`center ${Math.min(20 + percentage, 200)}%`);
    }, 1000); // Update every second

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="flex flex-col min-h-screen" style={{
      backgroundImage: `url(${backgroundImage})`,
      backgroundSize: "cover",
      backgroundPosition: backgroundPosition,
    }}>
      {/* Add your content here */}
    </div>
  );
};

export default Test;
