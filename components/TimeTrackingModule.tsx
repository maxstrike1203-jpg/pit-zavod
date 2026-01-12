
import React, { useState } from 'react';
import { INITIAL_EMPLOYEES } from '../constants';
import { Download, Calendar, Search, Filter, Loader2, CheckCircle, X, User, Check, Square, CheckSquare } from 'lucide-react';

const TimeTrackingModule: React.FC = () => {
  const [year] = useState(2023);
  const [month] = useState(11); // Ноябрь
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const [attendance, setAttendance] = useState<Record<string, Record<number, string>>>({});
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState<string>('');
  const [showExportSuccess, setShowExportSuccess] = useState(false);
  
  // Export Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [modalSearch, setModalSearch] = useState('');

  const handleCellClick = (empId: string, day: number) => {
    const current = attendance[empId]?.[day] || '8';
    let next = '8';
    if (current === '8') next = 'В';
    else if (current === 'В') next = 'Б';
    else if (current === 'Б') next = '8';

    setAttendance(prev => ({
      ...prev,
      [empId]: {
        ...(prev[empId] || {}),
        [day]: next
      }
    }));
  };

  const startExportProcess = () => {
    setSelectedEmployees(INITIAL_EMPLOYEES.map(e => e.id));
    setIsModalOpen(true);
  };

  const handleConfirmExport = async () => {
    if (selectedEmployees.length === 0) return;
    
    setIsModalOpen(false);
    setIsExporting(true);
    
    // Simulate batch processing for each selected employee
    for (const empId of selectedEmployees) {
      const emp = INITIAL_EMPLOYEES.find(e => e.id === empId);
      if (emp) {
        setExportProgress(`Генерация: ${emp.fullName}`);
        await new Promise(resolve => setTimeout(resolve, 800)); // Simulate work per file
      }
    }

    setIsExporting(false);
    setExportProgress('');
    setShowExportSuccess(true);
    setTimeout(() => setShowExportSuccess(false), 4000);
  };

  const toggleEmployeeSelection = (id: string) => {
    setSelectedEmployees(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const selectAll = () => setSelectedEmployees(INITIAL_EMPLOYEES.map(e => e.id));
  const deselectAll = () => setSelectedEmployees([]);

  const filteredEmployeesForModal = INITIAL_EMPLOYEES.filter(e => 
    e.fullName.toLowerCase().includes(modalSearch.toLowerCase()) || 
    e.position.toLowerCase().includes(modalSearch.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500 relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">Учет рабочего времени</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Заполнение табеля и расчет отработанных часов</p>
        </div>
        <div className="flex gap-3">
          <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-5 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-400 shadow-sm transition-colors">
             <Calendar size={18} className="text-blue-500" />
             Ноябрь 2023
          </div>
          <button 
            onClick={startExportProcess}
            disabled={isExporting}
            className={`px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 transition-all shadow-lg active:scale-95 ${
              isExporting ? 'bg-slate-400 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-900/20'
            }`}
          >
            {isExporting ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
            {isExporting ? (exportProgress || 'Генерация...') : 'Выгрузить PDF'}
          </button>
        </div>
      </div>

      {showExportSuccess && (
        <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30 p-5 rounded-3xl flex items-center gap-4 text-emerald-700 dark:text-emerald-400 animate-in slide-in-from-top-4 shadow-xl shadow-emerald-900/5">
          <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/20 rounded-full flex items-center justify-center shrink-0">
            <CheckCircle size={22} className="text-emerald-500" />
          </div>
          <div>
            <span className="font-bold text-sm tracking-tight block">Пакетная выгрузка завершена!</span>
            <p className="text-xs opacity-70">Сформировано индивидуальных табелей: {selectedEmployees.length}</p>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
           <div className="flex items-center gap-4 flex-1">
              <Search className="text-slate-400 dark:text-slate-600" size={20} />
              <input 
                type="text" 
                placeholder="Поиск сотрудника в табеле..." 
                className="bg-transparent border-none focus:ring-0 text-sm font-bold text-slate-700 dark:text-slate-200 w-64 placeholder:text-slate-400 dark:placeholder:text-slate-600 outline-none"
              />
           </div>
           <div className="hidden lg:flex items-center gap-8 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-600">
              <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-lg shadow-blue-500/50"></div> 8 - Работа</div>
              <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-orange-400 shadow-lg shadow-orange-500/50"></div> В - Выходной</div>
              <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-lg shadow-rose-500/50"></div> Б - Больничный</div>
           </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left table-fixed border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="sticky left-0 z-20 bg-slate-50 dark:bg-slate-800 px-8 py-5 w-64 text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest">Сотрудник</th>
                {days.map(d => (
                  <th key={d} className="px-1 py-5 text-center text-[10px] font-black text-slate-400 dark:text-slate-600 w-10 border-l border-slate-100/50 dark:border-slate-700/50">
                    {d}
                  </th>
                ))}
                <th className="px-4 py-5 text-center text-[10px] font-black text-slate-400 dark:text-slate-600 w-20 border-l border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800">Итого</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {INITIAL_EMPLOYEES.map(emp => {
                const empAttendance = attendance[emp.id] || {};
                let total = 0;
                days.forEach(d => { if (empAttendance[d] === '8' || !empAttendance[d]) total += 8; });

                return (
                  <tr key={emp.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="sticky left-0 z-20 bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 px-8 py-5">
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-slate-800 dark:text-white truncate tracking-tight">{emp.fullName}</span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-600 truncate uppercase font-black tracking-widest mt-0.5">{emp.position}</span>
                      </div>
                    </td>
                    {days.map(d => {
                      const status = empAttendance[d] || '8';
                      return (
                        <td 
                          key={d} 
                          onClick={() => handleCellClick(emp.id, d)}
                          className={`cursor-pointer border-l border-slate-100/50 dark:border-slate-800/50 text-center text-[11px] font-black transition-all h-14 ${
                            status === '8' ? 'text-slate-600 dark:text-slate-400 hover:bg-blue-50 dark:hover:bg-blue-900/20' : 
                            status === 'В' ? 'bg-orange-50 dark:bg-orange-900/10 text-orange-600 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-900/20' : 
                            'bg-rose-50 dark:bg-rose-900/10 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/20'
                          }`}
                        >
                          {status}
                        </td>
                      );
                    })}
                    <td className="bg-slate-50 dark:bg-slate-800/50 text-center font-black text-slate-800 dark:text-white border-l border-slate-200 dark:border-slate-700">
                      {total}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-6 transition-colors">
           <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center shadow-inner">
             <Filter size={28} />
           </div>
           <div>
             <div className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">100%</div>
             <div className="text-[10px] text-slate-400 dark:text-slate-600 uppercase font-black tracking-widest mt-1">Заполнение табеля</div>
           </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-6 transition-colors">
           <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center shadow-inner">
             <Download size={28} />
           </div>
           <div>
             <div className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">4</div>
             <div className="text-[10px] text-slate-400 dark:text-slate-600 uppercase font-black tracking-widest mt-1">Отчета выгружено</div>
           </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-6 transition-colors">
           <div className="w-14 h-14 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 rounded-2xl flex items-center justify-center shadow-inner">
             <Calendar size={28} />
           </div>
           <div>
             <div className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">18</div>
             <div className="text-[10px] text-slate-400 dark:text-slate-600 uppercase font-black tracking-widest mt-1">Раб. дней осталось</div>
           </div>
        </div>
      </div>

      {/* Export Selection Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-[40px] shadow-2xl w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-200 border dark:border-slate-800 flex flex-col max-h-[85vh]">
            <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-xl flex items-center justify-center"><Download size={20} /></div>
                <div>
                  <h3 className="font-black text-xl text-slate-800 dark:text-white tracking-tight leading-none">Экспорт табелей</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1.5">Выберите сотрудников для выгрузки</p>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <div className="px-8 pt-6 pb-2 shrink-0">
              <div className="flex flex-col sm:flex-row gap-4 mb-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input 
                    type="text" 
                    placeholder="Поиск по списку..." 
                    className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl pl-12 pr-4 py-3.5 text-sm font-bold text-slate-800 dark:text-white outline-none focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/10 transition-all"
                    value={modalSearch}
                    onChange={(e) => setModalSearch(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={selectAll}
                    className="px-4 py-3.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                  >
                    Все
                  </button>
                  <button 
                    onClick={deselectAll}
                    className="px-4 py-3.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                  >
                    Снять
                  </button>
                </div>
              </div>
              <div className="flex justify-between items-center px-2 py-2 border-b border-slate-50 dark:border-slate-800">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Выбрано: {selectedEmployees.length} из {INITIAL_EMPLOYEES.length}</span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-8 py-2 space-y-2">
              {filteredEmployeesForModal.length > 0 ? filteredEmployeesForModal.map(emp => (
                <div 
                  key={emp.id} 
                  onClick={() => toggleEmployeeSelection(emp.id)}
                  className={`flex items-center gap-4 p-4 rounded-3xl border transition-all cursor-pointer group ${
                    selectedEmployees.includes(emp.id) 
                      ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800' 
                      : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                    selectedEmployees.includes(emp.id) 
                      ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/30' 
                      : 'border-slate-200 dark:border-slate-700 text-transparent'
                  }`}>
                    <Check size={14} strokeWidth={4} />
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 font-black text-xs shrink-0">
                    {emp.fullName.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className={`text-sm font-black truncate leading-tight ${selectedEmployees.includes(emp.id) ? 'text-blue-700 dark:text-blue-300' : 'text-slate-800 dark:text-slate-200'}`}>{emp.fullName}</h4>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">{emp.position}</p>
                  </div>
                </div>
              )) : (
                <div className="py-12 text-center text-slate-400 font-bold uppercase text-[10px] tracking-widest italic">
                  Сотрудники не найдены
                </div>
              )}
            </div>

            <div className="p-8 border-t border-slate-100 dark:border-slate-800 shrink-0 bg-slate-50/50 dark:bg-slate-800/30">
              <div className="flex gap-4">
                <button 
                  onClick={() => setIsModalOpen(false)} 
                  className="flex-1 py-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 rounded-[20px] font-black text-xs uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
                >
                  Отмена
                </button>
                <button 
                  onClick={handleConfirmExport}
                  disabled={selectedEmployees.length === 0}
                  className="flex-[2] py-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-[20px] font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-emerald-900/20 active:scale-95 flex items-center justify-center gap-3"
                >
                  <Download size={18} />
                  Начать выгрузку ({selectedEmployees.length})
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimeTrackingModule;
