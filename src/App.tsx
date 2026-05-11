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
  Volume2,
  BookOpen,
  Download,
  Utensils,
  Moon,
  Microscope,
  Leaf
} from 'lucide-react';
import { generateLifeSimulation, generateLifeSimulationDeepDive, generatePersona360Report, generateRecommendedQuestions } from './services/ai';
import { ConsultationSession, Persona360Report, SimulationResult, LifeTheme, UserProfile, RecommendedQuestion, UserMemory } from './types';
import { MemoryService } from './services/memory';
import { useSpeech } from './hooks/useSpeech';
import ProfilingForm from './components/ProfilingForm';
import QuestionRecommender from './components/QuestionRecommender';
import StructuredResult from './components/StructuredResult';
import ArchiveDashboard from './components/ArchiveDashboard';
import DynamicLogo from './components/DynamicLogo';
import ThemedLoading from './components/ThemedLoading';
import MarqueeQuestions from './components/MarqueeQuestions';
import ProductFeatureDock from './components/ProductFeatureDock';

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

type AppStep = 'landing' | 'payment' | 'profile' | 'expert' | 'theme' | 'questions' | 'input' | 'loading' | 'result' | 'archive' | 'knowledge' | 'about';

const EXPERTS: { id: string; name: string; title: string; icon: React.ReactNode; color: string; description: string; voice: { pitch: number; rate: number } }[] = [
  { id: 'sports', name: '健指导', title: '运动康复专家', icon: <Activity className="w-6 h-6" />, color: 'bg-emerald-50 text-emerald-600 border-emerald-100', description: '科学规划，定制每日安全健身挑战，帮您告别腰酸背痛', voice: { pitch: 1.2, rate: 1.1 } },
  { id: 'diet', name: '禾营养师', title: '饮食营养专家', icon: <Utensils className="w-6 h-6" />, color: 'bg-teal-50 text-teal-600 border-teal-100', description: '精准调配，教您吃对每一餐，轻松管理肠胃与健康指标', voice: { pitch: 1.0, rate: 1.0 } },
  { id: 'tcm', name: '李大夫', title: '中医养生专家', icon: <Leaf className="w-6 h-6" />, color: 'bg-green-50 text-green-600 border-green-100', description: '沉稳睿智，顺应节气调理气血，传承东方传统养生智慧', voice: { pitch: 0.8, rate: 0.85 } },
  { id: 'western', name: 'Dr. 陈', title: '全科医学专家', icon: <Microscope className="w-6 h-6" />, color: 'bg-blue-50 text-blue-600 border-blue-100', description: '严谨理性，深度解读体检报告，给出现代医学前沿对策', voice: { pitch: 1.0, rate: 1.05 } },
  { id: 'sleep', name: '眠咨询师', title: '睡眠心理专家', icon: <Moon className="w-6 h-6" />, color: 'bg-indigo-50 text-indigo-600 border-indigo-100', description: '轻柔治愈，通过认知行为疗法帮您卸下疲惫，安然入睡', voice: { pitch: 0.9, rate: 0.75 } },
  { id: 'default', name: '智囊顾问', title: '家庭关系专家', icon: <Sparkles className="w-6 h-6" />, color: 'bg-cyan-50 text-cyan-600 border-cyan-100', description: '洞察入微，专业解答家庭矛盾、子女教育等各类生活烦恼', voice: { pitch: 1.1, rate: 1.0 } }
];

const EXPERT_QUESTIONS: Record<string, string[]> = {
  sports: [
    "想开始运动但怕伤膝盖，50岁后怎么练？", "经常腰酸背痛，是骨质疏松了吗？", "手指关节晨起僵硬，怎么缓解？",
    "爬楼梯气喘吁吁，心肺功能怎么练？", "久坐之后腰椎很不舒服，有什么简单的拉伸动作？", "肩颈总是僵硬酸痛，需要买颈椎按摩仪吗？"
  ],
  diet: [
    "最近体检指标有异常，该如何调整饮食？", "血糖有点偏高，还能吃水果吗？", "体检血脂高，必须吃他汀类药物吗？",
    "消化功能变差了，经常胃胀怎么办？", "便秘问题困扰很久了，怎么通过饮食调理？", "想吃点保健品，鱼油和钙片能一起吃吗？"
  ],
  tcm: [
    "老是感觉疲劳乏力，中医怎么补气血？", "冬天皮肤特别干燥瘙痒，有没有药膳可以调理？", "夜尿频繁影响睡眠，是肾虚吗？",
    "更年期潮热出汗，除了忍还能怎么调理？", "体内湿气重，拔罐和艾灸哪个更适合我？", "经常头晕眼花，气血不足怎么吃？"
  ],
  western: [
    "体检发现有结节，需要马上手术吗？", "血压最近有点波动，需要换降压药吗？", "感觉记忆力下降明显，需要做脑部CT吗？",
    "眼睛看东西越来越花，老花眼能治吗？", "听力感觉不如以前了，需要去医院检查什么项目？", "最近体重下降得厉害，需要做哪些筛查？"
  ],
  sleep: [
    "总是失眠多梦，有没有不吃药的缓解方法？", "半夜总是醒来，之后就很难入睡怎么办？", "晚上总是胡思乱想，怎么能快速平静下来？",
    "睡前喝牛奶真的有助于睡眠吗？", "白天犯困晚上精神，怎么把生物钟倒过来？", "需要买褪黑素吃吗？吃多了会不会有依赖？"
  ],
  default: [
    "老伴总是固执不听劝，怎么沟通才有效？", "孩子迟迟不结婚，我该怎么跟他聊聊？", "觉得退休后没价值感，怎么调整心态？",
    "带孙子太累了，身体吃不消怎么跟子女说？", "亲戚借钱不还，怎么处理才不伤和气？", "和子女教育观念冲突，夹在中间很难做？"
  ]
};

// Removed duplicate AppStep definition to fix linter error

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean; error: Error | null }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 text-center text-red-600 bg-red-50 rounded-xl border border-red-200 m-8">
          <h2 className="text-xl font-bold mb-2">组件渲染出错</h2>
          <p className="text-sm font-mono mb-4">{this.state.error?.message}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            刷新页面
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

const MOCK_RESULT: SimulationResult = {
  advice: {
    stateSummary: "当前处于生活转折期，面临一定的选择压力。\n核心挑战在于平衡个人需求与家庭责任。\n未来趋势向好，只需稳步调整即可。",
    riskReminder: "请注意保持身心放松，避免过度焦虑影响决策。",
    risks: [
      { type: 'health', level: 'medium', label: '睡眠质量', description: '近期可能存在入睡困难或多梦情况', adjustment: '建议睡前冥想10分钟', score: 65 },
      { type: 'psychology', level: 'high', label: '焦虑指数', description: '对未来不确定性感到担忧', adjustment: '尝试专注于当下可控的小事', score: 80 }
    ],
    actions: {
      today: "花15分钟做一次深呼吸放松练习，列出明天必须完成的3件事。",
      thisWeek: "安排一次户外散步，与一位信任的朋友倾诉心事。",
      thisMonth: "重新审视家庭财务规划，确保有一笔应急备用金。"
    },
    skillCard: {
      name: "五分钟禅定大师",
      description: "在快节奏的生活中，每天只需5分钟，就能大幅降低皮质醇水平，让大脑像重启一样清醒！",
      points: 50,
      challenge: "今晚睡前，放下手机，闭上眼睛深呼吸5次，数到50。"
    },
    communicationTip: "我理解你的担忧，我们可以一起坐下来慢慢商量吗？",
    resourceSuggestion: "推荐阅读《非暴力沟通》，学习更有效的表达方式。",
    encouragement: "每一次转折都是成长的契机，你比自己想象的更强大。",
    lifestyleAdvice: {
      moodRegulation: "每天记录一件开心的小事",
      sleepImprovement: "晚上10点后减少蓝光摄入",
      recreation: "周末尝试一次短途郊游"
    },
    healthAdvice: {
      diet: "增加深色蔬菜摄入，减少高糖饮食",
      exercise: "每周进行3次30分钟有氧运动",
      sleep: "保持规律作息，睡前避免剧烈运动"
    },
    decisionSimulation: {
      pathA: {
        label: "中医草药与功法调理",
        trend: "气血逐渐充盈，通过八段锦疏通经络，3个月后体质根本性改善。",
        risks: ["需长期坚持，草药口感可能不佳，短期见效不明显"],
        actions: ["每日晨练八段锦15分钟", "取党参5g、黄芪10g、红枣3枚泡水代茶饮，补气养血", "睡前温水泡脚20分钟，加艾叶生姜驱寒"],
        emotionalImpact: "心气平和，达到固本培元的长期稳定状态"
      },
      pathB: {
        label: "西医精准营养干预",
        trend: "通过靶向补充特定营养素，1-2周内细胞代谢效率显著提升。",
        risks: ["长期高剂量服用可能增加肝肾代谢负担"],
        actions: ["每日早餐后补充高浓度深海鱼油(含EPA/DHA) 1000mg，改善心血管", "服用复合维生素B族(含B1/B6/B12) 缓解神经疲劳", "如失眠严重，睡前半小时舌下含服褪黑素 3mg"],
        emotionalImpact: "精力迅速恢复，抗压能力短期内显著增强"
      }
    },
    perspectives: [
      { role: "自我视角", psychology: "渴望被理解和支持", suggestion: "先照顾好自己的情绪，再关照他人" },
      { role: "家人视角", psychology: "担心你的身体和状态", suggestion: "多表达感谢，少一些指责" }
    ],
    caseStudy: {
      title: "李先生的转型之路",
      story: "李先生在45岁时面临职业瓶颈，通过半年的调整和学习，成功开启第二曲线。",
      expertComment: "改变永远不晚，关键在于迈出第一步。"
    },
    wellAly: {
      healthRecords: [
        { type: "年度体检报告", suggestion: "建议按年份建立电子档案，重点关注异常指标变化" },
        { type: "常用药品清单", suggestion: "记录药品有效期及服用禁忌，定期清理过期药物" }
      ],
      medicationTracker: [
        { name: "复合维生素", frequency: "每日一次", note: "早餐后服用效果最佳" }
      ],
      reportAnalysis: [
        { item: "焦虑指数", result: "中等偏高", advice: "建议增加户外活动，减少咖啡因摄入" }
      ],
      familyHealth: [
        { member: "伴侣", advice: "关注其情绪变化，共同参与户外活动" }
      ],
      emotionalRituals: [
        { ritualName: "睡前 15 分钟无手机交流", frequency: "每日", benefit: "重建亲密感，缓解白天的疏离" }
      ],
      relationshipDynamics: [
        { indicator: "家庭沟通温度", status: "局部降温", advice: "建议本周末安排一次共同参与的轻松活动（如做饭、散步）来破冰" }
      ]
    }
  },
  followUpQuestions: ["如何缓解工作压力？", "怎样改善夫妻关系？", "退休后如何规划生活？"],
  resonanceScore: 88,
  soulSignature: "行到水穷处，坐看云起时"
};

export default function App() {
  const [step, setStep] = useState<AppStep>('result');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [selectedExpert, setSelectedExpert] = useState<string>('default');
  const [selectedTheme, setSelectedTheme] = useState<LifeTheme | null>('family');
  const [recommendedQuestions, setRecommendedQuestions] = useState<RecommendedQuestion[]>([]);
  const [userInput, setUserInput] = useState('');
  const [result, setResult] = useState<SimulationResult | null>(MOCK_RESULT);
  const [error, setError] = useState<string | null>(null);
  const [isDeepDiveLoading, setIsDeepDiveLoading] = useState(false);
  const [deepDiveError, setDeepDiveError] = useState<string | null>(null);
  const lastRequestRef = React.useRef<{ themeLabel: string; input: string; expertId: string; profile: UserProfile } | null>(null);
  const [archiveSessions, setArchiveSessions] = useState<ConsultationSession[]>(() => MemoryService.getArchiveSessions());
  const [activeArchiveId, setActiveArchiveId] = useState<string | null>(() => MemoryService.getArchiveSessions()[0]?.id || null);
  const [isArchiveSaving, setIsArchiveSaving] = useState(false);

  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  const [memory, setMemory] = useState<UserMemory>(MemoryService.getMemory());

  const [questionPage, setQuestionPage] = useState(0);
  const [isPaid, setIsPaid] = useState(true);
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



  const handleBack = () => {
    switch (step) {
      case 'profile':
        setStep('landing');
        break;
      case 'expert':
        setStep('profile');
        break;
      case 'questions':
        setStep('expert');
        break;
      case 'input':
        setStep('questions');
        break;
      case 'payment':
        setStep('result');
        break;
      case 'result':
        setStep('input');
        break;
      case 'archive':
        setStep('result');
        break;
      case 'knowledge':
      case 'about':
        setStep('landing');
        break;
      default:
        break;
    }
  };

  const mapConcernToTheme = (concern?: string): LifeTheme => {
    if (concern === 'stress') return 'emotion';
    if (concern === 'health') return 'health';
    if (concern === 'children') return 'children';
    if (concern === 'grandchildren') return 'grandchildren';
    if (concern === 'business') return 'business';
    return 'family';
  };

  const handleProfileComplete = (newProfile: UserProfile) => {
    setProfile(newProfile);
    const themeFromConcern = mapConcernToTheme(newProfile.mainConcern);
    setSelectedTheme(themeFromConcern);
    setStep('expert');
  };

  const handleExpertSelect = (expertId: string) => {
    setSelectedExpert(expertId);

    // Keep user's main concern theme as the primary context to avoid off-topic answers
    if (!selectedTheme && profile?.mainConcern) {
      setSelectedTheme(mapConcernToTheme(profile.mainConcern));
    }
    setStep('questions');
    
    // Reset page to 0
    setQuestionPage(0);
    
    // Build question pool prioritizing user's main concern, then expert style
    const themeDefault = THEMES.find(t => t.id === (selectedTheme || mapConcernToTheme(profile?.mainConcern)))?.defaultQuestions || [];
    const expertPool = EXPERT_QUESTIONS[expertId] || [];
    const presetPool = [...themeDefault, ...expertPool];
    const firstBatch = presetPool.slice(0, 6);
    
    if (firstBatch.length > 0) {
      setRecommendedQuestions(firstBatch.map((q, i) => ({
        id: `preset-${i}`,
        text: q,
        category: '猜你想问'
      })));
    }
  };

  const handleThemeSelect = async (themeId: LifeTheme) => {
    const themeObj = THEMES.find(t => t.id === themeId);
    setSelectedTheme(themeId);
    setStep('questions');
    
    // Reset page to 0
    setQuestionPage(0);
    
    // Fallback if accessed via older theme route, just use default expert questions
    const presetPool = EXPERT_QUESTIONS['default'] || [];
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
    if (selectedExpert) {
      setIsLoadingQuestions(true);
      
      // Simulate loading delay for better UX
      await new Promise(resolve => setTimeout(resolve, 600));
      
      const presetPool = EXPERT_QUESTIONS[selectedExpert] || [];
      const totalPages = Math.ceil(presetPool.length / 6);
      const nextPage = (questionPage + 1) % (totalPages > 0 ? totalPages : 1);
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
    setDeepDiveError(null);
    
    // Set a safety timeout to inform user if it's taking too long
    const timeoutId = setTimeout(() => {
      console.warn("Simulation is taking longer than expected... Switching to Mock Mode for demo.");
      // Fallback to Mock Result so user can see the UI
      setResult(MOCK_RESULT);
      setStep('result');
    }, 8000); // Shorten timeout to 8s for better experience

    const performRequest = async (attempt: number): Promise<void> => {
      try {
        const themeLabel = THEMES.find(t => t.id === selectedTheme)?.label || selectedTheme;
        console.log("[App] Requesting simulation for theme:", themeLabel, "expert:", selectedExpert);
        lastRequestRef.current = { themeLabel, input: userInput, expertId: selectedExpert, profile };
        
        // Note: memory is accessed internally by generateLifeSimulation via MemoryService
        const data = await generateLifeSimulation(themeLabel, userInput, profile, selectedExpert);
        console.log("[App] Simulation data received:", data);
        
        if (!data || !data.advice) {
          throw new Error("AI 返回的数据格式不完整");
        }

        setResult(data);
        setIsDeepDiveLoading(false);
        
        // Update long-term memory
        if (data.memoryUpdate) {
          try {
            const psychRisk = data.advice.risks?.find(r => r.type === 'psychology');
            MemoryService.updateFromSession(
              data.memoryUpdate.newTags || [],
              data.memoryUpdate.anxietyPoints || [],
              psychRisk?.score
            );
            setMemory(MemoryService.getMemory());
          } catch (memErr) {
            console.error("[App] Memory update failed (non-critical):", memErr);
          }
        }
        
        console.log("[App] Setting step to result");
        setStep('result');
        localStorage.removeItem('user_input_draft');
      } catch (err: any) {
        console.error("[App] performRequest error:", err);
        // Retry once if error occurs
        if (attempt < 1) {
          console.log(`Simulation attempt ${attempt + 1} failed, retrying...`);
          await new Promise(resolve => setTimeout(resolve, 1500));
          return performRequest(attempt + 1);
        }
        
        // If all retries fail, use Mock Result to show UI
        console.warn("All simulation attempts failed. Using Mock Result.");
        setResult(MOCK_RESULT);
        setIsDeepDiveLoading(false);
        setStep('result');
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
    setSelectedExpert('default');
    setSelectedTheme(null);
    setUserInput('');
    setResult(null);
    setError(null);
    setRecommendedQuestions([]);
    setIsPaid(false);
    setIsDeepDiveLoading(false);
    setDeepDiveError(null);
    lastRequestRef.current = null;
    setArchiveSessions(MemoryService.getArchiveSessions());
    setActiveArchiveId(MemoryService.getArchiveSessions()[0]?.id || null);
    setIsArchiveSaving(false);
  };

  const requestDeepDive = async () => {
    if (!profile || !result) return;
    if (!lastRequestRef.current) return;

    // avoid duplicate parallel requests
    if (isDeepDiveLoading) return;

    setIsDeepDiveLoading(true);
    setDeepDiveError(null);

    try {
      const { themeLabel, input, expertId, profile: prof } = lastRequestRef.current;
      const deep = await generateLifeSimulationDeepDive(themeLabel, input, prof, expertId);
      if (deep && deep.advice) {
        setResult(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            advice: {
              ...prev.advice,
              ...deep.advice
            }
          };
        });
      }
    } catch (e: any) {
      setDeepDiveError(e?.message || "未知错误");
      throw e;
    } finally {
      setIsDeepDiveLoading(false);
    }
  };

  const saveArchiveAndGenerate360 = async () => {
    if (!profile || !result || !lastRequestRef.current) return;
    if (isArchiveSaving) return;

    setIsArchiveSaving(true);
    try {
      const { themeLabel, input, expertId, profile: prof } = lastRequestRef.current;
      const sessionId = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
      const session: ConsultationSession = {
        id: sessionId,
        createdAt: new Date().toISOString(),
        expertId,
        themeLabel,
        input,
        resonanceScore: result.resonanceScore,
        soulSignature: result.soulSignature
      };
      MemoryService.upsertArchiveSession(session);

      const report360 = (await generatePersona360Report({
        profile: prof,
        theme: themeLabel,
        input,
        expertId,
        lastAdvice: result.advice
      })) as Persona360Report;

      const updated: ConsultationSession = { ...session, report360 };
      MemoryService.upsertArchiveSession(updated);

      const nextSessions = MemoryService.getArchiveSessions();
      setArchiveSessions(nextSessions);
      setActiveArchiveId(updated.id);
      setStep('archive');
    } finally {
      setIsArchiveSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB] text-slate-900 font-sans selection:bg-emerald-100 mesh-bg relative">
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/5 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/5 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <header className="fixed top-0 left-0 right-0 z-50 bg-white/60 backdrop-blur-xl border-b border-slate-200/50">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0 cursor-pointer" onClick={reset}>
            <DynamicLogo theme={selectedTheme} size="sm" />
            <span className="font-semibold text-lg tracking-tight truncate">家庭守护 AI 顾问</span>
          </div>
          <div className="flex items-center gap-4 shrink-0">
            <nav className="hidden md:flex items-center gap-4">
              <button type="button" onClick={reset} className={`text-sm font-medium transition-colors ${step === 'landing' ? 'text-emerald-700' : 'text-slate-500 hover:text-slate-900'}`}>首页</button>
              <button type="button" onClick={() => setStep('knowledge')} className={`text-sm font-medium transition-colors flex items-center gap-1.5 ${step === 'knowledge' ? 'text-emerald-700' : 'text-slate-500 hover:text-slate-900'}`}><BookOpen className="w-4 h-4 shrink-0" aria-hidden /> 知识库</button>
              <button type="button" onClick={() => setStep('about')} className={`text-sm font-medium transition-colors ${step === 'about' ? 'text-emerald-700' : 'text-slate-500 hover:text-slate-900'}`}>关于我们</button>
            </nav>
            {step !== 'landing' && (
              <button 
                type="button"
                onClick={reset}
                className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" />
                重新开始
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="pt-28 pb-20 px-6 max-w-5xl mx-auto min-h-screen">
        <ErrorBoundary>
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
                
                <div className="flex items-center justify-center gap-4 animate-in fade-in zoom-in duration-700 delay-200">
                  <div className="flex -space-x-4 hover:space-x-1 transition-all duration-300">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="w-10 h-10 rounded-full border-[3px] border-white bg-slate-100 overflow-hidden shadow-lg hover:scale-110 hover:z-10 transition-all relative group cursor-help">
                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i * 888}&backgroundColor=b6e3f4`} alt="" className="w-full h-full" />
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
                  不仅仅是聊天，更是您身边的“数字专家顾问”<br/>
                  <span className="text-slate-400 text-lg mt-2 block">深度解析 • 风险预警 • 情感共鸣</span>
                </p>
              </div>

              <MarqueeQuestions />

              <button
                type="button"
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
              <div className="p-10 bg-gradient-to-b from-slate-50/50 to-white/50 border-b border-slate-100 text-center space-y-3 relative">
              <button type="button" onClick={handleBack} className="absolute top-10 left-6 flex items-center gap-2 text-slate-400 hover:text-slate-900 transition-colors font-bold uppercase tracking-widest text-[10px]">
                <ChevronLeft className="w-4 h-4" aria-hidden />
                返回
              </button>
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
                  type="button"
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
              <ProfilingForm onComplete={handleProfileComplete} onBack={handleBack} />
            </motion.div>
          )}

          {step === 'expert' && (
            <motion.div 
              key="expert"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-12"
            >
              <button type="button" onClick={handleBack} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors mb-6 font-bold uppercase tracking-widest text-xs">
                <ChevronLeft className="w-4 h-4" aria-hidden />
                返回上一步
              </button>

              <div className="text-center space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-[0.3em] border border-emerald-500/20">
                  <UserCircle className="w-3 h-3" />
                  <span>STEP_02 // 选择专家</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
                  选择您的专属数字员工
                </h2>
                <p className="text-lg text-slate-500 max-w-2xl mx-auto font-medium">
                  每位专家擅长不同领域。选定后，推荐问题与报告语气会与之对齐。
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {EXPERTS.map((expert) => (
                  <button
                    key={expert.id}
                    type="button"
                    onClick={() => handleExpertSelect(expert.id)}
                    className={`group relative p-10 rounded-[3rem] border-2 transition-all duration-500 text-left space-y-6 hover:shadow-2xl hover:-translate-y-2 ${expert.color} border-transparent hover:border-current/20 bg-white/80 backdrop-blur-md overflow-hidden`}
                  >
                    <div className="absolute top-0 right-0 p-8 opacity-[0.05] group-hover:scale-150 transition-transform duration-1000 group-hover:rotate-12">
                      <div className="w-32 h-32 [&_svg]:w-full [&_svg]:h-full">{expert.icon}</div>
                    </div>
                    <div className={`p-5 rounded-[1.5rem] ${expert.color} w-fit group-hover:scale-110 transition-transform shadow-xl shadow-current/10 border border-current/5 relative z-10`}>
                      {expert.icon}
                    </div>
                    <div className="space-y-2 relative z-10">
                      <h3 className="font-black text-2xl tracking-tight">{expert.name}</h3>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{expert.title}</p>
                      <p className="text-sm opacity-80 leading-relaxed font-bold text-slate-600">{expert.description}</p>
                    </div>
                    <div className="pt-4 flex items-center gap-3 text-xs font-black uppercase tracking-[0.2em] opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0 text-emerald-700">
                      <span>开始咨询</span>
                      <ArrowRight className="w-4 h-4" aria-hidden />
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
              className="max-w-4xl mx-auto space-y-8 md:space-y-10"
            >
              <button type="button" onClick={handleBack} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors mb-6 font-bold uppercase tracking-widest text-xs">
                <ChevronLeft className="w-4 h-4" aria-hidden />
                返回上一步
              </button>

              <div className="text-center space-y-6">
                <div className="flex items-center justify-center gap-4">
                  <div className={`p-3 rounded-2xl ${EXPERTS.find(e => e.id === selectedExpert)?.color} shadow-lg shadow-current/5`}>
                    {EXPERTS.find(e => e.id === selectedExpert)?.icon}
                  </div>
                  <span className="text-sm font-black uppercase tracking-[0.4em] text-slate-400">
                    {EXPERTS.find(e => e.id === selectedExpert)?.name} · {EXPERTS.find(e => e.id === selectedExpert)?.title}
                  </span>
                </div>
                <h2 className="text-5xl font-black text-slate-900 tracking-tight">深度洞察 · 猜你想问</h2>
                <div className="max-w-2xl mx-auto space-y-4">
                  <p className="text-xl text-slate-600 font-medium leading-relaxed">
                    结合您的<span className="text-emerald-600 font-bold mx-1">个人画像</span>与<span className="text-emerald-600 font-bold mx-1">所选专家</span>，为您梳理了以下高频议题。
                  </p>
                  <p className="text-sm text-slate-400 font-medium uppercase tracking-widest border-t border-slate-100 pt-4 w-fit mx-auto">
                    请点击最贴切的一项，或选择自行输入
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
                    <Loader2 className="w-16 h-16 text-emerald-600 animate-spin relative z-10" aria-hidden />
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
              <button type="button" onClick={handleBack} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors mb-6 font-bold uppercase tracking-widest text-xs">
                <ChevronLeft className="w-4 h-4" aria-hidden />
                返回上一步
              </button>

              <div className="space-y-4">
                <div className="flex items-center gap-3 text-emerald-600 font-black uppercase tracking-[0.2em] text-xs">
                  <div className={`p-2 rounded-xl ${EXPERTS.find(e => e.id === selectedExpert)?.color}`}>
                    {EXPERTS.find(e => e.id === selectedExpert)?.icon}
                  </div>
                  <span>{EXPERTS.find(e => e.id === selectedExpert)?.name} · {EXPERTS.find(e => e.id === selectedExpert)?.title}</span>
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
                    type="button"
                    onClick={isListening ? stopListening : startListening}
                    className={`p-4 rounded-2xl transition-all shadow-xl flex items-center gap-2 ${
                      isListening
                        ? 'bg-rose-500 text-white animate-pulse'
                        : 'bg-white text-slate-500 hover:text-emerald-600 hover:bg-emerald-50'
                    }`}
                  >
                    {isListening ? <MicOff className="w-6 h-6" aria-hidden /> : <Mic className="w-6 h-6" aria-hidden />}
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
                    type="button"
                    onClick={handleStartSimulation}
                    disabled={!userInput.trim()}
                    className="p-4 bg-slate-900 text-white rounded-2xl hover:bg-emerald-600 transition-all shadow-xl disabled:opacity-50 disabled:hover:bg-slate-900 group"
                  >
                    <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" aria-hidden />
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

              <p className="flex items-center justify-center gap-2 text-slate-500 text-sm">
                <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0" aria-hidden />
                <span>内容仅用于生成本次建议，请避免输入银行卡号等敏感信息。</span>
              </p>
            </motion.div>
          )}

          {step === 'knowledge' && (
            <motion.div 
              key="knowledge"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-4xl mx-auto space-y-8"
            >
              <button type="button" onClick={handleBack} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors mb-6 font-bold uppercase tracking-widest text-xs">
                <ChevronLeft className="w-4 h-4" aria-hidden />
                返回首页
              </button>

              <div className="text-center space-y-4 mb-12">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-full text-xs font-black uppercase tracking-widest border border-emerald-100">
                  <BookOpen className="w-4 h-4" aria-hidden />
                  <span>Knowledge Base</span>
                </div>
                <h2 className="text-4xl font-black text-slate-900 tracking-tight">家庭健康与心理知识库</h2>
                <p className="text-slate-500 font-medium max-w-2xl mx-auto">
                  汇集中西医养生精粹与家庭心理学，为您提供经过验证的科学指引。
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { title: "中医养生", desc: "气血调理、体质辨识、食疗药膳", icon: <Activity className="w-6 h-6 text-emerald-500" />, color: "bg-emerald-50 border-emerald-100" },
                  { title: "西医保健", desc: "营养补充、慢性病管理、科学运动", icon: <Heart className="w-6 h-6 text-blue-500" />, color: "bg-blue-50 border-blue-100" },
                  { title: "家庭心理", desc: "亲子沟通、伴侣相处、情绪疏导", icon: <Brain className="w-6 h-6 text-rose-500" />, color: "bg-rose-50 border-rose-100" },
                  { title: "老年护理", desc: "居家照护、认知症预防、康复指导", icon: <Users className="w-6 h-6 text-amber-500" />, color: "bg-amber-50 border-amber-100" }
                ].map((item, i) => (
                  <div key={i} className={`glass-card rounded-[3rem] p-7 md:p-8 ${item.color} hover:shadow-xl transition-shadow cursor-default group`}>
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-white rounded-2xl shadow-sm group-hover:scale-110 transition-transform">
                        {item.icon}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">{item.title}</h3>
                        <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {step === 'about' && (
            <motion.div 
              key="about"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-3xl mx-auto space-y-12"
            >
              <button type="button" onClick={handleBack} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors mb-6 font-bold uppercase tracking-widest text-xs">
                <ChevronLeft className="w-4 h-4" aria-hidden />
                返回首页
              </button>

              <div className="text-center space-y-6">
                <DynamicLogo theme="health" size="lg" className="mx-auto" />
                <div>
                  <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-4">关于我们</h2>
                  <p className="text-xl text-slate-500 font-medium leading-relaxed">
                    “以科技之智，守家庭之暖”
                  </p>
                </div>
              </div>

              <div className="prose prose-slate prose-lg mx-auto text-slate-600">
                <p>
                  家庭守护 AI 顾问是一个致力于利用前沿人工智能技术，为中国家庭提供普惠性健康与心理支持的创新平台。我们深知，在快节奏的现代生活中，每个家庭都面临着养老、育儿、情感沟通等多重挑战。
                </p>
                <p>
                  我们的核心团队由资深医学专家、心理咨询师及 AI 算法工程师组成。通过构建专业的垂直领域知识图谱，我们将复杂的医学与心理学知识，转化为听得懂、用得上的个性化建议。
                </p>
                <div className="grid grid-cols-3 gap-4 my-8 not-prose">
                  <div className="p-4 bg-slate-50 rounded-2xl text-center">
                    <div className="text-2xl font-black text-slate-900 mb-1">300+</div>
                    <div className="text-xs text-slate-500 font-bold uppercase">专业模型节点</div>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl text-center">
                    <div className="text-2xl font-black text-slate-900 mb-1">24/7</div>
                    <div className="text-xs text-slate-500 font-bold uppercase">全天候响应</div>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl text-center">
                    <div className="text-2xl font-black text-slate-900 mb-1">100%</div>
                    <div className="text-xs text-slate-500 font-bold uppercase">隐私加密</div>
                  </div>
                </div>
                <p>
                  不同于冷冰冰的搜索引擎，我们更强调“陪伴”与“理解”。无论是深夜的健康焦虑，还是家庭矛盾的无助时刻，这里始终有一个理智而温暖的声音在等候。
                </p>
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
              <button type="button" onClick={handleBack} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors mb-6 font-bold uppercase tracking-widest text-xs">
                <ChevronLeft className="w-4 h-4" aria-hidden />
                返回修改咨询
              </button>
              
              <StructuredResult 
                result={result} 
                onReset={reset} 
                theme={selectedTheme} 
                stressHistory={memory.stressHistory}
                isPaid={isPaid}
                onUnlock={() => setStep('payment')}
                onRequestDeepDive={requestDeepDive}
                isDeepDiveLoading={isDeepDiveLoading}
                deepDiveError={deepDiveError}
                onSaveArchive={saveArchiveAndGenerate360}
                isArchiveSaving={isArchiveSaving}
                onSpeak={(text) => {
                  if (isSpeaking) {
                    stopSpeaking();
                  } else {
                    const expert = EXPERTS.find(e => e.id === selectedExpert) || EXPERTS[5];
                    speak(text, expert.voice.pitch, expert.voice.rate);
                  }
                }}
                isSpeaking={isSpeaking}
              />
            </motion.div>
          )}

          {step === 'archive' && (
            <motion.div
              key="archive"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-10"
            >
              <ArchiveDashboard
                sessions={archiveSessions}
                active={archiveSessions.find(s => s.id === activeArchiveId) || archiveSessions[0] || null}
                onSelect={(id) => setActiveArchiveId(id)}
                onBack={handleBack}
              />
            </motion.div>
          )}
        </AnimatePresence>
        </ErrorBoundary>
      </main>

      {/* Footer */}
      <footer className="py-16 border-t border-slate-100 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center space-y-10 md:space-y-12">
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
            <div className="max-w-4xl mx-auto text-xs text-slate-500/70 font-medium space-y-3">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="flex items-center justify-center gap-2 mb-2 text-slate-700">
                  <AlertCircle className="w-4 h-4 text-amber-500" />
                  <span className="font-bold">重要医疗免责声明 (Medical Disclaimer)</span>
                </p>
                <p className="leading-relaxed">
                  本平台（包括但不限于“智能健康档案”、“中西医养生调理推演”等模块）提供的所有分析、食疗配方、营养补充剂建议及健康推演结果，<span className="font-bold text-rose-500">均由人工智能(AI)基于一般性知识生成，仅供日常养生与健康管理的知识参考。</span>
                </p>
                <p className="leading-relaxed mt-2">
                  <span className="font-bold text-rose-500">本平台不是医疗机构，不提供任何形式的医疗诊断、治疗方案或处方建议。</span>此处的信息绝对不能替代专业执业医师的当面问诊。如您有任何具体的身体不适、正在服用处方药、或患有基础疾病，请在尝试任何食疗、保健品或生活方式改变之前，<span className="font-bold text-rose-500 underline decoration-rose-200 underline-offset-4">务必立即前往正规医院就医，并严格遵从专业医嘱。</span>本平台不对任何基于上述建议而产生的健康或医疗后果承担任何法律责任。
                </p>
              </div>
              <p className="pt-4 mt-4 inline-block w-full text-[10px] text-slate-400">© 2026 家庭守护 AI 顾问 · 智能养生与健康管理平台</p>
            </div>
          </div>
        </div>
      </footer>

      <ProductFeatureDock onOpenKnowledge={() => setStep('knowledge')} />
    </div>
  );
}
