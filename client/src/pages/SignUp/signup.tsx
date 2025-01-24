import React, { useState, FormEvent } from 'react'; // Correct import for React
import { Input, Button } from 'antd';
import { Select } from 'antd';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for redirection
const { Option } = Select;

const SignUp: React.FC = () => {
  // State for form fields
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [firstname, setFirstname] = useState<string>('');
  const [lastname, setLastname] = useState<string>('');
  const [role, setRole] = useState<string>(''); // Store role directly here

  const navigate = useNavigate(); // Initialize navigate for programmatic navigation

  // Handle role change
  const handleChange = (value: string) => {
    setRole(value); // Update the role state when the select changes
  };

  // Validate email
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

  // Submit form handler
  const submitHandler = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) {
      return; // Stop submission if validation fails
    }

    axios
      .post('http://localhost:3000/signup', {
        email,
        password,
        firstname,
        lastname,
        role, // Send the role to the backend
      })
      .then((data) => {
        console.log(data);
        alert('Signup successful! Redirecting to Sign In...'); // Inform user of success
        navigate('/signin'); // Redirect to the Sign In page
        // Clear form after submit
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
    <form
      onSubmit={submitHandler}
      className="max-w-lg mx-auto bg-white p-6 rounded-lg shadow-md mt-8"
    >
      <h1 className="text-2xl font-bold mb-6 text-center">Sign Up</h1>

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

      <label htmlFor="firstname" className="block text-lg mb-2">
        First Name
      </label>
      <Input
        type="text"
        placeholder="First Name"
        value={firstname}
        onChange={(e) => setFirstname(e.target.value)}
        className="w-full p-2 border border-gray-300 rounded mb-4"
      />

      <label htmlFor="lastname" className="block text-lg mb-2">
        Last Name
      </label>
      <Input
        type="text"
        placeholder="Last Name"
        value={lastname}
        onChange={(e) => setLastname(e.target.value)}
        className="w-full p-2 border border-gray-300 rounded mb-4"
      />

      <label htmlFor="role" className="block text-lg mb-2">
        Role
      </label>
      <Select
        value={role} // Bind Select to the role state
        onChange={handleChange} // Use handleChange to update role state
        placeholder="Select your role"
        style={{ width: '100%' }}
      >
        <Option value="HOST">Host</Option>
        <Option value="USER">User</Option>
      </Select>

      <Button type="primary" htmlType="submit" className="w-full mt-4">
        Sign Up
      </Button>
    </form>
  );
};

export default SignUp;
