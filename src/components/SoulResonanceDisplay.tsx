import React from 'react';
import { motion } from 'motion/react';
import { Sparkles } from 'lucide-react';

interface Props {
  score: number;
}

export default function SoulResonanceDisplay({ score }: Props) {
  // Normalize score to 0-100
  const normalizedScore = Math.min(100, Math.max(0, score));
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (normalizedScore / 100) * circumference;

  return (
    <div className="relative flex flex-col items-center justify-center p-6 bg-white/5 backdrop-blur-xl rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden group">
      {/* Animated background glow */}
      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3] 
        }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 via-blue-500/10 to-purple-500/20 blur-3xl"
      />

      <div className="relative z-10 flex flex-col items-center gap-4">
        <div className="relative w-32 h-32">
          {/* Background circle */}
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="64"
              cy="64"
              r={radius}
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              className="text-white/5"
            />
            {/* Progress circle */}
            <motion.circle
              cx="64"
              cy="64"
              r={radius}
              stroke="url(#resonanceGradient)"
              strokeWidth="8"
              fill="transparent"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: offset }}
              transition={{ duration: 2, ease: "easeOut", delay: 0.5 }}
              strokeLinecap="round"
            />
            <defs>
              <linearGradient id="resonanceGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="50%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#8b5cf6" />
              </linearGradient>
            </defs>
          </svg>
          
          {/* Score text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.span 
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.5, type: "spring" }}
              className="text-3xl font-black text-white tracking-tighter"
            >
              {normalizedScore}%
            </motion.span>
            <span className="text-[8px] font-black uppercase tracking-[0.2em] text-white/40">Resonance</span>
          </div>
        </div>

        <div className="text-center space-y-1">
          <div className="flex items-center justify-center gap-2 text-emerald-400">
            <Sparkles className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">灵魂共鸣度</span>
          </div>
          <p className="text-xs text-white/60 font-medium max-w-[120px]">
            {normalizedScore > 90 ? "极高：AI已深度触及您的灵魂核心" : 
             normalizedScore > 70 ? "高：AI与您的情感产生了强烈共振" :
             "中：AI正在努力理解您的内心世界"}
          </p>
        </div>
      </div>
    </div>
  );
}
