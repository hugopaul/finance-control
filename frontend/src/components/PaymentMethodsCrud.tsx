import React, { useState, useEffect } from 'react';
import { FinancialService } from '../services/api';
import { PaymentMethod } from '../interfaces/api';

const PaymentMethodsCrud: React.FC = () => {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<{ id?: string; name: string; description: string }>({ name: '', description: '' });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState<{ open: boolean; id: string | null }>({ open: false, id: null });

  const fetchPaymentMethods = async () => {
    setLoading(true);
    try {
      const result = await FinancialService.getPaymentMethods();
      const methods = Array.isArray(result) ? result : (result?.data || []);
      setPaymentMethods(methods);
    } catch (err: any) {
      setError(err.message || 'Erro ao buscar formas de pagamento');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingId) {
        await FinancialService.updatePaymentMethod(editingId, form);
      } else {
        await FinancialService.createPaymentMethod(form);
      }
      setForm({ name: '', description: '' });
      setEditingId(null);
      fetchPaymentMethods();
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar forma de pagamento');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (method: PaymentMethod) => {
    setForm({ name: method.name, description: method.description || '' });
    setEditingId(method.id);
  };

  const handleDelete = async (id: string) => {
    setShowConfirm({ open: true, id });
  };

  const confirmDelete = async () => {
    if (!showConfirm.id) return;
    setLoading(true);
    try {
      await FinancialService.deletePaymentMethod(showConfirm.id);
      fetchPaymentMethods();
    } catch (err: any) {
      setError(err.message || 'Erro ao excluir forma de pagamento');
    } finally {
      setLoading(false);
      setShowConfirm({ open: false, id: null });
    }
  };

  return (
    <div className="card bg-base-100 border border-base-300 p-6 max-w-xl mx-auto mt-8">
      <h2 className="text-xl font-bold mb-4">Gerenciar Formas de Pagamento</h2>
      <form onSubmit={handleSubmit} className="mb-6 space-y-2">
        <input
          type="text"
          className="input input-bordered w-full"
          placeholder="Nome"
          value={form.name}
          onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          required
        />
        <input
          type="text"
          className="input input-bordered w-full"
          placeholder="Descrição"
          value={form.description}
          onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
        />
        <button className="btn btn-primary w-full" type="submit" disabled={loading}>
          {editingId ? 'Atualizar' : 'Adicionar'}
        </button>
        {editingId && (
          <button className="btn btn-ghost w-full" type="button" onClick={() => { setForm({ name: '', description: '' }); setEditingId(null); }}>
            Cancelar edição
          </button>
        )}
      </form>
      {error && <div className="alert alert-error mb-4">{error}</div>}
      <ul className="divide-y divide-base-300">
        {paymentMethods.map(method => (
          <li key={method.id} className="flex items-center justify-between py-2">
            <div>
              <div className="font-semibold">{method.name}</div>
              <div className="text-sm text-base-content/60">{method.description}</div>
            </div>
            <div className="flex gap-2">
              <button className="btn btn-sm btn-ghost" onClick={() => handleEdit(method)}>Editar</button>
              <button className="btn btn-sm btn-error" onClick={() => handleDelete(method.id)}>Excluir</button>
            </div>
          </li>
        ))}
      </ul>

      {/* Modal de confirmação de exclusão */}
      {showConfirm.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="modal-box bg-base-100 border border-base-300">
            <h3 className="font-bold text-lg mb-4">Confirmar Exclusão</h3>
            <p>Tem certeza que deseja excluir esta forma de pagamento?</p>
            <div className="mt-6 flex justify-end gap-2">
              <button className="btn btn-ghost" onClick={() => setShowConfirm({ open: false, id: null })}>Cancelar</button>
              <button className="btn btn-error" onClick={confirmDelete} disabled={loading}>Excluir</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentMethodsCrud; 