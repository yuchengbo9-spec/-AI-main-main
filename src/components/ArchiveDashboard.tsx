import React from 'react';
import { ConsultationSession, Persona360Report } from '../types';
import { ChevronLeft, FileText, Sparkles, Calendar, UserCircle } from 'lucide-react';

interface Props {
  sessions: ConsultationSession[];
  active?: ConsultationSession | null;
  onSelect: (id: string) => void;
  onBack: () => void;
}

function ReportView({ report }: { report: Persona360Report }) {
  return (
    <div className="space-y-6">
      <div className="glass-card rounded-[3rem] p-8 md:p-10 border-white/40">
        <div className="flex items-start justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-emerald-500/20">
              <Sparkles className="w-3.5 h-3.5 shrink-0" aria-hidden />
              <span>360 报告</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900">{report.title}</h2>
            <p className="text-sm text-slate-500 font-medium">{new Date(report.createdAt).toLocaleString()}</p>
          </div>
        </div>
        <p className="mt-6 text-slate-700 leading-relaxed font-medium">{report.personaSummary}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { title: '关键线索', items: report.keySignals },
          { title: '优先关注', items: report.topConcerns },
          { title: '优势', items: report.strengths },
          { title: '盲点', items: report.blindSpots },
        ].map((block) => (
          <div key={block.title} className="glass-card rounded-[2rem] p-6 space-y-3 border-white/40">
            <div className="text-xs font-black uppercase tracking-widest text-slate-400">{block.title}</div>
            <ul className="space-y-2">
              {block.items.map((t, i) => (
                <li key={i} className="text-sm text-slate-700 font-medium flex gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0" />
                  <span className="leading-relaxed">{t}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="glass-card rounded-[2.5rem] p-6 md:p-8 space-y-4 border-white/40">
        <div className="text-xs font-black uppercase tracking-widest text-slate-400">维度建议</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {report.dimensions.map((d, i) => (
            <div key={i} className="p-5 rounded-2xl bg-slate-50/90 border border-slate-200/60 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="font-black text-slate-900">{d.name}</div>
                {d.metrics && d.metrics.length > 0 && (
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    {d.metrics.slice(0, 2).join(' · ')}
                  </div>
                )}
              </div>
              <div className="text-sm text-slate-700 font-medium leading-relaxed">{d.summary}</div>
              <div className="grid grid-cols-1 gap-2 text-xs">
                <div className="p-3 rounded-xl bg-white border border-slate-100">
                  <span className="font-bold text-emerald-800">今天：</span>{d.doToday}
                </div>
                <div className="p-3 rounded-xl bg-white border border-slate-100">
                  <span className="font-bold text-blue-800">本周：</span>{d.doThisWeek}
                </div>
                <div className="p-3 rounded-xl bg-white border border-slate-100">
                  <span className="font-bold text-rose-800">避免：</span>{d.avoid}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="glass-card rounded-[2.5rem] p-6 md:p-8 space-y-4 border-white/40">
        <div className="text-xs font-black uppercase tracking-widest text-slate-400">未来 7 天计划</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {report.next7DaysPlan.map((p, i) => (
            <div key={i} className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="flex items-center justify-between">
                <div className="font-black text-slate-900">{p.day}</div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{p.focus}</div>
              </div>
              <div className="mt-2 text-sm text-slate-700 font-medium leading-relaxed">{p.task}</div>
            </div>
          ))}
        </div>
        <div className="text-[10px] text-slate-400 leading-relaxed">{report.disclaimer}</div>
      </div>
    </div>
  );
}

export default function ArchiveDashboard({ sessions, active, onSelect, onBack }: Props) {
  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors font-bold uppercase tracking-widest text-xs"
      >
        <ChevronLeft className="w-4 h-4 shrink-0" aria-hidden />
        返回
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <div className="glass-card rounded-[2rem] p-6 border-white/40">
            <div className="flex items-center gap-2 text-slate-900 font-black">
              <FileText className="w-5 h-5 text-emerald-600 shrink-0" aria-hidden />
              我的档案
            </div>
            <p className="text-xs text-slate-500 font-medium mt-2 leading-relaxed">
              每次咨询都会沉淀为一条记录，并生成专属 360 报告。
            </p>
          </div>

          <div className="space-y-3">
            {sessions.length === 0 && (
              <div className="glass-card rounded-[2rem] p-6 text-sm text-slate-500 font-medium border-white/40">
                暂无档案记录。请先完成一次咨询并点击“保存我的档案”。
              </div>
            )}
            {sessions.map(s => (
              <button
                key={s.id}
                onClick={() => onSelect(s.id)}
                className={`w-full text-left p-5 rounded-[2rem] border transition-all ${
                  active?.id === s.id ? 'bg-emerald-50 border-emerald-100 shadow-md' : 'glass-card border-white/40 hover:border-emerald-200/50'
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm font-black text-slate-900 line-clamp-2">{s.input}</div>
                </div>
                <div className="mt-2 flex items-center gap-3 text-xs font-medium text-slate-500">
                  <span className="inline-flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(s.createdAt).toLocaleDateString()}</span>
                  <span className="inline-flex items-center gap-1"><UserCircle className="w-3 h-3" /> {s.expertId}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2">
          {active?.report360 ? (
            <ReportView report={active.report360} />
          ) : (
            <div className="glass-card rounded-[3rem] p-10 md:p-12 border-white/40">
              <div className="text-slate-900 font-black text-lg">请选择一条记录查看 360 报告</div>
              <p className="mt-2 text-sm text-slate-500 font-medium">
                如果某条记录还没有 360 报告，请在结果页点击“保存我的档案”生成。
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

