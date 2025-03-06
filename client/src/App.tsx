/**
 * App Component - The root component of the Event Reservation System
 * 
 * This component serves as the main entry point for the application and handles:
 * - Application routing using React Router
 * - Global layout and styling
 * - Route definitions for all major pages
 * 
 * The routing structure includes:
 * - Public routes (Home, SignIn, SignUp)
 * - Protected dashboard routes (User, Host, Admin)
 * - Event-specific routes
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

// Import page components
import SignUp from './pages/SignUp/signup';
import SignIn from './pages/SignIn/signin';
import UserDashboard from './pages/dashboard/UserDashboard';
import AdminDashboard from './pages/dashboard/AdminDashboard';
import HostDashboard from './pages/dashboard/HostDashboard';
import Home from './pages/Home/Home';
import EventPage from './pages/EventPagecrud/eventpage';

function App() {
  return (
    // Main application container with a light gray background
    <div className="bg-gray-100 min-h-screen">
      {/* Router wrapper for handling navigation */}
      <Router>
        {/* Route definitions */}
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          
          {/* Protected Dashboard Routes */}
          <Route path="/dashboard/UserDashboard" element={<UserDashboard />} />
          <Route path="/dashboard/HostDashboard" element={<HostDashboard />} />
          <Route path="/dashboard/AdminDashboard" element={<AdminDashboard />} />
          
          {/* Event-specific Routes */}
          <Route path="/events/:eventId" element={<EventPage />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
