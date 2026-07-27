import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Image as ImageIcon, Mic, Play, Pause, ArrowLeft, Video, Phone } from 'lucide-react';
import { useStore } from '@/store';
import { useRouter } from '@/router';
import { Card } from '@/components/ui';
import type { ChatMessage } from '@/types';

export function DoctorChat() {
  const { state, setState } = useStore();
  const { navigate, back } = useRouter();
  const [input, setInput] = useState('');
  const [playing, setPlaying] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => { scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight); }, [state.chat]);

  const send = (type: 'text' | 'image' | 'voice', text?: string) => {
    const msg: ChatMessage = {
      id: 'm' + Date.now(), from: 'patient', type,
      text: type === 'text' ? (text ?? input) : type === 'image' ? 'Wound photo' : undefined,
      image: type === 'image' ? 'https://images.pexels.com/photos/4226119/pexels-photo-4226119.jpeg?auto=compress&w=400' : undefined,
      voiceDuration: type === 'voice' ? '0:09' : undefined,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setState(s => ({ ...s, chat: [...s.chat, msg] }));
    if (type === 'text') setInput('');
    // simulated doctor reply
    setTimeout(() => {
      const reply: ChatMessage = { id: 'r' + Date.now(), from: 'doctor', type: 'text', text: 'Thanks for the update. Keep monitoring and rest well.', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
      setState(s => ({ ...s, chat: [...s.chat, reply] }));
    }, 1500);
  };

  return (
    <div className="min-h-screen flex flex-col max-w-md mx-auto bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <button onClick={back} className="text-slate-400"><ArrowLeft size={20} /></button>
        <img src="https://images.pexels.com/photos/5407206/pexels-photo-5407206.jpeg?auto=compress&w=200" alt="" className="w-10 h-10 rounded-full object-cover" />
        <div className="flex-1">
          <p className="font-bold text-slate-800 dark:text-white text-sm">Dr. Michael Chen</p>
          <p className="text-xs text-success-600 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-success-500" /> Online</p>
        </div>
        <button onClick={() => navigate('video-call')} className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center"><Video size={18} className="text-primary-600" /></button>
        <button className="w-10 h-10 rounded-xl bg-success-100 dark:bg-success-700/30 flex items-center justify-center"><Phone size={18} className="text-success-600" /></button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        {state.chat.map(m => (
          <motion.div key={m.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className={`flex ${m.from === 'patient' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[75%] rounded-2xl p-3 ${m.from === 'patient' ? 'bg-primary-600 text-white rounded-br-sm' : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-bl-sm shadow-sm'}`}>
              {m.type === 'text' && <p className="text-sm">{m.text}</p>}
              {m.type === 'image' && (
                <>
                  <img src={m.image} alt="" className="rounded-xl mb-1 max-w-full" />
                  {m.text && <p className="text-xs opacity-80">{m.text}</p>}
                </>
              )}
              {m.type === 'voice' && (
                <button onClick={() => setPlaying(playing === m.id ? null : m.id)} className="flex items-center gap-2">
                  {playing === m.id ? <Pause size={18} /> : <Play size={18} />}
                  <div className="flex items-end gap-0.5 h-6">
                    {[4, 8, 6, 10, 5, 9, 7, 11, 6, 8, 5, 10].map((h, i) => <span key={i} className={`w-1 rounded-full ${m.from === 'patient' ? 'bg-white/70' : 'bg-primary-500'}`} style={{ height: h, animation: playing === m.id ? `pulse 0.5s ${i * 0.05}s infinite alternate` : 'none' }} />)}
                  </div>
                  <span className="text-xs opacity-80">{m.voiceDuration}</span>
                </button>
              )}
              <p className={`text-[10px] mt-1 ${m.from === 'patient' ? 'text-primary-200' : 'text-slate-400'}`}>{m.time}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Input */}
      <div className="p-3 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex items-center gap-2">
        <button onClick={() => send('image')} className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center shrink-0"><ImageIcon size={18} className="text-slate-500" /></button>
        <button onClick={() => send('voice')} className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center shrink-0"><Mic size={18} className="text-slate-500" /></button>
        <input className="flex-1 rounded-full bg-slate-100 dark:bg-slate-700 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary-500 text-slate-800 dark:text-white" placeholder="Type a message..." value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && input && send('text')} />
        <button onClick={() => input && send('text')} className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center shrink-0"><Send size={18} className="text-white" /></button>
      </div>
    </div>
  );
}
