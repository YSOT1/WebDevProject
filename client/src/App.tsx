import React from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'; // Import routing components
import './App.css';
import SignUp from './pages/SignUp/signup'; // Import SignUp page
import SignIn from './pages/SignIn/signin'; // Import SignIn page
import Dashboard from './pages/dashboard/dashboard'; // Import Dashboard page
function App() {
  const apiCall = () => {
    axios.get('http://localhost:3000').then(() => {
      console.log('API call success');
    });
  };

  return (
    <div className="bg-gray-100 min-h-screen"> {/* Add background color to the body */}
      <Router> {/* Wrap the routes inside the Router */}
        <Routes> {/* Define your routes */}
          <Route path="/signup" element={<SignUp />} /> {/* Add route for SignUp page */}
          <Route path="/" element={<button onClick={apiCall} className="fixed bottom-4 right-4 p-2 bg-blue-500 text-white rounded-full">
          API Call
        </button>} />
          <Route path="/signin" element={<SignIn />}/>
          
        </Routes>
        
      </Router>
    </div>
  );
}

export default App;
