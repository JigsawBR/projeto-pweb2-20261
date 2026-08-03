import { type FormEvent, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import { createGoal } from '../features/goals/goalsSlice'
import { fetchCategories } from '../features/categories/categoriesSlice'

export default function NewGoalPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { status, error } = useAppSelector((state) => state.goals)
  const { items: categories } = useAppSelector((state) => state.categories)

  const today = new Date().toISOString().split('T')[0]
  const [name, setName] = useState('')
  const [targetAmount, setTargetAmount] = useState('')
  const [deadline, setDeadline] = useState('')
  const [startDate, setStartDate] = useState(today)
  const [categoryId, setCategoryId] = useState<number | ''>('')

  useEffect(() => {
    if (categories.length === 0) dispatch(fetchCategories())
  }, [dispatch, categories.length])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const result = await dispatch(
      createGoal({
        name,
        targetAmount: parseFloat(targetAmount),
        deadline,
        startDate,
        categoryId: categoryId || null,
      })
    )
    if (createGoal.fulfilled.match(result)) navigate('/goals')
  }

  return (
    <div>
      <div className="page-header">
        <h1>Nova meta</h1>
        <Link to="/goals" className="btn btn-outline">← Voltar</Link>
      </div>

      <div className="form-card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Nome da meta</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Reserva de emergência"
              required
              autoFocus
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="targetAmount">Valor-alvo (R$)</label>
              <input
                id="targetAmount"
                type="number"
                min="0.01"
                step="0.01"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                placeholder="0,00"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="deadline">Data-limite</label>
              <input
                id="deadline"
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                min={today}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="startDate">Data de início</label>
              <input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="categoryId">
                Categoria <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(opcional)</span>
              </label>
              <select
                id="categoryId"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : '')}
              >
                <option value="">Todas as receitas</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>

          {error && <div className="alert-error" role="alert" style={{ marginBottom: '16px' }}>{error}</div>}

          <button className="btn btn-primary" type="submit" disabled={status === 'loading'}>
            {status === 'loading' ? 'Salvando...' : 'Salvar meta'}
          </button>
        </form>
      </div>
    </div>
  )
}
