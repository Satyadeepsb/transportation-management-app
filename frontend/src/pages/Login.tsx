import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Card from '../horizon-components/card';
// import InputField from '../horizon-components/fields/InputField';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login({ email, password });
      navigate('/admin/default');
    } catch (err: any) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card extra="w-full px-8 py-10">
      <div className="mb-8">
        <h2 className="text-4xl font-bold text-navy-700 dark:text-white">
          Sign In
        </h2>
        <p className="mt-2 text-base text-gray-600 dark:text-gray-400">
          Enter your email and password to sign in
        </p>
      </div>

      <form className="space-y-5" onSubmit={handleSubmit}>
        {error && (
          <div className="rounded-xl bg-red-50 p-4 dark:bg-red-900/20">
            <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
          </div>
        )}

        <div>
          <label htmlFor="email" className="ml-1.5 text-sm font-medium text-navy-700 dark:text-white">
            Email*
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="mt-2 flex h-12 w-full items-center justify-center rounded-xl border border-gray-200 bg-white/0 p-3 text-sm outline-none dark:border-white/10 dark:text-white"
            placeholder="mail@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="password" className="ml-1.5 text-sm font-medium text-navy-700 dark:text-white">
            Password*
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            className="mt-2 flex h-12 w-full items-center justify-center rounded-xl border border-gray-200 bg-white/0 p-3 text-sm outline-none dark:border-white/10 dark:text-white"
            placeholder="Min. 6 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="linear mt-4 w-full rounded-xl bg-brand-500 py-3 text-base font-medium text-white transition duration-200 hover:bg-brand-600 active:bg-brand-700 disabled:bg-gray-400 dark:bg-brand-400 dark:text-white dark:hover:bg-brand-300 dark:active:bg-brand-200"
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>

        <div className="text-sm text-center">
          <span className="text-gray-600 dark:text-gray-400">Not registered yet? </span>
          <Link
            to="/auth/sign-up"
            className="font-medium text-brand-500 hover:text-brand-600 dark:text-brand-400"
          >
            Create an Account
          </Link>
        </div>

        <Card extra="mt-6 p-4 bg-lightPrimary dark:bg-navy-700">
          <p className="mb-2 text-xs font-bold text-navy-700 dark:text-white">Test Accounts:</p>
          <div className="space-y-1 text-xs text-gray-700 dark:text-gray-300">
            <p><span className="font-semibold">Admin:</span> admin@transport.com / password123</p>
            <p><span className="font-semibold">Dispatcher:</span> dispatcher@transport.com / password123</p>
            <p><span className="font-semibold">Customer:</span> customer@example.com / password123</p>
          </div>
        </Card>
      </form>
    </Card>
  );
}
