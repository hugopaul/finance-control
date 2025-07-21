import React, { useState, useEffect } from 'react';
import { FinancialProvider } from './context/FinancialContext';
import { DebtProvider } from './context/DebtContext';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import UserMenu from './components/auth/UserMenu';
import Dashboard from './components/Dashboard';
import DebtDashboard from './components/DebtDashboard';
import PaymentMethodsCrud from './components/PaymentMethodsCrud';
import CategoryCrud from './components/CategoryCrud';
import { Wallet, Users, Sun, Moon, Settings } from 'lucide-react';
import { useTheme } from './hooks/useTheme';
import { useFinancial } from './context/FinancialContext';
import { useDebt } from './context/DebtContext';

// Componente wrapper para controlar ativação dos contextos
const ContextController: React.FC<{ activeTab: 'finance' | 'debt'; children: React.ReactNode }> = ({ activeTab, children }) => {
  const { setActive: setFinancialActive } = useFinancial();
  const { setActive: setDebtActive } = useDebt();

  useEffect(() => {
    setFinancialActive(activeTab === 'finance');
    setDebtActive(activeTab === 'debt');
  }, [activeTab, setFinancialActive, setDebtActive]);

  return <>{children}</>;
};

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'finance' | 'debt'>(() => {
    const savedTab = localStorage.getItem('activeTab');
    return (savedTab as 'finance' | 'debt') || 'finance';
  });
  const { isDarkMode, toggleTheme } = useTheme();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState<'payment' | 'category' | null>(null);

  // Persist active tab in localStorage
  useEffect(() => {
    localStorage.setItem('activeTab', activeTab);
  }, [activeTab]);

  // Garantir que finanças seja a aba padrão após login (apenas uma vez)
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const hasSetDefault = localStorage.getItem('hasSetDefaultTab');
    
    if (token && !hasSetDefault) {
      setActiveTab('finance');
      localStorage.setItem('hasSetDefaultTab', 'true');
    }
  }, []);

  return (
    <AuthProvider>
      <FinancialProvider>
        <DebtProvider>
          <ContextController activeTab={activeTab}>
            <ProtectedRoute>
              <div className="min-h-screen bg-base-100 transition-colors duration-300">
                {/* Header */}
                <header className="navbar bg-base-200 border-b border-base-300 px-4 lg:px-8">
                  <div className="navbar-start">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-2">
                      <h1 className="text-lg sm:text-xl font-bold text-base-content leading-tight">
                        Controle Financeiro
                      </h1>
                    </div>
                  </div>

                  <div className="navbar-center hidden sm:block">
                    <div className="tabs tabs-boxed bg-base-100">
                      <button
                        className={`tab ${activeTab === 'finance' ? 'tab-active' : ''}`}
                        onClick={() => setActiveTab('finance')}
                      >
                        <Wallet className="w-4 h-4 mr-2" />
                        Finanças
                      </button>
                      <button
                        className={`tab ${activeTab === 'debt' ? 'tab-active' : ''}`}
                        onClick={() => setActiveTab('debt')}
                      >
                        <Users className="w-4 h-4 mr-2" />
                        Dívidas
                      </button>
                    </div>
                  </div>

                  {/* Tabs para mobile - abaixo do título */}
                  <div className="navbar-center sm:hidden absolute top-16 left-0 right-0 bg-base-200 border-b border-base-300 px-4 py-2">
                    <div className="tabs tabs-boxed bg-base-100 w-full">
                      <button
                        className={`tab flex-1 ${activeTab === 'finance' ? 'tab-active' : ''}`}
                        onClick={() => setActiveTab('finance')}
                      >
                        <Wallet className="w-4 h-4 mr-1" />
                        <span className="text-xs">Finanças</span>
                      </button>
                      <button
                        className={`tab flex-1 ${activeTab === 'debt' ? 'tab-active' : ''}`}
                        onClick={() => setActiveTab('debt')}
                      >
                        <Users className="w-4 h-4 mr-1" />
                        <span className="text-xs">Dívidas</span>
                      </button>
                    </div>
                  </div>

                  <div className="navbar-end gap-1 sm:gap-2">
                    <button 
                      onClick={toggleTheme}
                      className="btn btn-ghost btn-circle btn-sm sm:btn-md hover:bg-base-200 transition-all duration-200"
                      title={isDarkMode ? "Mudar para modo claro" : "Mudar para modo escuro"}
                    >
                      {isDarkMode ? <Sun size={18} className="sm:w-5 sm:h-5" /> : <Moon size={18} className="sm:w-5 sm:h-5" />}
                    </button>
                    <button
                      className="btn btn-ghost btn-circle btn-sm sm:btn-md hover:bg-base-200 transition-all duration-200"
                      title="Configurações"
                      onClick={() => setIsSettingsOpen(true)}
                    >
                      <Settings size={18} className="sm:w-5 sm:h-5" />
                    </button>
                    <UserMenu />
                  </div>
                </header>

                {/* Main Content */}
                <main className="container mx-auto px-4 lg:px-8 py-6 mt-20 sm:mt-6">
                  {activeTab === 'finance' ? <Dashboard /> : <DebtDashboard />}
                </main>

                {/* Modal de Configurações */}
                {isSettingsOpen && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                    <div className="modal-box max-w-2xl bg-base-100 border border-base-300 relative">
                      <button
                        className="btn btn-ghost btn-sm absolute right-2 top-2"
                        onClick={() => { setIsSettingsOpen(false); setSettingsTab(null); }}
                      >
                        Fechar
                      </button>
                      <h2 className="text-xl font-bold mb-4">Configurações</h2>
                      
                      <div className="tabs tabs-boxed mb-4">
                        <button
                          className={`tab ${settingsTab === 'payment' ? 'tab-active' : ''}`}
                          onClick={() => setSettingsTab('payment')}
                        >
                          Formas de Pagamento
                        </button>
                        <button
                          className={`tab ${settingsTab === 'category' ? 'tab-active' : ''}`}
                          onClick={() => setSettingsTab('category')}
                        >
                          Categorias
                        </button>
                      </div>

                      {settingsTab === 'payment' && <PaymentMethodsCrud />}
                      {settingsTab === 'category' && <CategoryCrud />}
                    </div>
                  </div>
                )}
              </div>
            </ProtectedRoute>
          </ContextController>
        </DebtProvider>
      </FinancialProvider>
    </AuthProvider>
  );
};

export default App; 