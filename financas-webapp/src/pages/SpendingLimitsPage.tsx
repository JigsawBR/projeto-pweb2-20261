import { type FormEvent, useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import { fetchCategories } from '../features/categories/categoriesSlice'
import { fetchMonthTransactions } from '../features/transactions/transactionsSlice'
import {
  fetchSpendingLimits,
  createSpendingLimit,
  deleteSpendingLimit,
} from '../features/spendingLimits/spendingLimitsSlice'
import { selectSpendingStatus } from '../features/spendingLimits/spendingStatusSelectors'
import { Icon } from '../components/Icon'

function fmtCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

function levelFor(percentUsed: number): 'ok' | 'warning' | 'danger' {
  if (percentUsed >= 100) return 'danger'
  if (percentUsed >= 80) return 'warning'
  return 'ok'
}

export default function SpendingLimitsPage() {
  const dispatch = useAppDispatch()
  const { items: limits, status, error } = useAppSelector((state) => state.spendingLimits)
  const { items: categories } = useAppSelector((state) => state.categories)
  const spendingStatus = useAppSelector(selectSpendingStatus)

  const [categoryId, setCategoryId] = useState('')
  const [limitAmount, setLimitAmount] = useState('')
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    dispatch(fetchSpendingLimits())
    dispatch(fetchMonthTransactions())
    if (categories.length === 0) dispatch(fetchCategories())
  }, [dispatch, categories.length])

  const usedCategoryIds = new Set(limits.map((limit) => limit.categoryId))
  const availableCategories = categories.filter((cat) => !usedCategoryIds.has(cat.id))

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setFormError(null)
    const result = await dispatch(
      createSpendingLimit({
        categoryId: Number(categoryId),
        limitAmount: parseFloat(limitAmount),
      })
    )
    if (createSpendingLimit.fulfilled.match(result)) {
      setCategoryId('')
      setLimitAmount('')
    } else {
      setFormError(result.payload as string)
    }
  }

  function handleDelete(id: number, categoryName: string) {
    if (window.confirm(`Excluir o limite de "${categoryName}"?`)) {
      dispatch(deleteSpendingLimit(id))
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1>Limites de Gastos</h1>
      </div>

      <div className="form-card" style={{ marginBottom: '28px' }}>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="categoryId">Categoria</label>
              <select
                id="categoryId"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                required
              >
                <option value="">Selecione uma categoria</option>
                {availableCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="limitAmount">Valor-limite mensal (R$)</label>
              <input
                id="limitAmount"
                type="number"
                min="0.01"
                step="0.01"
                value={limitAmount}
                onChange={(e) => setLimitAmount(e.target.value)}
                placeholder="0,00"
                required
              />
            </div>
          </div>

          {(formError || (error && status === 'failed')) && (
            <div className="alert-error" role="alert" style={{ marginBottom: '16px' }}>
              {formError || error}
            </div>
          )}

          <button
            className="btn btn-primary"
            type="submit"
            disabled={status === 'loading'}
            style={{ width: 'auto' }}
          >
            {status === 'loading' ? 'Salvando...' : '+ Definir limite'}
          </button>
        </form>
      </div>

      {status === 'loading' && limits.length === 0 && (
        <div className="loading">Carregando limites...</div>
      )}

      {status !== 'loading' && limits.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon"><Icon name="gauge" size={28} /></div>
          <p>Nenhum limite de gastos definido ainda.</p>
        </div>
      )}

      <div className="spending-limits-list">
        {limits.map((limit) => {
          const s = spendingStatus.find((item) => item.categoryId === limit.categoryId)
          const spent = s?.spent ?? 0
          const percentUsed = s?.percentUsed ?? 0
          const level = levelFor(percentUsed)

          return (
            <div key={limit.id} className="spending-limit-card">
              <div className="spending-limit-header">
                <div>
                  <h3 className="spending-limit-category">{limit.categoryName}</h3>
                  <span className="spending-limit-amounts">
                    {fmtCurrency(spent)} de {fmtCurrency(limit.limitAmount)}
                  </span>
                </div>
                <div className="spending-limit-actions">
                  <span className={`spending-limit-percent spending-limit-percent-${level}`}>
                    {percentUsed}%
                  </span>
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => handleDelete(limit.id, limit.categoryName)}
                    aria-label={`Excluir limite de ${limit.categoryName}`}
                  >
                    <Icon name="x" size={16} />
                  </button>
                </div>
              </div>

              <div className="progress-bar-track">
                <div
                  className={`progress-bar-fill spending-limit-bar-${level}`}
                  style={{ width: `${Math.min(percentUsed, 100)}%` }}
                  role="progressbar"
                  aria-valuenow={percentUsed}
                  aria-valuemin={0}
                  aria-valuemax={100}
                />
              </div>

              {level === 'danger' && (
                <p className="spending-limit-alert spending-limit-alert-danger">
                  Limite ultrapassado nesta categoria.
                </p>
              )}
              {level === 'warning' && (
                <p className="spending-limit-alert spending-limit-alert-warning">
                  Você está perto de atingir o limite.
                </p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
