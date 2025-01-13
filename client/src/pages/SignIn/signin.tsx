import React, { useState, FormEvent } from 'react';
import { Input, Button } from 'antd';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for redirection

const SignIn: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const navigate = useNavigate(); // Initialize navigate for programmatic navigation

  // Submit form handler
  const submitHandler = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    axios
      .post('http://localhost:3000/signin', { email, password })
      .then((response) => {
        console.log(response.data);
        alert('Sign in successful! Redirecting to Dashboard...');
        navigate('/dashboard'); // Redirect to the Dashboard page
      })
      .catch((error) => {
        alert('Sign in failed. Please check your credentials and try again.');
        console.error(error);
      });
  };

  return (
    <form
      onSubmit={submitHandler}
      className="max-w-lg mx-auto bg-white p-6 rounded-lg shadow-md mt-8"
    >
      <h1 className="text-2xl font-bold mb-6 text-center">Sign In</h1>

      <label htmlFor="email" className="block text-lg mb-2">
        Email
      </label>
      <Input
        id="email"
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full p-2 border border-gray-300 rounded mb-4"
      />

      <label htmlFor="password" className="block text-lg mb-2">
        Password
      </label>
      <Input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full p-2 border border-gray-300 rounded mb-4"
      />

      <Button type="primary" htmlType="submit" className="w-full mt-4">
        Sign In
      </Button>
    </form>
  );
};

export default SignIn;
