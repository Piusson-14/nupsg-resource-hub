import { AnimatePresence, motion } from 'framer-motion';
import { Menu, Upload, X } from 'lucide-react';
import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';

const navClass = ({ isActive }) => `text-sm font-medium transition ${isActive ? 'text-blue-800' : 'text-slate-600 hover:text-blue-700'}`;

export function Navbar() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  return <header className='sticky top-0 z-40 border-b border-blue-100/80 bg-white/80 backdrop-blur-xl'>
    <div className='mx-auto flex h-18 max-w-7xl items-center justify-between px-5 sm:px-8'>
      <Link to='/' onClick={close} className='flex items-center gap-3'>
        <span className='grid h-10 w-10 place-items-center overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-lg shadow-blue-200'><img src='https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcStuRUj1mHE_qZLdcIfE7iqb61NyiIUrALhTCy-zYhzBA&s=10' alt='NUPS-G crest' className='h-full w-full object-cover' /></span>
        <span><b className='block text-sm tracking-tight text-slate-900'>NUPS-G Resource Hub</b><small className='block text-[11px] text-slate-500'>Learn Together. Share Together.</small></span>
      </Link>
      <nav className='hidden items-center gap-7 md:flex'>
        <NavLink to='/browse' className={navClass}>Browse library</NavLink>
        <NavLink to='/upload' className={navClass}>Share a resource</NavLink>
        <Link to='/upload' className='inline-flex items-center gap-2 rounded-xl bg-blue-800 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-200 transition hover:bg-blue-700'><Upload size={16} /> Upload</Link>
      </nav>
      <button className='rounded-xl p-2 text-slate-700 md:hidden' onClick={() => setOpen(!open)} aria-label='Toggle navigation'>{open ? <X /> : <Menu />}</button>
    </div>
    <AnimatePresence>{open && <motion.nav initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className='overflow-hidden border-t border-blue-50 bg-white md:hidden'><div className='flex flex-col gap-4 px-5 py-5'><NavLink onClick={close} to='/browse' className={navClass}>Browse library</NavLink><NavLink onClick={close} to='/upload' className={navClass}>Share a resource</NavLink></div></motion.nav>}</AnimatePresence>
  </header>;
}
