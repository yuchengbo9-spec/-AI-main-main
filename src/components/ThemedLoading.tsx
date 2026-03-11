import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, ShieldCheck, Search, Brain, FileText, CheckCircle2 } from 'lucide-react';
import { LifeTheme } from '../types';
import DynamicLogo from './DynamicLogo';

interface Props {
  theme: LifeTheme | null;
}

const LOADING_STEPS = [
  { icon: <Search className="w-5 h-5" />, text: "正在结合你的画像分析处境...", color: "text-blue-500" },
  { icon: <Brain className="w-5 h-5" />, text: "正在检索生活场景知识库...", color: "text-purple-500" },
  { icon: <FileText className="w-5 h-5" />, text: "正在为您编排结构化守护建议...", color: "text-emerald-500" },
  { icon: <ShieldCheck className="w-5 h-5" />, text: "正在执行合规性与边界检查...", color: "text-amber-500" },
  { icon: <CheckCircle2 className="w-5 h-5" />, text: "报告生成完毕，正在进行最后润色...", color: "text-rose-500" }
];

export default function ThemedLoading({ theme }: Props) {
  const [currentStep, setCurrentStep] = useState(0);

  const [isLongWait, setIsLongWait] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev < LOADING_STEPS.length - 1 ? prev + 1 : prev));
    }, 2500);
    
    // If loading takes more than 12 seconds, show long wait message
    const timeout = setTimeout(() => {
      setIsLongWait(true);
    }, 12000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-20 min-h-[500px] space-y-16">
      <div className="relative">
        {/* Animated background rings */}
        <motion.div 
          animate={{ scale: [1, 1.3, 1], opacity: [0.1, 0.3, 0.1] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="absolute inset-0 bg-emerald-500 blur-[100px] rounded-full -z-10"
        />
        <motion.div 
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.05, 0.15, 0.05] }}
          transition={{ duration: 5, repeat: Infinity, delay: 1 }}
          className="absolute inset-0 bg-blue-500 blur-[120px] rounded-full -z-10"
        />
        
        <div className="relative flex flex-col items-center">
          <div className="p-8 bg-white/40 backdrop-blur-2xl rounded-[3rem] border border-white/50 shadow-2xl">
            <DynamicLogo theme={theme} size="lg" />
          </div>
          
          {/* Spinning ring */}
          <svg className="absolute -inset-8 w-[calc(100%+64px)] h-[calc(100%+64px)] animate-[spin_15s_linear_infinite]">
            <circle
              cx="50%"
              cy="50%"
              r="48%"
              fill="none"
              stroke="url(#loading-gradient)"
              strokeWidth="2"
              strokeDasharray="10 20"
              className="opacity-40"
            />
            <defs>
              <linearGradient id="loading-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#3b82f6" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      <div className="text-center space-y-10 max-w-md w-full">
        <div className="space-y-3">
          <motion.h3 
            key={currentStep}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-black text-slate-900 tracking-tight"
          >
            {currentStep === LOADING_STEPS.length - 1 ? "即将为您呈现" : "正在深度分析中"}
          </motion.h3>
          <p className="text-slate-500 font-medium">
            {isLongWait ? (
              <span className="text-emerald-600 animate-pulse">此次咨询较为复杂，AI 正在进行多维度推演，请耐心等待...</span>
            ) : (
              "请稍候，我们正在为您定制专属守护方案"
            )}
          </p>
        </div>

        {/* Progress steps */}
        <div className="space-y-4 text-left">
          {LOADING_STEPS.map((step, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ 
                opacity: i <= currentStep ? 1 : 0.2,
                x: 0,
                scale: i === currentStep ? 1.05 : 1
              }}
              className={`flex items-center gap-5 p-4 rounded-3xl transition-all ${
                i === currentStep ? 'bg-white shadow-xl border border-slate-100 ring-4 ring-emerald-500/5' : ''
              }`}
            >
              <div className={`p-3 rounded-2xl ${i <= currentStep ? 'bg-slate-50 shadow-inner' : 'bg-slate-100'} ${i <= currentStep ? step.color : 'text-slate-300'}`}>
                {i < currentStep ? <CheckCircle2 className="w-6 h-6" /> : step.icon}
              </div>
              <div className="flex-1">
                <span className={`text-sm font-black tracking-tight ${i <= currentStep ? 'text-slate-800' : 'text-slate-300'}`}>
                  {step.text}
                </span>
                {i === currentStep && (
                  <div className="mt-1 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ x: '-100%' }}
                      animate={{ x: '0%' }}
                      transition={{ duration: 2.5, ease: "linear" }}
                      className="h-full bg-gradient-to-r from-emerald-500 to-blue-500"
                    />
                  </div>
                )}
              </div>
              {i === currentStep && (
                <motion.div 
                  layoutId="active-dot"
                  className="w-2.5 h-2.5 bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                  animate={{ scale: [1, 1.5, 1] }}
                  transition={{ repeat: Infinity, duration: 1 }}
                />
              )}
            </motion.div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2 text-slate-300 text-xs font-bold uppercase tracking-[0.2em]">
        <Sparkles className="w-4 h-4" />
        <span>基于真实场景深度优化</span>
      </div>
    </div>
  );
}
