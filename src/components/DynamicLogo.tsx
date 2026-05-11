import React from 'react';
import { motion } from 'motion/react';
import { 
  Activity, 
  Users, 
  Heart, 
  Baby, 
  Briefcase, 
  Smile,
  Sparkles,
  Bot
} from 'lucide-react';
import { LifeTheme } from '../types';

interface Props {
  theme?: LifeTheme | null;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function DynamicLogo({ theme, size = 'md', className = '' }: Props) {
  const sizeClasses = {
    sm: 'w-8 h-8 p-1.5',
    md: 'w-12 h-12 p-2.5',
    lg: 'w-20 h-20 p-4'
  };

  const iconSize = {
    sm: 'w-5 h-5',
    md: 'w-7 h-7',
    lg: 'w-12 h-12'
  };

  const getThemeConfig = () => {
    switch (theme) {
      case 'health':
        return { icon: <Activity className={iconSize[size]} />, color: 'bg-emerald-600 shadow-emerald-600/30' };
      case 'family':
        return { icon: <Users className={iconSize[size]} />, color: 'bg-blue-600 shadow-blue-600/30' };
      case 'children':
        return { icon: <Heart className={iconSize[size]} />, color: 'bg-rose-600 shadow-rose-600/30' };
      case 'grandchildren':
        return { icon: <Baby className={iconSize[size]} />, color: 'bg-amber-600 shadow-amber-600/30' };
      case 'business':
        return { icon: <Briefcase className={iconSize[size]} />, color: 'bg-indigo-600 shadow-indigo-600/30' };
      case 'emotion':
        return { icon: <Smile className={iconSize[size]} />, color: 'bg-purple-600 shadow-purple-600/30' };
      default:
        // 使用更高级的渐变与小机器图标
        return { 
          icon: <Bot className={iconSize[size]} />, 
          color: 'bg-gradient-to-br from-cyan-600 to-emerald-600 shadow-cyan-600/30 border border-white/20' 
        };
    }
  };

  const config = getThemeConfig();

  return (
    <motion.div
      layout
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`relative flex items-center justify-center rounded-2xl text-white shadow-xl ${config.color} ${sizeClasses[size]} ${className}`}
    >
      <motion.div
        key={theme || 'default'}
        initial={{ rotate: -20, opacity: 0 }}
        animate={{ rotate: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200 }}
      >
        {config.icon}
      </motion.div>
      
      {/* Decorative particles */}
      {size === 'lg' && (
        <>
          <motion.div
            animate={{ 
              y: [0, -20, 0],
              opacity: [0, 1, 0]
            }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
            className="absolute -top-4 -right-2 text-emerald-400"
          >
            <Sparkles className="w-4 h-4" />
          </motion.div>
          <motion.div
            animate={{ 
              y: [0, -15, 0],
              opacity: [0, 1, 0]
            }}
            transition={{ duration: 2.5, repeat: Infinity, delay: 1 }}
            className="absolute -top-2 -left-4 text-blue-400"
          >
            <Sparkles className="w-3 h-3" />
          </motion.div>
        </>
      )}
    </motion.div>
  );
}
