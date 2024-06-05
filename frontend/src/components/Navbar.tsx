import React from "react";
import { Link, useLocation } from "react-router-dom";
import Logo from "../manas_logo_with_border.png"; // Assuming you have a logo file
import Button from "./Button";
import axios from "axios";
import Multiselect from 'multiselect-react-dropdown';



const Navbar: React.FC = () => {
  const location = useLocation();

const state = {
    options: []
    
};
  

  return (
    <div className="bg-black h-16 flex items-center justify-between px-4">
      <img src={Logo} alt="Logo" className="h-10 w-auto" />
      <p className="text-white text-lg font-bold">ODLC GUI</p>
      <p></p>
    </div>
  );
}

export default Navbar;
