import { LoginForm } from '../components/LoginForm';
import { Role } from '../types';
import { motion } from 'framer-motion';
interface LoginPageProps {
  onLogin: (email: string, role: Role) => Promise<void>;
}
export function LoginPage({ onLogin }: LoginPageProps) {
  return (
    <div className="min-h-screen w-full bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-blue-100/50 to-transparent pointer-events-none" />
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-40 -left-40 w-96 h-96 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{
          opacity: 0,
          y: 20
        }}
        animate={{
          opacity: 1,
          y: 0
        }}
        transition={{
          duration: 0.5,
          ease: 'easeOut'
        }}
        className="relative z-10 w-full max-w-md">

        <LoginForm onLogin={onLogin} />
      </motion.div>
    </div>);

}