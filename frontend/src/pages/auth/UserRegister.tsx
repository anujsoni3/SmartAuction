import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Gavel, UserPlus } from 'lucide-react';
import { authService } from '../../services/authService';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { AuthShell } from '../../components/auth/AuthShell';
import { useToast } from '../../components/ui/Toast';

export const UserRegister: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: '',
    mobile_number: '',
  });
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    try {
      await authService.userRegister(formData);
      showSuccess('Registration successful! Please login.');
      navigate('/user/login');
    } catch (error: any) {
      showError(error.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  };

  return (
    <AuthShell
      title="User Registration"
      subtitle="Create your account to bid, track auctions, and manage your wallet securely."
      accent="user"
      icon={Gavel}
      switchText="Already have an account?"
      switchLinkText="Login"
      switchTo="/user/login"
    >
      <div className="space-y-2">
        <h2 className="theme-text text-2xl font-semibold tracking-tight">Create account</h2>
        <p className="theme-muted text-sm">Start with your profile details to enter the auction portal.</p>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <Input label="Full Name" name="name" type="text" value={formData.name} onChange={onChange} required placeholder="Enter your full name" />
        <Input label="Username" name="username" type="text" value={formData.username} onChange={onChange} required placeholder="Choose a username" />
        <Input label="Mobile Number" name="mobile_number" type="tel" value={formData.mobile_number} onChange={onChange} required placeholder="Enter your mobile number" />
        <Input label="Password" name="password" type="password" value={formData.password} onChange={onChange} required placeholder="Create a password" />

        <Button type="submit" loading={loading} className="w-full" size="lg">
          <UserPlus className="h-4 w-4" />
          Register
        </Button>
      </form>
    </AuthShell>
  );
};
