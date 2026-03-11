import React from 'react';
import { RiskIndicator } from '../types';
import { Activity, Users, Wallet, AlertCircle, Brain, TrendingUp } from 'lucide-react';
import { motion } from 'motion/react';
import StressTrendChart from './StressTrendChart';

interface Props {
  risks: RiskIndicator[];
  stressHistory?: { date: string; score: number }[];
}

export default function RiskDashboard({ risks, stressHistory }: Props) {
  const getIcon = (type: string) => {
    switch (type) {
      case 'health': return <Activity className="w-6 h-6" />;
      case 'relationship': return <Users className="w-6 h-6" />;
      case 'finance': return <Wallet className="w-6 h-6" />;
      case 'psychology': return <Brain className="w-6 h-6" />;
      default: return <AlertCircle className="w-6 h-6" />;
    }
  };

  const getTheme = (level: string) => {
    switch (level) {
      case 'low': return {
        bg: 'bg-emerald-50/50 border-emerald-100',
        accent: 'bg-emerald-500',
        text: 'text-emerald-900',
        iconBg: 'bg-emerald-100 text-emerald-600',
        label: '安全'
      };
      case 'medium': return {
        bg: 'bg-amber-50/50 border-amber-100',
        accent: 'bg-amber-500',
        text: 'text-amber-900',
        iconBg: 'bg-amber-100 text-amber-600',
        label: '谨慎'
      };
      case 'high': return {
        bg: 'bg-rose-50/50 border-rose-100',
        accent: 'bg-rose-500',
        text: 'text-rose-900',
        iconBg: 'bg-rose-100 text-rose-600',
        label: '高危'
      };
      default: return {
        bg: 'bg-slate-50/50 border-slate-100',
        accent: 'bg-slate-500',
        text: 'text-slate-900',
        iconBg: 'bg-slate-100 text-slate-600',
        label: '稳定'
      };
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {risks.map((risk, i) => {
        const theme = getTheme(risk.level);
        return (
          <motion.div 
            key={i}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ y: -5 }}
            className={`p-8 rounded-[2rem] border-2 ${theme.bg} ${theme.text} space-y-6 relative overflow-hidden group transition-all hover:shadow-xl hover:bg-white`}
          >
            <div className="flex items-center justify-between relative z-10">
              <div className={`p-3 rounded-2xl ${theme.iconBg} transition-transform group-hover:scale-110`}>
                {getIcon(risk.type)}
              </div>
              <div className="flex items-center gap-2 px-3 py-1 bg-white/80 rounded-full border border-current/5 shadow-sm">
                <motion.div 
                  animate={{ scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className={`w-2.5 h-2.5 rounded-full ${theme.accent}`} 
                />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">
                  {theme.label}
                </span>
              </div>
            </div>
            
            <div className="space-y-4 relative z-10">
              <div className="space-y-2">
                <h4 className="font-black text-xl tracking-tight">{risk.label}</h4>
                <p className="text-sm opacity-70 leading-relaxed font-medium">{risk.description}</p>
              </div>

              {risk.score !== undefined && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest opacity-50">
                    <span>压力指数</span>
                    <span>{risk.score}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-black/5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${risk.score}%` }}
                      transition={{ duration: 1, delay: i * 0.2 }}
                      className={`h-full rounded-full ${theme.accent}`}
                    />
                  </div>
                </div>
              )}
              
              {risk.adjustment && (
                <div className="pt-4 border-t border-current/10 space-y-2">
                  <div className="text-[10px] font-black uppercase tracking-widest opacity-50">调整方案</div>
                  <p className="text-xs font-bold leading-relaxed">{risk.adjustment}</p>
                </div>
              )}
            </div>

            {/* Decorative background element */}
            <div className={`absolute -bottom-4 -right-4 w-24 h-24 rounded-full opacity-5 transition-transform group-hover:scale-150 ${theme.accent}`} />
          </motion.div>
        );
      })}

      {/* Stress Trend Chart - Full Width below the grid if history exists */}
      {stressHistory && stressHistory.length > 1 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="col-span-full mt-8 p-10 glass-card rounded-[3rem] border-white/40 space-y-8"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-500 text-white rounded-2xl shadow-lg shadow-emerald-500/20">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-2xl font-black tracking-tight">心理压力水平趋势</h3>
                <p className="text-sm text-slate-500 font-medium">基于近期咨询数据的动态评估</p>
              </div>
            </div>
            <div className="px-4 py-2 bg-slate-100 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-500 border border-slate-200">
              数据驱动 · 深度洞察
            </div>
          </div>
          
          <div className="bg-white/50 p-6 rounded-[2rem] border border-slate-100">
            <StressTrendChart data={stressHistory} />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 bg-emerald-50/50 rounded-2xl border border-emerald-100">
              <p className="text-xs text-emerald-800 font-bold leading-relaxed">
                💡 <span className="opacity-70">趋势分析：</span>
                {stressHistory[stressHistory.length - 1].score < stressHistory[0].score 
                  ? "您的压力水平呈现下降趋势，说明近期的调整方案正在生效，请继续保持。" 
                  : "压力水平略有波动，建议关注情绪反刍，适当增加户外活动或深呼吸练习。"}
              </p>
            </div>
            <div className="p-6 bg-blue-50/50 rounded-2xl border border-blue-100">
              <p className="text-xs text-blue-800 font-bold leading-relaxed">
                🛡️ <span className="opacity-70">守护提醒：</span>
                系统已为您自动匹配了更具针对性的心理调适资源，可在下方“推荐资源”中查看。
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
