import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, LogOut, Settings, X, Mail, Calendar, Shield } from 'lucide-react';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  createdAt: string;
}

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://api.solidtechsolutions.com.br';

const UserMenu: React.FC = () => {
  const { state, logout } = useAuth();
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);

  const handleLogout = () => {
    logout();
  };

  const openProfileModal = async () => {
    setIsProfileModalOpen(true);
    if (!userProfile) {
      await loadUserProfile();
    }
  };

  const loadUserProfile = async () => {
    try {
      setIsLoadingProfile(true);
      const token = localStorage.getItem('authToken');
      if (!token) return;

      const response = await fetch(API_BASE_URL + '/auth/me', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data?.user) {
          setUserProfile(data.data.user);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar perfil do usuário:', error);
    } finally {
      setIsLoadingProfile(false);
    }
  };

  if (!state.user) return null;

  return (
    <>
      {/* Botões flutuantes */}
      <div className="flex items-center gap-2">
        {/* Botão de Perfil */}
        <button
          onClick={openProfileModal}
          className="btn btn-circle btn-ghost btn-sm bg-base-100/80 backdrop-blur-sm border border-base-300 hover:bg-base-200 transition-all duration-200 shadow-lg hover:shadow-xl"
          aria-label="Ver perfil do usuário"
        >
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/70 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md">
            {state.user.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
        </button>

        {/* Botão de Sair */}
        <button
          onClick={handleLogout}
          className="btn btn-circle btn-ghost btn-sm bg-base-100/80 backdrop-blur-sm border border-base-300 hover:bg-error/10 hover:border-error/30 transition-all duration-200 shadow-lg hover:shadow-xl"
          aria-label="Sair da aplicação"
        >
          <LogOut className="w-4 h-4 text-error" />
        </button>
      </div>

      {/* Modal de Perfil */}
      {isProfileModalOpen && (
        <div className="modal modal-open">
          <div className="modal-box max-w-md bg-base-100 border border-base-300">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-lg text-base-content flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                Perfil do Usuário
              </h3>
              <button 
                onClick={() => setIsProfileModalOpen(false)}
                className="btn btn-ghost btn-sm btn-circle"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {isLoadingProfile ? (
              <div className="flex justify-center items-center py-8">
                <span className="loading loading-spinner loading-lg"></span>
                <span className="ml-2">Carregando perfil...</span>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Avatar e Nome */}
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-primary to-primary/70 rounded-full flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4 shadow-lg">
                    {userProfile?.name?.charAt(0)?.toUpperCase() || state.user.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <h4 className="text-xl font-bold text-base-content">
                    {userProfile?.name || state.user.name}
                  </h4>
                </div>

                {/* Informações do Usuário */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-base-200 rounded-lg">
                    <Mail className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-sm font-medium text-base-content/70">Email</p>
                      <p className="text-base-content">{userProfile?.email || state.user.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-base-200 rounded-lg">
                    <Shield className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-sm font-medium text-base-content/70">ID do Usuário</p>
                      <p className="text-base-content font-mono text-sm">{userProfile?.id || 'N/A'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-base-200 rounded-lg">
                    <Calendar className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-sm font-medium text-base-content/70">Membro desde</p>
                      <p className="text-base-content">
                        {userProfile?.createdAt 
                          ? new Date(userProfile.createdAt).toLocaleDateString('pt-BR', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric'
                            })
                          : 'N/A'
                        }
                      </p>
                    </div>
                  </div>
                </div>

                {/* Estatísticas (pode ser expandido no futuro) */}
                <div className="border-t border-base-300 pt-4">
                  <h5 className="font-semibold text-base-content mb-3">Estatísticas</h5>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-success/10 rounded-lg">
                      <p className="text-2xl font-bold text-success">0</p>
                      <p className="text-xs text-base-content/60">Dívidas Pagas</p>
                    </div>
                    <div className="text-center p-3 bg-warning/10 rounded-lg">
                      <p className="text-2xl font-bold text-warning">0</p>
                      <p className="text-xs text-base-content/60">Dívidas Pendentes</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Botões de Ação */}
            <div className="modal-action">
              <button
                onClick={() => setIsProfileModalOpen(false)}
                className="btn btn-ghost"
              >
                Fechar
              </button>
              <button
                onClick={handleLogout}
                className="btn btn-error"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </button>
            </div>
          </div>

          {/* Backdrop */}
          <div
            className="modal-backdrop"
            onClick={() => setIsProfileModalOpen(false)}
          />
        </div>
      )}
    </>
  );
};

export default UserMenu; 