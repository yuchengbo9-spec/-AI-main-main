/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Compass, 
  ArrowRight, 
  Loader2, 
  Brain,
  Heart, 
  HeartHandshake,
  Briefcase, 
  TrendingUp, 
  Smile, 
  Home, 
  RefreshCw,
  ChevronLeft,
  ShieldAlert,
  ShieldCheck,
  CreditCard,
  UserCircle,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  Cpu,
  Lightbulb,
  MessageCircle,
  Users,
  Baby,
  Activity,
  Mic,
  MicOff,
  Volume2
} from 'lucide-react';
import { generateLifeSimulation, generateRecommendedQuestions } from './services/ai';
import { SimulationResult, LifeTheme, UserProfile, RecommendedQuestion, UserMemory } from './types';
import { MemoryService } from './services/memory';
import { useSpeech } from './hooks/useSpeech';
import ProfilingForm from './components/ProfilingForm';
import QuestionRecommender from './components/QuestionRecommender';
import StructuredResult from './components/StructuredResult';
import DynamicLogo from './components/DynamicLogo';
import ThemedLoading from './components/ThemedLoading';
import MarqueeQuestions from './components/MarqueeQuestions';

const THEMES: { id: LifeTheme; label: string; icon: React.ReactNode; color: string; description: string; defaultQuestions: string[] }[] = [
  { 
    id: 'health', 
    label: '身体健康与生活方式', 
    icon: <Activity className="w-5 h-5" />, 
    color: 'bg-emerald-50 text-emerald-600 border-emerald-100', 
    description: '体检指标、睡眠、饮食与运动建议',
    defaultQuestions: ['最近体检指标有异常，该如何调整生活习惯？', '总是失眠多梦，有没有不吃药的缓解方法？', '想开始运动但怕伤膝盖，50岁后怎么练？']
  },
  { 
    id: 'family', 
    label: '家庭关系与沟通', 
    icon: <Users className="w-5 h-5" />, 
    color: 'bg-blue-50 text-blue-600 border-blue-100', 
    description: '夫妻沟通、赡养压力、亲戚往来',
    defaultQuestions: ['老伴总是固执不听劝，怎么沟通才有效？', '赡养老人压力大，兄弟姐妹间怎么分配责任？', '亲戚借钱不还，怎么处理才不伤和气？']
  },
  { 
    id: 'children', 
    label: '子女发展与婚育', 
    icon: <Heart className="w-5 h-5" />, 
    color: 'bg-rose-50 text-rose-600 border-rose-100', 
    description: '职业选择、创业风险、婚恋沟通',
    defaultQuestions: ['孩子想辞职创业，我该支持还是劝阻？', '孩子迟迟不结婚，我该怎么跟他聊聊？', '孩子在大城市压力大，我能帮上什么忙？']
  },
  { 
    id: 'grandchildren', 
    label: '孙辈学业与习惯', 
    icon: <Baby className="w-5 h-5" />, 
    color: 'bg-amber-50 text-amber-600 border-amber-100', 
    description: '沉迷手机、学习动力、隔代教育',
    defaultQuestions: ['孙子总是玩手机不学习，怎么管才听？', '和儿媳在带孩子上有分歧，怎么处理？', '孩子学习跟不上，爷爷奶奶能做什么？']
  },
  { 
    id: 'business', 
    label: '生意与财务压力', 
    icon: <Briefcase className="w-5 h-5" />, 
    color: 'bg-indigo-50 text-indigo-600 border-indigo-100', 
    description: '现金流、客户下滑、转型决策支持',
    defaultQuestions: ['生意越来越难做，是该坚持还是关门？', '客户流失严重，怎么找回老客户？', '想把生意交给孩子，但他没兴趣怎么办？']
  },
  { 
    id: 'emotion', 
    label: '情绪压力与调整', 
    icon: <Smile className="w-5 h-5" />, 
    color: 'bg-purple-50 text-purple-600 border-purple-100', 
    description: '失眠焦虑、无力感、状态调整',
    defaultQuestions: ['总是莫名其妙感到烦躁，怎么调节情绪？', '觉得自己老了没用了，怎么找回价值感？', '对什么都提不起兴趣，是不是抑郁了？']
  },
];

type AppStep = 'landing' | 'payment' | 'profile' | 'theme' | 'questions' | 'input' | 'loading' | 'result';

const PRESET_QUESTIONS: Record<LifeTheme, string[]> = {
  health: [
    "最近体检指标有异常，该如何调整生活习惯？", "总是失眠多梦，有没有不吃药的缓解方法？", "想开始运动但怕伤膝盖，50岁后怎么练？",
    "血压最近有点波动，饮食上要注意什么？", "感觉记忆力下降明显，是正常的衰老吗？", "更年期潮热出汗，除了忍还能怎么办？",
    "体检发现有结节，需要马上手术吗？", "老是感觉疲劳乏力，补点什么好？", "牙齿最近开始松动了，怎么护理？",
    "血糖有点偏高，还能吃水果吗？", "经常腰酸背痛，是骨质疏松了吗？", "眼睛看东西越来越花，老花镜怎么配？",
    "听力感觉不如以前了，需要戴助听器吗？", "消化功能变差了，经常胃胀怎么办？", "最近体重下降得厉害，需要去检查吗？",
    "冬天皮肤特别干燥瘙痒，怎么保湿？", "手指关节晨起僵硬，是风湿吗？", "爬楼梯气喘吁吁，心肺功能怎么练？",
    "便秘问题困扰很久了，怎么调理？", "夜尿频繁影响睡眠，是肾虚吗？", "体检血脂高，必须吃他汀类药物吗？",
    "经常头晕眼花，是颈椎病引起的吗？", "想吃点保健品，鱼油和钙片能一起吃吗？", "心情不好会影响身体健康吗？"
  ],
  family: [
    "老伴总是固执不听劝，怎么沟通才有效？", "赡养老人压力大，兄弟姐妹间怎么分配责任？", "亲戚借钱不还，怎么处理才不伤和气？",
    "子女不常回家看看，心里失落怎么排解？", "和老伴生活习惯差异大，总是吵架怎么办？", "亲家之间相处尴尬，怎么维持面子？",
    "家里老人需要长期照护，请保姆还是去养老院？", "兄弟姐妹为了遗产争执，怎么调解？", "过年过节子女不想回来，该怎么说？",
    "老伴沉迷买保健品，怎么劝都不听怎么办？", "感觉在家里没有话语权，怎么找回尊严？", "子女教育观念冲突，夹在中间很难做？",
    "亲戚总是爱攀比，怎么应对才得体？", "退休后和老伴天天在家大眼瞪小眼，怎么相处？", "想去子女城市生活，又怕不习惯怎么办？",
    "家里总是乱糟糟的，怎么动员大家一起收拾？", "老伴不爱卫生，说了也不改怎么办？", "子女工作忙，生病了不敢告诉他们？",
    "怎么委婉拒绝亲戚的不合理请求？", "感觉和子女代沟越来越大，聊不到一块去？", "家里有矛盾，是该忍着还是挑明了说？",
    "怎么组织一次全家都满意的家庭聚会？", "老伴退休后变得很啰嗦，怎么适应？", "想要立遗嘱，怎么开口跟子女商量？"
  ],
  children: [
    "孩子想辞职创业，我该支持还是劝阻？", "孩子迟迟不结婚，我该怎么跟他聊聊？", "孩子在大城市压力大，我能帮上什么忙？",
    "孩子工作太忙总是熬夜，怎么劝他注意身体？", "孩子找的对象我不满意，该不该反对？", "孩子买房首付不够，我要不要拿出养老钱？",
    "孩子总是报喜不报忧，怎么了解他的真实情况？", "孩子不想生孩子（丁克），我该怎么接受？", "孩子在大城市买不起房，要不要劝他回来？",
    "孩子总是换工作，不稳定怎么办？", "孩子性格太内向，在职场受欺负怎么办？", "孩子总是月光族，存不下钱怎么办？",
    "孩子感情受挫，怎么安慰他走出阴影？", "孩子想出国发展，我舍不得怎么办？", "孩子工作不顺心，想考公考编，该支持吗？",
    "孩子和伴侣吵架闹离婚，我该劝和还是劝分？", "孩子总是不接电话，发微信也不回，怎么办？", "孩子过度消费，欠了网贷怎么办？",
    "孩子想转行，但放弃现在的积累太可惜？", "孩子在大城市漂泊多年没起色，该怎么规划？", "孩子总是抱怨工作累，怎么引导他积极面对？",
    "孩子不爱社交，总是宅在家里怎么办？", "孩子对未来很迷茫，我能给他什么建议？", "孩子总是向我索取，不懂感恩怎么办？"
  ],
  grandchildren: [
    "孙子总是玩手机不学习，怎么管才听？", "和儿媳在带孩子上有分歧，怎么处理？", "孩子学习跟不上，爷爷奶奶能做什么？",
    "孙子挑食不爱吃饭，怎么做才爱吃？", "孙子性格太娇气，怎么锻炼他的独立性？", "带孙子太累了，身体吃不消怎么跟子女说？",
    "孙子不爱叫人，怎么教懂礼貌？", "给孙子买礼物，儿媳总是嫌弃怎么办？", "孙子想学特长，该选钢琴还是画画？",
    "隔代亲是不是会宠坏孩子？", "孙子在学校被欺负了，该不该去找老师？", "怎么培养孙子的阅读习惯？",
    "孙子沉迷游戏，怎么引导他合理娱乐？", "儿媳不让给孙子吃零食，我觉得少吃点没事？", "孙子总是生病，是不是带得不够细心？",
    "怎么利用假期带孙子增长见识？", "孙子不听话，能不能适当打骂？", "儿女没空带孩子，完全扔给我们怎么办？",
    "孙子和外公外婆更亲，心里有点吃醋？", "怎么给孙子存一笔教育基金？", "孙子青春期叛逆，怎么和他沟通？",
    "带孙子和享受晚年生活，怎么平衡？", "孙子总是乱花钱，怎么教他理财？", "怎么让孙子理解爷爷奶奶的辛苦？"
  ],
  business: [
    "生意越来越难做，是该坚持还是关门？", "客户流失严重，怎么找回老客户？", "想把生意交给孩子，但他没兴趣怎么办？",
    "现金流紧张，哪里能找到靠谱的资金？", "合伙人想撤资，我该怎么应对？", "现在入局短视频直播，还来得及吗？",
    "员工越来越难管，怎么设计激励机制？", "房租成本太高，要不要搬到偏一点的地方？", "库存积压严重，怎么快速清仓？",
    "同行都在打价格战，我该不该跟进？", "老客户觉得我们服务变差了，怎么挽回口碑？", "想要转型做新业务，风险怎么评估？",
    "生意太忙顾不上家，家人有怨言怎么办？", "供应链不稳定，经常断货怎么办？", "想要拓展外地市场，该怎么起步？",
    "税务税务方面有什么优惠政策可以利用？", "怎么利用AI工具来降低生意成本？", "店铺装修老旧了，要不要重新翻修？",
    "竞争对手恶意抹黑，怎么维护声誉？", "想要招个得力助手，怎么识人？", "生意赚不到钱，是不是该及时止损？",
    "怎么判断现在的市场趋势？", "由于身体原因想退休，生意转让给谁合适？", "投资失败欠了债，怎么东山再起？"
  ],
  emotion: [
    "总是莫名其妙感到烦躁，怎么调节情绪？", "觉得自己老了没用了，怎么找回价值感？", "对什么都提不起兴趣，是不是抑郁了？",
    "退休后心里空落落的，怎么适应新生活？", "看到别人过得好，心里总是嫉妒怎么办？", "总是担心未来发生不好的事，怎么缓解焦虑？",
    "感觉孤独寂寞，没人说话怎么办？", "最近总是爱发脾气，控制不住自己？", "想起以前的遗憾，总是释怀不了？",
    "感觉被社会抛弃了，跟不上时代怎么办？", "老伴去世了，一个人怎么走出悲伤？", "总是失眠多梦，担心身体出问题？",
    "感觉子女不孝顺，心里很委屈？", "害怕生病拖累子女，心理压力大？", "怎么培养一个能寄托精神的爱好？",
    "感觉生活没有目标，每天混日子？", "总是怀疑自己得了大病，疑神疑鬼？", "怎么面对衰老带来的容貌焦虑？",
    "和朋友闹矛盾了，心里堵得慌？", "感觉记忆力衰退，担心自己变傻？", "怎么保持年轻积极的心态？",
    "遇到不顺心的事，怎么快速调整过来？", "总是回忆过去，沉浸在回忆里出不来？", "怎么让自己的晚年生活更有意义？"
  ]
};

export default function App() {
  const [step, setStep] = useState<AppStep>('landing');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [selectedTheme, setSelectedTheme] = useState<LifeTheme | null>(null);
  const [recommendedQuestions, setRecommendedQuestions] = useState<RecommendedQuestion[]>([]);
  const [userInput, setUserInput] = useState('');
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  const [memory, setMemory] = useState<UserMemory>(MemoryService.getMemory());

  const [questionPage, setQuestionPage] = useState(0);
  const [isPaid, setIsPaid] = useState(false);
  const { isListening, transcript, startListening, stopListening, isSpeaking, speak, stopSpeaking } = useSpeech();

  useEffect(() => {
    if (transcript && step === 'input') {
      setUserInput(prev => prev ? prev + ' ' + transcript : transcript);
    }
  }, [transcript, step]);

  // Input persistence
  useEffect(() => {
    const draft = localStorage.getItem('user_input_draft');
    if (draft && !userInput && step === 'input') {
      setUserInput(draft);
    }
  }, [step]);

  useEffect(() => {
    if (userInput) {
      localStorage.setItem('user_input_draft', userInput);
    }
  }, [userInput]);



  const handleProfileComplete = (newProfile: UserProfile) => {
    setProfile(newProfile);
    setStep('theme');
  };

  const handleThemeSelect = async (themeId: LifeTheme) => {
    const themeObj = THEMES.find(t => t.id === themeId);
    setSelectedTheme(themeId);
    setStep('questions');
    
    // Reset page to 0
    setQuestionPage(0);
    
    // Load first batch from local preset
    const presetPool = PRESET_QUESTIONS[themeId] || [];
    const firstBatch = presetPool.slice(0, 6);
    
    if (firstBatch.length > 0) {
      setRecommendedQuestions(firstBatch.map((q, i) => ({
        id: `preset-${i}`,
        text: q,
        category: '猜你想问'
      })));
    }
  };

  const loadPersonalizedQuestions = async (themeId: LifeTheme) => {
    // Deprecated: Using local presets instead
  };

  const handleRefreshQuestions = async () => {
    if (selectedTheme) {
      setIsLoadingQuestions(true);
      
      // Simulate loading delay for better UX
      await new Promise(resolve => setTimeout(resolve, 600));
      
      const presetPool = PRESET_QUESTIONS[selectedTheme] || [];
      const nextPage = (questionPage + 1) % 4; // 4 pages of 6 questions = 24 total
      setQuestionPage(nextPage);
      
      const startIdx = nextPage * 6;
      const endIdx = startIdx + 6;
      const nextBatch = presetPool.slice(startIdx, endIdx);
      
      setRecommendedQuestions(nextBatch.map((q, i) => ({
        id: `preset-${nextPage}-${i}`,
        text: q,
        category: '猜你想问'
      })));
      
      setIsLoadingQuestions(false);
    }
  };

  const handleQuestionSelect = (question: string) => {
    setUserInput(question);
    setStep('input');
  };

  const handleStartSimulation = async () => {
    if (!selectedTheme || !userInput.trim() || !profile) return;
    
    setStep('loading');
    setError(null);
    
    // Set a safety timeout to inform user if it's taking too long
    const timeoutId = setTimeout(() => {
      console.warn("Simulation is taking longer than expected...");
    }, 15000);

    const performRequest = async (attempt: number): Promise<void> => {
      try {
        const themeLabel = THEMES.find(t => t.id === selectedTheme)?.label || selectedTheme;
        // Note: memory is accessed internally by generateLifeSimulation via MemoryService
        const data = await generateLifeSimulation(themeLabel, userInput, profile);
        
        if (!data || !data.advice) {
          throw new Error("AI 返回的数据格式不完整");
        }

        setResult(data);
        
        // Update long-term memory
        if (data.memoryUpdate) {
          const psychRisk = data.advice.risks?.find(r => r.type === 'psychology');
          MemoryService.updateFromSession(
            data.memoryUpdate.newTags || [],
            data.memoryUpdate.anxietyPoints || [],
            psychRisk?.score
          );
          setMemory(MemoryService.getMemory());
        }
        
        setStep('result');
        localStorage.removeItem('user_input_draft');
      } catch (err: any) {
        // Retry once if error occurs
        if (attempt < 1) {
          console.log(`Simulation attempt ${attempt + 1} failed, retrying...`);
          await new Promise(resolve => setTimeout(resolve, 1500));
          return performRequest(attempt + 1);
        }
        throw err;
      }
    };

    try {
      await performRequest(0);
    } catch (err: any) {
      console.error("Simulation error:", err);
      const isNetworkError = err.message?.includes("Rpc failed") || err.message?.includes("xhr error") || err.message?.includes("fetch");
      const isParseError = err instanceof SyntaxError || err.message?.includes("JSON");
      
      let errorMessage = '建议生成失败，请稍后重试。';
      if (isNetworkError) errorMessage = '网络连接不稳定，请检查网络后重试。';
      else if (isParseError) errorMessage = 'AI 思考过程中出现了逻辑波动，请尝试简化描述后重试。';
      else if (err.message) errorMessage = err.message;
      
      setError(errorMessage);
      setStep('input');
    } finally {
      clearTimeout(timeoutId);
    }
  };

  const reset = () => {
    setStep('landing');
    setProfile(null);
    setSelectedTheme(null);
    setUserInput('');
    setResult(null);
    setError(null);
    setRecommendedQuestions([]);
    setIsPaid(false);
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB] text-slate-900 font-sans selection:bg-emerald-100 mesh-bg relative">
      {/* Decorative Background Blobs */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/5 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/5 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/60 backdrop-blur-xl border-b border-slate-200/50">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={reset}>
            <DynamicLogo theme={selectedTheme} size="sm" />
            <span className="font-semibold text-lg tracking-tight">家庭守护 AI 顾问</span>
          </div>
          <div className="flex items-center gap-4">
            {step !== 'landing' && (
              <button 
                onClick={reset}
                className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" />
                重新开始
              </button>
            )}
            {/* Auth Buttons Removed as requested */}
          </div>
        </div>
      </header>

      <main className="pt-28 pb-20 px-6 max-w-5xl mx-auto min-h-screen">
        <AnimatePresence mode="wait">
          {step === 'landing' && (
            <motion.div 
              key="landing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center space-y-16 animate-in fade-in slide-in-from-bottom-8 duration-1000"
            >
              <div className="space-y-8 relative">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-400/10 rounded-full blur-[120px] -z-10" />
                
                <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/50 border border-slate-200 shadow-sm backdrop-blur-md mb-8 hover:scale-105 transition-transform cursor-default">
                  <Sparkles className="w-5 h-5 text-emerald-500 animate-pulse" />
                  <span className="text-sm font-semibold text-slate-600 tracking-wide">专为 30+ 人群打造的家庭 AI 顾问</span>
                </div>
                
                <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-slate-900 leading-[1.1]">
                  用 <span className="text-transparent bg-clip-text bg-gradient-to-br from-emerald-600 to-teal-500 animate-gradient-x">AI 智慧</span><br />
                  守护您的<span className="relative whitespace-nowrap">
                    <span className="relative z-10">家庭幸福</span>
                    <span className="absolute bottom-2 left-0 w-full h-4 bg-emerald-200/50 -z-10 -rotate-1"></span>
                  </span>
                </h1>
                
                {/* Social Proof Badge - RESTORED & ENHANCED */}
                <div className="flex items-center justify-center gap-4 animate-in fade-in zoom-in duration-700 delay-200">
                  <div className="flex -space-x-4 hover:space-x-1 transition-all duration-300">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="w-10 h-10 rounded-full border-[3px] border-white bg-slate-100 overflow-hidden shadow-lg hover:scale-110 hover:z-10 transition-all relative group cursor-help">
                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i * 888}&backgroundColor=b6e3f4`} alt="User" className="w-full h-full" />
                      </div>
                    ))}
                    <div className="w-10 h-10 rounded-full border-[3px] border-white bg-slate-900 text-white flex items-center justify-center text-[10px] font-bold shadow-lg z-10">
                      +1w
                    </div>
                  </div>
                  <div className="text-left space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <div className="flex text-amber-400">
                        {[1,2,3,4,5].map(i => <svg key={i} className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>)}
                      </div>
                      <span className="text-slate-900 font-bold text-sm">4.9/5.0</span>
                    </div>
                    <p className="text-xs text-slate-500 font-medium">已为 <span className="text-emerald-600 font-bold">12,508</span> 个家庭提供咨询</p>
                  </div>
                </div>

                <p className="text-xl md:text-2xl text-slate-500 max-w-2xl mx-auto leading-relaxed font-medium">
                  不仅仅是聊天，更是您身边的数字家庭医生。<br/>
                  <span className="text-slate-400 text-lg mt-2 block">深度解析 • 风险预警 • 情感共鸣</span>
                </p>
              </div>

              <MarqueeQuestions />

              <button
                onClick={() => setStep('profile')}
                className="group relative px-12 py-5 bg-slate-900 text-white rounded-2xl font-medium text-lg overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-slate-900/20"
              >
                <div className="relative z-10 flex items-center gap-3">
                  立即开启咨询
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>

              <div className="flex items-center justify-center gap-8 text-slate-400 grayscale opacity-60">
                <span className="text-xs font-medium tracking-widest uppercase">线下扫码体验版</span>
                <div className="h-4 w-px bg-slate-200" />
                <span className="text-xs font-medium tracking-widest uppercase">专业级 AI 引擎</span>
              </div>
            </motion.div>
          )}

          {step === 'payment' && (
            <motion.div 
              key="payment"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-md mx-auto glass-card rounded-[3rem] overflow-hidden border-white/40"
            >
              <div className="p-10 bg-gradient-to-b from-slate-50/50 to-white/50 border-b border-slate-100 text-center space-y-3">
                <h3 className="text-2xl font-black tracking-tight">解锁完整报告</h3>
                <p className="text-sm text-slate-500 font-medium">获取结构化深度建议 + 3次追问权限</p>
              </div>
              <div className="p-10 space-y-8">
                <div className="p-8 bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent rounded-[2rem] border-2 border-emerald-500/30 relative group transition-all hover:shadow-xl hover:shadow-emerald-500/10">
                  <div className="absolute -top-3 right-6 bg-emerald-500 text-white text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20">限时优惠</div>
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h4 className="font-black text-xl tracking-tight">深度咨询版</h4>
                      <p className="text-xs text-emerald-600 font-bold mt-1">AI 专家级分析</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-baseline justify-end gap-1">
                        <span className="text-sm font-bold">¥</span>
                        <span className="text-3xl font-black">9.9</span>
                      </div>
                      <p className="text-[10px] text-slate-400 line-through font-medium">¥19.9</p>
                    </div>
                  </div>
                  <ul className="space-y-3">
                    {['个性化行动清单', '心理风险预警', '家庭沟通话术'].map((item, i) => (
                      <li key={i} className="flex items-center gap-3 text-sm text-slate-700 font-medium">
                        <div className="p-1 bg-emerald-500/20 rounded-full">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        </div>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={() => {
                    setIsPaid(true);
                    setStep('result');
                  }}
                  className="w-full py-5 bg-emerald-600 text-white rounded-2xl font-black text-lg flex items-center justify-center gap-3 hover:bg-emerald-500 transition-all shadow-xl shadow-emerald-600/20 active:scale-[0.98]"
                >
                  确认支付并查看
                  <CreditCard className="w-6 h-6" />
                </button>
                
                <p className="text-[10px] text-center text-slate-400 leading-relaxed font-medium">
                  支付即代表同意《用户协议》与《隐私政策》<br />
                  本服务为 AI 生成建议，不作为专业医疗/法律决策依据
                </p>
              </div>
            </motion.div>
          )}

          {step === 'profile' && (
            <motion.div 
              key="profile"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-2xl mx-auto"
            >
              <div className="mb-10 space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 text-blue-500 rounded-full text-[10px] font-black uppercase tracking-[0.3em] border border-blue-500/20">
                  <UserCircle className="w-3 h-3" />
                  <span>STEP_01 // 快速画像</span>
                </div>
                <h2 className="text-4xl font-black tracking-tight">让我们更懂你</h2>
                <p className="text-slate-500 text-lg font-medium">只需 30 秒，让我们了解你的处境，提供更精准的建议。</p>
              </div>
              <ProfilingForm onComplete={handleProfileComplete} />
            </motion.div>
          )}

          {step === 'theme' && (
            <motion.div 
              key="theme"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-12"
            >
              <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-full h-64 bg-emerald-500/5 blur-[120px] rounded-full -z-10" />
              
              <div className="text-center space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-[10px] font-black uppercase tracking-[0.3em] border border-emerald-500/20">
                  <Compass className="w-3 h-3" />
                  <span>咨询领域选择</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
                  你想聊聊哪个话题？
                </h2>
                <p className="text-lg text-slate-500 max-w-2xl mx-auto font-medium">
                  选择一个你当前最关心的领域，我们将为你生成专属建议。
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {THEMES.map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => handleThemeSelect(theme.id)}
                    className={`group relative p-10 rounded-[3rem] border-2 transition-all duration-500 text-left space-y-6 hover:shadow-2xl hover:-translate-y-2 ${theme.color} border-transparent hover:border-current/20 bg-white/80 backdrop-blur-md overflow-hidden`}
                  >
                    <div className="absolute top-0 right-0 p-8 opacity-[0.05] group-hover:scale-150 transition-transform duration-1000 group-hover:rotate-12">
                      <div className="w-40 h-40 [&_svg]:w-full [&_svg]:h-full">
                        {theme.icon}
                      </div>
                    </div>
                    <div className={`p-6 rounded-[1.5rem] ${theme.color} w-fit group-hover:scale-110 transition-transform shadow-xl shadow-current/10 border border-current/5`}>
                      {theme.icon}
                    </div>
                    <div className="space-y-3 relative z-10">
                      <h3 className="font-black text-2xl tracking-tight">{theme.label}</h3>
                      <p className="text-sm opacity-70 leading-relaxed font-bold">{theme.description}</p>
                    </div>
                    <div className="pt-6 flex items-center gap-3 text-xs font-black uppercase tracking-[0.2em] opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                      <span>开启深度扫描</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 'questions' && (
            <motion.div 
              key="questions"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="max-w-4xl mx-auto space-y-12 relative"
            >
              <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-full h-[500px] bg-blue-500/5 blur-[150px] rounded-full -z-10" />

              <div className="text-center space-y-6">
                <div className="flex items-center justify-center gap-4">
                  <div className={`p-3 rounded-2xl ${THEMES.find(t => t.id === selectedTheme)?.color} shadow-lg shadow-current/5`}>
                    {THEMES.find(t => t.id === selectedTheme)?.icon}
                  </div>
                  <span className="text-sm font-black uppercase tracking-[0.4em] text-slate-400">
                    {THEMES.find(t => t.id === selectedTheme)?.label}
                  </span>
                </div>
                <h2 className="text-5xl font-black text-slate-900 tracking-tight">深度洞察 · 猜你想问</h2>
                <div className="max-w-2xl mx-auto space-y-4">
                  <p className="text-xl text-slate-600 font-medium leading-relaxed">
                    基于您的<span className="text-emerald-600 font-bold mx-1">个人画像</span>与<span className="text-emerald-600 font-bold mx-1">当前生活阶段</span>，AI 专家系统为您梳理了以下高频核心议题。
                  </p>
                  <p className="text-sm text-slate-400 font-medium uppercase tracking-widest border-t border-slate-100 pt-4 w-fit mx-auto">
                    请点击最贴切的一项，开启专家级深度咨询
                  </p>
                </div>
              </div>

              {recommendedQuestions.length > 0 ? (
                <div className="glass-card p-2 rounded-[3.5rem] relative">
                  <QuestionRecommender 
                    questions={recommendedQuestions} 
                    onSelect={handleQuestionSelect}
                    onCustom={() => setStep('input')}
                    onRefresh={handleRefreshQuestions}
                    isLoading={isLoadingQuestions}
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-32 space-y-10 glass-card rounded-[4rem] border-white/40">
                  <div className="relative">
                    <div className="absolute inset-0 bg-emerald-500/30 blur-2xl rounded-full animate-pulse" />
                    <Loader2 className="w-16 h-16 text-emerald-600 animate-spin relative z-10" />
                  </div>
                  <div className="space-y-3 text-center">
                    <p className="text-slate-900 font-black uppercase tracking-[0.3em] text-sm">正在同步 AI 深度模型</p>
                    <p className="text-slate-400 text-xs font-mono">MATCHING_PERSONALIZED_INSIGHTS...</p>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {step === 'input' && (
            <motion.div 
              key="input"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-3xl mx-auto space-y-10"
            >
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-emerald-600 font-black uppercase tracking-[0.2em] text-xs">
                  <div className={`p-2 rounded-xl ${THEMES.find(t => t.id === selectedTheme)?.color}`}>
                    {THEMES.find(t => t.id === selectedTheme)?.icon}
                  </div>
                  <span>{THEMES.find(t => t.id === selectedTheme)?.label}</span>
                </div>
                <h2 className="text-4xl font-black tracking-tight">进一步描述你的困扰</h2>
                <p className="text-slate-500 text-lg font-medium">
                  你可以直接使用刚才选中的问题，也可以补充更多细节，让建议更贴合你的实际情况。
                </p>
              </div>

              <div className="relative glass-card p-2 rounded-[3rem]">
                <textarea
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder="在这里输入你的想法，或点击麦克风直接说话..."
                  className="w-full h-64 p-10 rounded-[2.5rem] border border-slate-100 bg-white/50 focus:ring-8 focus:ring-emerald-500/5 focus:border-emerald-500 outline-none transition-all resize-none text-xl leading-relaxed shadow-inner placeholder:text-slate-300"
                />
                <div className="absolute bottom-10 left-10 flex items-center gap-4">
                  <button
                    onClick={isListening ? stopListening : startListening}
                    className={`p-4 rounded-2xl transition-all shadow-xl flex items-center gap-2 ${
                      isListening 
                        ? 'bg-rose-500 text-white animate-pulse' 
                        : 'bg-white text-slate-500 hover:text-emerald-600 hover:bg-emerald-50'
                    }`}
                  >
                    {isListening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                    <span className="text-xs font-bold uppercase tracking-wider hidden sm:block">
                      {isListening ? '点击停止' : '语音输入'}
                    </span>
                  </button>
                </div>
                <div className="absolute bottom-10 right-10 flex items-center gap-4">
                  <div className="px-4 py-2 bg-slate-50 rounded-full text-xs text-slate-400 font-mono border border-slate-100">
                    {userInput.length} 字
                  </div>
                  <button 
                    onClick={handleStartSimulation}
                    disabled={!userInput.trim()}
                    className="p-4 bg-slate-900 text-white rounded-2xl hover:bg-emerald-600 transition-all shadow-xl disabled:opacity-50 disabled:hover:bg-slate-900 group"
                  >
                    <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>

              {/* High Risk Keyword Warning */}
              {(userInput.includes("离婚") || userInput.includes("财产") || userInput.includes("欠债")) && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-amber-50 text-amber-700 rounded-xl text-sm border border-amber-100 flex items-start gap-3"
                >
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">法律与财务风险提示：</span>
                    <p className="mt-1 opacity-90">检测到您咨询的内容涉及复杂的法律或财务问题。AI 建议仅供参考，建议您在必要时咨询专业律师或理财顾问。</p>
                  </div>
                </motion.div>
              )}
              
              {(userInput.includes("病") || userInput.includes("疼") || userInput.includes("痛") || userInput.includes("药")) && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-rose-50 text-rose-700 rounded-xl text-sm border border-rose-100 flex items-start gap-3"
                >
                  <Activity className="w-5 h-5 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">健康医疗风险提示：</span>
                    <p className="mt-1 opacity-90">检测到您咨询的内容涉及身体健康问题。AI 无法替代线下诊疗，如遇身体不适请及时就医。</p>
                  </div>
                </motion.div>
              )}

              {error && (
                <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}

              <div className="flex items-center justify-center gap-4 text-slate-400 text-xs font-bold uppercase tracking-widest">
                <ShieldCheck className="w-4 h-4" />
                <span>您的隐私受到银行级加密保护</span>
              </div>
            </motion.div>
          )}

          {step === 'loading' && (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <ThemedLoading theme={selectedTheme} />
            </motion.div>
          )}

          {step === 'result' && result && (
            <motion.div 
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-12"
            >
              <StructuredResult 
                result={result} 
                onReset={reset} 
                theme={selectedTheme} 
                stressHistory={memory.stressHistory}
                isPaid={isPaid}
                onUnlock={() => setStep('payment')}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="py-16 border-t border-slate-100 bg-white">
        <div className="max-w-5xl mx-auto px-6 text-center space-y-12">
          {/* Unified Feature Cell */}
          <div className="glass-card rounded-[2.5rem] overflow-hidden border-slate-200/60 shadow-xl shadow-slate-200/20">
            <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-slate-100">
              {[
                { icon: <Brain className="w-5 h-5 text-emerald-500" />, title: "深度思维", desc: "多维分析" },
                { icon: <ShieldCheck className="w-5 h-5 text-blue-500" />, title: "隐私加密", desc: "安全保障" },
                { icon: <HeartHandshake className="w-5 h-5 text-rose-500" />, title: "情感陪伴", desc: "情绪理解" },
                { icon: <AlertCircle className="w-5 h-5 text-amber-500" />, title: "免责说明", desc: "建议仅供参考" }
              ].map((item, i) => (
                <div key={i} className="p-10 group hover:bg-slate-50/50 transition-colors text-center relative overflow-hidden flex flex-col items-center justify-center">
                  <div className="relative z-10 space-y-4 flex flex-col items-center">
                    <div className="p-3 bg-white rounded-2xl w-fit shadow-sm group-hover:scale-110 transition-transform border border-slate-50 [&_svg]:w-6 [&_svg]:h-6">{item.icon}</div>
                    <div>
                      <h3 className="font-bold text-lg text-slate-900 tracking-tight">{item.title}</h3>
                      <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1 opacity-70">{item.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6 pt-4">
            <div className="flex items-center justify-center gap-3 text-slate-300">
              <ShieldAlert className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-[0.2em]">家庭守护 AI 顾问</span>
            </div>
            <div className="max-w-2xl mx-auto text-[10px] text-slate-400 leading-relaxed space-y-2">
              <p>免责声明：本系统提供的所有建议均为 AI 生成，仅供参考。不构成任何医疗诊断、法律意见或投资建议。如遇紧急情况或涉及专业决策，请务必咨询相关领域的持证专业人士。</p>
              <p>© 2026 家庭守护 AI 顾问 · 线下扫码体验版</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
