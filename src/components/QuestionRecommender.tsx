import React from 'react';
import { motion } from 'motion/react';
import { RecommendedQuestion } from '../types';
import { MessageSquare, ArrowRight, PlusCircle, RefreshCw, Sparkles } from 'lucide-react';

interface Props {
  questions: RecommendedQuestion[];
  onSelect: (question: string) => void;
  onCustom: () => void;
  onRefresh: () => void;
  isLoading: boolean;
}

export default function QuestionRecommender({ questions, onSelect, onCustom, onRefresh, isLoading }: Props) {
  return (
    <div className="space-y-10">
      <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 transition-opacity duration-500 ${isLoading ? 'opacity-50' : 'opacity-100'}`}>
        {questions.map((q, i) => (
          <motion.button
            key={q.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ scale: 1.02 }}
            onClick={() => onSelect(q.text)}
            className="group relative p-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:border-emerald-200 transition-all text-left flex items-start gap-6 overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-[0.02] group-hover:scale-150 transition-transform duration-700">
              <MessageSquare className="w-24 h-24" />
            </div>
            
            <div className="p-4 bg-emerald-50 rounded-2xl text-emerald-600 group-hover:scale-110 group-hover:bg-emerald-100 transition-all shadow-lg shadow-emerald-600/5">
              <Sparkles className="w-6 h-6" />
            </div>
            
            <div className="flex-1 space-y-4 relative z-10">
              <p className="font-black text-slate-800 leading-tight text-lg group-hover:text-emerald-700 transition-colors">{q.text}</p>
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 bg-slate-50 rounded-full border border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-600 group-hover:border-emerald-100 transition-all">
                  {q.category}
                </span>
                <div className="flex items-center gap-2 text-xs font-black text-emerald-600 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                  <span>立即咨询</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          </motion.button>
        ))}
      </div>

      <div className="flex flex-col md:flex-row items-center justify-center gap-6 pt-6">
        <button
          onClick={onCustom}
          className="group relative px-10 py-5 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-slate-900/20"
        >
          <div className="relative z-10 flex items-center gap-3">
            <PlusCircle className="w-5 h-5" />
            我自己输入
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>
        
        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="flex items-center gap-3 px-10 py-5 bg-white text-slate-500 rounded-2xl font-black uppercase tracking-widest text-xs border border-slate-200 hover:bg-slate-50 hover:text-slate-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
        >
          <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
          {isLoading ? '正在刷新...' : '换一批建议'}
        </button>
      </div>
    </div>
  );
}
