import React, { useState } from 'react';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';

const AuthContainer: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-secondary/10">
      {isLogin ? (
        <LoginForm />
      ) : (
        <RegisterForm />
      )}
      
      {/* Auth Mode Toggle */}
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2">
        <div className="card bg-base-100 shadow-lg border border-base-300">
          <div className="card-body p-4">
            <div className="flex gap-2">
              <button
                className={`btn btn-sm ${isLogin ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setIsLogin(true)}
              >
                Login
              </button>
              <button
                className={`btn btn-sm ${!isLogin ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setIsLogin(false)}
              >
                Registrar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthContainer; 