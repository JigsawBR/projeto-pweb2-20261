import { type FormEvent, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import { fetchTransactions, type FetchTransactionsParams } from '../features/transactions/transactionsSlice'
import { fetchCategories } from '../features/categories/categoriesSlice'
import { Icon } from '../components/Icon'

export default function TransactionsPage() {
  const dispatch = useAppDispatch()
  const { items, status, error, currentPage, totalPages } = useAppSelector(
    (state) => state.transactions
  )
  const { items: categories } = useAppSelector((state) => state.categories)

  const [type, setType] = useState<'INCOME' | 'EXPENSE' | ''>('')
  const [categoryId, setCategoryId] = useState<number | ''>('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [activeFilters, setActiveFilters] = useState<FetchTransactionsParams>({})

  useEffect(() => {
    dispatch(fetchTransactions({ page: 0 }))
    if (categories.length === 0) dispatch(fetchCategories())
  }, [dispatch])

  function handleFilter(e: FormEvent) {
    e.preventDefault()
    const filters: FetchTransactionsParams = {
      page: 0,
      ...(type && { type }),
      ...(categoryId && { categoryId }),
      ...(startDate && { startDate }),
      ...(endDate && { endDate }),
    }
    setActiveFilters(filters)
    dispatch(fetchTransactions(filters))
  }

  function handleClear() {
    setType('')
    setCategoryId('')
    setStartDate('')
    setEndDate('')
    setActiveFilters({})
    dispatch(fetchTransactions({ page: 0 }))
  }

  function handlePageChange(page: number) {
    dispatch(fetchTransactions({ ...activeFilters, page }))
  }

  function formatAmount(amount: number, type: 'INCOME' | 'EXPENSE') {
    const formatted = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(amount)
    return type === 'EXPENSE' ? `- ${formatted}` : `+ ${formatted}`
  }

  function formatDate(dateStr: string) {
    const [year, month, day] = dateStr.split('-')
    return `${day}/${month}/${year}`
  }

  const hasActiveFilters = !!(activeFilters.type || activeFilters.categoryId || activeFilters.startDate || activeFilters.endDate)

  return (
    <div>
      <div className="page-header">
        <h1>Transações</h1>
        <Link to="/transactions/new" className="btn btn-primary" style={{ width: 'auto' }}>
          + Nova transação
        </Link>
      </div>

      <div className="form-card" style={{ marginBottom: '24px' }}>
        <form onSubmit={handleFilter}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="filterType">Tipo</label>
              <select id="filterType" value={type} onChange={(e) => setType(e.target.value as typeof type)}>
                <option value="">Todos</option>
                <option value="INCOME">Receita</option>
                <option value="EXPENSE">Despesa</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="filterCategory">Categoria</label>
              <select id="filterCategory" value={categoryId} onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : '')}>
                <option value="">Todas</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="filterStart">De</label>
              <input
                id="filterStart"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="filterEnd">Até</label>
              <input
                id="filterEnd"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn btn-primary" type="submit" style={{ width: 'auto' }}
              disabled={status === 'loading'}>
              Filtrar
            </button>
            {hasActiveFilters && (
              <button className="btn btn-outline" type="button" style={{ width: 'auto' }} onClick={handleClear}>
                Limpar filtros
              </button>
            )}
          </div>
        </form>
      </div>

      {status === 'loading' && <div className="loading">Carregando transações...</div>}
      {error && <div className="alert-error" role="alert">{error}</div>}

      {status !== 'loading' && items.length === 0 && !error && (
        <div className="empty-state">
          <div className="empty-icon"><Icon name="inbox" size={28} /></div>
          <p>{hasActiveFilters ? 'Nenhuma transação encontrada para os filtros aplicados.' : 'Nenhuma transação registrada ainda.'}</p>
          {!hasActiveFilters && (
            <Link to="/transactions/new" className="btn btn-primary" style={{ width: 'auto', display: 'inline-flex' }}>
              Criar primeira transação
            </Link>
          )}
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
                      <Icon name={t.type === 'INCOME' ? 'arrow-up' : 'arrow-down'} size={12} />
                      {t.type === 'INCOME' ? 'Receita' : 'Despesa'}
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
                <Icon name="arrow-left" size={14} />
                Anterior
              </button>
              <span>Página {currentPage + 1} de {totalPages}</span>
              <button
                className="btn btn-outline"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage + 1 >= totalPages}
              >
                Próxima
                <Icon name="arrow-right" size={14} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
