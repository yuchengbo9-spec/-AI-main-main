import React from 'react';
import { motion } from 'motion/react';
import { MessageSquare, Sparkles, Zap, Heart, Shield, User, ThumbsUp } from 'lucide-react';

// Mock Confessions Data (Merged from ConfessionWall)
const CONFESSIONS = [
  { age: 52, text: "孩子最近在外面创业欠了不少钱，我整晚整晚睡不着，又不敢跟老伴说。", tags: ["债务压力", "失眠"], likes: 128 },
  { age: 48, text: "在家里忙里忙外一整天，孩子回家就进屋关门，老伴只知道看手机，觉得自己像个透明人。", tags: ["家庭地位", "孤独感"], likes: 256 },
  { age: 55, text: "马上要退休了，突然不知道以后该干什么，心里空落落的。", tags: ["退休焦虑", "价值感"], likes: 89 },
  { age: 60, text: "老伴身体越来越差，我一个人照顾真的很吃力，但又不想去养老院。", tags: ["照护压力", "养老困境"], likes: 342 },
  { age: 45, text: "夹在更年期和青春期中间，每天家里都是战场，心好累。", tags: ["家庭矛盾", "情绪崩溃"], likes: 167 },
  { age: 58, text: "想帮儿女带孩子，又怕带不好被嫌弃，不带又怕被说闲话。", tags: ["隔代育儿", "左右为难"], likes: 215 },
];

const QUESTIONS = [
  { text: "如何平衡工作与陪伴家人的时间？", icon: <Heart className="w-4 h-4" />, color: "text-rose-400" },
  { text: "孩子进入叛逆期，该如何有效沟通？", icon: <MessageSquare className="w-4 h-4" />, color: "text-blue-400" },
  { text: "父母身体健康出现预警，我该做些什么？", icon: <Shield className="w-4 h-4" />, color: "text-emerald-400" },
  { text: "生意遇到瓶颈，如何寻找新的突破点？", icon: <Zap className="w-4 h-4" />, color: "text-amber-400" },
  { text: "如何处理婆媳关系中的微妙矛盾？", icon: <Sparkles className="w-4 h-4" />, color: "text-purple-400" },
];

export default function MarqueeQuestions() {
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <div 
      className="relative w-full overflow-hidden py-16 bg-slate-950 border-y border-white/10"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950 z-0" />
      
      {/* Row 1: High Frequency Questions (Classic Marquee) */}
      <div className="flex whitespace-nowrap mb-12 relative z-10">
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-slate-950 to-transparent z-20 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-slate-950 to-transparent z-20 pointer-events-none" />
        
        <motion.div 
          animate={{ x: isHovered ? undefined : ["0%", "-50%"] }}
          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
          className="flex gap-6 items-center pr-6"
        >
          {[...QUESTIONS, ...QUESTIONS, ...QUESTIONS, ...QUESTIONS].map((q, i) => (
            <div 
              key={`q-${i}`}
              className="flex items-center gap-4 px-6 py-3 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition-colors cursor-default backdrop-blur-sm"
            >
              <div className={`${q.color} p-1.5 bg-white/10 rounded-full`}>
                {q.icon}
              </div>
              <span className="text-slate-300 text-sm font-medium">
                {q.text}
              </span>
            </div>
          ))}
        </motion.div>
      </div>
      
      {/* Row 2: Confession Cards (Larger, Slower) */}
      <div className="flex whitespace-nowrap relative z-10">
        <div className="absolute left-0 top-0 bottom-0 w-40 bg-gradient-to-r from-slate-950 to-transparent z-20 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-40 bg-gradient-to-l from-slate-950 to-transparent z-20 pointer-events-none" />

        <motion.div 
          animate={{ x: isHovered ? undefined : ["-50%", "0%"] }}
          transition={{ duration: 80, repeat: Infinity, ease: "linear" }}
          className="flex gap-8 items-center pr-8"
        >
          {[...CONFESSIONS, ...CONFESSIONS, ...CONFESSIONS].map((c, i) => (
            <div 
              key={`c-${i}`}
              className="w-[400px] p-6 bg-slate-900/80 border border-white/10 rounded-3xl hover:border-emerald-500/30 hover:bg-slate-800/80 transition-all cursor-default group shadow-xl backdrop-blur-md relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-12 bg-emerald-500/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-emerald-500/10 transition-colors" />
              
              <div className="relative z-10 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-slate-800 rounded-full text-slate-400">
                      <User className="w-3 h-3" />
                    </div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">匿名用户 · {c.age}岁</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-500/80 bg-emerald-500/10 px-2 py-1 rounded-full">
                    <ThumbsUp className="w-3 h-3" />
                    <span className="text-[10px] font-bold">{c.likes}</span>
                  </div>
                </div>
                
                <p className="text-white text-lg font-medium leading-relaxed whitespace-normal line-clamp-2 italic opacity-90 group-hover:opacity-100 transition-opacity">
                  "{c.text}"
                </p>
                
                <div className="flex gap-2">
                  {c.tags.map((tag, j) => (
                    <span key={j} className="px-2.5 py-1 bg-white/5 text-slate-400 rounded-md text-[10px] font-medium border border-white/5">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Decorative accent lines */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
    </div>
  );
}
