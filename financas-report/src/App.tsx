import { useEffect, useState } from 'react'

interface Transaction {
  id: number
  amount: number
  type: 'INCOME' | 'EXPENSE'
  categoryName: string
  date: string
}

interface CategorySummary {
  name: string
  income: number
  expense: number
  balance: number
}

const fmt = (val: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)

export default function App() {
  const [token, setToken] = useState<string | null>(null)
  const [summary, setSummary] = useState<CategorySummary[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Recebe o token do app principal via postMessage
  useEffect(() => {
    function handleMessage(e: MessageEvent) {
      if (!e.origin.startsWith('http://localhost:')) return
      if (e.data?.type === 'AUTH_TOKEN' && e.data.token) {
        setToken(e.data.token)
      }
    }
    window.addEventListener('message', handleMessage)
    // Avisa ao pai que está pronto para receber o token
    window.parent.postMessage({ type: 'REPORT_READY' }, '*')
    return () => window.removeEventListener('message', handleMessage)
  }, [])

  // Busca transações do mês quando recebe o token
  useEffect(() => {
    if (!token) return
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const lastDay = new Date(year, now.getMonth() + 1, 0).getDate()
    const startDate = `${year}-${month}-01`
    const endDate = `${year}-${month}-${lastDay}`

    setLoading(true)
    fetch(`http://localhost:8080/transactions?startDate=${startDate}&endDate=${endDate}&size=1000&sort=date,desc`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        const transactions: Transaction[] = data.content ?? []
        const map = new Map<string, CategorySummary>()
        for (const t of transactions) {
          const key = t.categoryName ?? 'Sem categoria'
          if (!map.has(key)) map.set(key, { name: key, income: 0, expense: 0, balance: 0 })
          const entry = map.get(key)!
          if (t.type === 'INCOME') entry.income += t.amount
          else entry.expense += t.amount
          entry.balance = entry.income - entry.expense
        }
        setSummary([...map.values()].sort((a, b) => b.expense - a.expense))
      })
      .catch(() => setError('Erro ao carregar relatório.'))
      .finally(() => setLoading(false))
  }, [token])

  const totalIncome = summary.reduce((s, c) => s + c.income, 0)
  const totalExpense = summary.reduce((s, c) => s + c.expense, 0)

  if (!token) {
    return (
      <div style={styles.center}>
        <p style={styles.muted}>Aguardando autenticação...</p>
      </div>
    )
  }

  if (loading) return <div style={styles.center}><p style={styles.muted}>Carregando relatório...</p></div>
  if (error) return <div style={styles.center}><p style={{ color: '#ef4444' }}>{error}</p></div>
  if (summary.length === 0) return <div style={styles.center}><p style={styles.muted}>Nenhuma transação no mês atual.</p></div>

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Relatório por Categoria — Mês Atual</h2>

      <div style={styles.totals}>
        <div style={styles.totalCard}>
          <span style={styles.totalLabel}>Total Receitas</span>
          <span style={{ ...styles.totalValue, color: '#22c55e' }}>{fmt(totalIncome)}</span>
        </div>
        <div style={styles.totalCard}>
          <span style={styles.totalLabel}>Total Despesas</span>
          <span style={{ ...styles.totalValue, color: '#ef4444' }}>{fmt(totalExpense)}</span>
        </div>
        <div style={styles.totalCard}>
          <span style={styles.totalLabel}>Saldo</span>
          <span style={{ ...styles.totalValue, color: totalIncome - totalExpense >= 0 ? '#22c55e' : '#ef4444' }}>
            {fmt(totalIncome - totalExpense)}
          </span>
        </div>
      </div>

      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Categoria</th>
            <th style={{ ...styles.th, textAlign: 'right' }}>Receitas</th>
            <th style={{ ...styles.th, textAlign: 'right' }}>Despesas</th>
            <th style={{ ...styles.th, textAlign: 'right' }}>% das Despesas</th>
          </tr>
        </thead>
        <tbody>
          {summary.map((cat) => (
            <tr key={cat.name} style={styles.tr}>
              <td style={styles.td}>{cat.name}</td>
              <td style={{ ...styles.td, textAlign: 'right', color: '#22c55e' }}>
                {cat.income > 0 ? fmt(cat.income) : '—'}
              </td>
              <td style={{ ...styles.td, textAlign: 'right', color: '#ef4444' }}>
                {cat.expense > 0 ? fmt(cat.expense) : '—'}
              </td>
              <td style={{ ...styles.td, textAlign: 'right', color: '#6b7280' }}>
                {totalExpense > 0 ? `${Math.round((cat.expense / totalExpense) * 100)}%` : '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: { fontFamily: 'system-ui, sans-serif', padding: '24px', color: '#111827', background: '#f9fafb', minHeight: '100vh' },
  center: { display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', fontFamily: 'system-ui, sans-serif' },
  muted: { color: '#6b7280' },
  title: { fontSize: '1.125rem', fontWeight: 600, marginBottom: '20px', color: '#111827' },
  totals: { display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' },
  totalCard: { flex: 1, minWidth: '140px', background: '#fff', borderRadius: '8px', padding: '16px', border: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', gap: '4px' },
  totalLabel: { fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' },
  totalValue: { fontSize: '1.25rem', fontWeight: 700 },
  table: { width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e5e7eb' },
  th: { padding: '12px 16px', background: '#f3f4f6', fontSize: '0.75rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'left', borderBottom: '1px solid #e5e7eb' },
  tr: { borderBottom: '1px solid #f3f4f6' },
  td: { padding: '12px 16px', fontSize: '0.875rem' },
}
