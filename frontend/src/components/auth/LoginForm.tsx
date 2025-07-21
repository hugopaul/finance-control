import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { LoginCredentials } from '../../types';
import { Eye, EyeOff, Lock, Mail, AlertCircle } from 'lucide-react';

const LoginForm: React.FC = () => {
  const { state, login, clearError } = useAuth();
  const [formData, setFormData] = useState<LoginCredentials>({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Partial<LoginCredentials>>({});



  const validateForm = (): boolean => {
    const newErrors: Partial<LoginCredentials> = {};

    if (!formData.email) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!formData.password) {
      newErrors.password = 'Senha é obrigatória';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      await login(formData);
    }
  };

  const handleInputChange = (field: keyof LoginCredentials, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10 p-4">
      <div className="card w-full max-w-md bg-base-100 shadow-2xl border border-base-300">
        <div className="card-body p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-base-content">Bem-vindo de volta!</h2>
            <p className="text-base-content/60 mt-2">
              Faça login para acessar seu controle financeiro
            </p>
          </div>

          {/* Error Alert */}
          {state.error && (
            <div className="alert alert-error mb-6">
              <AlertCircle className="w-5 h-5" />
              <span>{state.error}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div className="form-control">
              <label className="label">
                <span className="label-text text-base-content">Email</span>
              </label>
              <div className="relative">
                <input
                  type="email"
                  placeholder="seu@email.com"
                  className={`input input-bordered w-full pl-10 ${
                    errors.email ? 'input-error' : ''
                  }`}
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  disabled={state.isLoading}
                />
                <Mail className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-base-content/40" />
              </div>
              {errors.email && (
                <label className="label">
                  <span className="label-text-alt text-error">{errors.email}</span>
                </label>
              )}
            </div>

            {/* Password Field */}
            <div className="form-control">
              <label className="label">
                <span className="label-text text-base-content">Senha</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className={`input input-bordered w-full pl-10 pr-10 ${
                    errors.password ? 'input-error' : ''
                  }`}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  disabled={state.isLoading}
                  autoComplete="current-password"
                />
                <Lock className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-base-content/40" />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-base-content/40 hover:text-base-content/60"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <label className="label">
                  <span className="label-text-alt text-error">{errors.password}</span>
                </label>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className={`btn btn-primary w-full ${state.isLoading ? 'loading' : ''}`}
              disabled={state.isLoading}
            >
              {state.isLoading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginForm; 