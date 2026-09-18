import { useState, type FormEvent } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';
import { supabase, supabaseConfigurationError } from '../lib/supabase';

interface LoginLocationState {
  from?: string;
}

export function LoginPage() {
  const { user } = useAuth();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const requestedPath = (location.state as LoginLocationState | null)?.from;
  const destination = requestedPath?.startsWith('/')
    ? requestedPath
    : '/admin/products';

  if (user) return <Navigate to={destination} replace />;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    if (!supabase) {
      setErrorMessage(supabaseConfigurationError);
      return;
    }

    setIsSubmitting(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) setErrorMessage(error.message);
    setIsSubmitting(false);
  }

  return (
    <main className="login-page">
      <section className="login-brand">
        <Link className="brand" to="/">
          <span className="brand-mark">R</span>
          <span>
            <strong>REECO</strong>
            <small>AI product intelligence</small>
          </span>
        </Link>
        <h1>Product operations, grounded in verified data.</h1>
        <p>
          Sign in to inspect all catalog records and run the controlled
          server-side import.
        </p>
      </section>
      <section className="login-form-wrap">
        <div className="login-card panel">
          <h2>Admin sign in</h2>
          <p>Use an existing Supabase account to continue.</p>
          <form onSubmit={handleSubmit}>
            <label>
              Email
              <input
                autoComplete="email"
                name="email"
                onChange={(event) => setEmail(event.target.value)}
                required
                type="email"
                value={email}
              />
            </label>
            <label>
              Password
              <input
                autoComplete="current-password"
                name="password"
                onChange={(event) => setPassword(event.target.value)}
                required
                type="password"
                value={password}
              />
            </label>
            <button
              className="button button-primary"
              disabled={isSubmitting}
              type="submit"
            >
              {isSubmitting ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
          {errorMessage ? (
            <p className="inline-error" role="alert">
              {errorMessage}
            </p>
          ) : null}
          <Link className="back-link" to="/">
            ← Back to search
          </Link>
        </div>
      </section>
    </main>
  );
}
