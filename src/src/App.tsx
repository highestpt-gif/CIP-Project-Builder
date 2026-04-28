import React, { useState, useMemo } from 'react';
import { 
  addMonths, 
  format, 
  startOfMonth, 
  differenceInMonths, 
  eachMonthOfInterval
} from 'date-fns';
import { 
  Calendar, 
  LayoutGrid, 
  FileText, 
  Hammer, 
  CheckCircle2, 
  Plus, 
  ArrowRight,
  Info,
  Clock,
  Download,
  Users,
  Scale,
  Gavel,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { motion } from 'motion/react';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Phase {
  id: string;
  name: string;
  duration: number;
  icon: React.ReactNode;
  color: string;
  required: boolean;
}

const INITIAL_PHASES: Phase[] = [
  { id: 'initiation', name: 'Project Initiation', duration: 1, icon: <Info className="w-4 h-4" />, color: 'bg-blue-500', required: false },
  { id: 'procure-design', name: 'Procure Design Contract', duration: 2, icon: <FileText className="w-4 h-4" />, color: 'bg-indigo-500', required: false },
  { id: 'design', name: 'Design Phase', duration: 6, icon: <LayoutGrid className="w-4 h-4" />, color: 'bg-purple-500', required: true },
  { id: 'procure-construction', name: 'Procure Construction Contract', duration: 2, icon: <FileText className="w-4 h-4" />, color: 'bg-amber-500', required: false },
  { id: 'construction', name: 'Construction Phase', duration: 12, icon: <Hammer className="w-4 h-4" />, color: 'bg-orange-500', required: true },
  { id: 'closeout', name: 'Project Closeout', duration: 2, icon: <CheckCircle2 className="w-4 h-4" />, color: 'bg-emerald-500', required: false },
];

export default function App() {
  const [projectName, setProjectName] = useState('New Capital Project');
  const [projectNumber, setProjectNumber] = useState('CIP-2026-001');
  const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [phases, setPhases] = useState<Phase[]>(INITIAL_PHASES);
  
  const [useRFQ, setUseRFQ] = useState(false);
  const [councilDate, setCouncilDate] = useState('');
  const [useBid, setUseBid] = useState(true);

  const handleDurationChange = (id: string, value: number) => {
    setPhases(prev => prev.map(p => p.id === id ? { ...p, duration: Math.max(0.5, value) } : p));
  };

  const scheduleData = useMemo(() => {
    const activePhases: Phase[] = [];
    
    // 1. Initiation
    activePhases.push(phases.find(p => p.id === 'initiation')!);

    // 2. RFQ Selection (Optional)
    if (useRFQ) {
      activePhases.push({ id: 'rfq-selection', name: 'RFQ Selection Process', duration: 3, icon: <Users className="w-4 h-4" />, color: 'bg-cyan-500', required: false });
    }

    // 3. Procure Design Contract
    activePhases.push(phases.find(p => p.id === 'procure-design')!);

    // 4. Council Approval (Optional)
    if (councilDate) {
      activePhases.push({ id: 'council-approval', name: 'Council Approval (Wait)', duration: 2, icon: <Scale className="w-4 h-4" />, color: 'bg-rose-500', required: false });
    }

    // 5. Design Phase
    activePhases.push(phases.find(p => p.id === 'design')!);

    // 6. Bid Process (Optional)
    if (useBid) {
      activePhases.push({ id: 'bid-process', name: 'Public Bidding Process', duration: 6, icon: <Gavel className="w-4 h-4" />, color: 'bg-slate-600', required: false });
    }

    // 7. Procure Construction
    activePhases.push(phases.find(p => p.id === 'procure-construction')!);

    // 8. Construction
    activePhases.push(phases.find(p => p.id === 'construction')!);

    // 9. Closeout
    activePhases.push(phases.find(p => p.id === 'closeout')!);

    let currentStart = startOfMonth(new Date(startDate));
    const timelinePhases = activePhases.map(phase => {
      const start = currentStart;
      const end = addMonths(start, phase.duration);
      currentStart = end;
      return { ...phase, startDate: start, endDate: end };
    });

    const projectEnd = timelinePhases[timelinePhases.length - 1].endDate;
    const months = eachMonthOfInterval({ start: startOfMonth(new Date(startDate)), end: projectEnd });

    return { timelinePhases, months, projectStart: startOfMonth(new Date(startDate)), projectEnd };
  }, [startDate, phases, useRFQ, councilDate, useBid]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900">
      <header className="h-16 bg-slate-900 text-white px-8 flex items-center justify-between shadow-md z-10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-500 rounded-sm flex items-center justify-center font-bold text-lg">C</div>
          <h1 className="text-xl font-semibold tracking-tight">CIP Master Scheduler <span className="text-slate-400 font-normal text-sm ml-2">v2.5</span></h1>
        </div>
        <div className="flex gap-3">
          <button onClick={() => window.print()} className="px-4 py-1.5 bg-slate-700 hover:bg-slate-600 rounded text-xs font-medium flex items-center gap-2"><Download className="w-3.5 h-3.5" />Export PDF</button>
          <button className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 rounded text-xs font-medium">Save Project</button>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        <aside className="w-80 bg-white border-r border-slate-200 overflow-y-auto p-6 flex flex-col gap-8 custom-scrollbar shrink-0">
          <section>
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-2"><Calendar className="w-3 h-3 text-blue-500" />Project Metadata</h2>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Project Name</label>
                <input type="text" value={projectName} onChange={(e) => setProjectName(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Project #</label>
                  <input type="text" value={projectNumber} onChange={(e) => setProjectNumber(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-sm font-mono text-xs" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Start Date</label>
                  <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-2 text-sm" />
                </div>
              </div>
            </div>
          </section>

          <hr className="border-slate-100" />

          <section className="flex-1">
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-2"><LayoutGrid className="w-3 h-3 text-blue-500" />Workflow Configuration</h2>
            <div className="space-y-4">
              <div className="space-y-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                <div className="flex justify-between items-center"><span className="text-[10px] font-black uppercase text-slate-400 tracking-tighter">Phase 1: Initiation</span><input type="number" step="0.5" value={phases.find(p => p.id === 'initiation')?.duration} onChange={(e) => handleDurationChange('initiation', parseFloat(e.target.value))} className="w-12 bg-white border border-slate-200 rounded px-1 text-right text-xs font-bold" /></div>
                <button onClick={() => setUseRFQ(!useRFQ)} className={cn("w-full flex items-center justify-between p-2 rounded text-xs transition-all", useRFQ ? "bg-cyan-50 text-cyan-700 border border-cyan-100" : "bg-white text-slate-500 border border-slate-200")}>
                  <span className="flex items-center gap-2"><Users className="w-3.5 h-3.5" />Require RFQ?</span>
                  {useRFQ ? <ToggleRight className="w-5 h-5 text-cyan-600" /> : <ToggleLeft className="w-5 h-5" />}
                </button>
              </div>
              <div className="space-y-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                <div className="flex justify-between items-center"><span className="text-[10px] font-black uppercase text-slate-400 tracking-tighter">Phase 2: Design Contract</span><input type="number" step="0.5" value={phases.find(p => p.id === 'procure-design')?.duration} onChange={(e) => handleDurationChange('procure-design', parseFloat(e.target.value))} className="w-12 bg-white border border-slate-200 rounded px-1 text-right text-xs font-bold" /></div>
                <div className="space-y-1.5"><label className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Council Date</label>
                  <input type="date" value={councilDate} onChange={(e) => setCouncilDate(e.target.value)} className="w-full bg-white border border-slate-200 rounded px-2 py-1.5 text-xs" />
                </div>
              </div>
              <div className="space-y-3 p-3 bg-blue-50/50 rounded-lg border border-blue-100">
                <div className="flex justify-between items-center"><span className="text-[10px] font-black uppercase text-blue-400 tracking-tighter">Phase 3: Design</span><input type="number" step="0.5" value={phases.find(p => p.id === 'design')?.duration} onChange={(e) => handleDurationChange('design', parseFloat(e.target.value))} className="w-12 bg-white border border-blue-200 rounded px-1 text-right text-xs font-bold text-blue-700" /></div>
                <button onClick={() => setUseBid(!useBid)} className={cn("w-full flex items-center justify-between p-2 rounded text-xs transition-all", useBid ? "bg-slate-700 text-white border border-slate-800" : "bg-white text-slate-500 border border-slate-200")}>
                  <span className="flex items-center gap-2"><Gavel className="w-3.5 h-3.5" />Public Bid?</span>
                  {useBid ? <ToggleRight className="w-5 h-5 text-blue-400" /> : <ToggleLeft className="w-5 h-5" />}
                </button>
              </div>
              <div className="space-y-3 p-3 bg-orange-50/50 rounded-lg border border-orange-100">
                <div className="flex justify-between items-center"><span className="text-[10px] font-black uppercase text-orange-400 tracking-tighter">Construction Phase</span><input type="number" step="0.5" value={phases.find(p => p.id === 'construction')?.duration} onChange={(e) => handleDurationChange('construction', parseFloat(e.target.value))} className="w-12 bg-white border border-orange-200 rounded px-1 text-right text-xs font-bold text-orange-700" /></div>
              </div>
            </div>
          </section>

          <footer className="mt-auto pt-6 border-t border-slate-100">
            <div className="flex justify-between items-end mb-2"><span className="text-[10px] font-bold text-slate-500 uppercase">Total Duration</span><span className="text-2xl font-black text-slate-900">{differenceInMonths(scheduleData.projectEnd, scheduleData.projectStart)} <span className="text-xs font-normal text-slate-500">mo</span></span></div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden"><div className="bg-blue-600 h-full transition-all duration-500" style={{ width: `${Math.min(100, (differenceInMonths(scheduleData.projectEnd, scheduleData.projectStart) / 48) * 100)}%` }} /></div>
          </footer>
        </aside>

        <section className="flex-1 p-8 flex flex-col gap-6 bg-slate-50/50 overflow-auto">
          <div className="max-w-6xl w-full mx-auto flex flex-col flex-1 gap-6">
            <header className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between mb-2">
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-none mb-2">{projectName}</h2>
                <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest"><span className="bg-slate-200 px-1.5 py-0.5 rounded text-slate-600">{projectNumber}</span><span>Start: {format(new Date(startDate), 'MMM dd, yyyy')}</span></div>
              </div>
              <div className="px-4 py-2 bg-white border border-slate-200 rounded-lg shadow-sm flex items-center gap-4">
                <div className="flex flex-col"><span className="text-[9px] uppercase font-bold text-slate-400">Completion</span><span className="text-sm font-bold text-blue-600">{format(scheduleData.projectEnd, 'MMMM yyyy')}</span></div>
                <div className="w-px h-8 bg-slate-100" /><div className="flex flex-col"><span className="text-[9px] uppercase font-bold text-slate-400">Total Months</span><span className="text-sm font-bold text-slate-900">{differenceInMonths(scheduleData.projectEnd, scheduleData.projectStart)}</span></div>
              </div>
            </header>

            <div className="bg-white rounded-lg border border-slate-200 shadow-sm flex flex-col overflow-hidden">
              <div className="flex bg-slate-50 border-b border-slate-200"><div className="w-48 shrink-0 p-4 border-r border-slate-200 text-xs font-bold text-slate-400 uppercase">Phase</div><div className="flex-1 overflow-x-auto no-scrollbar"><div className="min-w-fit flex">{scheduleData.months.map(m => <div key={m.getTime()} className={cn("w-20 shrink-0 text-center p-4 border-r border-slate-100 text-[10px] font-bold uppercase", m.getMonth() === 0 ? "bg-slate-200/50" : "text-slate-400")}>{format(m, 'MMM')} '{format(m, 'yy')}</div>)}</div></div></div>
              <div className="flex-1 overflow-auto relative min-h-[450px]">
                <div className="absolute inset-0 flex pointer-events-none"><div className="w-48 border-r border-slate-200 sticky left-0 z-10 h-full bg-transparent" />{scheduleData.months.map(m => <div key={m.getTime()} className="w-20 border-r border-slate-50 shrink-0" />)}</div>
                <div className="relative z-10 flex flex-col">{scheduleData.timelinePhases.map(p => { const offset = differenceInMonths(p.startDate, scheduleData.projectStart); return (
                  <div key={p.id} className={cn("flex border-b border-slate-100 h-16 items-center", p.id === 'design' ? "bg-blue-50/20" : p.id === 'construction' ? "bg-orange-50/20" : "")}>
                    <div className="w-48 shrink-0 px-4 sticky left-0 z-20 bg-inherit border-r border-slate-200 h-full flex items-center"><span className={cn("text-xs font-medium", p.id === 'design' || p.id === 'construction' ? "font-bold" : "")}>{p.name}</span></div>
                    <div className="flex-1 relative h-full"><motion.div layoutId={p.id} className={cn("absolute top-5 h-6 rounded-sm flex items-center justify-center text-[9px] text-white font-black", p.id === 'design' ? "bg-blue-500" : p.id === 'construction' ? "bg-orange-500" : "bg-slate-400")} style={{ left: `${offset * 80 + 8}px`, width: `${p.duration * 80 - 16}px` }}>M{Math.round(offset + p.duration)}</motion.div></div>
                  </div>
                );})}</div>
              </div>
              <div className="p-6 bg-slate-50 border-t border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-8">
                <div><p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Fiscal Range</p><p className="text-lg font-semibold text-blue-600">FY{format(scheduleData.projectStart, 'yy')} — FY{format(scheduleData.projectEnd, 'yy')}</p></div>
                <div><p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Council Milestones</p><p className="text-lg font-semibold text-slate-800">{councilDate ? format(new Date(councilDate), 'MMM yyyy') : '--'}</p></div>
                <div className="text-right"><p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Procurement</p><p className="text-lg font-semibold text-slate-800">{useBid ? "Low Bid" : "JOC"}</p></div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
