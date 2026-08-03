import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Clock3, Download, Sparkles, Layers3 } from 'lucide-react';
import { ResourceCard } from '../components/ResourceCard';
import { UploadPanel } from '../components/UploadPanel';
import { AnimatedCounter } from '../components/AnimatedCounter';
import {
	fetchResources,
	incrementResourceDownload,
	uploadResource,
} from '../lib/resourceService';

const categories = ['All', 'Lecture Slides', 'Past Questions', 'Notes'];
const universities = [
	'All',
	'University of Ghana',
	'Kwame Nkrumah University of Science and Technology',
	'University of Cape Coast',
	'University of Education, Winneba',
];
const levels = ['All', '100', '200', '300', '400'];
const semesters = ['All', 'First Semester', 'Second Semester'];

function formatBytes(bytes) {
	if (!bytes) return '0 MB';
	return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function HomePage() {
	const [resources, setResources] = useState([]);
	const [search, setSearch] = useState('');
	const [selectedCategory, setSelectedCategory] = useState('All');
	const [selectedUniversity, setSelectedUniversity] = useState('All');
	const [selectedLevel, setSelectedLevel] = useState('All');
	const [selectedSemester, setSelectedSemester] = useState('All');
	const [loading, setLoading] = useState(false);
	const [toast, setToast] = useState('');

	useEffect(() => {
		const loadResources = async () => {
			setLoading(true);
			try {
				const data = await fetchResources();
				setResources(data);
			} catch (error) {
				console.error(error);
				setToast('Unable to load resources from Supabase yet.');
			}
			setLoading(false);
		};

		loadResources();
	}, []);

	const filteredResources = useMemo(() => {
		const query = search.toLowerCase();
		return resources.filter((resource) => {
			const matchesSearch = [
				resource.title,
				resource.course_code,
				resource.department,
				resource.university,
			].some((value) => value.toLowerCase().includes(query));
			const matchesCategory =
				selectedCategory === 'All' || resource.category === selectedCategory;
			const matchesUniversity =
				selectedUniversity === 'All' ||
				resource.university === selectedUniversity;
			const matchesLevel =
				selectedLevel === 'All' || resource.level === selectedLevel;
			const matchesSemester =
				selectedSemester === 'All' || resource.semester === selectedSemester;
			return (
				matchesSearch &&
				matchesCategory &&
				matchesUniversity &&
				matchesLevel &&
				matchesSemester
			);
		});
	}, [
		resources,
		search,
		selectedCategory,
		selectedUniversity,
		selectedLevel,
		selectedSemester,
	]);

	const stats = useMemo(
		() => ({
			resources: resources.length,
			downloads: resources.reduce(
				(sum, resource) => sum + resource.downloads,
				0,
			),
			universities: new Set(resources.map((resource) => resource.university))
				.size,
			departments: new Set(resources.map((resource) => resource.department))
				.size,
		}),
		[resources],
	);

	const handleDownload = async (resource) => {
		try {
			const { downloadUrl } = await incrementResourceDownload(resource);
			setResources((prev) =>
				prev.map((item) =>
					item.id === resource.id
						? { ...item, downloads: item.downloads + 1 }
						: item,
				),
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

	const handleUpload = async (payload) => {
		try {
			const resource = await uploadResource(payload);
			setResources((prev) => [resource, ...prev]);
			setToast('Resource uploaded. Students can discover it instantly.');
			setTimeout(() => setToast(''), 2200);
		} catch (error) {
			console.error(error);
			setToast(
				'Upload failed. Make sure your Supabase bucket and table are configured for public access.',
			);
		}
	};

	return (
		<div className='min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.18),_transparent_35%),linear-gradient(135deg,_#020617_0%,_#0f172a_45%,_#111827_100%)] text-slate-100'>
			<main className='mx-auto flex max-w-7xl flex-col gap-8 px-4 py-6 sm:px-6 lg:px-8 lg:py-8'>
				<motion.section
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					className='overflow-hidden rounded-[36px] border border-slate-800 bg-slate-900/70 shadow-[0_40px_100px_-40px_rgba(34,211,238,0.5)]'
				>
					<div className='grid gap-8 px-6 py-8 sm:px-8 lg:grid-cols-[1.15fr_0.85fr] lg:px-10 lg:py-10'>
						<div className='space-y-6'>
							<div className='inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-500/10 px-3 py-1 text-sm text-cyan-200'>
								<Sparkles size={16} />A modern student resource hub for NUPS-G
							</div>
							<div className='space-y-3'>
								<h1 className='max-w-2xl text-4xl font-semibold leading-tight text-white sm:text-5xl'>
									Discover the best study resources across campuses.
								</h1>
								<p className='max-w-xl text-lg text-slate-400'>
									Share lecture slides, notes, and past questions with a vibrant
									community built for students who learn together.
								</p>
							</div>

							<div className='flex flex-wrap gap-3'>
								<div className='rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-3'>
									<p className='text-2xl font-semibold text-white'>
										<AnimatedCounter value={stats.resources} />
									</p>
									<p className='text-sm text-slate-400'>Resources available</p>
								</div>
								<div className='rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-3'>
									<p className='text-2xl font-semibold text-white'>
										<AnimatedCounter value={stats.downloads} />
									</p>
									<p className='text-sm text-slate-400'>Downloads</p>
								</div>
								<div className='rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-3'>
									<p className='text-2xl font-semibold text-white'>
										<AnimatedCounter value={stats.universities} />
									</p>
									<p className='text-sm text-slate-400'>Universities</p>
								</div>
							</div>
						</div>

						<div className='rounded-[28px] border border-slate-800 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-6'>
							<div className='flex items-center justify-between'>
								<div>
									<p className='text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300'>
										Search resources
									</p>
									<h2 className='mt-2 text-xl font-semibold text-white'>
										Find what you need in seconds
									</h2>
								</div>
								<div className='rounded-2xl border border-amber-400/20 bg-amber-500/10 p-3'>
									<img
										src='https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQrNXIMBlC_u4ndlTu--5LABOovtLa9-6qLNTuHpVu1fA&s=10'
										alt='NUPS-G crest'
										className='h-6 w-6 object-contain rounded-full'
									/>
								</div>
							</div>

							<label className='mt-6 flex items-center gap-3 rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3'>
								<img
									src='https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQrNXIMBlC_u4ndlTu--5LABOovtLa9-6qLNTuHpVu1fA&s=10'
									alt='NUPS-G crest'
									className='h-5 w-5 object-contain rounded-full'
								/>
								<input
									value={search}
									onChange={(event) => setSearch(event.target.value)}
									placeholder='Search by title, course code, department, university'
									className='w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500'
								/>
							</label>

							<div className='mt-6 flex flex-wrap gap-2'>
								{categories.map((category) => (
									<button
										key={category}
										type='button'
										onClick={() => setSelectedCategory(category)}
										className={`rounded-full px-3 py-2 text-sm transition ${selectedCategory === category ? 'bg-cyan-500 text-slate-950' : 'border border-slate-700 bg-slate-900/70 text-slate-300'}`}
									>
										{category}
									</button>
								))}
							</div>

							<div className='mt-6 grid gap-3 sm:grid-cols-3'>
								<div className='rounded-2xl border border-slate-800 bg-slate-900/70 p-3'>
									<p className='text-xs uppercase tracking-[0.25em] text-slate-500'>
										Universities
									</p>
									<p className='mt-2 text-lg font-semibold text-white'>
										{stats.universities}
									</p>
								</div>
								<div className='rounded-2xl border border-slate-800 bg-slate-900/70 p-3'>
									<p className='text-xs uppercase tracking-[0.25em] text-slate-500'>
										Departments
									</p>
									<p className='mt-2 text-lg font-semibold text-white'>
										{stats.departments}
									</p>
								</div>
								<div className='rounded-2xl border border-slate-800 bg-slate-900/70 p-3'>
									<p className='text-xs uppercase tracking-[0.25em] text-slate-500'>
										Storage
									</p>
									<p className='mt-2 text-lg font-semibold text-white'>
										{formatBytes(
											resources.reduce(
												(sum, item) => sum + (item.file_size || 0),
												0,
											),
										)}
									</p>
								</div>
							</div>
						</div>
					</div>
				</motion.section>

				<section
					id='stats'
					className='grid gap-4 md:grid-cols-3'
				>
					<div className='rounded-3xl border border-slate-800 bg-slate-900/70 p-5'>
						<div className='flex items-center gap-3 text-cyan-300'>
							<Layers3 size={18} />
							<p className='text-sm font-semibold uppercase tracking-[0.25em]'>
								Trending
							</p>
						</div>
						<p className='mt-3 text-2xl font-semibold text-white'>
							{filteredResources.length} resources ready
						</p>
						<p className='mt-2 text-sm text-slate-400'>
							Search results update instantly as you type.
						</p>
					</div>
					<div className='rounded-3xl border border-slate-800 bg-slate-900/70 p-5'>
						<div className='flex items-center gap-3 text-cyan-300'>
							<Clock3 size={18} />
							<p className='text-sm font-semibold uppercase tracking-[0.25em]'>
								Recently added
							</p>
						</div>
						<p className='mt-3 text-2xl font-semibold text-white'>
							{resources.slice(0, 3).length} fresh uploads
						</p>
						<p className='mt-2 text-sm text-slate-400'>
							The newest files appear first for easy discovery.
						</p>
					</div>
					<div className='rounded-3xl border border-slate-800 bg-slate-900/70 p-5'>
						<div className='flex items-center gap-3 text-cyan-300'>
							<Download size={18} />
							<p className='text-sm font-semibold uppercase tracking-[0.25em]'>
								Downloads
							</p>
						</div>
						<p className='mt-3 text-2xl font-semibold text-white'>
							{stats.downloads}
						</p>
						<p className='mt-2 text-sm text-slate-400'>
							Every click updates the counter in real time.
						</p>
					</div>
				</section>

				<section className='rounded-[32px] border border-slate-800 bg-slate-900/70 p-6 sm:p-8'>
					<div className='flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between'>
						<div>
							<p className='text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300'>
								Resource library
							</p>
							<h2 className='mt-2 text-2xl font-semibold text-white'>
								Browse resources by campus, department, and level.
							</h2>
						</div>
						<div className='flex flex-wrap gap-3'>
							<select
								value={selectedUniversity}
								onChange={(event) => setSelectedUniversity(event.target.value)}
								className='rounded-2xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-white'
							>
								{universities.map((option) => (
									<option key={option}>{option}</option>
								))}
							</select>
							<select
								value={selectedLevel}
								onChange={(event) => setSelectedLevel(event.target.value)}
								className='rounded-2xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-white'
							>
								{levels.map((option) => (
									<option key={option}>{option}</option>
								))}
							</select>
							<select
								value={selectedSemester}
								onChange={(event) => setSelectedSemester(event.target.value)}
								className='rounded-2xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-white'
							>
								{semesters.map((option) => (
									<option key={option}>{option}</option>
								))}
							</select>
						</div>
					</div>

					<div
						id='resources'
						className='mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3'
					>
						{loading ? (
							Array.from({ length: 3 }).map((_, index) => (
								<div
									key={index}
									className='h-64 animate-pulse rounded-3xl border border-slate-800 bg-slate-950/70'
								/>
							))
						) : filteredResources.length ? (
							filteredResources.map((resource) => (
								<ResourceCard
									key={resource.id}
									resource={resource}
									onDownload={handleDownload}
								/>
							))
						) : (
							<div className='rounded-3xl border border-dashed border-slate-700 bg-slate-950/40 p-8 text-center text-slate-400 md:col-span-2 xl:col-span-3'>
								<p className='text-lg font-semibold text-white'>
									No resources match your filters yet.
								</p>
								<p className='mt-2'>
									Try broadening your search or upload a new resource.
								</p>
							</div>
						)}
					</div>
				</section>

				<UploadPanel onUpload={handleUpload} />
			</main>

			<footer className='border-t border-slate-800 bg-slate-950/70 px-4 py-6 text-center text-sm text-slate-400 sm:px-6 lg:px-8'>
				<p>
					© 2026 Piusson. Made for NUPS-G students who want to learn faster,
					study smarter, and share with purpose.
				</p>
			</footer>

			{toast ? (
				<div className='fixed bottom-4 right-4 z-50 rounded-2xl border border-cyan-400/20 bg-slate-900/90 px-4 py-3 text-sm text-cyan-100 shadow-lg'>
					{toast}
				</div>
			) : null}
		</div>
	);
}
