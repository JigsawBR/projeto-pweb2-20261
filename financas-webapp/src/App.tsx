import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'
import { useAppSelector } from './app/hooks'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import TransactionsPage from './pages/TransactionsPage'
import NewTransactionPage from './pages/NewTransactionPage'
import AppLayout from './layouts/AppLayout'

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { token } = useAppSelector((state) => state.auth)
  return token ? <>{children}</> : <Navigate to="/login" replace />
}

const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
  {
    element: (
      <PrivateRoute>
        <AppLayout />
      </PrivateRoute>
    ),
    children: [
      { path: '/', element: <DashboardPage /> },
      { path: '/transactions', element: <TransactionsPage /> },
      { path: '/transactions/new', element: <NewTransactionPage /> },
    ],
  },
])

export default function App() {
  return <RouterProvider router={router} />
}
