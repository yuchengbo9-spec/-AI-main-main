import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, ChevronDown, ChevronUp, Bot, Loader2, BookOpen } from 'lucide-react';
import { askKnowledgeAssistant } from '../services/ai';

export type ProductFeatureDockProps = {
  /** 打开完整「知识库」页（与客服底层同源信息） */
  onOpenKnowledge?: () => void;
};

type ChatTurn = {
  id: string;
  at: string;
  question: string;
  answer?: string;
  error?: string;
  loading: boolean;
};

/**
 * 右下角 7×24 智能客服：结合内置专题知识、典型问答与本地咨询档案摘要，由大模型生成答复。
 */
export default function ProductFeatureDock({ onOpenKnowledge }: ProductFeatureDockProps) {
  const [expanded, setExpanded] = useState(false);
  const [draft, setDraft] = useState('');
  const [turns, setTurns] = useState<ChatTurn[]>([]);
  const [pending, setPending] = useState(false);

  const submit = useCallback(async () => {
    const text = draft.trim();
    if (!text || pending) return;
    setPending(true);
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const at = new Date().toLocaleString();
    setDraft('');
    setTurns((prev) => [{ id, at, question: text, loading: true }, ...prev]);
    try {
      const answer = await askKnowledgeAssistant(text);
      setTurns((prev) =>
        prev.map((t) => (t.id === id ? { ...t, answer, loading: false } : t))
      );
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : '请求失败，请稍后重试';
      setTurns((prev) =>
        prev.map((t) => (t.id === id ? { ...t, error: msg, loading: false } : t))
      );
    } finally {
      setPending(false);
    }
  }, [draft, pending]);

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[60] flex justify-end p-3 sm:p-5 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
      <div className="pointer-events-auto w-full max-w-[min(92vw,720px)] flex flex-col items-end gap-2">
        <AnimatePresence mode="wait">
          {!expanded ? (
            <motion.button
              key="pill"
              type="button"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              onClick={() => setExpanded(true)}
              className="group flex items-center gap-2 rounded-full border border-cyan-200/70 bg-gradient-to-r from-white/95 via-cyan-50/80 to-emerald-50/80 px-5 py-3 text-sm font-bold text-slate-800 shadow-xl shadow-slate-900/10 backdrop-blur-xl transition-all hover:-translate-y-0.5 hover:border-cyan-300/80 hover:shadow-2xl"
            >
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-cyan-200/80 bg-white/95 text-cyan-700 shadow-sm transition-transform group-hover:scale-105">
                <Bot className="h-3.5 w-3.5" aria-hidden />
              </span>
              智能守护
            </motion.button>
          ) : (
            <motion.div
              key="panel"
              role="region"
              aria-label="智能守护对话"
              initial={{ opacity: 0, y: 24, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 320, damping: 28 }}
              className="glass-card flex max-h-[min(78vh,820px)] min-h-[min(52vh,520px)] w-full flex-col overflow-hidden rounded-[2rem] border-white/50 shadow-2xl shadow-slate-900/15"
            >
              <div className="flex items-start justify-between gap-3 border-b border-slate-100/80 bg-gradient-to-r from-emerald-50/40 to-white/80 px-5 py-4 sm:px-6">
                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-2 text-emerald-700">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-lg border border-cyan-200/80 bg-white/95 text-cyan-700 shadow-sm">
                      <Bot className="h-3.5 w-3.5 shrink-0" aria-hidden />
                    </span>
                    <span className="text-xs font-black uppercase tracking-[0.2em]">智能守护 · 知识库增强</span>
                  </div>
                  <p className="text-sm font-medium text-slate-600">
                    随时提问关键信息，答复结合平台专题知识、典型问答与本地咨询档案摘要；与顶部「知识库」同源底层信息。
                  </p>
                  {onOpenKnowledge && (
                    <button
                      type="button"
                      onClick={() => {
                        onOpenKnowledge();
                        setExpanded(false);
                      }}
                      className="mt-1 inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800"
                    >
                      <BookOpen className="h-3.5 w-3.5 shrink-0" aria-hidden />
                      打开完整知识库页面
                    </button>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setExpanded(false)}
                  className="shrink-0 rounded-xl border border-slate-200/80 bg-white/80 p-2 text-slate-500 transition-colors hover:border-emerald-200 hover:text-emerald-700"
                  title="收起为小按钮"
                >
                  <ChevronDown className="h-5 w-5" aria-hidden />
                </button>
              </div>

              <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden px-5 py-4 sm:px-6 sm:py-5">
                <div className="min-h-[12rem] flex-1 overflow-y-auto rounded-2xl border border-dashed border-slate-200/90 bg-slate-50/40 p-4 sm:p-5">
                  {turns.length === 0 ? (
                    <div className="flex h-full min-h-[10rem] flex-col items-center justify-center gap-3 text-center text-slate-500">
                      <p className="text-base font-bold text-slate-700">您好，我是您的智能守护助手</p>
                      <p className="max-w-md text-sm leading-relaxed">
                        请用一两句话说明背景与问题（如：为谁咨询、主要困扰、期望结果）。我会结合知识库与历史摘要，尽量给出可执行的思路。
                      </p>
                    </div>
                  ) : (
                    <ul className="flex flex-col-reverse gap-4">
                      {turns.map((item) => (
                        <li key={item.id} className="space-y-2">
                          <div className="ml-auto max-w-[92%] rounded-2xl rounded-br-md bg-emerald-600 px-4 py-3 text-left text-sm font-medium leading-relaxed text-white shadow-sm">
                            <div className="text-[10px] font-bold uppercase tracking-widest text-emerald-100/90">
                              您 · {item.at}
                            </div>
                            <p className="mt-1 whitespace-pre-wrap">{item.question}</p>
                          </div>
                          <div className="mr-auto max-w-[92%] rounded-2xl rounded-bl-md border border-slate-100 bg-white/95 px-4 py-3 text-left text-sm leading-relaxed text-slate-800 shadow-sm">
                            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                              守护答复
                            </div>
                            {item.loading ? (
                              <div className="mt-2 flex items-center gap-2 text-slate-500">
                                <Loader2 className="h-4 w-4 animate-spin shrink-0" aria-hidden />
                                <span>正在结合知识库生成…</span>
                              </div>
                            ) : item.error ? (
                              <p className="mt-2 text-red-600">{item.error}</p>
                            ) : (
                              <p className="mt-2 whitespace-pre-wrap font-medium">{item.answer}</p>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
                  <label className="sr-only" htmlFor="ai-customer-service-input">
                    向智能守护提问
                  </label>
                  <textarea
                    id="ai-customer-service-input"
                    rows={2}
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                        e.preventDefault();
                        void submit();
                      }
                    }}
                    placeholder="描述背景与问题…（⌘/Ctrl + Enter 发送）"
                    className="min-h-[4.5rem] flex-1 resize-y rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-sm text-slate-900 shadow-inner outline-none transition-shadow placeholder:text-slate-400 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10"
                  />
                  <button
                    type="button"
                    onClick={() => void submit()}
                    disabled={!draft.trim() || pending}
                    className="inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl bg-slate-900 px-6 py-3 text-sm font-bold text-white shadow-lg transition-colors hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-40 sm:self-stretch"
                  >
                    <Send className="h-4 w-4" aria-hidden />
                    发送
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setExpanded(false)}
                className="flex w-full items-center justify-center gap-1 border-t border-slate-100/90 py-2 text-xs font-bold uppercase tracking-widest text-slate-400 transition-colors hover:bg-slate-50/80 hover:text-slate-600"
              >
                <ChevronUp className="h-3.5 w-3.5" aria-hidden />
                收起停靠栏
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
