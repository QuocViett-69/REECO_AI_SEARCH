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
    <main>
      <h1>REECO Admin Sign In</h1>
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
        <button disabled={isSubmitting} type="submit">
          {isSubmitting ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
      {errorMessage ? <p role="alert">{errorMessage}</p> : null}
      <Link to="/">Back to search</Link>
    </main>
  );
}
