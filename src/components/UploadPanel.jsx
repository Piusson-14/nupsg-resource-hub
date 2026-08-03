import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileUp, UploadCloud, CheckCircle2 } from 'lucide-react';
import { isSupabaseConfigured } from '../lib/supabase';

const initialForm = {
	title: '',
	university: '',
	department: '',
	course_code: '',
	level: '',
	semester: '',
	category: 'Lecture Slides',
	description: '',
};

export function UploadPanel({ onUpload }) {
	const [form, setForm] = useState(initialForm);
	const [file, setFile] = useState(null);
	const [isDragging, setIsDragging] = useState(false);
	const [progress, setProgress] = useState(0);
	const [message, setMessage] = useState('');

	const handleChange = (event) => {
		const { name, value } = event.target;
		setForm((prev) => ({ ...prev, [name]: value }));
	};

	const handleDrop = (event) => {
		event.preventDefault();
		setIsDragging(false);
		const droppedFile = event.dataTransfer.files?.[0];
		if (droppedFile) setFile(droppedFile);
	};

	const handleSubmit = async (event) => {
		event.preventDefault();
		if (!file) {
			setMessage('Please select a file to upload first.');
			return;
		}

		setProgress(35);
		setTimeout(() => setProgress(75), 400);
		try {
			await onUpload({ ...form, file });
			setProgress(100);
			setMessage(
				'Resource uploaded successfully. It is now available for students.',
			);
			setForm(initialForm);
			setFile(null);
		} catch (error) {
			setProgress(0);
			setMessage('Upload failed. Check your Supabase settings and try again.');
		}
	};

	return (
		<motion.section
			id='upload'
			initial={{ opacity: 0, y: 24 }}
			whileInView={{ opacity: 1, y: 0 }}
			viewport={{ once: true, amount: 0.2 }}
			className='rounded-[32px] border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 p-6 shadow-[0_30px_80px_-30px_rgba(34,211,238,0.3)] sm:p-8'
		>
			<div className='flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between'>
				<div>
					<p className='text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300'>
						Upload a resource
					</p>
					<h2 className='mt-2 text-2xl font-semibold text-white'>
						Share a study asset with your campus community.
					</h2>
				</div>
				<div className='rounded-full border border-cyan-400/20 bg-cyan-500/10 px-4 py-2 text-sm text-cyan-200'>
					Drag, drop, or browse your file
				</div>
			</div>

			<form
				onSubmit={handleSubmit}
				className='mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]'
			>
				<div className='space-y-4'>
					<div className='grid gap-4 sm:grid-cols-2'>
						<label className='text-sm text-slate-300'>
							Resource title
							<input
								name='title'
								value={form.title}
								onChange={handleChange}
								required
								className='mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-white outline-none transition focus:border-cyan-400'
							/>
						</label>
						<label className='text-sm text-slate-300'>
							University
							<input
								name='university'
								value={form.university}
								onChange={handleChange}
								required
								className='mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-white outline-none transition focus:border-cyan-400'
							/>
						</label>
						<label className='text-sm text-slate-300'>
							Department
							<input
								name='department'
								value={form.department}
								onChange={handleChange}
								required
								className='mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-white outline-none transition focus:border-cyan-400'
							/>
						</label>
						<label className='text-sm text-slate-300'>
							Course code
							<input
								name='course_code'
								value={form.course_code}
								onChange={handleChange}
								required
								className='mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-white outline-none transition focus:border-cyan-400'
							/>
						</label>
						<label className='text-sm text-slate-300'>
							Academic level
							<input
								name='level'
								value={form.level}
								onChange={handleChange}
								required
								className='mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-white outline-none transition focus:border-cyan-400'
							/>
						</label>
						<label className='text-sm text-slate-300'>
							Semester
							<input
								name='semester'
								value={form.semester}
								onChange={handleChange}
								required
								className='mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-white outline-none transition focus:border-cyan-400'
							/>
						</label>
					</div>

					<label className='text-sm text-slate-300'>
						Category
						<select
							name='category'
							value={form.category}
							onChange={handleChange}
							className='mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-white outline-none transition focus:border-cyan-400'
						>
							<option>Lecture Slides</option>
							<option>Past Questions</option>
							<option>Notes</option>
						</select>
					</label>

					<label className='text-sm text-slate-300'>
						Description
						<textarea
							name='description'
							value={form.description}
							onChange={handleChange}
							required
							rows='4'
							className='mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-white outline-none transition focus:border-cyan-400'
						/>
					</label>
				</div>

				<div className='space-y-4'>
					<div
						onDragOver={(event) => {
							event.preventDefault();
							setIsDragging(true);
						}}
						onDragLeave={() => setIsDragging(false)}
						onDrop={handleDrop}
						className={`flex min-h-[260px] flex-col items-center justify-center rounded-[24px] border-2 border-dashed p-6 text-center transition ${isDragging ? 'border-cyan-400 bg-cyan-500/10' : 'border-slate-700 bg-slate-950/40'}`}
					>
						<UploadCloud
							className='text-cyan-300'
							size={36}
						/>
						<p className='mt-3 text-lg font-semibold text-white'>
							{file ? file.name : 'Drop your file here'}
						</p>
						<p className='mt-2 text-sm text-slate-400'>
							Supports PDFs, DOCs, and slides. Files stay in your Supabase
							storage bucket.
						</p>
						<label className='mt-5 cursor-pointer rounded-full border border-cyan-400/20 bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-200 transition hover:bg-cyan-500/20'>
							Browse files
							<input
								type='file'
								className='hidden'
								onChange={(event) => setFile(event.target.files?.[0] || null)}
							/>
						</label>
					</div>

					<div className='rounded-2xl border border-slate-800 bg-slate-950/60 p-4 text-sm text-slate-300'>
						<div className='flex items-center justify-between'>
							<span>Upload progress</span>
							<span>{progress}%</span>
						</div>
						<div className='mt-3 h-2 rounded-full bg-slate-800'>
							<div
								className='h-2 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all'
								style={{ width: `${progress}%` }}
							/>
						</div>
						{file ? (
							<p className='mt-3 text-sm text-slate-400'>
								{file.name} • {(file.size / 1024 / 1024).toFixed(2)} MB
							</p>
						) : null}
					</div>

					<button
						type='submit'
						className='flex w-full items-center justify-center gap-2 rounded-2xl bg-cyan-500 px-4 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400'
					>
						<FileUp size={18} />
						Share resource
					</button>

					{message ? (
						<div
							className={`flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm ${message.includes('success') ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300' : 'border-amber-500/20 bg-amber-500/10 text-amber-300'}`}
						>
							<CheckCircle2 size={16} />
							{message}
						</div>
					) : null}
				</div>
			</form>
		</motion.section>
	);
}
