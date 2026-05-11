import React from 'react';
import { motion } from 'motion/react';
import { SimulationResult } from '../types';
import { 
  CheckCircle2, 
  AlertTriangle, 
  Calendar, 
  MessageCircle, 
  BookOpen, 
  Heart, 
  Download, 
  Share2, 
  Printer,
  ChevronRight,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Utensils,
  Dumbbell,
  Moon,
  Activity
} from 'lucide-react';

import RiskDashboard from './RiskDashboard';
import DecisionSimulator from './DecisionSimulator';
import PerspectiveSwitcher from './PerspectiveSwitcher';
import DynamicLogo from './DynamicLogo';
import SoulResonanceDisplay from './SoulResonanceDisplay';
import { LifeTheme } from '../types';

interface Props {
  result: SimulationResult;
  onReset: () => void;
  theme: LifeTheme | null;
  stressHistory?: { date: string; score: number }[];
  isPaid?: boolean;
  onUnlock?: () => void;
  onSpeak?: (text: string) => void;
  isSpeaking?: boolean;
  onRequestDeepDive?: () => Promise<void>;
  isDeepDiveLoading?: boolean;
  deepDiveError?: string | null;
  onSaveArchive?: () => Promise<void> | void;
  isArchiveSaving?: boolean;
}

export default function StructuredResult({
  result,
  onReset,
  theme,
  stressHistory,
  isPaid = false,
  onUnlock,
  onSpeak,
  isSpeaking = false,
  onRequestDeepDive,
  isDeepDiveLoading = false,
  deepDiveError = null,
  onSaveArchive,
  isArchiveSaving = false,
}: Props) {
  const { advice, followUpQuestions, resonanceScore = 85, soulSignature = "心之所向，素履以往" } = result;

  const hasDeepBlocks =
    Boolean(advice.caseStudy) ||
    Boolean(advice.perspectives && advice.perspectives.length > 0) ||
    Boolean(advice.decisionSimulation) ||
    Boolean(
      advice.lifestyleAdvice &&
        (advice.lifestyleAdvice.moodRegulation ||
          advice.lifestyleAdvice.sleepImprovement ||
          advice.lifestyleAdvice.recreation)
    );

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      {/* 1. Core Action Plan - The "Meat" first */}
      <motion.section 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="space-y-8 relative"
      >
        <div className="flex items-center justify-between px-6">
          <div className="flex items-center gap-4 text-emerald-600">
            <div className="p-2 bg-emerald-500/10 rounded-xl">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h3 className="text-2xl font-black tracking-tight">为您定制的守护计划</h3>
          </div>
          {onSaveArchive ? (
            <button
              type="button"
              onClick={() => void onSaveArchive()}
              disabled={isArchiveSaving}
              className="text-xs text-emerald-600 font-black uppercase tracking-[0.2em] bg-emerald-50 px-4 py-2 rounded-full border border-emerald-100 flex items-center gap-2 hover:bg-emerald-100 transition-colors disabled:opacity-50"
            >
              <Download className="w-3 h-3" />
              {isArchiveSaving ? '保存中…' : '保存我的档案'}
            </button>
          ) : (
            <button
              type="button"
              className="text-xs text-emerald-600 font-black uppercase tracking-[0.2em] bg-emerald-50 px-4 py-2 rounded-full border border-emerald-100 flex items-center gap-2 hover:bg-emerald-100 transition-colors"
            >
              <Download className="w-3 h-3" />
              保存计划
            </button>
          )}
        </div>
        
        <div className={`grid grid-cols-1 md:grid-cols-3 gap-8 ${!isPaid ? 'blur-md select-none pointer-events-none opacity-60' : ''}`}>
          {[
            { label: '今天', content: advice.actions.today, color: 'bg-gradient-to-br from-emerald-600 to-emerald-500 text-white border-emerald-400 shadow-2xl shadow-emerald-600/30', icon: <Sparkles className="w-5 h-5" /> },
            { label: '本周', content: advice.actions.thisWeek, color: 'glass-card text-slate-900 border-white/40', icon: <Calendar className="w-5 h-5 text-blue-500" /> },
            { label: '本月', content: advice.actions.thisMonth, color: 'glass-card text-slate-900 border-white/40', icon: <ArrowRight className="w-5 h-5 text-amber-500" /> }
          ].map((item, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.15, type: "spring", stiffness: 100 }}
              whileHover={{ scale: 1.03, y: -5 }}
              className={`p-10 rounded-[3rem] border ${item.color} space-y-6 relative overflow-hidden group transition-all duration-500`}
            >
              <div className="flex items-center justify-between">
                <div className={`px-5 py-2 rounded-full text-xl font-black uppercase tracking-widest ${i === 0 ? 'bg-white/20 text-white' : 'bg-slate-100/50 text-slate-500'}`}>
                  {item.label}
                </div>
                <div className={`${i === 0 ? 'bg-white/20' : 'bg-slate-50/50'} p-3 rounded-2xl shadow-inner`}>
                  {React.cloneElement(item.icon as React.ReactElement<{ className?: string }>, { className: 'w-7 h-7' })}
                </div>
              </div>
              <p className="font-bold leading-relaxed text-xl tracking-tight">{item.content}</p>
            </motion.div>
          ))}
        </div>

        {/* Lock Overlay for Actions */}
        {!isPaid && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center space-y-6">
            <div className="p-4 bg-slate-900 text-white rounded-full shadow-2xl shadow-slate-900/30">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div className="text-center space-y-2">
              <h4 className="text-2xl font-black text-slate-900">解锁完整行动方案</h4>
              <p className="text-slate-500 font-medium">获取针对您个人情况的 3 阶段详细指引</p>
            </div>
            <button 
              onClick={onUnlock}
              className="px-10 py-4 bg-emerald-600 text-white rounded-2xl font-black text-lg hover:bg-emerald-500 transition-all shadow-xl shadow-emerald-600/30 flex items-center gap-2"
            >
              立即解锁
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </motion.section>

      {/* 2. Quick Status Header - ALWAYS VISIBLE (FREE HOOK) */}
      <div className="glass-card rounded-[4rem] overflow-hidden border-white/40 shadow-2xl shadow-slate-200/50">
        <div className="p-10 md:p-14 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/10 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2 animate-pulse" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-10">
            <div className="flex flex-col gap-6 max-w-2xl">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-md">
                  <DynamicLogo theme={theme} size="md" className="shrink-0" />
                </div>
                <div className="flex items-center gap-2 text-emerald-400 font-black tracking-[0.2em] uppercase text-[10px] bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                  <ShieldCheck className="w-3 h-3" />
                  <span>AI Guardian Message</span>
                </div>
              </div>
              
              <div className="space-y-4">
                 <h2 className="text-2xl md:text-4xl font-black leading-tight tracking-tight text-white">
                   {advice.stateSummary.split('\n')[0]}
                 </h2>
                 <p className="text-lg text-slate-300 font-medium leading-relaxed">
                   {advice.stateSummary.split('\n').slice(1).join(' ')}
                 </p>
              </div>
            </div>
            
            <div className="shrink-0 flex flex-col items-center gap-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
              >
                <SoulResonanceDisplay score={resonanceScore} />
              </motion.div>
              {onSpeak && (
                <button
                  type="button"
                  onClick={() => onSpeak(advice.stateSummary)}
                  title="听专家解读"
                  className={`p-3 rounded-full border shadow-lg transition-all ${
                    isSpeaking
                      ? 'bg-emerald-500 text-white animate-pulse border-emerald-400'
                      : 'bg-white/90 text-emerald-600 hover:scale-105 border-white/40'
                  }`}
                >
                  <Activity className={`w-5 h-5 ${isSpeaking ? 'animate-bounce' : ''}`} />
                </button>
              )}
            </div>
          </div>
        </div>

          <div className="p-8 md:p-12 space-y-16">
            {/* Risk Indicators - PARTIALLY BLURRED IF NOT PAID */}
            <section className="space-y-8 relative">
              <div className="flex items-center justify-between px-4">
                <div className="flex items-center gap-3 text-slate-400">
                  <div className="p-2 bg-slate-100 rounded-lg">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-black uppercase tracking-[0.2em]">关键风险指标</span>
                </div>
                {advice.risks.some(r => r.level === 'high') && (
                  <div className="flex items-center gap-2 px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-[10px] font-bold border border-amber-100">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                    需关注
                  </div>
                )}
              </div>
              
              <div className={!isPaid ? 'blur-sm select-none pointer-events-none opacity-80 transition-all duration-500' : ''}>
                <RiskDashboard risks={advice.risks} stressHistory={stressHistory} />
              </div>

              {!isPaid && (
                <div className="absolute inset-0 z-20 flex items-center justify-center">
                  <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    className="p-8 bg-white/90 backdrop-blur-xl rounded-[2.5rem] shadow-2xl border border-white/50 text-center space-y-6 max-w-sm mx-auto"
                  >
                    <div className="p-4 bg-gradient-to-br from-amber-100 to-amber-50 text-amber-600 rounded-full w-fit mx-auto shadow-inner">
                      <AlertTriangle className="w-8 h-8" />
                    </div>
                    <div>
                      <h4 className="font-black text-xl text-slate-900 leading-tight">为您识别到 {advice.risks.filter(r => r.level === 'high').length} 个<br/>需重点关注事项</h4>
                      <p className="text-sm text-slate-500 font-medium mt-3 leading-relaxed">解锁后查看详细的风险规避建议与过往案例参考，助您未雨绸缪</p>
                    </div>
                    <button 
                      onClick={onUnlock}
                      className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold text-sm hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20 flex items-center justify-center gap-2"
                    >
                      <span>立即查看详情</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </motion.div>
                </div>
              )}
            </section>

          {/* Risk Reminder - ALWAYS VISIBLE (FREE HOOK) */}
          <section className="p-8 md:p-10 bg-rose-50/50 rounded-[3rem] border border-rose-100 flex flex-col sm:flex-row gap-6 md:gap-8 items-start relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-rose-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="p-4 md:p-5 bg-rose-100 text-rose-600 rounded-[1.5rem] shrink-0 shadow-lg shadow-rose-500/10 relative z-10">
              <AlertTriangle className="w-6 h-6 md:w-8 md:h-8" />
            </div>
            <div className="space-y-3 relative z-10">
              <h4 className="font-black text-lg md:text-xl text-rose-900 tracking-tight">风险警示</h4>
              <p className="text-rose-800 leading-relaxed text-base md:text-lg font-medium">{advice.riskReminder}</p>
            </div>
          </section>
        </div>
      </div>

      {/* 4. Communication & Resources */}
      <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 ${!isPaid ? 'blur-md select-none pointer-events-none opacity-60' : ''}`}>
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 space-y-4 hover:bg-white hover:shadow-lg transition-all duration-300"
        >
          <div className="flex items-center gap-3 text-slate-900">
            <div className="p-2 bg-white rounded-xl shadow-sm">
              <MessageCircle className="w-5 h-5 text-blue-500" />
            </div>
            <h3 className="font-bold text-lg">家庭沟通建议</h3>
          </div>
          <p className="text-slate-600 leading-relaxed italic text-lg">“{advice.communicationTip}”</p>
          <div className="flex items-center gap-2 text-[10px] text-slate-400 uppercase tracking-wider font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
            建议话术 · 仅供参考
          </div>
        </motion.section>

        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 space-y-4 hover:bg-white hover:shadow-lg transition-all duration-300"
        >
          <div className="flex items-center gap-3 text-slate-900">
            <div className="p-2 bg-white rounded-xl shadow-sm">
              <BookOpen className="w-5 h-5 text-emerald-500" />
            </div>
            <h3 className="font-bold text-lg">推荐资源</h3>
          </div>
          <p className="text-slate-600 leading-relaxed text-lg">{advice.resourceSuggestion}</p>
          <div className="flex items-center gap-2 text-[10px] text-slate-400 uppercase tracking-wider font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            非诊断性建议 · 仅供参考
          </div>
        </motion.section>
      </div>

      {/* Health Recommendations */}
      {advice.healthAdvice && (
        <section className={`glass-card rounded-[3rem] border-white/40 overflow-hidden ${!isPaid ? 'blur-md select-none pointer-events-none opacity-60' : ''}`}>
          <div className="p-8 bg-emerald-50/50 border-b border-emerald-100 flex items-center gap-3">
            <div className="p-2 bg-emerald-500 text-white rounded-xl">
              <Heart className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-black text-emerald-900 tracking-tight">个性化健康守护建议</h3>
          </div>
          <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: <Utensils className="w-6 h-6" />, label: '饮食调理', content: advice.healthAdvice?.diet, color: 'text-orange-600', bg: 'bg-orange-50' },
              { icon: <Dumbbell className="w-6 h-6" />, label: '运动建议', content: advice.healthAdvice?.exercise, color: 'text-blue-600', bg: 'bg-blue-50' },
              { icon: <Moon className="w-6 h-6" />, label: '睡眠改善', content: advice.healthAdvice?.sleep, color: 'text-indigo-600', bg: 'bg-indigo-50' }
            ].map((item, i) => (
              <div key={i} className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl ${item.bg} ${item.color}`}>
                    {item.icon}
                  </div>
                  <span className="font-black text-slate-900 tracking-tight">{item.label}</span>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed font-medium">{item.content}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {onRequestDeepDive && (
        <div className="px-2 py-2 space-y-3">
          {(isDeepDiveLoading || deepDiveError) && (
            <div className="glass-card rounded-[2rem] border-white/40 p-6 space-y-2">
              {isDeepDiveLoading && (
                <div className="flex items-center gap-3 text-slate-600 text-sm font-bold">
                  <div className="w-4 h-4 rounded-full border-2 border-slate-200 border-t-emerald-500 animate-spin" />
                  正在加载深度分析…
                </div>
              )}
              {deepDiveError && (
                <div className="text-sm text-rose-600 font-bold">深度分析加载失败：{deepDiveError}</div>
              )}
            </div>
          )}
          {!hasDeepBlocks && !isDeepDiveLoading && (
            <div className="flex justify-center">
              <button
                type="button"
                onClick={async () => {
                  try {
                    await onRequestDeepDive();
                  } catch {
                    /* parent holds error */
                  }
                }}
                className="inline-flex items-center gap-3 px-8 py-4 bg-white rounded-full border border-slate-200 shadow-sm hover:shadow-xl hover:border-emerald-200 transition-all font-black text-sm text-slate-900"
              >
                <Sparkles className="w-4 h-4 text-emerald-600" />
                加载深度分析（案例 · 视角 · 推演）
              </button>
            </div>
          )}
        </div>
      )}

      {/* 5. Real-life Case Study - NEW SECTION */}
      {advice.caseStudy && (
        <section className={`glass-card rounded-[3rem] border-white/40 overflow-hidden ${!isPaid ? 'blur-md select-none pointer-events-none opacity-60' : ''}`}>
          <div className="p-12 md:p-16 bg-slate-900 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[100px] rounded-full" />
            <div className="relative z-10 space-y-8">
              <div className="flex items-center gap-3 text-emerald-400 font-black tracking-[0.3em] uppercase text-xs bg-emerald-500/10 w-fit px-4 py-1.5 rounded-full border border-emerald-500/20">
                <BookOpen className="w-5 h-5" />
                <span>专家决策参考</span>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-3xl font-serif italic text-white/90 leading-relaxed">
                  “我也曾面临同样的困境...”
                </h3>
                <p className="text-slate-400 font-medium text-lg">
                  看看其他家庭是如何走出这段迷茫期的。真实的案例，或许能给你最直接的勇气。
                </p>
              </div>
            </div>
          </div>
          
          <div className="p-10 bg-white space-y-8">
            <div className="flex items-start gap-6">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center shrink-0 font-serif font-bold text-xl text-slate-400">
                案
              </div>
              <div className="space-y-4">
                <h4 className="font-bold text-xl text-slate-900">{advice.caseStudy.title}</h4>
                <p className="text-slate-600 leading-relaxed">
                  {advice.caseStudy.story}
                </p>
                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
                  <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm uppercase tracking-wider">
                    <CheckCircle2 className="w-4 h-4" />
                    专家点评
                  </div>
                  <p className="text-slate-700 italic font-medium">
                    “{advice.caseStudy.expertComment}”
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 6. Lifestyle Advice */}
      <section className={`text-center py-16 border-t border-slate-100 space-y-16 ${!isPaid ? 'blur-md select-none pointer-events-none opacity-60' : ''}`}>
        
        {/* Lifestyle Advice Card */}
        {advice.lifestyleAdvice && (
          <div className="max-w-2xl mx-auto space-y-8">
            <div className="flex flex-col items-center gap-3">
              <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600 shadow-sm">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">身心调适指南</h3>
              <p className="text-slate-500 font-medium">为您定制的生活状态提升建议</p>
            </div>

            <div className="grid grid-cols-1 gap-6 text-left">
              {[
                { icon: <Heart className="w-5 h-5" />, title: '心理调节', content: advice.lifestyleAdvice?.moodRegulation, color: 'bg-rose-50 text-rose-600 border-rose-100' },
                { icon: <Moon className="w-5 h-5" />, title: '睡眠改善', content: advice.lifestyleAdvice?.sleepImprovement, color: 'bg-indigo-50 text-indigo-600 border-indigo-100' },
                { icon: <Utensils className="w-5 h-5" />, title: '休闲建议', content: advice.lifestyleAdvice?.recreation, color: 'bg-amber-50 text-amber-600 border-amber-100' }
              ].map((item, i) => (
                <div key={i} className={`p-6 rounded-2xl border ${item.color} flex gap-5 items-start transition-transform hover:-translate-y-1`}>
                  <div className={`p-3 rounded-xl bg-white shadow-sm shrink-0`}>
                    {item.icon}
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-bold text-lg text-slate-900">{item.title}</h4>
                    <p className="text-slate-700 leading-relaxed font-medium">{item.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Decision Simulation */}
      {advice.decisionSimulation && (
        <div className={!isPaid ? 'blur-md select-none pointer-events-none opacity-60' : ''}>
          <DecisionSimulator 
            pathA={advice.decisionSimulation.pathA} 
            pathB={advice.decisionSimulation.pathB} 
          />
        </div>
      )}

      {/* Perspective Switcher */}
      {advice.perspectives && (
        <div className={!isPaid ? 'blur-md select-none pointer-events-none opacity-60' : ''}>
          <PerspectiveSwitcher perspectives={advice.perspectives} />
        </div>
      )}

      {/* Soul Signature - The unique touch */}
      <section className={`text-center py-16 space-y-10 ${!isPaid ? 'blur-md select-none pointer-events-none opacity-60' : ''}`}>
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative py-14 px-8 max-w-2xl mx-auto"
        >
          {/* Decorative Elements */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />
          
          <div className="space-y-6">
            <div className="flex items-center justify-center gap-4">
              <div className="h-px w-8 bg-slate-300" />
              <span className="text-xs font-black uppercase tracking-[0.4em] text-slate-400">灵魂签语 · Soul Signature</span>
              <div className="h-px w-8 bg-slate-300" />
            </div>
            
            <p className="text-4xl md:text-6xl font-serif italic bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 bg-clip-text text-transparent leading-tight py-2 drop-shadow-sm">
              {soulSignature}
            </p>
            
            <div className="flex justify-center gap-2 pt-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/40" />
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/70" />
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            </div>
          </div>
        </motion.div>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-8">
          {onSaveArchive ? (
            <button
              type="button"
              onClick={() => void onSaveArchive()}
              disabled={isArchiveSaving}
              className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl text-sm font-medium hover:bg-slate-800 transition-all disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              {isArchiveSaving ? '保存中…' : '保存我的档案'}
            </button>
          ) : (
            <button
              type="button"
              className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl text-sm font-medium hover:bg-slate-800 transition-all"
            >
              <Download className="w-4 h-4" />
              保存建议卡
            </button>
          )}
          <button
            type="button"
            className="flex items-center gap-2 px-6 py-3 bg-white text-slate-600 rounded-xl text-sm font-medium border border-slate-200 hover:bg-slate-50 transition-all"
          >
            <Share2 className="w-4 h-4" />
            分享给家人
          </button>
          <button
            type="button"
            className="flex items-center gap-2 px-6 py-3 bg-white text-slate-600 rounded-xl text-sm font-medium border border-slate-200 hover:bg-slate-50 transition-all"
          >
            <Printer className="w-4 h-4" />
            打印码
          </button>
        </div>
      </section>

      {/* Follow-up Questions */}
      <div className={`space-y-6 ${!isPaid ? 'blur-md select-none pointer-events-none opacity-60' : ''}`}>
        <div className="flex items-center gap-2 text-slate-400 px-4">
          <Sparkles className="w-4 h-4" />
          <span className="text-xs font-bold uppercase tracking-widest">你可能还想追问</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {followUpQuestions.map((q, i) => (
            <button
              key={i}
              className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all text-left flex items-center justify-between group"
            >
              <span className="text-sm font-medium text-slate-700">{q}</span>
              <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-500 transition-colors" />
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-center pt-8">
        <button
          onClick={onReset}
          className="flex items-center gap-2 text-slate-400 hover:text-slate-900 transition-colors font-medium"
        >
          <RefreshCw className="w-4 h-4" />
          重新开始咨询
        </button>
      </div>
    </div>
  );
}
