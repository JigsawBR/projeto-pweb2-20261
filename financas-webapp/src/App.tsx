import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import TransactionsPage from './pages/TransactionsPage'
import NewTransactionPage from './pages/NewTransactionPage'

const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
  { path: '/', element: <ProtectedRoute><DashboardPage /></ProtectedRoute> },
  { path: '/transactions', element: <ProtectedRoute><TransactionsPage /></ProtectedRoute> },
  { path: '/transactions/new', element: <ProtectedRoute><NewTransactionPage /></ProtectedRoute> },
])

export default function App() {
  return <RouterProvider router={router} />
}
