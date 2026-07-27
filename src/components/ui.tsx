import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

export function Card({ children, className = '', onClick }: { children: ReactNode; className?: string; onClick?: () => void }) {
  return (
    <motion.div
      whileHover={onClick ? { y: -2 } : undefined}
      onClick={onClick}
      className={`glass-card p-4 ${className}`}
    >
      {children}
    </motion.div>
  );
}

export function SectionTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">{children}</h2>
      {action}
    </div>
  );
}

export function Chip({ color = 'primary', children }: { color?: 'primary' | 'success' | 'warning' | 'danger' | 'slate'; children: ReactNode }) {
  const map = {
    primary: 'bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300',
    success: 'bg-success-100 text-success-700 dark:bg-success-700/30 dark:text-success-400',
    warning: 'bg-warning-100 text-warning-600 dark:bg-warning-500/20 dark:text-warning-400',
    danger: 'bg-danger-100 text-danger-600 dark:bg-danger-500/20 dark:text-danger-400',
    slate: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
  };
  return <span className={`chip ${map[color]}`}>{children}</span>;
}

export function Button({ children, variant = 'primary', className = '', onClick, type = 'button', disabled = false }: {
  children: ReactNode; variant?: 'primary' | 'ghost' | 'danger' | 'success' | 'outline'; className?: string; onClick?: () => void; type?: 'button' | 'submit'; disabled?: boolean;
}) {
  const map = {
    primary: 'bg-primary-600 hover:bg-primary-700 text-white shadow-glow',
    ghost: 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200',
    danger: 'bg-danger-500 hover:bg-danger-600 text-white',
    success: 'bg-success-500 hover:bg-success-600 text-white',
    outline: 'border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800',
  };
  return (
    <motion.button
      type={type}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      disabled={disabled}
      className={`rounded-xl px-4 py-2.5 font-semibold text-sm transition-all ${map[variant]} ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {children}
    </motion.button>
  );
}

export function RiskBadge({ level }: { level: 'low' | 'moderate' | 'high' }) {
  const map = {
    low: { color: 'success', label: 'Low Risk', dot: 'bg-success-500' },
    moderate: { color: 'warning', label: 'Moderate Risk', dot: 'bg-warning-500' },
    high: { color: 'danger', label: 'High Risk', dot: 'bg-danger-500' },
  } as const;
  const m = map[level];
  return (
    <Chip color={m.color}>
      <span className={`w-2 h-2 rounded-full ${m.dot}`} /> {m.label}
    </Chip>
  );
}

export function Gauge({ value, size = 160, label }: { value: number; size?: number; label?: string }) {
  const r = (size - 16) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (value / 100) * c;
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="currentColor" strokeWidth="10" className="text-slate-200 dark:text-slate-700" />
        <motion.circle
          cx={size/2} cy={size/2} r={r} fill="none" stroke="url(#gaugeGrad)" strokeWidth="10" strokeLinecap="round"
          strokeDasharray={c} initial={{ strokeDashoffset: c }} animate={{ strokeDashoffset: offset }} transition={{ duration: 1, ease: 'easeOut' }}
        />
        <defs>
          <linearGradient id="gaugeGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#2563eb" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute text-center">
        <div className="text-3xl font-extrabold text-slate-800 dark:text-white">{value}%</div>
        {label && <div className="text-xs text-slate-500 dark:text-slate-400">{label}</div>}
      </div>
    </div>
  );
}

export function PageHeader({ title, subtitle, right }: { title: string; subtitle?: string; right?: ReactNode }) {
  return (
    <div className="flex items-start justify-between mb-5">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white">{title}</h1>
        {subtitle && <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>}
      </div>
      {right}
    </div>
  );
}

export function Empty({ icon, text }: { icon: ReactNode; text: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-slate-400">
      <div className="mb-3">{icon}</div>
      <p className="text-sm">{text}</p>
    </div>
  );
}
