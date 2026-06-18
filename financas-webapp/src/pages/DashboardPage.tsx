import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import { fetchTransactions, fetchMonthTransactions } from '../features/transactions/transactionsSlice'
import {
  selectMonthIncome,
  selectMonthExpense,
  selectMonthBalance,
  selectRecentTransactions,
} from '../features/transactions/selectors'

const fmt = (val: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)

const fmtDate = (dateStr: string) => {
  const [y, m, d] = dateStr.split('-')
  return `${d}/${m}/${y}`
}

export default function DashboardPage() {
  const dispatch = useAppDispatch()
  const { user } = useAppSelector((state) => state.auth)
  const monthStatus = useAppSelector((state) => state.transactions.monthStatus)
  const listStatus = useAppSelector((state) => state.transactions.status)

  const income = useAppSelector(selectMonthIncome)
  const expense = useAppSelector(selectMonthExpense)
  const balance = useAppSelector(selectMonthBalance)
  const recent = useAppSelector(selectRecentTransactions)

  useEffect(() => {
    dispatch(fetchMonthTransactions())
    dispatch(fetchTransactions({ page: 0 }))
  }, [dispatch])

  const loading = monthStatus === 'loading' || listStatus === 'loading'

  return (
    <div>
      <div className="page-header">
        <h1>Olá, {user?.name ?? user?.username}</h1>
      </div>

      <div className="dashboard-grid">
        <div className="stat-card">
          <div className="stat-label">Saldo do mês</div>
          <div className="stat-value" style={{ color: balance >= 0 ? 'var(--income)' : 'var(--expense)' }}>
            {loading ? '...' : fmt(balance)}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Receitas do mês</div>
          <div className="stat-value" style={{ color: 'var(--income)' }}>
            {loading ? '...' : fmt(income)}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Despesas do mês</div>
          <div className="stat-value" style={{ color: 'var(--expense)' }}>
            {loading ? '...' : fmt(expense)}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <h2 style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Últimas transações
        </h2>
        <Link to="/transactions" style={{ fontSize: '0.875rem' }}>Ver todas</Link>
      </div>

      {recent.length === 0 && !loading ? (
        <div className="empty-state" style={{ padding: '40px' }}>
          <p>Nenhuma transação ainda.</p>
          <Link to="/transactions/new" className="btn btn-primary" style={{ width: 'auto', display: 'inline-flex', marginTop: '16px' }}>
            Criar primeira transação
          </Link>
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Data</th>
                <th>Categoria</th>
                <th>Descrição</th>
                <th>Tipo</th>
                <th>Valor</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((t) => (
                <tr key={t.id}>
                  <td>{fmtDate(t.date)}</td>
                  <td>{t.categoryName}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{t.description || '—'}</td>
                  <td>
                    <span className={t.type === 'INCOME' ? 'badge badge-income' : 'badge badge-expense'}>
                      {t.type === 'INCOME' ? 'Receita' : 'Despesa'}
                    </span>
                  </td>
                  <td className={t.type === 'INCOME' ? 'amount-income' : 'amount-expense'}>
                    {t.type === 'EXPENSE' ? `- ${fmt(t.amount)}` : `+ ${fmt(t.amount)}`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
