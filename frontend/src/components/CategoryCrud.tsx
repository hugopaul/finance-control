import React, { useState, useEffect } from 'react';
import { FinancialService } from '../services/api';
import { CategoryResponse } from '../interfaces/api';

const CategoryCrud: React.FC = () => {
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<{ name: string; icon: string; color: string }>({ name: '', icon: '', color: '' });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState<{ open: boolean; id: string | null }>({ open: false, id: null });

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await FinancialService.getCategories();
      const categories = Array.isArray(res) ? res : (res?.data?.categories || []);
      setCategories(categories);
    } catch (err: any) {
      setError(err.message || 'Erro ao buscar categorias');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingId) {
        // Atualizar categoria (não pode alterar o id)
        await FinancialService.updateCategory(editingId, {
          name: form.name,
          icon: form.icon,
          color: form.color,
        });
      } else {
        // Gerar id automaticamente a partir do nome
        const generatedId = form.name.trim().toLowerCase().replace(/\s+/g, '_');
        await FinancialService.createCategory({
          id: generatedId,
          name: form.name,
          icon: form.icon,
          color: form.color,
        });
      }
      setForm({ name: '', icon: '', color: '' });
      setEditingId(null);
      fetchCategories();
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar categoria');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (cat: CategoryResponse) => {
    setForm({ name: cat.name, icon: cat.icon, color: cat.color });
    setEditingId(cat.id);
  };

  const handleDelete = async (id: string) => {
    setShowConfirm({ open: true, id });
  };
  const confirmDelete = async () => {
    if (!showConfirm.id) return;
    setLoading(true);
    try {
      await FinancialService.deleteCategory(showConfirm.id);
      fetchCategories();
    } catch (err: any) {
      setError(err.message || 'Erro ao excluir categoria');
    } finally {
      setLoading(false);
      setShowConfirm({ open: false, id: null });
    }
  };

  return (
    <div className="card bg-base-100 border border-base-300 p-6 max-w-xl mx-auto mt-8">
      <h2 className="text-xl font-bold mb-4">Gerenciar Categorias</h2>
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
          placeholder="Ícone (emoji)"
          value={form.icon}
          onChange={e => setForm(f => ({ ...f, icon: e.target.value }))}
        />
        <input
          type="text"
          className="input input-bordered w-full"
          placeholder="Cor (ex: #FF0000)"
          value={form.color}
          onChange={e => setForm(f => ({ ...f, color: e.target.value }))}
        />
        <button className="btn btn-primary w-full" type="submit" disabled={loading}>
          {editingId ? 'Atualizar' : 'Adicionar'}
        </button>
        {editingId && (
          <button className="btn btn-ghost w-full" type="button" onClick={() => { setForm({ name: '', icon: '', color: '' }); setEditingId(null); }}>
            Cancelar edição
          </button>
        )}
      </form>
      {error && <div className="alert alert-error mb-4">{error}</div>}
      <ul className="divide-y divide-base-300">
        {categories.map(cat => (
          <li key={cat.id} className="flex items-center justify-between py-2">
            <div>
              <div className="font-semibold">{cat.icon} {cat.name}</div>
              <div className="text-sm text-base-content/60">{cat.color}</div>
            </div>
            <div className="flex gap-2">
              <button className="btn btn-sm btn-ghost" onClick={() => handleEdit(cat)}>Editar</button>
              <button className="btn btn-sm btn-error" onClick={() => handleDelete(cat.id)}>Excluir</button>
            </div>
          </li>
        ))}
      </ul>
      {/* Modal de confirmação de exclusão */}
      {showConfirm.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="modal-box bg-base-100 border border-base-300">
            <h3 className="font-bold text-lg mb-4">Confirmar Exclusão</h3>
            <p>Tem certeza que deseja excluir esta categoria?</p>
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

export default CategoryCrud; 