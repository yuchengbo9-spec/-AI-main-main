import React, { useRef, useEffect, useState } from 'react';
import { Confession } from '../types';
import { MessageSquare, Heart, Sparkles } from 'lucide-react';
import { motion, useAnimationControls } from 'motion/react';

interface Props {
  confessions: Confession[];
}

export default function ConfessionWall({ confessions }: Props) {
  // Clone confessions to create seamless loop
  const displayConfessions = [...confessions, ...confessions, ...confessions];
  const controls = useAnimationControls();
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isHovered) {
      controls.start({
        x: '-50%',
        transition: {
          duration: 30,
          ease: "linear",
          repeat: Infinity,
        }
      });
    } else {
      controls.stop();
    }
  }, [isHovered, controls]);

  return (
    <div className="space-y-8 overflow-hidden">
      <div className="flex items-center justify-between px-4">
        <div className="flex items-center gap-2 text-slate-400">
          <MessageSquare className="w-4 h-4" />
          <span className="text-xs font-bold uppercase tracking-widest">匿名倾诉墙</span>
        </div>
        <div className="flex items-center gap-2 text-emerald-500 text-xs font-bold uppercase tracking-widest">
          <Sparkles className="w-4 h-4" />
          共鸣产生力量
        </div>
      </div>

      <div 
        className="relative -mx-6 px-6"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-[#FDFCFB] to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-[#FDFCFB] to-transparent z-10" />
        
        <motion.div 
          className="flex gap-6 w-max py-4"
          animate={controls}
          initial={{ x: 0 }}
        >
          {displayConfessions.map((c, i) => (
            <div
              key={`${c.id}-${i}`}
              className="w-[320px] md:w-[380px] p-8 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all space-y-6 relative overflow-hidden group shrink-0"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform" />
              
              <div className="relative z-10 space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                  <span className="px-2 py-1 bg-slate-100 rounded-lg">{c.age} 岁</span>
                  <span>匿名用户</span>
                </div>
                <p className="text-slate-700 leading-relaxed text-lg italic line-clamp-3">
                  “{c.content}”
                </p>
                <div className="flex flex-wrap gap-2">
                  {c.tags.map((tag, j) => (
                    <span key={j} className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-bold uppercase tracking-wider">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-50 flex items-center justify-between relative z-10">
                <button className="flex items-center gap-2 text-slate-300 hover:text-rose-500 transition-colors group/btn">
                  <Heart className="w-4 h-4 group-hover/btn:fill-current transition-colors" />
                  <span className="text-xs font-medium">抱抱他</span>
                </button>
                <div className="text-[10px] text-slate-300 uppercase tracking-widest">
                  24小时前
                </div>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
