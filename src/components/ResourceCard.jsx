import { motion } from 'framer-motion';
import { ArrowDownToLine, FileText, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export function ResourceCard({ resource, onDownload }) {
	return (
		<motion.article
			whileHover={{ y: -4, scale: 1.01 }}
			transition={{ type: 'spring', stiffness: 220, damping: 20 }}
			className='group rounded-3xl border border-slate-800 bg-slate-900/70 p-5 shadow-[0_20px_50px_-20px_rgba(34,211,238,0.35)]'
		>
			<div className='flex items-start justify-between gap-3'>
				<div className='rounded-2xl border border-cyan-400/20 bg-cyan-500/10 p-3 text-cyan-300'>
					<FileText size={18} />
				</div>
				<span className='rounded-full border border-amber-400/20 bg-amber-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-300'>
					{resource.category}
				</span>
			</div>

			<div className='mt-5 space-y-2'>
				<h3 className='text-lg font-semibold text-white'>{resource.title}</h3>
				<p className='line-clamp-3 text-sm text-slate-400'>
					{resource.description}
				</p>
			</div>

			<div className='mt-5 grid gap-2 text-sm text-slate-400'>
				<div className='flex items-center justify-between'>
					<span>{resource.university}</span>
					<span>{resource.department}</span>
				</div>
				<div className='flex items-center justify-between'>
					<span>{resource.course_code}</span>
					<span>{resource.level}</span>
				</div>
			</div>

			<div className='mt-5 flex items-center justify-between text-sm text-slate-400'>
				<span>{resource.semester}</span>
				<span>{resource.downloads} downloads</span>
			</div>

			<div className='mt-6 flex items-center gap-3'>
				<Link
					to={`/resources/${resource.id}`}
					className='flex-1 rounded-2xl border border-slate-700 px-4 py-2 text-center text-sm font-medium text-slate-200 transition hover:border-cyan-400/40 hover:text-cyan-300'
				>
					View details
				</Link>
				<button
					type='button'
					onClick={() => onDownload(resource)}
					className='flex items-center gap-2 rounded-2xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400'
				>
					<ArrowDownToLine size={16} />
					Download
				</button>
			</div>
		</motion.article>
	);
}
