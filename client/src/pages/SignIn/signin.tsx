import react from 'react';
import axios from 'axios';
import { Input, Button } from 'antd';  
const SignIn = () => {
    
  return (
    <div>
      <h1>Sign In</h1>
        <form>
            <Input type="email" placeholder="Email" />
            <Input type="password" placeholder="Password" />
            <Button type="primary" htmlType="submit" className="w-full mt-4">
                Sign In
            </Button>
        </form>
    </div>
  );
}
export default SignIn;