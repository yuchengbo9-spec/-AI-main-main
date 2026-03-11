import React, { useState } from 'react';
import { Perspective } from '../types';
import { RefreshCw, User, MessageCircle, Lightbulb, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Props {
  perspectives: Perspective[];
}

export default function PerspectiveSwitcher({ perspectives }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);

  const getTheme = (role: string) => {
    if (role.includes('自我')) return 'bg-indigo-50 text-indigo-600 border-indigo-100';
    if (role.includes('儿女')) return 'bg-rose-50 text-rose-600 border-rose-100';
    return 'bg-emerald-50 text-emerald-600 border-emerald-100';
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-4">
        <div className="flex items-center gap-3 text-slate-400">
          <RefreshCw className="w-5 h-5" />
          <span className="text-sm font-black uppercase tracking-[0.2em]">多维深度洞察</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {perspectives.map((p, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className={`px-6 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
                activeIndex === i 
                  ? 'bg-slate-900 text-white shadow-xl shadow-slate-900/20 scale-105' 
                  : 'bg-white text-slate-400 border border-slate-100 hover:bg-slate-50'
              }`}
            >
              {p.role}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeIndex}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative group"
        >
          <div className={`absolute inset-0 rounded-[3rem] blur-2xl opacity-20 -z-10 ${getTheme(perspectives[activeIndex].role)}`} />
          
          <div className="bg-white rounded-[3rem] border border-slate-100 shadow-xl p-10 md:p-12 space-y-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-[0.03]">
              <Sparkles className="w-32 h-32" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 relative z-10">
              <div className="space-y-6">
                <div className="flex items-center gap-3 text-indigo-600">
                  <div className="p-2 bg-indigo-50 rounded-xl">
                    <MessageCircle className="w-6 h-6" />
                  </div>
                  <h4 className="font-black text-lg uppercase tracking-tight">核心诉求 / 心理</h4>
                </div>
                <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                  <p className="text-slate-700 leading-relaxed text-xl font-serif italic">
                    “{perspectives[activeIndex].psychology}”
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-3 text-emerald-600">
                  <div className="p-2 bg-emerald-50 rounded-xl">
                    <Lightbulb className="w-6 h-6" />
                  </div>
                  <h4 className="font-black text-lg uppercase tracking-tight">行动 / 提升建议</h4>
                </div>
                <div className="space-y-4">
                  <p className="text-slate-600 leading-relaxed text-lg font-medium">
                    {perspectives[activeIndex].suggestion}
                  </p>
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 uppercase tracking-widest">
                    <Sparkles className="w-4 h-4" />
                    <span>推荐立即尝试</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
