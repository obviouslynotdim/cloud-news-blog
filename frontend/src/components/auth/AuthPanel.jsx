import { useEffect, useState } from 'react';

export function AuthPanel({ mode, setMode, onLogin, onRegister, status }) {
  const [loginForm, setLoginForm] = useState({
    username: '',
    password: ''
  });

  const [registerForm, setRegisterForm] = useState({
    username: '',
    password: '',
    confirmPassword: ''
  });

  useEffect(() => {
    setLoginForm((prev) => ({ ...prev, password: '' }));
    setRegisterForm((prev) => ({ ...prev, password: '', confirmPassword: '' }));
  }, [mode]);

  async function handleLoginSubmit(event) {
    event.preventDefault();
    await onLogin(loginForm);
  }

  async function handleRegisterSubmit(event) {
    event.preventDefault();
    await onRegister(registerForm);
  }

  return (
    <section className="mx-auto mt-10 w-full max-w-xl rounded-xl border border-zinc-300 bg-white p-6 shadow-sm md:p-8">
      <div className="mb-6 flex items-center gap-2 rounded-md border border-zinc-300 bg-zinc-50 p-1">
        <button
          className={`flex-1 rounded px-4 py-2 text-sm font-bold transition ${
            mode === 'login' ? 'bg-zinc-900 text-white' : 'text-zinc-700 hover:bg-zinc-200'
          }`}
          onClick={() => setMode('login')}
          type="button"
        >
          Login
        </button>
        <button
          className={`flex-1 rounded px-4 py-2 text-sm font-bold transition ${
            mode === 'register' ? 'bg-zinc-900 text-white' : 'text-zinc-700 hover:bg-zinc-200'
          }`}
          onClick={() => setMode('register')}
          type="button"
        >
          Register
        </button>
      </div>

      {mode === 'login' ? (
        <form className="grid gap-4" onSubmit={handleLoginSubmit}>
          <h2 className="font-serif text-3xl text-zinc-900">Sign in</h2>
          <p className="text-sm text-zinc-600">Use your credentials to continue.</p>

          <label className="grid gap-1 text-sm font-semibold text-zinc-800">
            Username
            <input
              className="rounded-md border border-zinc-300 px-3 py-2"
              required
              value={loginForm.username}
              onChange={(event) => setLoginForm((prev) => ({ ...prev, username: event.target.value }))}
            />
          </label>

          <label className="grid gap-1 text-sm font-semibold text-zinc-800">
            Password
            <input
              type="password"
              className="rounded-md border border-zinc-300 px-3 py-2"
              required
              value={loginForm.password}
              onChange={(event) => setLoginForm((prev) => ({ ...prev, password: event.target.value }))}
            />
          </label>

          <button className="mt-2 rounded-md bg-[#b80000] px-4 py-2 text-sm font-bold text-white hover:bg-[#980000]" type="submit">
            Login
          </button>
        </form>
      ) : (
        <form className="grid gap-4" onSubmit={handleRegisterSubmit}>
          <h2 className="font-serif text-3xl text-zinc-900">Create account</h2>
          <p className="text-sm text-zinc-600">Register as a user account for reading and tracking stories.</p>

          <label className="grid gap-1 text-sm font-semibold text-zinc-800">
            Username
            <input
              className="rounded-md border border-zinc-300 px-3 py-2"
              required
              value={registerForm.username}
              onChange={(event) => setRegisterForm((prev) => ({ ...prev, username: event.target.value }))}
            />
          </label>

          <label className="grid gap-1 text-sm font-semibold text-zinc-800">
            Password
            <input
              type="password"
              className="rounded-md border border-zinc-300 px-3 py-2"
              required
              value={registerForm.password}
              onChange={(event) => setRegisterForm((prev) => ({ ...prev, password: event.target.value }))}
            />
          </label>

          <label className="grid gap-1 text-sm font-semibold text-zinc-800">
            Confirm password
            <input
              type="password"
              className="rounded-md border border-zinc-300 px-3 py-2"
              required
              value={registerForm.confirmPassword}
              onChange={(event) => setRegisterForm((prev) => ({ ...prev, confirmPassword: event.target.value }))}
            />
          </label>

          <button className="mt-2 rounded-md bg-[#b80000] px-4 py-2 text-sm font-bold text-white hover:bg-[#980000]" type="submit">
            Register
          </button>
        </form>
      )}

      {status ? <p className="mt-4 text-sm font-semibold text-zinc-700">{status}</p> : null}
    </section>
  );
}
