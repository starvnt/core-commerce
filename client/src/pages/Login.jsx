import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { login } from '../services/auth';
import { Button, Card, Field, Input, Label, Badge, Separator } from '../components/ui';
import Icon from '../components/Icon';
import { AuthShell } from '../components/auth/AuthShell';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError(''); setBusy(true);
    try {
      const user = await login({ email, password });
      const to = location.state?.from || (user.role === 'CUSTOMER' ? '/customers/me' : '/admin');
      navigate(to, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell>
      <div className="text-center mb-7">
        <Badge variant="aura" size="md" dot className="mx-auto">Welcome back</Badge>
        <h1 className="font-display text-[30px] font-semibold tracking-[-0.02em] mt-3 text-platinum-50">Sign in to StarVnt</h1>
        <p className="text-platinum-300/70 text-[13.5px] mt-1.5">Pick up where you left off in your event workspace.</p>
      </div>

      <Card className="p-6 sm:p-7" accent>
        {error && (
          <div className="mb-4 rounded-xl border border-rose-500/30 bg-rose-500/[0.08] text-rose-200 text-[12.5px] px-3.5 py-2.5 flex items-start gap-2 anim-fade-in">
            <Icon name="x" size={14} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <Field label="Email" required>
            <Input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              leftIcon={<Icon name="mail" size={15} />}
              autoComplete="email"
            />
          </Field>
          <Field label="Password" required>
            <Input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              leftIcon={<Icon name="lock" size={15} />}
              autoComplete="current-password"
            />
          </Field>

          <Button type="submit" variant="gold" size="lg" loading={busy} className="mt-1">
            {!busy && <><Icon name="arrow" size={16} /> Sign in</>}
          </Button>
        </form>

        <Separator className="my-5" />
        <div className="text-center text-[12.5px] text-platinum-300/70">
          New to StarVnt?{' '}
          <Link to="/signup" className="text-aura-300 hover:text-aura-200 font-medium transition-colors">
            Create an account
          </Link>
        </div>
      </Card>

      <div className="text-center mt-5">
        <Link to="/landing" className="text-[12px] text-platinum-300/50 hover:text-platinum-200 transition-colors">
          ← Back to home
        </Link>
      </div>
    </AuthShell>
  );
}
