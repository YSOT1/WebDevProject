import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // If you're using React Router
import { Button } from 'antd';

const Dashboard: React.FC = () => {
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const navigate = useNavigate();

  // Simulate fetching user data
  useEffect(() => {
    // Fetch user data from localStorage or an API
    const loggedInUser = JSON.parse(localStorage.getItem('user') || 'null');
    if (loggedInUser) {
      setUser(loggedInUser);
    } else {
      // Redirect to sign-in if no user is found
      navigate('/signin');
    }
  }, [navigate]);

  // Handle sign-out
  const handleSignOut = () => {
    // Clear user data from localStorage and redirect to sign-in
    localStorage.removeItem('user');
    navigate('/signin');
  };

  if (!user) {
    return <p>Loading...</p>; // Show a loading message while fetching user data
  }

  return (
    <div className="dashboard-container p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Welcome, {user.name}!</h1>
      <p className="text-lg mb-6">Email: {user.email}</p>
      
      <div className="actions flex flex-col md:flex-row gap-4">
        <Button type="primary" className="w-full md:w-auto" onClick={() => navigate('/profile')}>
          View Profile
        </Button>
        <Button type="default" className="w-full md:w-auto" onClick={() => navigate('/settings')}>
          Account Settings
        </Button>
        <Button type="danger" className="w-full md:w-auto" onClick={handleSignOut}>
          Sign Out
        </Button>
      </div>
    </div>
  );
};

export default Dashboard;
