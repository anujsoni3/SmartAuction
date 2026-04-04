import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Gavel, LogIn } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { AuthShell } from '../../components/auth/AuthShell';
import { useToast } from '../../components/ui/Toast';

export const UserLogin: React.FC = () => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    try {
      await login(formData);
      showSuccess('Login successful');
      navigate('/user/dashboard');
    } catch (error: any) {
      showError(error.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="User Login"
      subtitle="Access your dashboard, auctions, bids, and wallet in one place."
      accent="user"
      icon={Gavel}
      switchText="Don't have an account?"
      switchLinkText="Register"
      switchTo="/user/register"
    >
      <div className="space-y-2">
        <h2 className="theme-text text-2xl font-semibold tracking-tight">Welcome back</h2>
        <p className="theme-muted text-sm">Sign in to continue your auction journey.</p>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <Input
          label="Username"
          name="username"
          type="text"
          value={formData.username}
          onChange={(event) => setFormData({ ...formData, username: event.target.value })}
          required
          placeholder="Enter your username"
        />

        <Input
          label="Password"
          name="password"
          type="password"
          value={formData.password}
          onChange={(event) => setFormData({ ...formData, password: event.target.value })}
          required
          placeholder="Enter your password"
        />

        <Button type="submit" loading={loading} className="w-full" size="lg">
          <LogIn className="h-4 w-4" />
          Login
        </Button>
      </form>
    </AuthShell>
  );
};
