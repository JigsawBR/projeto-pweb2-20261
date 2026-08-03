import { useEffect } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import { logout } from '../features/auth/authSlice'

export default function AppLayout() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { user } = useAppSelector((state) => state.auth)

  // Solicita permissão para exibir Web Notifications (usadas pelo Service
  // Worker para alertar sobre limites de gastos), uma única vez.
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [])

  function handleLogout() {
    dispatch(logout())
    navigate('/login')
  }

  const initials = user?.username?.slice(0, 2).toUpperCase() ?? '??'

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <span className="sidebar-logo-text">Finanças</span>
        </div>

        <nav className="sidebar-nav">
          <NavLink to="/" end className={({ isActive }) => 'sidebar-link' + (isActive ? ' active' : '')}>
            Dashboard
          </NavLink>
          <NavLink to="/transactions" className={({ isActive }) => 'sidebar-link' + (isActive ? ' active' : '')}>
            Transações
          </NavLink>
          <NavLink to="/transactions/new" className={({ isActive }) => 'sidebar-link' + (isActive ? ' active' : '')}>
            Nova transação
          </NavLink>
          <NavLink to="/goals" className={({ isActive }) => 'sidebar-link' + (isActive ? ' active' : '')}>
            Metas
          </NavLink>
          <NavLink to="/spending-limits" className={({ isActive }) => 'sidebar-link' + (isActive ? ' active' : '')}>
            Limites de Gastos
          </NavLink>
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-user">
            <div className="sidebar-avatar">{initials}</div>
            <span className="sidebar-username">{user?.username}</span>
          </div>
          <button className="btn btn-ghost" style={{ width: '100%', justifyContent: 'flex-start' }} onClick={handleLogout}>
            Sair
          </button>
        </div>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  )
}
