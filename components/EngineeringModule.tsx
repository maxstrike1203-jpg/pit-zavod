
import React, { useState, useRef, useMemo } from 'react';
import { INITIAL_CONTRACTORS } from '../constants';
import { Contractor, AIPrediction, ContractDocument, AIDocumentAnalysis } from '../types';
import { HardHat, FileText, UserCheck, Truck, CheckCircle2, AlertCircle, Sparkles, Loader2, Plus, Download, Clock, AlertTriangle, SortAsc, SortDesc, ShieldAlert, Cpu, Search, X } from 'lucide-react';
import { getProjectPrediction, getPassSecurityAnalysis, getDocumentAnalysis } from '../services/geminiService';

type SortField = 'name' | 'progress' | 'updatedAt';

const EngineeringModule: React.FC = () => {
  const [contractors, setContractors] = useState<Contractor[]>(INITIAL_CONTRACTORS);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [prediction, setPrediction] = useState<AIPrediction | null>(null);
  const [passReport, setPassReport] = useState<string | null>(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const [loadingPassAI, setLoadingPassAI] = useState(false);
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Document Analysis State
  const [analyzingDocId, setAnalyzingDocId] = useState<string | null>(null);
  const [selectedDocAnalysis, setSelectedDocAnalysis] = useState<{ doc: ContractDocument, analysis: AIDocumentAnalysis } | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const activeContractor = contractors.find(c => c.id === selectedId);

  const sortedContractors = useMemo(() => {
    return [...contractors].sort((a, b) => {
      let comparison = 0;
      if (sortField === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (sortField === 'progress') {
        comparison = a.progress - b.progress;
      } else if (sortField === 'updatedAt') {
        comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [contractors, sortField, sortDirection]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handlePrediction = async (contractor: Contractor) => {
    setLoadingAI(true);
    const result = await getProjectPrediction(contractor);
    setPrediction(result);
    setLoadingAI(false);
  };

  const handlePassAudit = async (contractor: Contractor) => {
    setLoadingPassAI(true);
    const report = await getPassSecurityAnalysis(contractor);
    setPassReport(report);
    setLoadingPassAI(false);
  };

  const handleAnalyzeDoc = async (doc: ContractDocument) => {
    if (!activeContractor) return;
    setAnalyzingDocId(doc.id);
    try {
      const analysis = await getDocumentAnalysis(doc, activeContractor);
      setSelectedDocAnalysis({ doc, analysis });
    } catch (err) {
      console.error(err);
    } finally {
      setAnalyzingDocId(null);
    }
  };

  const handleAddDocument = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !selectedId) return;

    const newDocs: ContractDocument[] = Array.from(files).map((file: any) => ({
      id: Math.random().toString(36).substr(2, 9),
      type: 'ACT', 
      name: file.name,
      date: new Date().toISOString().split('T')[0],
      url: '#'
    }));

    setContractors(prev => prev.map(c => 
      c.id === selectedId ? { 
        ...c, 
        documents: [...c.documents, ...newDocs],
        updatedAt: new Date().toISOString()
      } : c
    ));
  };

  const getPassStatus = (expiryDateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiry = new Date(expiryDateStr);
    expiry.setHours(0, 0, 0, 0);
    const diffDays = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return 'EXPIRED';
    if (diffDays <= 7) return 'EXPIRING_SOON';
    return 'OK';
  };

  const hasExpiringPasses = activeContractor?.workers.some(w => getPassStatus(w.expiryDate) !== 'OK') || 
                           activeContractor?.transport.some(t => getPassStatus(t.passExpiry) !== 'OK');

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-10 duration-500">
      <input type="file" multiple ref={fileInputRef} className="hidden" onChange={handleAddDocument} />

      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Инженерный учет</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Мониторинг проектов и контроль подрядчиков</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        {/* Contractor List */}
        <div className="xl:col-span-1 space-y-4">
          <div className="flex items-center justify-between px-1 mb-2">
            <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest">Активные подрядчики</h3>
            <div className="flex gap-1">
              <button 
                onClick={() => toggleSort('name')}
                title="Сортировать по имени"
                className={`p-1.5 rounded-lg transition-all ${sortField === 'name' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
              >
                {sortField === 'name' && sortDirection === 'desc' ? <SortDesc size={14} /> : <SortAsc size={14} />}
              </button>
              <button 
                onClick={() => toggleSort('progress')}
                title="Сортировать по прогрессу"
                className={`p-1.5 rounded-lg transition-all ${sortField === 'progress' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
              >
                {sortField === 'progress' && sortDirection === 'desc' ? <SortDesc size={14} /> : <SortAsc size={14} />}
              </button>
              <button 
                onClick={() => toggleSort('updatedAt')}
                title="Сортировать по обновлению"
                className={`p-1.5 rounded-lg transition-all ${sortField === 'updatedAt' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
              >
                {sortField === 'updatedAt' && sortDirection === 'desc' ? <SortDesc size={14} /> : <SortAsc size={14} />}
              </button>
            </div>
          </div>
          
          <div className="space-y-3">
            {sortedContractors.map((c) => {
              const problematic = c.workers.some(w => getPassStatus(w.expiryDate) !== 'OK') || 
                                c.transport.some(t => getPassStatus(t.passExpiry) !== 'OK');
              return (
                <button
                  key={c.id}
                  onClick={() => { setSelectedId(c.id); setPrediction(null); setPassReport(null); setSelectedDocAnalysis(null); }}
                  className={`w-full text-left p-5 rounded-3xl border transition-all duration-300 relative group ${
                    selectedId === c.id 
                      ? 'bg-blue-600 border-blue-500 text-white shadow-xl shadow-blue-900/20' 
                      : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-blue-200 dark:hover:border-blue-900/50'
                  }`}
                >
                  {problematic && selectedId !== c.id && (
                    <div className="absolute top-4 right-4 w-2.5 h-2.5 bg-amber-500 rounded-full animate-pulse shadow-lg shadow-amber-500/50"></div>
                  )}
                  <div className="flex justify-between items-start mb-4">
                    <div className={`p-3 rounded-2xl ${selectedId === c.id ? 'bg-blue-500/50' : 'bg-slate-50 dark:bg-slate-800'}`}>
                      <HardHat size={20} className={selectedId === c.id ? 'text-white' : 'text-blue-600 dark:text-blue-400'} />
                    </div>
                    <div className={`text-[11px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${selectedId === c.id ? 'bg-white/20' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}>
                      {c.progress}%
                    </div>
                  </div>
                  <h4 className="font-black leading-tight mb-1 text-sm tracking-tight">{c.name}</h4>
                  <p className={`text-xs line-clamp-1 font-medium ${selectedId === c.id ? 'text-blue-100' : 'text-slate-400 dark:text-slate-500'}`}>
                    {c.object}
                  </p>
                  
                  {/* Progress Bar Visual Indicator */}
                  <div className="mt-3 mb-2">
                    <div className={`w-full h-1 rounded-full overflow-hidden ${selectedId === c.id ? 'bg-blue-400/30' : 'bg-slate-100 dark:bg-slate-800'}`}>
                      <div 
                        className={`h-full transition-all duration-700 ${selectedId === c.id ? 'bg-white' : 'bg-blue-500'}`}
                        style={{ width: `${c.progress}%` }}
                      />
                    </div>
                  </div>

                  <div className={`text-[9px] mt-2 font-bold uppercase tracking-wider ${selectedId === c.id ? 'text-blue-200' : 'text-slate-400 dark:text-slate-600'}`}>
                    Обновлено: {new Date(c.updatedAt).toLocaleDateString('ru-RU')}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Detailed Info */}
        <div className="xl:col-span-3">
          {activeContractor ? (
            <div className="space-y-6">
              {hasExpiringPasses && (
                <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 p-5 rounded-3xl flex items-center gap-4 text-amber-800 dark:text-amber-400 animate-in slide-in-from-top-4">
                  <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/20 rounded-2xl flex items-center justify-center shrink-0">
                    <AlertTriangle className="text-amber-500" size={20} />
                  </div>
                  <div className="flex-1">
                    <span className="font-bold text-sm tracking-tight block">Обнаружены проблемы с пропусками у персонала или техники!</span>
                    <p className="text-xs opacity-70">Некоторые сотрудники могут быть заблокированы на КПП.</p>
                  </div>
                  <button 
                    onClick={() => handlePassAudit(activeContractor)}
                    disabled={loadingPassAI}
                    className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-xl font-bold text-[10px] uppercase tracking-widest flex items-center gap-2 transition-all"
                  >
                    {loadingPassAI ? <Loader2 size={14} className="animate-spin" /> : <ShieldAlert size={14} />}
                    AI Аудит
                  </button>
                </div>
              )}

              <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm transition-colors">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                  <div>
                    <h3 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">{activeContractor.name}</h3>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">{activeContractor.object}</p>
                  </div>
                  <button 
                    onClick={() => handlePrediction(activeContractor)}
                    disabled={loadingAI}
                    className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 transition-all shadow-xl shadow-indigo-900/20 active:scale-95"
                  >
                    {loadingAI ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
                    AI Анализ рисков
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {/* Finances */}
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 transition-colors">
                    <h4 className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest mb-6">Экономика проекта</h4>
                    <div className="space-y-6">
                      <div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Авансовый платеж</div>
                        {activeContractor.advance.paid ? (
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center text-green-600">
                               <CheckCircle2 size={16} />
                            </div>
                            <div>
                                <div className="font-black text-slate-800 dark:text-white leading-none">
                                  {activeContractor.advance.amount?.toLocaleString('ru-RU')} ₽
                                </div>
                                <div className="text-[10px] text-slate-400 mt-1 font-bold uppercase">{activeContractor.advance.date}</div>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-3 text-rose-500 bg-rose-50 dark:bg-rose-900/10 p-2 rounded-xl border border-rose-100 dark:border-rose-900/20">
                            <AlertCircle size={16} />
                            <span className="font-black text-xs uppercase tracking-widest">Не выплачен</span>
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                           <span>Прогресс</span>
                           <span className="text-blue-600">{activeContractor.progress}%</span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500 shadow-lg shadow-blue-500/50" style={{ width: `${activeContractor.progress}%` }}></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Documents */}
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 transition-colors">
                    <div className="flex justify-between items-center mb-6">
                      <h4 className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest">Документация</h4>
                      <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="w-8 h-8 bg-white dark:bg-slate-800 rounded-lg flex items-center justify-center text-blue-600 shadow-sm border border-slate-100 dark:border-slate-700"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                    <div className="space-y-2 max-h-44 overflow-auto pr-1">
                      {activeContractor.documents.map(doc => (
                        <div key={doc.id} className="flex items-center justify-between text-xs p-3 bg-white dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all border border-slate-100 dark:border-slate-800 group relative">
                          <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300 overflow-hidden font-bold">
                            <FileText size={16} className="text-blue-500 shrink-0" />
                            <span className="truncate">{doc.name}</span>
                          </div>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                             <button 
                                onClick={() => handleAnalyzeDoc(doc)}
                                disabled={analyzingDocId === doc.id}
                                title="AI Анализ документа"
                                className="p-1.5 text-indigo-400 hover:text-indigo-600 transition-colors"
                             >
                               {analyzingDocId === doc.id ? <Loader2 size={14} className="animate-spin" /> : <Cpu size={14} />}
                             </button>
                             <Download size={14} className="text-slate-300 dark:text-slate-700 hover:text-blue-600 transition-all" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Access Summary */}
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 transition-colors">
                    <h4 className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest mb-6">Пропускной режим</h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between bg-white dark:bg-slate-900/50 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-3 text-xs font-bold text-slate-600 dark:text-slate-400">
                          <div className="w-8 h-8 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center text-blue-600"><UserCheck size={16} /></div>
                          Рабочие
                        </div>
                        <span className="font-black text-lg text-slate-800 dark:text-white">{activeContractor.workers.length}</span>
                      </div>
                      <div className="flex items-center justify-between bg-white dark:bg-slate-900/50 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-3 text-xs font-bold text-slate-600 dark:text-slate-400">
                          <div className="w-8 h-8 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg flex items-center justify-center text-emerald-600"><Truck size={16} /></div>
                          Техника
                        </div>
                        <span className="font-black text-lg text-slate-800 dark:text-white">{activeContractor.transport.length}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Doc AI Results Section */}
                {selectedDocAnalysis && (
                  <div className="mt-8 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-[32px] p-8 border border-indigo-200 dark:border-indigo-900/30 animate-in fade-in slide-in-from-top-2 relative">
                    <button 
                      onClick={() => setSelectedDocAnalysis(null)}
                      className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      <X size={20} />
                    </button>
                    <div className="flex items-center gap-4 mb-8">
                       <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl text-indigo-600 dark:text-indigo-400 shadow-sm border border-indigo-100 dark:border-indigo-900/20">
                          <Cpu size={24} />
                       </div>
                       <div>
                          <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-1">AI Document Audit</h4>
                          <h5 className="text-xl font-black text-slate-800 dark:text-white tracking-tight">{selectedDocAnalysis.doc.name}</h5>
                       </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                       <div className="bg-white/80 dark:bg-slate-900/80 p-5 rounded-2xl border border-indigo-100/50 dark:border-indigo-900/10">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2">Извлеченная дата</span>
                          <span className="text-sm font-black text-slate-800 dark:text-slate-200">{selectedDocAnalysis.analysis.extractedDate}</span>
                       </div>
                       <div className="bg-white/80 dark:bg-slate-900/80 p-5 rounded-2xl border border-indigo-100/50 dark:border-indigo-900/10">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2">Извлеченная сумма</span>
                          <span className="text-sm font-black text-slate-800 dark:text-slate-200">{selectedDocAnalysis.analysis.extractedAmount}</span>
                       </div>
                       <div className="bg-white/80 dark:bg-slate-900/80 p-5 rounded-2xl border border-indigo-100/50 dark:border-indigo-900/10">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2">Статус обработки</span>
                          <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg text-xs font-black uppercase tracking-widest border border-indigo-100 dark:border-indigo-900/20">{selectedDocAnalysis.analysis.status}</span>
                       </div>
                    </div>

                    <div className="space-y-6">
                       <div>
                          <h6 className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                             <AlertCircle size={14} /> Выявленные несоответствия
                          </h6>
                          <div className="space-y-2">
                             {selectedDocAnalysis.analysis.discrepancies.map((d, idx) => (
                               <div key={idx} className="bg-rose-50/50 dark:bg-rose-900/10 p-4 rounded-xl border border-rose-100 dark:border-rose-900/20 text-xs text-rose-700 dark:text-rose-400 font-bold flex items-center gap-3">
                                  <div className="w-1.5 h-1.5 bg-rose-500 rounded-full"></div>
                                  {d}
                               </div>
                             ))}
                          </div>
                       </div>
                       <div className="pt-6 border-t border-indigo-100 dark:border-indigo-900/20">
                          <p className="text-sm text-slate-600 dark:text-slate-400 font-medium leading-relaxed italic pr-4">
                             "{selectedDocAnalysis.analysis.summary}"
                          </p>
                       </div>
                    </div>
                  </div>
                )}

                {/* Pass AI Report */}
                {passReport && (
                  <div className="mt-8 bg-amber-50/50 dark:bg-amber-900/10 rounded-[32px] p-8 border border-amber-100 dark:border-amber-900/30 animate-in fade-in slide-in-from-right-4 duration-500">
                     <div className="flex items-center gap-3 mb-6">
                        <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl text-amber-600 dark:text-amber-400 shadow-sm"><ShieldAlert size={18} /></div>
                        <h4 className="text-[10px] font-black text-amber-900 dark:text-amber-300 uppercase tracking-[0.2em]">Security AI Report: Контроль доступа</h4>
                     </div>
                     <div className="prose prose-sm dark:prose-invert max-w-none">
                        <p className="text-sm text-slate-700 dark:text-slate-300 font-medium leading-relaxed whitespace-pre-wrap">{passReport}</p>
                     </div>
                  </div>
                )}

                {/* AI Prediction */}
                {prediction && (
                  <div className="mt-10 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-[32px] p-8 border border-indigo-100 dark:border-indigo-900/30 animate-in fade-in zoom-in-95">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 bg-white dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center shadow-sm">
                        <Sparkles className="text-indigo-600" size={20} />
                      </div>
                      <h4 className="font-black text-indigo-900 dark:text-indigo-300 uppercase text-xs tracking-widest">Аналитический прогноз системы</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                       <div className="space-y-4">
                          <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                            prediction.status === 'ON_TIME' ? 'bg-green-100 text-green-700' : 'bg-rose-100 text-rose-700'
                          }`}>
                            {prediction.status === 'ON_TIME' ? 'Статус: В графике' : 'Статус: Критическая задержка'}
                          </div>
                          <p className="text-sm text-slate-700 dark:text-slate-300 font-medium leading-relaxed italic border-l-4 border-indigo-200 dark:border-indigo-800 pl-4">
                            "{prediction.predictionText}"
                          </p>
                       </div>
                       <div className="bg-white/80 dark:bg-slate-900/80 p-6 rounded-3xl space-y-4 border border-indigo-100/50 dark:border-indigo-900/30 shadow-sm">
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Прогноз просрочки:</span>
                            <span className="font-black text-rose-600 text-lg">{prediction.delayDays} дней</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Штрафные санкции:</span>
                            <span className="font-black text-slate-800 dark:text-white">{prediction.fineRecommendation}</span>
                          </div>
                          <div className="text-[11px] text-slate-400 dark:text-slate-500 pt-4 border-t border-slate-100 dark:border-slate-800 leading-snug">
                            <strong className="text-indigo-600 dark:text-indigo-400">Обоснование:</strong> {prediction.fineReason}
                          </div>
                       </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-slate-100/30 dark:bg-slate-900/30 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[40px] h-[600px] flex flex-col items-center justify-center text-slate-400 dark:text-slate-700 p-12 text-center transition-colors">
              <HardHat size={64} className="mb-6 opacity-10" />
              <h3 className="text-2xl font-black text-slate-600 dark:text-slate-800 mb-2 tracking-tight">Объект не выбран</h3>
              <p className="max-w-xs font-medium">Выберите подрядную организацию из списка для детального анализа</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EngineeringModule;
