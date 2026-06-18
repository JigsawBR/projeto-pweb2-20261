import { type FormEvent, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import { createTransaction } from '../features/transactions/transactionsSlice'
import { fetchCategories } from '../features/categories/categoriesSlice'

export default function NewTransactionPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const { status, error } = useAppSelector((state) => state.transactions)
  const { items: categories } = useAppSelector((state) => state.categories)

  // Valor padrão da data: hoje no formato yyyy-MM-dd (exigido pelo input[type=date])
  const today = new Date().toISOString().split('T')[0]

  const [amount, setAmount] = useState('')
  const [type, setType] = useState<'INCOME' | 'EXPENSE'>('EXPENSE')
  const [categoryId, setCategoryId] = useState('')
  const [date, setDate] = useState(today)
  const [description, setDescription] = useState('')
  const [tag, setTag] = useState('')

  useEffect(() => {
    // Carrega categorias ao montar o formulário (só busca se ainda não tiver)
    if (categories.length === 0) {
      dispatch(fetchCategories())
    }
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

    if (createTransaction.fulfilled.match(result)) {
      navigate('/transactions')
    }
  }

  return (
    <div>
      <h1>Nova Transação</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="amount">Valor</label>
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

        <div>
          <label htmlFor="type">Tipo</label>
          <select
            id="type"
            value={type}
            onChange={(e) => setType(e.target.value as 'INCOME' | 'EXPENSE')}
            required
          >
            <option value="EXPENSE">Despesa</option>
            <option value="INCOME">Receita</option>
          </select>
        </div>

        <div>
          <label htmlFor="categoryId">Categoria</label>
          <select
            id="categoryId"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            required
          >
            <option value="">Selecione uma categoria</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="date">Data</label>
          <input
            id="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="description">Descrição</label>
          <input
            id="description"
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Opcional"
          />
        </div>

        <div>
          <label htmlFor="tag">Tag</label>
          <input
            id="tag"
            type="text"
            value={tag}
            onChange={(e) => setTag(e.target.value)}
            placeholder="Opcional (ex: mensal, fixo...)"
          />
        </div>

        {error && <p role="alert">{error}</p>}

        <button type="submit" disabled={status === 'loading'}>
          {status === 'loading' ? 'Salvando...' : 'Salvar'}
        </button>
      </form>
    </div>
  )
}
