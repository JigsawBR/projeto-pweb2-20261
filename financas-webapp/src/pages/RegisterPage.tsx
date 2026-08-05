import { type FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import { register } from '../features/auth/authSlice'
import { Icon } from '../components/Icon'

export default function RegisterPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { status, error } = useAppSelector((state) => state.auth)
  const [name, setName] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const result = await dispatch(register({ name, username, password }))
    if (register.fulfilled.match(result)) navigate('/')
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <span className="auth-logo-icon"><Icon name="wallet" size={20} color="#fff" /></span>
          <span className="auth-logo-text">Finanças</span>
        </div>

        <h1>Criar conta</h1>
        <p className="auth-subtitle">Comece a controlar suas finanças agora</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Nome completo</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Seu nome"
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="username">Email</label>
            <input
              id="username"
              type="email"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="seu@email.com"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Senha</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              minLength={6}
              required
            />
          </div>

          {error && <div className="alert-error" role="alert">{error}</div>}

          <button className="btn btn-primary" type="submit" disabled={status === 'loading'}>
            {status === 'loading' ? 'Criando conta...' : 'Criar conta'}
          </button>
        </form>

        <p className="auth-footer">
          Já tem conta?{' '}
          <Link to="/login">Entrar</Link>
        </p>
      </div>
    </div>
  )
}
