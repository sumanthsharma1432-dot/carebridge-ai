import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Video, VideoOff, Volume2, PhoneOff, ArrowLeft, Users } from 'lucide-react';
import { useRouter } from '@/router';

export function VideoCall() {
  const { back } = useRouter();
  const [muted, setMuted] = useState(false);
  const [camOff, setCamOff] = useState(false);
  const [speaker, setSpeaker] = useState(true);
  const [ended, setEnded] = useState(false);

  if (ended) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white">
        <div className="w-20 h-20 rounded-full bg-success-500 flex items-center justify-center mb-4"><PhoneOff size={36} /></div>
        <p className="text-xl font-bold">Call Ended</p>
        <p className="text-slate-400 text-sm mt-1">Duration: 12:34</p>
        <button onClick={back} className="mt-8 bg-white text-slate-900 font-bold rounded-2xl px-8 py-3">Back to Chat</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between p-4 text-white">
        <button onClick={back}><ArrowLeft size={22} /></button>
        <div className="text-center">
          <p className="font-bold text-sm">Dr. Michael Chen</p>
          <p className="text-xs text-success-400 flex items-center justify-center gap-1"><span className="w-2 h-2 rounded-full bg-success-500 animate-pulse" /> Connected · 12:34</p>
        </div>
        <Users size={22} />
      </div>

      {/* Video area */}
      <div className="flex-1 flex items-center justify-center relative p-4">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-md aspect-[3/4] rounded-3xl bg-gradient-to-br from-primary-600 to-primary-900 flex items-center justify-center shadow-2xl relative overflow-hidden">
          <img src="https://images.pexels.com/photos/5407206/pexels-photo-5407206.jpeg?auto=compress&w=600" alt="" className="w-full h-full object-cover" />
          <div className="absolute bottom-3 left-3 bg-black/40 backdrop-blur px-3 py-1 rounded-full text-white text-xs font-medium">Dr. Michael Chen</div>
        </motion.div>

        {/* Self view */}
        <div className="absolute top-6 right-6 w-24 h-32 rounded-2xl bg-slate-700 overflow-hidden shadow-lg border-2 border-white/20">
          {camOff ? <div className="w-full h-full flex items-center justify-center text-slate-400"><VideoOff size={20} /></div> : <img src="https://images.pexels.com/photos/599845/pexels-photo-599845.jpeg?auto=compress&w=200" alt="" className="w-full h-full object-cover" />}
        </div>
      </div>

      {/* Controls */}
      <div className="p-6 flex items-center justify-center gap-4">
        <button onClick={() => setMuted(!muted)} className={`w-14 h-14 rounded-full flex items-center justify-center transition ${muted ? 'bg-white text-slate-900' : 'bg-white/15 text-white backdrop-blur'}`}>
          {muted ? <MicOff size={22} /> : <Mic size={22} />}
        </button>
        <button onClick={() => setCamOff(!camOff)} className={`w-14 h-14 rounded-full flex items-center justify-center transition ${camOff ? 'bg-white text-slate-900' : 'bg-white/15 text-white backdrop-blur'}`}>
          {camOff ? <VideoOff size={22} /> : <Video size={22} />}
        </button>
        <button onClick={() => setSpeaker(!speaker)} className={`w-14 h-14 rounded-full flex items-center justify-center transition ${speaker ? 'bg-white/15 text-white backdrop-blur' : 'bg-white text-slate-900'}`}>
          <Volume2 size={22} />
        </button>
        <button onClick={() => setEnded(true)} className="w-16 h-16 rounded-full bg-danger-500 flex items-center justify-center shadow-lg">
          <PhoneOff size={26} className="text-white" />
        </button>
      </div>
    </div>
  );
}
