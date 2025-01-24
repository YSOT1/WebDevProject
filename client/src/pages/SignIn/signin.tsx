import React, { useState, FormEvent } from 'react';
import axios from 'axios';
import { Input, Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode'; // Import the jwt-decode library

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
    <div>
      <h1>Sign In</h1>
      <form onSubmit={submitHandler}>
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button type="primary" htmlType="submit">
          Sign In
        </Button>
      </form>
      {errorMessage && <p>{errorMessage}</p>}
    </div>
  );
};

export default SignIn;
