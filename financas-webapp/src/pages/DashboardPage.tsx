import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import { fetchTransactions } from '../features/transactions/transactionsSlice'

export default function DashboardPage() {
  const dispatch = useAppDispatch()
  const { items, status } = useAppSelector((state) => state.transactions)
  const { user } = useAppSelector((state) => state.auth)

  useEffect(() => { dispatch(fetchTransactions(0)) }, [dispatch])

  const totalIncome = items
    .filter((t) => t.type === 'INCOME')
    .reduce((acc, t) => acc + t.amount, 0)

  const totalExpense = items
    .filter((t) => t.type === 'EXPENSE')
    .reduce((acc, t) => acc + t.amount, 0)

  const balance = totalIncome - totalExpense

  function fmt(val: number) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)
  }

  return (
    <div>
      <div className="page-header">
        <h1>Olá, {user?.username}</h1>
      </div>

      <div className="dashboard-grid">
        <div className="stat-card">
          <div className="stat-label">Saldo atual</div>
          <div className="stat-value" style={{ color: balance >= 0 ? 'var(--income)' : 'var(--expense)' }}>
            {status === 'loading' ? '...' : fmt(balance)}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Receitas</div>
          <div className="stat-value" style={{ color: 'var(--income)' }}>
            {status === 'loading' ? '...' : fmt(totalIncome)}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Despesas</div>
          <div className="stat-value" style={{ color: 'var(--expense)' }}>
            {status === 'loading' ? '...' : fmt(totalExpense)}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <h2 style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Últimas transações
        </h2>
        <Link to="/transactions" style={{ fontSize: '0.875rem' }}>Ver todas</Link>
      </div>

      {items.length === 0 && status !== 'loading' ? (
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
              {items.slice(0, 5).map((t) => {
                const [y, m, d] = t.date.split('-')
                const fmt2 = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(t.amount)
                return (
                  <tr key={t.id}>
                    <td>{`${d}/${m}/${y}`}</td>
                    <td>{t.categoryName}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{t.description || '—'}</td>
                    <td>
                      <span className={t.type === 'INCOME' ? 'badge badge-income' : 'badge badge-expense'}>
                        {t.type === 'INCOME' ? 'Receita' : 'Despesa'}
                      </span>
                    </td>
                    <td className={t.type === 'INCOME' ? 'amount-income' : 'amount-expense'}>
                      {t.type === 'EXPENSE' ? `- ${fmt2}` : `+ ${fmt2}`}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
