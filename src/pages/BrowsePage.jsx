import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal } from 'lucide-react';
import {
	downloadResource,
	fetchResources,
	saveDownload,
	SEMESTERS,
	UPSA_DEPARTMENTS,
} from '../lib/resourceService';

function CourseFolderCard({ group, onOpen }) {
	const slideCount = group.items.filter(
		(item) => item.category === 'slides',
	).length;
	const questionCount = group.items.filter(
		(item) => item.category === 'past_questions',
	).length;
	return (
		<button
			type='button'
			onClick={onOpen}
			className='resource-folder-card'
		>
			<div className='folder-heading'>
				<div>
					<p className='folder-label'>Course</p>
					<h3>{group.course_name || group.course_code}</h3>
					<p className='folder-meta'>
						{group.course_code} · {group.department} · L{group.level}
					</p>
				</div>
				<span className='folder-count'>{group.items.length} resources</span>
			</div>
			<div className='folder-tags'>
				{slideCount > 0 && <span className='tag'>Slides</span>}
				{questionCount > 0 && <span className='tag'>Past questions</span>}
			</div>
		</button>
	);
}

export function BrowsePage() {
	const [searchParams] = useSearchParams();
	const navigate = useNavigate();
	const [resources, setResources] = useState([]);
	const [loading, setLoading] = useState(true);
	const [query, setQuery] = useState('');
	const [filters, setFilters] = useState({
		level: searchParams.get('level') || '',
		semester: '',
		category: '',
		department: '',
	});
	const [notice, setNotice] = useState('');

	useEffect(() => {
		fetchResources()
			.then(setResources)
			.catch(() =>
				setNotice('The library could not be loaded. Please try again later.'),
			)
			.finally(() => setLoading(false));
	}, []);

	const visible = useMemo(
		() =>
			resources.filter((r) => {
				const q = query.toLowerCase();
				return (
					(!q ||
						[r.title, r.course_code, r.course_name, r.department]
							.join(' ')
							.toLowerCase()
							.includes(q)) &&
					Object.entries(filters).every(([k, v]) => !v || r[k] === v)
				);
			}),
		[resources, query, filters],
	);

	const grouped = useMemo(() => {
		const map = new Map();
		visible.forEach((resource) => {
			const key = resource.course_code;
			if (!map.has(key)) {
				map.set(key, {
					course_code: resource.course_code,
					course_name: resource.course_name,
					department: resource.department,
					level: resource.level,
					semester: resource.semester,
					items: [],
				});
			}
			map.get(key).items.push(resource);
		});
		return Array.from(map.values());
	}, [visible]);

	const download = async (r) => {
		try {
			const { downloadUrl, fileName } = await downloadResource(r);
			setResources((items) =>
				items.map((x) =>
					x.id === r.id ? { ...x, downloads: x.downloads + 1 } : x,
				),
			);
			saveDownload(downloadUrl, fileName);
		} catch {
			setNotice('Download could not be started.');
		}
	};

	const filterOptions = {
		level: ['100', '200', '300', '400'],
		semester: SEMESTERS,
		department: UPSA_DEPARTMENTS,
		category: ['slides', 'past_questions'],
	};

	return (
		<main className='page-shell browse-page'>
			<div className='page-intro'>
				<p className='eyebrow'>The library</p>
				<h1>
					Resources for every <span>study session.</span>
				</h1>
				<p>
					Search by course, then filter the collection to find exactly what you
					need.
				</p>
			</div>

			<section className='filters'>
				<div className='search-box'>
					<Search size={19} />
					<input
						value={query}
						onChange={(e) => setQuery(e.target.value)}
						placeholder='Search course code, title or department'
					/>
				</div>
				<div className='filter-row'>
					<span>
						<SlidersHorizontal size={16} /> Filter
					</span>
					{[
						['level', 'Level'],
						['semester', 'Semester'],
						['department', 'Department'],
						['category', 'Type'],
					].map(([key, label]) => (
						<select
							key={key}
							value={filters[key]}
							onChange={(e) =>
								setFilters((f) => ({ ...f, [key]: e.target.value }))
							}
						>
							<option value=''>All {label}s</option>
							{filterOptions[key].map((x) => (
								<option
									key={x}
									value={x}
								>
									{x.replace('_', ' ')}
								</option>
							))}
						</select>
					))}
				</div>
			</section>

			<div className='results-head'>
				<p>
					<b>{grouped.length}</b> courses found
				</p>
				{notice && <p className='notice'>{notice}</p>}
			</div>

			<section className='resource-grid'>
				{loading ? (
					Array.from({ length: 6 }).map((_, i) => (
						<div
							key={i}
							className='skeleton'
						/>
					))
				) : grouped.length ? (
					grouped.map((group) => (
						<CourseFolderCard
							key={group.course_code}
							group={group}
							onOpen={() =>
								navigate(`/course/${encodeURIComponent(group.course_code)}`)
							}
						/>
					))
				) : (
					<div className='empty-state'>
						<h2>No courses match that search.</h2>
						<p>Try a different course code or remove a filter.</p>
					</div>
				)}
			</section>
		</main>
	);
}
