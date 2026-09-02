import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../services/auth';
import { Button, Card, Field, Input, Badge, Separator } from '../components/ui';
import Icon from '../components/Icon';
import { AuthShell } from '../components/auth/AuthShell';

export default function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  function onChange(k, v) { setForm({ ...form, [k]: v }); }

  async function onSubmit(e) {
    e.preventDefault();
    setError(''); setBusy(true);
    try {
      const user = await register({ ...form, role: 'CUSTOMER' });
      navigate(user.role === 'CUSTOMER' ? '/onboarding' : '/admin', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell>
      <div className="text-center mb-7">
        <Badge variant="gold" size="md" dot className="mx-auto">Start your workspace</Badge>
        <h1 className="font-display text-[30px] font-semibold tracking-[-0.02em] mt-3 text-platinum-50">Create your account</h1>
        <p className="text-platinum-300/70 text-[13.5px] mt-1.5">Plan, discover, and book in minutes.</p>
      </div>

      <Card className="p-6 sm:p-7" accent>
        {error && (
          <div className="mb-4 rounded-xl border border-rose-500/30 bg-rose-500/[0.08] text-rose-200 text-[12.5px] px-3.5 py-2.5 flex items-start gap-2 anim-fade-in">
            <Icon name="x" size={14} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <Field label="Full name" required>
            <Input
              required
              value={form.name}
              onChange={(e) => onChange('name', e.target.value)}
              placeholder="Your name"
              leftIcon={<Icon name="user" size={15} />}
              autoComplete="name"
            />
          </Field>
          <Field label="Email" required>
            <Input
              type="email"
              required
              value={form.email}
              onChange={(e) => onChange('email', e.target.value)}
              placeholder="you@example.com"
              leftIcon={<Icon name="mail" size={15} />}
              autoComplete="email"
            />
          </Field>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Phone (optional)">
              <Input
                value={form.phone}
                onChange={(e) => onChange('phone', e.target.value)}
                placeholder="+91 …"
                leftIcon={<Icon name="phone" size={15} />}
                autoComplete="tel"
              />
            </Field>
            <Field label="Password" required>
              <Input
                type="password"
                required
                minLength={6}
                value={form.password}
                onChange={(e) => onChange('password', e.target.value)}
                placeholder="At least 6 chars"
                leftIcon={<Icon name="lock" size={15} />}
                autoComplete="new-password"
              />
            </Field>
          </div>

          <Button type="submit" variant="gold" size="lg" loading={busy} className="mt-1">
            {!busy && <><Icon name="spark" size={16} /> Create account</>}
          </Button>
        </form>

        <Separator className="my-5" />
        <div className="text-center text-[12.5px] text-platinum-300/70">
          Already have an account?{' '}
          <Link to="/login" className="text-aura-300 hover:text-aura-200 font-medium transition-colors">
            Sign in
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
