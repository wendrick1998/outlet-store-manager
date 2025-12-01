import React, { useState, useEffect } from 'react';
import { KeyRound } from 'lucide-react';
import { User } from '../../types';
import { DEFAULT_ADMIN_PERMISSIONS } from '../../utils/constants';

interface AuthScreenProps {
    onLogin: (user: User) => void;
    users: User[];
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin, users }) => {
    const [mode, setMode] = useState<'login' | 'setup'>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState(''); // Only for setup
    const [error, setError] = useState('');

    useEffect(() => {
        if (users.length === 0) setMode('setup');
        else setMode('login');
    }, [users]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (mode === 'setup') {
            if (!email || !password || !name) return setError("Preencha todos os campos");
            const newUser: User = {
                id: Date.now().toString(),
                name,
                email,
                password, // In real app, hash this
                role: 'admin',
                permissions: DEFAULT_ADMIN_PERMISSIONS,
                active: true
            };
            onLogin(newUser); // First user logs in immediately as Admin and saves to parent
        } else {
            const user = users.find(u => u.email === email && u.password === password && u.active);
            if (user) {
                onLogin(user);
            } else {
                setError("Credenciais inválidas ou usuário inativo.");
            }
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900 flex items-center justify-center z-[1000] p-4">
            <div className="bg-white dark:bg-slate-950 p-8 rounded-3xl shadow-2xl w-full max-w-sm text-center">
                <div className="bg-indigo-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-indigo-600/30">
                    <KeyRound className="text-white w-8 h-8" />
                </div>
                <h1 className="text-2xl font-black text-slate-800 dark:text-white mb-2">Outlet Store+</h1>
                <p className="text-slate-500 mb-6 text-sm">
                    {mode === 'setup' ? "Configuração Inicial do Administrador" : "Acesse sua conta"}
                </p>

                <form onSubmit={handleSubmit} className="space-y-4 text-left">
                    {mode === 'setup' && (
                        <div>
                            <label className="text-xs font-bold text-slate-500 ml-1">Nome Completo</label>
                            <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white" placeholder="Seu nome" />
                        </div>
                    )}
                    <div>
                        <label className="text-xs font-bold text-slate-500 ml-1">E-mail</label>
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white" placeholder="exemplo@loja.com" />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-500 ml-1">Senha</label>
                        <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white" placeholder="••••••" />
                    </div>

                    {error && <p className="text-red-500 text-xs font-bold text-center">{error}</p>}

                    <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition shadow-lg mt-4">
                        {mode === 'setup' ? "Criar Admin e Entrar" : "Entrar no Sistema"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AuthScreen;
