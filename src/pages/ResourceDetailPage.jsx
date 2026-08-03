import { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
	ArrowLeft,
	ArrowDownToLine,
	CalendarDays,
	FileText,
	GraduationCap,
	Building2,
	BookOpenText,
} from 'lucide-react';
import {
	fetchResources,
	incrementResourceDownload,
} from '../lib/resourceService';

export function ResourceDetailPage() {
	const { id } = useParams();
	const [resource, setResource] = useState(null);
	const [relatedResources, setRelatedResources] = useState([]);
	const [loading, setLoading] = useState(true);
	const [toast, setToast] = useState('');

	useEffect(() => {
		const loadResource = async () => {
			setLoading(true);
			try {
				const resources = await fetchResources();
				const current = resources.find((item) => item.id === id);
				setResource(current || null);
				setRelatedResources(
					resources.filter((item) => item.id !== id).slice(0, 3),
				);
			} catch (error) {
				console.error(error);
			}
			setLoading(false);
		};

		loadResource();
	}, [id]);

	const formattedDate = useMemo(() => {
		if (!resource?.created_at) return 'Recently added';
		return new Date(resource.created_at).toLocaleDateString(undefined, {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
		});
	}, [resource]);

	const handleDownload = async () => {
		if (!resource) return;
		try {
			const { downloadUrl } = await incrementResourceDownload(resource);
			setResource((prev) =>
				prev ? { ...prev, downloads: prev.downloads + 1 } : prev,
			);
			if (downloadUrl) {
				window.open(downloadUrl, '_blank', 'noopener,noreferrer');
			}
			setToast(`Downloaded ${resource.title}`);
			setTimeout(() => setToast(''), 1800);
		} catch (error) {
			console.error(error);
			setToast('Unable to download this resource right now.');
		}
	};

	if (loading) {
		return (
			<div className='mx-auto max-w-6xl px-6 py-16 text-slate-300'>
				Loading resource...
			</div>
		);
	}

	if (!resource) {
		return (
			<div className='mx-auto max-w-6xl px-6 py-16 text-slate-300'>
				<p className='text-2xl font-semibold text-white'>Resource not found.</p>
				<Link
					to='/'
					className='mt-4 inline-flex items-center gap-2 text-cyan-300'
				>
					{' '}
					<ArrowLeft size={16} /> Back to library{' '}
				</Link>
			</div>
		);
	}

	return (
		<div className='min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.18),_transparent_35%),linear-gradient(135deg,_#020617_0%,_#0f172a_45%,_#111827_100%)] px-4 py-10 text-slate-100 sm:px-6 lg:px-8'>
			<div className='mx-auto max-w-6xl rounded-[32px] border border-slate-800 bg-slate-900/80 p-6 shadow-[0_30px_80px_-30px_rgba(34,211,238,0.3)] sm:p-8'>
				<Link
					to='/'
					className='inline-flex items-center gap-2 text-sm text-cyan-300'
				>
					<ArrowLeft size={16} /> Back to resources
				</Link>

				<div className='mt-8 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]'>
					<div>
						<div className='inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-500/10 px-3 py-1 text-sm text-cyan-200'>
							<FileText size={16} /> {resource.category}
						</div>
						<h1 className='mt-4 text-3xl font-semibold text-white sm:text-4xl'>
							{resource.title}
						</h1>
						<p className='mt-4 text-lg text-slate-400'>
							{resource.description}
						</p>

						<div className='mt-8 grid gap-4 sm:grid-cols-2'>
							<div className='rounded-2xl border border-slate-800 bg-slate-950/60 p-4'>
								<p className='text-sm text-slate-500'>University</p>
								<p className='mt-2 flex items-center gap-2 text-white'>
									<Building2 size={16} /> {resource.university}
								</p>
							</div>
							<div className='rounded-2xl border border-slate-800 bg-slate-950/60 p-4'>
								<p className='text-sm text-slate-500'>Department</p>
								<p className='mt-2 flex items-center gap-2 text-white'>
									<BookOpenText size={16} /> {resource.department}
								</p>
							</div>
							<div className='rounded-2xl border border-slate-800 bg-slate-950/60 p-4'>
								<p className='text-sm text-slate-500'>Course</p>
								<p className='mt-2 flex items-center gap-2 text-white'>
									<GraduationCap size={16} /> {resource.course_code}
								</p>
							</div>
							<div className='rounded-2xl border border-slate-800 bg-slate-950/60 p-4'>
								<p className='text-sm text-slate-500'>Uploaded</p>
								<p className='mt-2 flex items-center gap-2 text-white'>
									<CalendarDays size={16} /> {formattedDate}
								</p>
							</div>
						</div>
					</div>

					<div className='rounded-[28px] border border-slate-800 bg-slate-950/60 p-6'>
						<p className='text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300'>
							Download
						</p>
						<p className='mt-3 text-2xl font-semibold text-white'>
							{resource.downloads} downloads
						</p>
						<p className='mt-2 text-sm text-slate-400'>
							Open the file directly from the public Supabase bucket.
						</p>
						<button
							onClick={handleDownload}
							className='mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-cyan-500 px-4 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400'
						>
							<ArrowDownToLine size={18} /> Download resource
						</button>
						<div className='mt-6 rounded-2xl border border-slate-800 bg-slate-900/70 p-4 text-sm text-slate-400'>
							<p className='font-semibold text-white'>Related resources</p>
							<div className='mt-3 space-y-3'>
								{relatedResources.map((item) => (
									<Link
										key={item.id}
										to={`/resources/${item.id}`}
										className='block rounded-2xl border border-slate-800 p-3 transition hover:border-cyan-400/30 hover:text-cyan-300'
									>
										<p className='font-medium text-white'>{item.title}</p>
										<p className='mt-1 text-sm text-slate-400'>
											{item.university} • {item.department}
										</p>
									</Link>
								))}
							</div>
						</div>
					</div>
				</div>
			</div>

			{toast ? (
				<div className='fixed bottom-4 right-4 rounded-2xl border border-cyan-400/20 bg-slate-900/90 px-4 py-3 text-sm text-cyan-100 shadow-lg'>
					{toast}
				</div>
			) : null}
		</div>
	);
}
