import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import { fetchGoals } from '../features/goals/goalsSlice'
import { fetchMonthTransactions } from '../features/transactions/transactionsSlice'
import { selectGoalProgress } from '../features/goals/goalSelectors'
import GoalProgressBar from '../components/GoalProgressBar'

export default function GoalsPage() {
  const dispatch = useAppDispatch()
  const { items: goals, status, error } = useAppSelector((state) => state.goals)

  useEffect(() => {
    dispatch(fetchGoals())
    dispatch(fetchMonthTransactions())
  }, [dispatch])

  return (
    <div>
      <div className="page-header">
        <h1>Metas Financeiras</h1>
        <Link to="/goals/new" className="btn btn-primary" style={{ width: 'auto' }}>
          + Nova meta
        </Link>
      </div>

      {status === 'loading' && <div className="loading">Carregando metas...</div>}
      {error && <div className="alert-error" role="alert">{error}</div>}

      {status !== 'loading' && goals.length === 0 && !error && (
        <div className="empty-state">
          <div className="empty-icon">🎯</div>
          <p>Nenhuma meta criada ainda.</p>
          <Link to="/goals/new" className="btn btn-primary" style={{ width: 'auto', display: 'inline-flex' }}>
            Criar primeira meta
          </Link>
        </div>
      )}

      <div className="goals-list">
        {goals.map((goal) => (
          <GoalCard key={goal.id} goalId={goal.id} />
        ))}
      </div>
    </div>
  )
}

function GoalCard({ goalId }: { goalId: number }) {
  const goal = useAppSelector((state) => state.goals.items.find((g) => g.id === goalId))
  const progressSelector = selectGoalProgress(goalId)
  const progress = useAppSelector(progressSelector)

  if (!goal) return null

  const fmt = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)

  const [dy, dm, dd] = goal.deadline.split('-')

  return (
    <div className="goal-card">
      <div className="goal-card-header">
        <div>
          <h3 className="goal-name">{goal.name}</h3>
          {goal.categoryName && (
            <span className="goal-category">{goal.categoryName}</span>
          )}
        </div>
        <span className="goal-deadline">Até {`${dd}/${dm}/${dy}`}</span>
      </div>

      <div className="goal-amounts">
        <span className="goal-target">{fmt(goal.targetAmount)}</span>
        <span className="goal-percent">{progress}%</span>
      </div>

      <GoalProgressBar progress={progress} />
    </div>
  )
}
