import React, { useState, FormEvent } from 'react';
import axios from 'axios';
import { Input, Button, Typography, Space, Card, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode'; // Import the jwt-decode library

const { Title } = Typography;

const SignIn: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const navigate = useNavigate();

  const submitHandler = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    axios
      .post('http://localhost:3000/signin', { email, password })
      .then((response) => {
        const token = response.data.token; // Get the raw JWT
        localStorage.setItem('token', token); // Save the token in localStorage

        // Decode the JWT to access the role
        const decodedToken: any = jwtDecode(token); // Use jwt-decode to parse the token
        const role = decodedToken.role; // Extract the role field

        // Redirect based on the role
        if (role === 'USER') {
          navigate('/dashboard/UserDashboard');
        } else if (role === 'ADMIN') {
          navigate('/dashboard/AdminDashboard');
        } else if (role === 'HOST') {
          navigate('/dashboard/HostDashboard');
        }
      })
      .catch((error) => {
        setErrorMessage(error.response.data.message);
      });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <div className="text-center mb-6">
          <Title level={2}>Sign In</Title>
        </div>
        <form onSubmit={submitHandler} className="space-y-4">
          <div>
            <Input
              size="large"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <Input.Password
              size="large"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <Space className="w-full justify-between">
            <Button type="primary" htmlType="submit" size="large">
              Sign In
            </Button>
            <Button 
              size="large" 
              onClick={() => navigate('/signup')}
            >
              Create Account
            </Button>
          </Space>
        </form>
        {errorMessage && (
          <div className="mt-4">
            <Typography.Text type="danger">{errorMessage}</Typography.Text>
          </div>
        )}
      </Card>
    </div>
  );
};

export default SignIn;
