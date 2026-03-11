import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile } from '../types';
import { 
  ChevronLeft, 
  Sparkles, 
  Shield, 
  Zap, 
  Target, 
  Users, 
  Heart, 
  Briefcase, 
  TrendingUp, 
  Smile, 
  Baby, 
  Activity,
  Cpu,
  Fingerprint,
  ArrowRight,
  BrainCircuit,
  AlertCircle
} from 'lucide-react';

interface Props {
  onComplete: (profile: UserProfile) => void;
}

const QUESTIONS = [
  {
    id: 'ageRange',
    label: '为了提供匹配您阅历的建议，请问您目前处于哪个人生阶段？',
    subLabel: 'Age Group Analysis',
    icon: <Activity className="w-6 h-6 text-cyan-400" />,
    options: [
      { value: '30-40', label: '30-40 岁 · 黄金积累期', icon: <TrendingUp className="w-5 h-5" />, color: 'from-cyan-500 to-blue-500' },
      { value: '40-50', label: '40-50 岁 · 中流砥柱期', icon: <Target className="w-5 h-5" />, color: 'from-blue-500 to-indigo-500' },
      { value: '50-60', label: '50-60 岁 · 智慧沉淀期', icon: <Shield className="w-5 h-5" />, color: 'from-indigo-500 to-violet-500' },
      { value: '60+', label: '60 岁以上 · 乐享晚年期', icon: <Smile className="w-5 h-5" />, color: 'from-violet-500 to-fuchsia-500' },
    ]
  },
  {
    id: 'role',
    label: '您在生活中主要扮演着什么样的角色？',
    subLabel: 'Identity Role Scan',
    icon: <Fingerprint className="w-6 h-6 text-violet-400" />,
    options: [
      { value: 'employee', label: '职场先锋', desc: '在工作中追求卓越', icon: <Briefcase className="w-5 h-5" />, color: 'from-violet-500 to-purple-500' },
      { value: 'self-employed', label: '创业经营者', desc: '掌控自己的事业航向', icon: <TrendingUp className="w-5 h-5" />, color: 'from-purple-500 to-pink-500' },
      { value: 'manager', label: '决策管理者', desc: '带领团队不断前行', icon: <Users className="w-5 h-5" />, color: 'from-pink-500 to-rose-500' },
      { value: 'caregiver', label: '家庭守护者', desc: '悉心照料家人生活', icon: <Heart className="w-5 h-5" />, color: 'from-rose-500 to-orange-500' },
      { value: 'retired', label: '自由探索者', desc: '享受退休后的自由时光', icon: <Sparkles className="w-5 h-5" />, color: 'from-orange-500 to-amber-500' },
      { value: 'student', label: '终身学习者', desc: '保持好奇，探索新知', icon: <BrainCircuit className="w-5 h-5" />, color: 'from-amber-500 to-yellow-500' },
    ]
  },
  {
    id: 'mainConcern',
    label: '当下，最牵动您心弦的事情是？',
    subLabel: 'Core Focus Detection',
    icon: <BrainCircuit className="w-6 h-6 text-rose-400" />,
    options: [
      { value: 'health', label: '身体健康', icon: <Heart className="w-5 h-5" />, color: 'from-rose-500 to-red-500' },
      { value: 'children', label: '子女发展', icon: <Users className="w-5 h-5" />, color: 'from-red-500 to-orange-500' },
      { value: 'grandchildren', label: '孙辈教育', icon: <Baby className="w-5 h-5" />, color: 'from-orange-500 to-amber-500' },
      { value: 'business', label: '事业财务', icon: <Briefcase className="w-5 h-5" />, color: 'from-amber-500 to-yellow-500' },
      { value: 'family', label: '家庭关系', icon: <Users className="w-5 h-5" />, color: 'from-yellow-500 to-lime-500' },
      { value: 'stress', label: '情绪调节', icon: <Zap className="w-5 h-5" />, color: 'from-lime-500 to-emerald-500' },
    ]
  },
  {
    id: 'stressLevel',
    label: '如果将压力具象化，您现在的负荷状态是？',
    subLabel: 'Stress Load Assessment',
    icon: <Activity className="w-6 h-6 text-amber-400" />,
    options: [
      { value: 'low', label: '轻松自如', desc: '状态良好，游刃有余', icon: <Smile className="w-5 h-5" />, color: 'from-emerald-500 to-teal-500' },
      { value: 'medium', label: '略感吃力', desc: '有些挑战，但在掌控中', icon: <Zap className="w-5 h-5" />, color: 'from-teal-500 to-cyan-500' },
      { value: 'high', label: '负荷过重', desc: '急需寻找突破口', icon: <Shield className="w-5 h-5" />, color: 'from-cyan-500 to-sky-500' },
      { value: 'critical', label: '濒临极限', desc: '急需立刻停下来喘息', icon: <AlertCircle className="w-5 h-5" />, color: 'from-rose-500 to-red-500' },
    ]
  },
  {
    id: 'preference',
    label: '您希望 AI 助手如何为您提供支持？',
    subLabel: 'Output Mode Selection',
    icon: <Cpu className="w-6 h-6 text-emerald-400" />,
    options: [
      { value: 'action', label: '理性派 · 具体的行动方案', icon: <Target className="w-5 h-5" />, color: 'from-sky-500 to-blue-500' },
      { value: 'comfort', label: '感性派 · 温和的情绪陪伴', icon: <Heart className="w-5 h-5" />, color: 'from-blue-500 to-indigo-500' },
      { value: 'both', label: '平衡派 · 两者兼顾', icon: <Sparkles className="w-5 h-5" />, color: 'from-indigo-500 to-violet-500' },
      { value: 'analysis', label: '分析派 · 深度的逻辑拆解', icon: <BrainCircuit className="w-5 h-5" />, color: 'from-violet-500 to-purple-500' },
    ]
  }
];

export default function ProfilingForm({ onComplete }: Props) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Partial<UserProfile>>({});
  const [direction, setDirection] = useState(0);

  const handleSelect = (value: string) => {
    const newAnswers = { ...answers, [QUESTIONS[currentStep].id]: value };
    setAnswers(newAnswers);
    setDirection(1);
    
    setTimeout(() => {
      if (currentStep < QUESTIONS.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        onComplete(newAnswers as UserProfile);
      }
    }, 400);
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setDirection(-1);
      setCurrentStep(currentStep - 1);
    }
  };

  const progress = ((currentStep + 1) / QUESTIONS.length) * 100;

  return (
    <div className="relative max-w-4xl mx-auto min-h-[600px] flex items-center justify-center">
      {/* Background Ambience - Lighter, cleaner, more welcoming */}
      <div className="absolute inset-0 bg-white rounded-[3rem] overflow-hidden border border-slate-100 shadow-2xl shadow-slate-200/50">
        <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-emerald-50/50 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-blue-50/50 rounded-full blur-[100px] translate-x-1/2 translate-y-1/2" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]" />
      </div>

      <div className="relative z-10 w-full p-6 md:p-14 space-y-10">
        {/* Header */}
        <div className="flex justify-between items-center text-slate-400">
          <button
            onClick={handleBack}
            disabled={currentStep === 0}
            className={`flex items-center gap-2 text-xs font-bold uppercase tracking-widest transition-all ${
              currentStep === 0 ? 'opacity-0 cursor-default' : 'hover:text-emerald-600'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            上一步
          </button>
          
          <div className="flex flex-col items-center gap-2">
             <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-50 border border-slate-100">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600">AI 分析中</span>
             </div>
          </div>

          <div className="text-xs font-bold uppercase tracking-widest text-slate-300">
            {currentStep + 1} <span className="text-slate-200">/</span> {QUESTIONS.length}
          </div>
        </div>

        {/* Question Card Area */}
        <div className="relative min-h-[400px]">
          <AnimatePresence mode="wait" initial={false} custom={direction}>
            <motion.div
              key={currentStep}
              custom={direction}
              initial={{ opacity: 0, x: direction > 0 ? 30 : -30, filter: 'blur(8px)' }}
              animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, x: direction > 0 ? -30 : 30, filter: 'blur(8px)' }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className="space-y-12"
            >
              {/* Question Header */}
              <div className="space-y-6 text-center">
                <motion.div 
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="w-16 h-16 mx-auto bg-white rounded-2xl border border-slate-100 flex items-center justify-center shadow-lg shadow-slate-100"
                >
                  {React.isValidElement(QUESTIONS[currentStep].icon) && React.cloneElement(QUESTIONS[currentStep].icon as React.ReactElement<any>, { className: "w-8 h-8 text-emerald-600" })}
                </motion.div>
                
                <div className="space-y-3">
                   <h2 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">
                    {QUESTIONS[currentStep].subLabel}
                  </h2>
                  <h3 className="text-2xl md:text-3xl font-black text-slate-800 leading-tight">
                    {QUESTIONS[currentStep].label}
                  </h3>
                </div>
              </div>

              {/* Options Grid */}
              <div className={`grid gap-4 max-w-3xl mx-auto ${
                QUESTIONS[currentStep].options.length > 4 ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2'
              }`}>
                {QUESTIONS[currentStep].options.map((option, idx) => {
                  const isSelected = answers[QUESTIONS[currentStep].id as keyof UserProfile] === option.value;
                  return (
                    <motion.button
                      key={option.value}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      onClick={() => handleSelect(option.value)}
                      className={`
                        group relative overflow-hidden p-6 rounded-2xl border transition-all duration-300 text-left
                        flex flex-col gap-3 hover:scale-[1.01] hover:shadow-lg
                        ${isSelected 
                          ? 'bg-slate-900 border-slate-900 shadow-xl shadow-slate-900/10' 
                          : 'bg-white border-slate-100 hover:border-emerald-100 hover:bg-emerald-50/30'
                        }
                      `}
                    >
                      <div className="relative z-10 flex items-start justify-between">
                        <div className={`p-2.5 rounded-xl transition-colors ${isSelected ? 'bg-white/10 text-white' : 'bg-slate-50 text-slate-400 group-hover:text-emerald-600 group-hover:bg-white'}`}>
                          {React.isValidElement((option as any).icon) && React.cloneElement((option as any).icon as React.ReactElement<any>, { 
                            className: `w-5 h-5` 
                          })}
                        </div>
                        {isSelected && (
                          <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]" />
                        )}
                      </div>

                      <div className="relative z-10 space-y-1">
                        <div className={`font-bold text-lg transition-colors ${isSelected ? 'text-white' : 'text-slate-700 group-hover:text-slate-900'}`}>
                          {option.label}
                        </div>
                        {(option as any).desc && (
                          <div className={`text-xs font-medium transition-colors ${isSelected ? 'text-slate-400' : 'text-slate-400 group-hover:text-slate-500'}`}>
                            {(option as any).desc}
                          </div>
                        )}
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Progress Bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-slate-50">
          <motion.div 
            className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ type: "spring", stiffness: 50 }}
          />
        </div>
      </div>
    </div>
  );
}
