import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './components/Home';
import Test from './components/Test';

function App() {
  return (
    <Router>
      <div>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home/>} />
            <Route path="/Freya" element={<Test/>}/>
          </Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;
