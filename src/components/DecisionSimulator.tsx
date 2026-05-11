import React, { useState } from 'react';
import { DecisionPath } from '../types';
import { ArrowRight, TrendingUp, AlertTriangle, Zap, Heart, Sparkles, Clock, Target, PlayCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Props {
  pathA: DecisionPath;
  pathB: DecisionPath;
}

export default function DecisionSimulator({ pathA, pathB }: Props) {
  const [activeTab, setActiveTab] = useState<'overview' | 'simulation'>('overview');
  const [simulationStep, setSimulationStep] = useState(0);

  if (!pathA || !pathB) return null;

  const startSimulation = () => {
    setActiveTab('simulation');
    setSimulationStep(0);
    // Auto-advance simulation steps
    const interval = setInterval(() => {
      setSimulationStep(prev => {
        if (prev >= 2) {
          clearInterval(interval);
          return 2;
        }
        return prev + 1;
      });
    }, 1500);
  };

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between px-4">
        <div className="flex items-center gap-3 text-slate-900">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-black tracking-tight">双向决策沙盘</h3>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">AI Scenario Simulation</p>
          </div>
        </div>
        
        <div className="flex bg-slate-100 p-1 rounded-xl">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'overview' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
          >
            全景对比
          </button>
          <button 
            onClick={startSimulation}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${activeTab === 'simulation' ? 'bg-indigo-500 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <PlayCircle className="w-3 h-3" />
            动态推演
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'overview' ? (
          <motion.div 
            key="overview"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
          >
            {[pathA, pathB].map((path, i) => {
              const isA = i === 0;
              return (
                <div 
                  key={i}
                  className={`relative p-8 rounded-[2.5rem] border-2 transition-all hover:scale-[1.02] ${
                    isA 
                      ? 'border-emerald-100 bg-gradient-to-b from-emerald-50/50 to-white' 
                      : 'border-blue-100 bg-gradient-to-b from-blue-50/50 to-white'
                  }`}
                >
                  <div className={`absolute top-0 right-0 p-6 opacity-[0.05] ${isA ? 'text-emerald-600' : 'text-blue-600'}`}>
                    {isA ? <Zap className="w-32 h-32" /> : <Target className="w-32 h-32" />}
                  </div>

                  <div className="relative z-10 space-y-6">
                    <div className="space-y-3">
                      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        isA ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {isA ? '保守稳健策略' : '积极变革策略'}
                      </div>
                      <h4 className="text-2xl font-black text-slate-900 leading-tight">{path.label}</h4>
                    </div>

                    <div className="space-y-4">
                      <div className="p-4 bg-white/60 rounded-2xl border border-white/50 backdrop-blur-sm space-y-2">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                          <TrendingUp className="w-3 h-3" />
                          趋势预测
                        </div>
                        <p className="text-sm font-medium text-slate-700 leading-relaxed">{path.trend}</p>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                          <AlertTriangle className="w-3 h-3" />
                          潜在风险
                        </div>
                        {path.risks.slice(0, 2).map((risk, j) => (
                          <div key={j} className="flex items-start gap-2 text-sm text-slate-600">
                            <span className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${isA ? 'bg-emerald-400' : 'bg-blue-400'}`} />
                            <span>{risk}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </motion.div>
        ) : (
          <motion.div 
            key="simulation"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="glass-card p-8 rounded-[3rem] border-slate-200 bg-slate-900 text-white relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10" />
            <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/20 blur-[100px] rounded-full" />
            
            <div className="relative z-10 space-y-12">
              <div className="flex justify-between items-center border-b border-white/10 pb-6">
                <div>
                  <h4 className="text-2xl font-black tracking-tight">时光推演模式</h4>
                  <p className="text-slate-400 text-sm font-medium mt-1">AI 正在计算不同决策路径的未来影响...</p>
                </div>
                <div className="flex gap-2">
                  {[0, 1, 2].map(step => (
                    <div key={step} className={`w-3 h-3 rounded-full transition-colors ${step <= simulationStep ? 'bg-indigo-500' : 'bg-white/10'}`} />
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-12 relative">
                {/* Connecting Line */}
                <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-white/5 via-white/20 to-white/5 -translate-x-1/2" />

                {[pathA, pathB].map((path, i) => {
                  const isA = i === 0;
                  return (
                    <div key={i} className="space-y-8">
                      <div className={`text-center space-y-2 ${simulationStep >= 0 ? 'opacity-100' : 'opacity-30 blur-sm'} transition-all duration-500`}>
                        <div className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-2 ${isA ? 'bg-emerald-500/20 text-emerald-400' : 'bg-blue-500/20 text-blue-400'}`}>
                          {isA ? '路径 A' : '路径 B'}
                        </div>
                        <h5 className="text-xl font-bold">{path.label}</h5>
                      </div>

                      <div className="space-y-6">
                        {/* Phase 1: Short Term */}
                        <motion.div 
                          initial={{ opacity: 0, x: isA ? -20 : 20 }}
                          animate={{ opacity: simulationStep >= 0 ? 1 : 0.3, x: 0 }}
                          className="flex gap-4 items-start"
                        >
                          <div className="flex flex-col items-center gap-1 shrink-0 mt-1">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${simulationStep >= 0 ? 'bg-white text-slate-900' : 'bg-white/10 text-slate-500'}`}>1</div>
                            <div className="w-px h-12 bg-white/10" />
                          </div>
                          <div className={`p-4 rounded-2xl bg-white/5 border border-white/10 w-full ${simulationStep >= 0 ? 'shadow-lg shadow-indigo-500/10' : ''}`}>
                            <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">
                              <Clock className="w-3 h-3" />
                              短期影响 (1-3个月)
                            </div>
                            <p className="text-sm text-slate-300 leading-relaxed">{path.risks[0]}</p>
                          </div>
                        </motion.div>

                        {/* Phase 2: Long Term */}
                        <motion.div 
                          initial={{ opacity: 0, x: isA ? -20 : 20 }}
                          animate={{ opacity: simulationStep >= 1 ? 1 : 0.3, x: 0 }}
                          className="flex gap-4 items-start"
                        >
                          <div className="flex flex-col items-center gap-1 shrink-0 mt-1">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${simulationStep >= 1 ? 'bg-white text-slate-900' : 'bg-white/10 text-slate-500'}`}>2</div>
                            <div className="w-px h-12 bg-white/10" />
                          </div>
                          <div className={`p-4 rounded-2xl bg-white/5 border border-white/10 w-full ${simulationStep >= 1 ? 'shadow-lg shadow-indigo-500/10' : ''}`}>
                            <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">
                              <Target className="w-3 h-3" />
                              长期趋势 (1-3年)
                            </div>
                            <p className="text-sm text-slate-300 leading-relaxed">{path.trend}</p>
                          </div>
                        </motion.div>

                        {/* Phase 3: Emotional Outcome */}
                        <motion.div 
                          initial={{ opacity: 0, x: isA ? -20 : 20 }}
                          animate={{ opacity: simulationStep >= 2 ? 1 : 0.3, x: 0 }}
                          className="flex gap-4 items-start"
                        >
                          <div className="flex flex-col items-center gap-1 shrink-0 mt-1">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${simulationStep >= 2 ? 'bg-white text-slate-900' : 'bg-white/10 text-slate-500'}`}>3</div>
                          </div>
                          <div className={`p-4 rounded-2xl w-full ${simulationStep >= 2 ? (isA ? 'bg-emerald-500/20 border-emerald-500/30' : 'bg-blue-500/20 border-blue-500/30') : 'bg-white/5 border-white/10'} border`}>
                            <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">
                              <Heart className="w-3 h-3" />
                              心理状态
                            </div>
                            <p className="text-sm font-medium italic">“{path.emotionalImpact}”</p>
                          </div>
                        </motion.div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
