import React from "react";
import { Link, useLocation } from "react-router-dom";
import Logo from "../manas_logo_with_border.png"; // Assuming you have a logo file
import Button from "./Button";
import axios from "axios";
import Multiselect from 'multiselect-react-dropdown';



const Navbar: React.FC = () => {
  const location = useLocation();

const state = {
    options: [{name: 'quarter_circle blue R orange',id:1},
    {name:'star orange A purple', id: 2},
    {name:'pentagon blue S orange', id:3},
    {name:'rectangle white T purple', id:4}]
    
};
  

  return (
    <div className="bg-black h-16 flex items-center justify-between px-4">
      <img src={Logo} alt="Logo" className="h-10 w-auto" />
      <p className="text-white text-lg font-bold">ODLC GUI</p>
      {/* {location.pathname === "/Freya" ? (
        <Link to="/">
          <Button label="Go to Home" />
        </Link>
      ) : (
        <Link to="/Freya">
          <Button label="Go to Freya" />
        </Link>
      )} */}

<Multiselect
options={state.options} // Options to display in the dropdown
displayValue="name" // Property name to display in the dropdown options
/>
    </div>
  );
}

export default Navbar;
