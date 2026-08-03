import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

export function Navbar() {
	const [open, setOpen] = useState(false);

	return (
		<header className='sticky top-0 z-40 border-b border-slate-800/70 bg-slate-950/85 backdrop-blur-xl'>
			<div className='mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8'>
				<Link
					to='/'
					className='flex items-center gap-3'
				>
					<div className='rounded-2xl border border-amber-400/30 bg-amber-500/10 p-2'>
						<img
							src='https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQrNXIMBlC_u4ndlTu--5LABOovtLa9-6qLNTuHpVu1fA&s=10'
							alt='NUPS-G crest'
							className='h-6 w-6 object-contain rounded-full'
						/>
					</div>
					<div>
						<p className='text-sm font-semibold text-white'>
							NUPS-G Resource Hub
						</p>
						<p className='text-xs text-slate-400'>
							Learn Together. Share Together.
						</p>
					</div>
				</Link>

				<nav className='hidden items-center gap-6 text-sm text-slate-300 md:flex'>
					<a
						href='#resources'
						className='transition hover:text-cyan-300'
					>
						Resources
					</a>
					<a
						href='#upload'
						className='transition hover:text-cyan-300'
					>
						Upload
					</a>
					<a
						href='#stats'
						className='transition hover:text-cyan-300'
					>
						Statistics
					</a>
				</nav>

				<button
					type='button'
					className='rounded-full border border-slate-700 p-2 text-slate-200 md:hidden'
					onClick={() => setOpen((prev) => !prev)}
					aria-label='Toggle menu'
				>
					{open ? <X size={18} /> : <Menu size={18} />}
				</button>
			</div>

			<AnimatePresence>
				{open ? (
					<motion.div
						initial={{ opacity: 0, height: 0 }}
						animate={{ opacity: 1, height: 'auto' }}
						exit={{ opacity: 0, height: 0 }}
						className='overflow-hidden border-t border-slate-800 bg-slate-950/95 md:hidden'
					>
						<div className='flex flex-col gap-3 px-4 py-4 text-sm text-slate-300'>
							<a
								href='#resources'
								onClick={() => setOpen(false)}
								className='transition hover:text-cyan-300'
							>
								Resources
							</a>
							<a
								href='#upload'
								onClick={() => setOpen(false)}
								className='transition hover:text-cyan-300'
							>
								Upload
							</a>
							<a
								href='#stats'
								onClick={() => setOpen(false)}
								className='transition hover:text-cyan-300'
							>
								Statistics
							</a>
						</div>
					</motion.div>
				) : null}
			</AnimatePresence>
		</header>
	);
}
