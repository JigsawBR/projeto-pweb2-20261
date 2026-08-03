import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import AppLayout from './layouts/AppLayout'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import TransactionsPage from './pages/TransactionsPage'
import NewTransactionPage from './pages/NewTransactionPage'
import GoalsPage from './pages/GoalsPage'
import NewGoalPage from './pages/NewGoalPage'
import SpendingLimitsPage from './pages/SpendingLimitsPage'

const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
  {
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: '/', element: <DashboardPage /> },
      { path: '/transactions', element: <TransactionsPage /> },
      { path: '/transactions/new', element: <NewTransactionPage /> },
      { path: '/goals', element: <GoalsPage /> },
      { path: '/goals/new', element: <NewGoalPage /> },
      { path: '/spending-limits', element: <SpendingLimitsPage /> },
    ],
  },
])

export default function App() {
  return <RouterProvider router={router} />
}
