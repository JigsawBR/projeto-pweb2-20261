import { type FormEvent, useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import { createTransaction, fetchMonthTransactions, fetchTransactions } from '../features/transactions/transactionsSlice'
import { fetchCategories } from '../features/categories/categoriesSlice'
import { fetchSpendingLimits } from '../features/spendingLimits/spendingLimitsSlice'
import { selectSpendingStatusByCategory } from '../features/spendingLimits/spendingStatusSelectors'
import { Icon } from '../components/Icon'

export default function NewTransactionPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { status, error } = useAppSelector((state) => state.transactions)
  const { items: categories } = useAppSelector((state) => state.categories)
  const { items: spendingLimits } = useAppSelector((state) => state.spendingLimits)
  const { monthItems } = useAppSelector((state) => state.transactions)

  const today = new Date().toISOString().split('T')[0]
  const [amount, setAmount] = useState('')
  const [type, setType] = useState<'INCOME' | 'EXPENSE'>('EXPENSE')
  const [categoryId, setCategoryId] = useState('')
  const [date, setDate] = useState(today)
  const [description, setDescription] = useState('')
  const [tag, setTag] = useState('')

  useEffect(() => {
    if (categories.length === 0) dispatch(fetchCategories())
    dispatch(fetchSpendingLimits())
    dispatch(fetchMonthTransactions())
  }, [dispatch, categories.length])

  // Status de gasto (antes desta transação) da categoria selecionada
  const spendingStatus = useAppSelector(
    selectSpendingStatusByCategory(categoryId ? Number(categoryId) : '')
  )

  // Projeta o percentual utilizado somando o valor que está sendo digitado,
  // para alertar o usuário antes mesmo de ele confirmar o envio.
  const parsedAmount = parseFloat(amount) || 0
  const projectedSpent =
    type === 'EXPENSE' && spendingStatus ? spendingStatus.spent + parsedAmount : spendingStatus?.spent ?? 0
  const projectedPercent =
    spendingStatus && spendingStatus.limitAmount > 0
      ? Math.round((projectedSpent / spendingStatus.limitAmount) * 100)
      : 0
  const showLimitAlert = type === 'EXPENSE' && !!spendingStatus && parsedAmount > 0 && projectedPercent >= 100

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const result = await dispatch(
      createTransaction({
        amount: parsedAmount,
        type,
        categoryId: Number(categoryId),
        date,
        description: description || undefined,
        tag: tag || undefined,
      })
    )
    if (createTransaction.fulfilled.match(result)) {
      dispatch(fetchMonthTransactions())
      dispatch(fetchTransactions({ page: 0 }))
      notifyIfLimitReached()
      navigate('/transactions')
    }
  }

  // Envia uma mensagem ao Service Worker para exibir uma Web Notification
  // quando o gasto na categoria atinge 80% do limite definido — funciona
  // mesmo com a aba em segundo plano, pois quem dispara a notificação é o SW.
  function notifyIfLimitReached() {
    if (type !== 'EXPENSE') return
    const limit = spendingLimits.find((l) => l.categoryId === Number(categoryId))
    if (!limit || limit.limitAmount <= 0) return

    const previousSpent = monthItems
      .filter((t) => t.type === 'EXPENSE' && t.categoryId === limit.categoryId)
      .reduce((sum, t) => sum + t.amount, 0)
    const newSpent = previousSpent + parsedAmount
    const percentUsed = Math.round((newSpent / limit.limitAmount) * 100)

    if (percentUsed < 80) return

    if (navigator.serviceWorker?.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'SPENDING_ALERT',
        payload: {
          categoryId: limit.categoryId,
          categoryName: limit.categoryName,
          limitAmount: limit.limitAmount,
          spent: newSpent,
          percentUsed,
        },
      })
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1>Nova transação</h1>
        <Link to="/transactions" className="btn btn-outline"><Icon name="arrow-left" size={14} />Voltar</Link>
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
                <Icon name="arrow-down" size={14} />
                Despesa
              </button>
              <button
                type="button"
                className={`type-btn ${type === 'INCOME' ? 'active-income' : ''}`}
                onClick={() => setType('INCOME')}
              >
                <Icon name="arrow-up" size={14} />
                Receita
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
            {showLimitAlert && (
              <div className="alert-warning" role="alert" style={{ marginTop: '8px' }}>
                Esta categoria já atingirá {projectedPercent}% do limite mensal
                ({spendingStatus && new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(spendingStatus.limitAmount)}) com esta transação.
              </div>
            )}
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
