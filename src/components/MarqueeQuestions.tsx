import React from 'react';
import { motion } from 'motion/react';
import { MessageSquare, Sparkles, Zap, Heart, Shield } from 'lucide-react';

const QUESTIONS = [
  { text: "如何平衡工作与陪伴家人的时间？", icon: <Heart className="w-4 h-4" />, color: "text-rose-400" },
  { text: "孩子进入叛逆期，该如何有效沟通？", icon: <MessageSquare className="w-4 h-4" />, color: "text-blue-400" },
  { text: "父母身体健康出现预警，我该做些什么？", icon: <Shield className="w-4 h-4" />, color: "text-emerald-400" },
  { text: "生意遇到瓶颈，如何寻找新的突破点？", icon: <Zap className="w-4 h-4" />, color: "text-amber-400" },
  { text: "如何处理婆媳关系中的微妙矛盾？", icon: <Sparkles className="w-4 h-4" />, color: "text-purple-400" },
  { text: "步入中年，如何缓解对未来的焦虑感？", icon: <Heart className="w-4 h-4" />, color: "text-rose-400" },
  { text: "退休后的生活该如何规划才更有意义？", icon: <Shield className="w-4 h-4" />, color: "text-emerald-400" },
  { text: "如何引导孩子建立正确的金钱观？", icon: <Zap className="w-4 h-4" />, color: "text-amber-400" },
  { text: "您最近的身体状况有哪些信号让您感到担忧？", icon: <Shield className="w-4 h-4" />, color: "text-emerald-400" },
  { text: "在家庭琐事中，目前最让您牵肠挂肚的是哪件事？", icon: <Heart className="w-4 h-4" />, color: "text-rose-400" },
  { text: "面对事业挑战与子女未来，您更希望先理清哪一团乱麻？", icon: <MessageSquare className="w-4 h-4" />, color: "text-blue-400" },
];

export default function MarqueeQuestions() {
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <div 
      className="relative w-full overflow-hidden py-12 bg-slate-950 border-y border-white/10"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Reduced gradient fade for better visibility of content */}
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-transparent to-slate-950 z-10 pointer-events-none opacity-80" />
      
      <div className="flex whitespace-nowrap">
        <motion.div 
          animate={{ x: isHovered ? undefined : ["0%", "-50%"] }}
          transition={{ 
            duration: 120, 
            repeat: Infinity, 
            ease: "linear" 
          }}
          className="flex gap-6 items-center pr-6"
        >
          {[...QUESTIONS, ...QUESTIONS, ...QUESTIONS, ...QUESTIONS].map((q, i) => (
            <div 
              key={i}
              className="flex items-center gap-4 px-8 py-5 bg-slate-900/80 border border-white/10 rounded-2xl hover:border-emerald-500/50 hover:bg-slate-800 transition-all cursor-default group shadow-[0_8px_30px_rgb(0,0,0,0.12)] backdrop-blur-md"
            >
              <div className={`${q.color} group-hover:scale-110 transition-transform p-2 bg-white/10 rounded-xl w-10 h-10 flex items-center justify-center [&_svg]:w-6 [&_svg]:h-6 shadow-inner`}>
                {q.icon}
              </div>
              <span className="text-white text-lg font-black tracking-tight drop-shadow-md">
                {q.text}
              </span>
            </div>
          ))}
        </motion.div>
      </div>
      
      <div className="mt-10 flex whitespace-nowrap">
        <motion.div 
          animate={{ x: isHovered ? undefined : ["-50%", "0%"] }}
          transition={{ 
            duration: 150, 
            repeat: Infinity, 
            ease: "linear" 
          }}
          className="flex gap-8 items-center pr-8"
        >
          {[...QUESTIONS, ...QUESTIONS, ...QUESTIONS, ...QUESTIONS].reverse().map((q, i) => (
            <div 
              key={i}
              className="flex items-center gap-4 px-8 py-5 bg-slate-900/80 border border-white/10 rounded-2xl hover:border-blue-500/50 hover:bg-slate-800 transition-all cursor-default group shadow-[0_8px_30px_rgb(0,0,0,0.12)] backdrop-blur-md"
            >
              <div className={`${q.color} group-hover:scale-110 transition-transform p-2 bg-white/10 rounded-xl w-10 h-10 flex items-center justify-center [&_svg]:w-6 [&_svg]:h-6 shadow-inner`}>
                {q.icon}
              </div>
              <span className="text-white text-lg font-black tracking-tight drop-shadow-md">
                {q.text}
              </span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Decorative accent lines */}
      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-30" />
      <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-30" />
    </div>
  );
}
