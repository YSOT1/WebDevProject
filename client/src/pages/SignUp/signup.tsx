import React, { useState, FormEvent } from 'react';
import { Input, Button, Typography, Space, Card, Select } from 'antd';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;
const { Option } = Select;

const SignUp: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [firstname, setFirstname] = useState<string>('');
  const [lastname, setLastname] = useState<string>('');
  const [role, setRole] = useState<string>('');

  const navigate = useNavigate();

  const handleChange = (value: string) => {
    setRole(value);
  };

  const validateForm = (): boolean => {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    const validEmailDomains = ['gmail.com', 'yahoo.com', 'outlook.com'];
    const emailDomain = email.split('@')[1];

    if (!emailRegex.test(email)) {
      alert('Please enter a valid email address.');
      return false;
    }

    if (!validEmailDomains.includes(emailDomain)) {
      alert(
        'The email must be from a valid domain (e.g., gmail.com, yahoo.com, outlook.com).'
      );
      return false;
    }

    if (!password || !firstname || !lastname || !role) {
      alert('Please fill out all fields.');
      return false;
    }

    return true;
  };

  const submitHandler = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    axios
      .post('http://localhost:3000/signup', {
        email,
        password,
        firstname,
        lastname,
        role,
      })
      .then((data) => {
        console.log(data);
        alert('Signup successful! Redirecting to Sign In...');
        navigate('/signin');
        setEmail('');
        setPassword('');
        setFirstname('');
        setLastname('');
        setRole('');
      })
      .catch((error) => {
        alert('Signup failed. Please try again.');
        console.error(error);
      });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <div className="text-center mb-6">
          <Title level={2}>Sign Up</Title>
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
          <div>
            <Input
              size="large"
              placeholder="First Name"
              value={firstname}
              onChange={(e) => setFirstname(e.target.value)}
            />
          </div>
          <div>
            <Input
              size="large"
              placeholder="Last Name"
              value={lastname}
              onChange={(e) => setLastname(e.target.value)}
            />
          </div>
          <div>
            <Select
              size="large"
              value={role}
              onChange={handleChange}
              placeholder="Select your role"
              style={{ width: '100%' }}
            >
              <Option value="HOST">Host</Option>
              <Option value="USER">User</Option>
            </Select>
          </div>
          <Space className="w-full justify-between">
            <Button type="primary" htmlType="submit" size="large">
              Sign Up
            </Button>
            <Button 
              size="large"
              onClick={() => navigate('/signin')}
            >
              Already have an account? Sign In
            </Button>
          </Space>
        </form>
      </Card>
    </div>
  );
};

export default SignUp;
