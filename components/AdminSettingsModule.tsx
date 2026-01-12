
import React, { useState } from 'react';
import { User, ModuleType, UserPermissions } from '../types';
import { UserPlus, Trash2, X, Check, Lock, Shield, Key, User as UserIcon, Edit2, Eye, EyeOff } from 'lucide-react';

interface AdminSettingsModuleProps {
  users: User[];
  setUsers: (users: User[]) => void;
  currentUser: User;
}

const AdminSettingsModule: React.FC<AdminSettingsModuleProps> = ({ users, setUsers, currentUser }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});

  const [newLogin, setNewLogin] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newName, setNewName] = useState('');
  const [newPerms, setNewPerms] = useState<UserPermissions>({
    [ModuleType.DASHBOARD]: true,
    [ModuleType.HR]: false,
    [ModuleType.ENGINEERING]: false,
    [ModuleType.TIME_TRACKING]: false,
    [ModuleType.TASKS]: false,
    [ModuleType.CHAT]: true,
  });

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLogin || !newPassword || !newName) return;
    const newUser: User = { 
      id: Date.now().toString(), 
      login: newLogin, 
      password: newPassword, 
      fullName: newName, 
      role: 'USER', 
      permissions: { ...newPerms } 
    };
    setUsers([...users, newUser]);
    setIsAdding(false);
    resetAddForm();
  };

  const resetAddForm = () => {
    setNewLogin(''); 
    setNewPassword(''); 
    setNewName('');
    setNewPerms({
      [ModuleType.DASHBOARD]: true,
      [ModuleType.HR]: false,
      [ModuleType.ENGINEERING]: false,
      [ModuleType.TIME_TRACKING]: false,
      [ModuleType.TASKS]: false,
      [ModuleType.CHAT]: true,
    });
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setUsers(users.map(u => u.id === editingUser.id ? editingUser : u));
    setEditingUser(null);
  };

  const togglePermission = (userId: string, module: ModuleType) => {
    setUsers(users.map(u => {
      if (u.id === userId && u.role !== 'ADMIN') {
        return { ...u, permissions: { ...u.permissions, [module]: !u.permissions[module] } };
      }
      return u;
    }));
  };

  const deleteUser = (id: string) => { 
    if (confirm('Удалить этого пользователя?')) setUsers(users.filter(u => u.id !== id)); 
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 relative z-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Управление доступом</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Просмотр учетных данных и настройка прав доступа</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)} 
          className="bg-slate-900 dark:bg-blue-600 text-white px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 hover:bg-slate-800 dark:hover:bg-blue-700 transition-all shadow-xl active:scale-95 z-20"
        >
          <UserPlus size={18} /> Добавить аккаунт
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
              <tr className="text-[10px] uppercase font-black text-slate-400 dark:text-slate-600 tracking-widest">
                <th className="px-10 py-6">Сотрудник</th>
                <th className="px-6 py-6">Учетные данные</th>
                <th className="px-6 py-6">Разрешения</th>
                <th className="px-10 py-6 text-right">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {users.map(user => (
                <tr key={user.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors group">
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-500 dark:text-slate-400 font-black border border-white dark:border-slate-700 shadow-sm shrink-0">{user.fullName.charAt(0)}</div>
                      <div className="flex flex-col min-w-0">
                        <span className="font-black text-slate-800 dark:text-white tracking-tight truncate">{user.fullName}</span>
                        <span className={`inline-flex w-fit px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-tighter mt-1 ${user.role === 'ADMIN' ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                          {user.role}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-6 text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2"><Shield size={12} className="text-slate-400"/><span className="font-black text-blue-600 dark:text-blue-400">{user.login}</span></div>
                      <div className="flex items-center gap-2"><Key size={12} className="text-slate-400"/><span className="font-bold">{showPasswords[user.id] ? user.password : '••••••••'}</span><button onClick={() => setShowPasswords(p => ({...p, [user.id]: !p[user.id]}))} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors text-slate-400">{showPasswords[user.id] ? <EyeOff size={10}/> : <Eye size={10}/>}</button></div>
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <div className="flex flex-wrap gap-1.5">
                      {[ModuleType.HR, ModuleType.ENGINEERING, ModuleType.TIME_TRACKING, ModuleType.TASKS, ModuleType.CHAT].map(mod => (
                        <button key={mod} disabled={user.role === 'ADMIN'} onClick={() => togglePermission(user.id, mod)} className={`px-2 py-1 rounded-lg text-[8px] font-black tracking-widest uppercase transition-all border ${user.permissions[mod] ? 'bg-blue-600 text-white border-blue-500' : 'bg-white dark:bg-slate-900 text-slate-400 border-slate-100 dark:border-slate-800'} ${user.role === 'ADMIN' ? 'opacity-30' : ''}`}>{mod.slice(0, 4)}</button>
                      ))}
                    </div>
                  </td>
                  <td className="px-10 py-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => setEditingUser({ ...user })} className="p-2.5 text-slate-400 hover:text-blue-500 transition-all hover:bg-blue-50 dark:hover:bg-blue-900/10 rounded-xl"><Edit2 size={18} /></button>
                      {user.id !== currentUser.id && user.role !== 'ADMIN' && (<button onClick={() => deleteUser(user.id)} className="p-2.5 text-slate-400 hover:text-rose-500 transition-all hover:bg-rose-50 dark:hover:bg-rose-900/10 rounded-xl"><Trash2 size={18} /></button>)}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isAdding && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-[32px] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 border dark:border-slate-800 flex flex-col max-h-[90vh]">
            <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
              <div className="flex items-center gap-3 text-slate-800 dark:text-white">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-xl flex items-center justify-center"><UserPlus size={20} /></div>
                <h3 className="font-black text-xl tracking-tight">Новый аккаунт</h3>
              </div>
              <button onClick={() => setIsAdding(false)} className="text-slate-400 hover:text-slate-600"><X size={24} /></button>
            </div>
            <form onSubmit={handleAddUser} className="p-8 space-y-6 overflow-y-auto">
              <div className="space-y-4">
                <input required value={newName} onChange={(e) => setNewName(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 rounded-2xl px-6 py-4 text-sm font-bold text-slate-800 dark:text-white outline-none focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/20" placeholder="ФИО Сотрудника" />
                <div className="grid grid-cols-2 gap-4">
                  <input required value={newLogin} onChange={(e) => setNewLogin(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 rounded-2xl px-6 py-4 text-sm font-bold text-slate-800 dark:text-white outline-none" placeholder="Логин" />
                  <input required value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 rounded-2xl px-6 py-4 text-sm font-bold text-slate-800 dark:text-white outline-none" placeholder="Пароль" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[ModuleType.HR, ModuleType.ENGINEERING, ModuleType.TIME_TRACKING, ModuleType.TASKS, ModuleType.CHAT, ModuleType.DASHBOARD].map(mod => (
                  <button key={mod} type="button" onClick={() => setNewPerms({ ...newPerms, [mod]: !newPerms[mod] })} className={`flex items-center gap-3 p-4 rounded-2xl border transition-all text-left ${newPerms[mod] ? 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-300' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-500'}`}>
                    <div className={`w-4 h-4 rounded-md border-2 flex items-center justify-center transition-all ${newPerms[mod] ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-200 dark:border-slate-700'}`}>{newPerms[mod] && <Check size={10} />}</div>
                    <span className="text-[10px] font-black uppercase">{mod.slice(0, 8)}</span>
                  </button>
                ))}
              </div>
              <div className="pt-6 flex gap-4">
                <button type="button" onClick={() => setIsAdding(false)} className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-2xl font-black text-xs uppercase tracking-widest">Отмена</button>
                <button type="submit" className="flex-2 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-900/20 active:scale-95">Создать</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSettingsModule;
