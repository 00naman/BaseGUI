import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";

export default function Layout(){
  return (
    <div className="flex flex-col min-h-screen" >
      <Navbar />
      <div className="flex-1">
        <Outlet /> {/* Render child routes here */}
      </div>
      <Footer />
    </div>
  );
}
