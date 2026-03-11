import React from 'react';
import { WisdomTips } from '../types';
import { Lightbulb, ShieldAlert, TrendingUp, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Props {
  tips: WisdomTips;
}

export default function WisdomTipsCard({ tips }: Props) {
  const [isRevealed, setIsRevealed] = React.useState(false);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-slate-900 to-indigo-950 rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl cursor-pointer group"
      onClick={() => setIsRevealed(!isRevealed)}
    >
      {/* ... background blobs ... */}
      <motion.div 
        animate={{ 
          scale: [1, 1.1, 1],
          opacity: [0.1, 0.15, 0.1],
          rotate: [0, 5, 0]
        }}
        transition={{ duration: 10, repeat: Infinity }}
        className="absolute top-0 right-0 w-96 h-96 bg-indigo-500 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" 
      />
      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.05, 0.1, 0.05],
          rotate: [0, -5, 0]
        }}
        transition={{ duration: 12, repeat: Infinity, delay: 1 }}
        className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500 blur-[100px] rounded-full translate-y-1/2 -translate-x-1/2" 
      />
      
      <div className="relative z-10 space-y-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-emerald-400 font-black tracking-[0.3em] uppercase text-sm">
            <Lightbulb className="w-6 h-6" />
            <span>核心智慧锦囊</span>
          </div>
          <div className="text-[10px] font-black uppercase tracking-widest text-white/40 px-3 py-1 bg-white/5 rounded-full border border-white/10">
            {isRevealed ? "点击收起" : "点击开启深度洞察"}
          </div>
        </div>
        
        <div className="space-y-6">
          <h3 className="text-3xl md:text-4xl font-serif font-medium leading-tight text-white">
            {tips.title}
          </h3>
          <div className="h-px w-24 bg-emerald-500/50" />
        </div>

        <AnimatePresence mode="wait">
          {!isRevealed ? (
            <motion.div 
              key="closed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-12 flex flex-col items-center justify-center space-y-6 border-2 border-dashed border-white/10 rounded-[2rem] bg-white/5 hover:bg-white/10 transition-colors"
            >
              <div className="p-6 bg-emerald-500/20 rounded-full">
                <Sparkles className="w-10 h-10 text-emerald-400 animate-pulse" />
              </div>
              <p className="text-xl font-serif italic text-white/60">这份智慧，只为您此刻的困惑而生</p>
            </motion.div>
          ) : (
            <motion.div 
              key="open"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-12"
            >
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-emerald-400 text-sm font-black uppercase tracking-widest">
                  <TrendingUp className="w-5 h-5" />
                  智慧洞察
                </div>
                <p className="text-slate-200 text-lg leading-relaxed font-medium">
                  {tips.insight}
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 text-rose-400 text-sm font-black uppercase tracking-widest">
                  <ShieldAlert className="w-5 h-5" />
                  避坑指南
                </div>
                <div className="p-6 bg-rose-500/10 border border-rose-500/20 rounded-3xl">
                  <p className="text-rose-100 font-bold text-lg leading-relaxed">
                    {tips.avoid}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
