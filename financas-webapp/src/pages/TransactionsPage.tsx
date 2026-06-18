import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import { fetchTransactions } from '../features/transactions/transactionsSlice'

export default function TransactionsPage() {
  const dispatch = useAppDispatch()
  const { items, status, error, currentPage, totalPages } = useAppSelector(
    (state) => state.transactions
  )

  useEffect(() => {
    dispatch(fetchTransactions(0))
  }, [dispatch])

  function handlePageChange(page: number) {
    dispatch(fetchTransactions(page))
  }

  function formatAmount(amount: number, type: 'INCOME' | 'EXPENSE') {
    const formatted = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(amount)
    return type === 'EXPENSE' ? `- ${formatted}` : `+ ${formatted}`
  }

  function formatDate(dateStr: string) {
    // dateStr vem como "yyyy-MM-dd" da API
    const [year, month, day] = dateStr.split('-')
    return `${day}/${month}/${year}`
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Transações</h1>
        <Link to="/transactions/new">Nova transação</Link>
      </div>

      {status === 'loading' && <p>Carregando...</p>}
      {error && <p role="alert">{error}</p>}

      {status !== 'loading' && items.length === 0 && (
        <p>Nenhuma transação encontrada. <Link to="/transactions/new">Crie uma agora!</Link></p>
      )}

      {items.length > 0 && (
        <>
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
              {items.map((transaction) => (
                <tr key={transaction.id}>
                  <td>{formatDate(transaction.date)}</td>
                  <td>{transaction.categoryName}</td>
                  <td>{transaction.description || '—'}</td>
                  <td>{transaction.type === 'INCOME' ? 'Receita' : 'Despesa'}</td>
                  <td style={{ color: transaction.type === 'INCOME' ? 'green' : 'red' }}>
                    {formatAmount(transaction.amount, transaction.type)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {totalPages > 1 && (
            <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 0}
              >
                Anterior
              </button>
              <span>
                Página {currentPage + 1} de {totalPages}
              </span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage + 1 >= totalPages}
              >
                Próxima
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}