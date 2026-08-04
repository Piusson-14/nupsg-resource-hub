import { motion } from 'framer-motion';
import { Download, FileQuestion, Files, GraduationCap } from 'lucide-react';
import { Link } from 'react-router-dom';

export function ResourceCard({ resource, onDownload }) {
  const isPast = resource.category === 'past_questions';
  const Icon = isPast ? FileQuestion : Files;
  return <motion.article initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} whileHover={{ y: -4 }} className='resource-card group'>
    <div className='flex items-start justify-between gap-3'><span className={`grid h-11 w-11 place-items-center rounded-2xl ${isPast ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-700'}`}><Icon size={21} /></span><span className={`rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${isPast ? 'bg-amber-50 text-amber-700' : 'bg-blue-50 text-blue-700'}`}>{isPast ? 'Past questions' : 'Slides'}</span></div>
    <Link to={`/course/${encodeURIComponent(resource.course_code)}`} className='mt-5 block'><h3 className='line-clamp-2 text-lg font-bold text-slate-900 group-hover:text-blue-800'>{resource.title}</h3><p className='mt-1 text-sm text-slate-500'>{resource.course_name || resource.department}</p></Link>
    <div className='mt-5 flex items-center justify-between border-t border-slate-100 pt-4 text-xs text-slate-500'><span className='inline-flex items-center gap-1.5'><GraduationCap size={14} /> {resource.course_code} · L{resource.level}</span><span>{Number(resource.downloads || 0)} downloads</span></div>
    <button onClick={() => onDownload(resource)} className='mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-blue-100 bg-white py-2.5 text-sm font-bold text-blue-800 transition hover:border-blue-700 hover:bg-blue-700 hover:text-white'><Download size={16} /> Download</button>
  </motion.article>;
}
