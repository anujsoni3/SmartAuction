import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, UserPlus } from 'lucide-react';
import { authService } from '../../services/authService';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { AuthShell } from '../../components/auth/AuthShell';
import { useToast } from '../../components/ui/Toast';

export const AdminRegister: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: '',
    mobile_number: '',
    role: 'admin'
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);

    try {
      await authService.adminRegister(formData);
      showSuccess('Admin registration successful! Please login.');
      navigate('/admin/login');
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
      title="Admin Registration"
      subtitle="Create an administrative account for full auction operations access."
      accent="admin"
      icon={Shield}
      switchText="Already have admin access?"
      switchLinkText="Login"
      switchTo="/admin/login"
    >
      <div className="space-y-2">
        <h2 className="theme-text text-2xl font-semibold tracking-tight">Create admin account</h2>
        <p className="theme-muted text-sm">Enter details below to provision administrative access.</p>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <Input label="Full Name" name="name" type="text" value={formData.name} onChange={onChange} required placeholder="Enter your full name" />
        <Input label="Username" name="username" type="text" value={formData.username} onChange={onChange} required placeholder="Choose admin username" />
        <Input label="Mobile Number" name="mobile_number" type="tel" value={formData.mobile_number} onChange={onChange} required placeholder="Enter your mobile number" />
        <Input label="Password" name="password" type="password" value={formData.password} onChange={onChange} required placeholder="Create a secure password" />

        <Button type="submit" loading={loading} className="w-full bg-[#8C5A3C] hover:bg-[#7d4f35]" size="lg">
          <UserPlus className="h-4 w-4" />
          Register as Admin
        </Button>
      </form>
    </AuthShell>
  );
};