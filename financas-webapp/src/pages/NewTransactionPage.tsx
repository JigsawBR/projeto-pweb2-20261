import { type FormEvent, useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import { createTransaction } from '../features/transactions/transactionsSlice'
import { fetchCategories } from '../features/categories/categoriesSlice'

export default function NewTransactionPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { status, error } = useAppSelector((state) => state.transactions)
  const { items: categories } = useAppSelector((state) => state.categories)

  const today = new Date().toISOString().split('T')[0]
  const [amount, setAmount] = useState('')
  const [type, setType] = useState<'INCOME' | 'EXPENSE'>('EXPENSE')
  const [categoryId, setCategoryId] = useState('')
  const [date, setDate] = useState(today)
  const [description, setDescription] = useState('')
  const [tag, setTag] = useState('')

  useEffect(() => {
    if (categories.length === 0) dispatch(fetchCategories())
  }, [dispatch, categories.length])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const result = await dispatch(
      createTransaction({
        amount: parseFloat(amount),
        type,
        categoryId: Number(categoryId),
        date,
        description: description || undefined,
        tag: tag || undefined,
      })
    )
    if (createTransaction.fulfilled.match(result)) navigate('/transactions')
  }

  return (
    <div>
      <div className="page-header">
        <h1>Nova transação</h1>
        <Link to="/transactions" className="btn btn-outline">← Voltar</Link>
      </div>

      <div className="form-card">
        <form onSubmit={handleSubmit}>
          {/* Tipo toggle */}
          <div className="form-group">
            <label>Tipo</label>
            <div className="type-toggle">
              <button
                type="button"
                className={`type-btn ${type === 'EXPENSE' ? 'active-expense' : ''}`}
                onClick={() => setType('EXPENSE')}
              >
                ↓ Despesa
              </button>
              <button
                type="button"
                className={`type-btn ${type === 'INCOME' ? 'active-income' : ''}`}
                onClick={() => setType('INCOME')}
              >
                ↑ Receita
              </button>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="amount">Valor (R$)</label>
              <input
                id="amount"
                type="number"
                min="0.01"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0,00"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="date">Data</label>
              <input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="categoryId">Categoria</label>
            <select
              id="categoryId"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              required
            >
              <option value="">Selecione uma categoria</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="description">Descrição <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(opcional)</span></label>
            <input
              id="description"
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: Mercado do mês"
            />
          </div>

          <div className="form-group">
            <label htmlFor="tag">Tag <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(opcional)</span></label>
            <input
              id="tag"
              type="text"
              value={tag}
              onChange={(e) => setTag(e.target.value)}
              placeholder="Ex: mensal, fixo..."
            />
          </div>

          {error && <div className="alert-error" role="alert" style={{ marginBottom: '16px' }}>{error}</div>}

          <button className="btn btn-primary" type="submit" disabled={status === 'loading'}>
            {status === 'loading' ? 'Salvando...' : 'Salvar transação'}
          </button>
        </form>
      </div>
    </div>
  )
}
