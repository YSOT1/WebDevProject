import React, { useEffect, useState } from 'react';
import axios from 'axios';

const AdminDashboard: React.FC = () => {
    const [userData, setUserData] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const token = localStorage.getItem('token');

        if (token) {
            axios
                .get('http://localhost:3000/user', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                })
                .then((response) => {
                    setUserData(response.data);  // Set user data for display
                    setLoading(false);  // Stop loading
                })
                .catch((error) => {
                    console.error(error);
                    setLoading(false);  // Stop loading in case of error
                });
        } else {
            setLoading(false);  // Stop loading if no token is found
        }
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!userData) {
        return <div>Please sign in</div>;  // Display message if no user data found
    }

    return (
        <div>
            <h1>Hello, {userData.firstName} {userData.lastName}!</h1>
        </div>
    );
};

export default AdminDashboard;
