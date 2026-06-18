import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import { fetchTransactions } from '../features/transactions/transactionsSlice'

export default function TransactionsPage() {
  const dispatch = useAppDispatch()
  const { items, status, error, currentPage, totalPages } = useAppSelector(
    (state) => state.transactions
  )

  useEffect(() => { dispatch(fetchTransactions(0)) }, [dispatch])

  function handlePageChange(page: number) { dispatch(fetchTransactions(page)) }

  function formatAmount(amount: number, type: 'INCOME' | 'EXPENSE') {
    const formatted = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(amount)
    return type === 'EXPENSE' ? `- ${formatted}` : `+ ${formatted}`
  }

  function formatDate(dateStr: string) {
    const [year, month, day] = dateStr.split('-')
    return `${day}/${month}/${year}`
  }

  return (
    <div>
      <div className="page-header">
        <h1>Transações</h1>
        <Link to="/transactions/new" className="btn btn-primary" style={{ width: 'auto' }}>
          + Nova transação
        </Link>
      </div>

      {status === 'loading' && (
        <div className="loading">⏳ Carregando transações...</div>
      )}

      {error && <div className="alert-error" role="alert">{error}</div>}

      {status !== 'loading' && items.length === 0 && !error && (
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <p>Nenhuma transação registrada ainda.</p>
          <Link to="/transactions/new" className="btn btn-primary" style={{ width: 'auto', display: 'inline-flex' }}>
            Criar primeira transação
          </Link>
        </div>
      )}

      {items.length > 0 && (
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
              {items.map((t) => (
                <tr key={t.id}>
                  <td>{formatDate(t.date)}</td>
                  <td>{t.categoryName}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{t.description || '—'}</td>
                  <td>
                    <span className={t.type === 'INCOME' ? 'badge badge-income' : 'badge badge-expense'}>
                      {t.type === 'INCOME' ? '↑ Receita' : '↓ Despesa'}
                    </span>
                  </td>
                  <td className={t.type === 'INCOME' ? 'amount-income' : 'amount-expense'}>
                    {formatAmount(t.amount, t.type)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {totalPages > 1 && (
            <div className="pagination">
              <button
                className="btn btn-outline"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 0}
              >
                ← Anterior
              </button>
              <span>Página {currentPage + 1} de {totalPages}</span>
              <button
                className="btn btn-outline"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage + 1 >= totalPages}
              >
                Próxima →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
