import Button from "./Button";
import { Link, useLocation } from "react-router-dom";

export default function Footer() {
    const location = useLocation();

    return(
        <div  className="text-center">
            © 2024 Project Manas. All rights reserved.
             {location.pathname === "/Freya" ? (
        <Link to="/">
          <Button label="Home" />
        </Link>
      ) : (
        <Link to="/Freya">
          <Button label="Freya" />
        </Link>
      )} 
        </div>
    );
}