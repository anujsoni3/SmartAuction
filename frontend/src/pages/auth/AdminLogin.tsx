import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, Shield } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { AuthShell } from '../../components/auth/AuthShell';
import { useToast } from '../../components/ui/Toast';

export const AdminLogin: React.FC = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: 'admin'
  });
  const [loading, setLoading] = useState(false);
  const { adminLogin } = useAuth();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);

    try {
      await adminLogin(formData);
      showSuccess('Admin login successful');
      navigate('/admin/dashboard');
    } catch (error: any) {
      showError(error.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Admin Login"
      subtitle="Sign in to manage auctions, products, users, and reports with full control."
      accent="admin"
      icon={Shield}
      switchText="Need admin access?"
      switchLinkText="Register"
      switchTo="/admin/register"
    >
      <div className="space-y-2">
        <h2 className="theme-text text-2xl font-semibold tracking-tight">Administrator access</h2>
        <p className="theme-muted text-sm">Use your admin credentials to open the control panel.</p>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <Input
          label="Username"
          name="username"
          type="text"
          value={formData.username}
          onChange={(event) => setFormData({ ...formData, username: event.target.value })}
          required
          placeholder="Enter admin username"
        />

        <Input
          label="Password"
          name="password"
          type="password"
          value={formData.password}
          onChange={(event) => setFormData({ ...formData, password: event.target.value })}
          required
          placeholder="Enter admin password"
        />

        <Button type="submit" loading={loading} className="w-full bg-[#8C5A3C] hover:bg-[#7d4f35]" size="lg">
          <LogIn className="h-4 w-4" />
          Login as Admin
        </Button>
      </form>
    </AuthShell>
  );
};