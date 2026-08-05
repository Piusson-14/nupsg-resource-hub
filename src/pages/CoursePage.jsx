import { useEffect, useState } from 'react';
import { ArrowLeft, Download, Files } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import {
	downloadResource,
	fetchResources,
	saveDownload,
} from '../lib/resourceService';
import { ResourceCard } from '../components/ResourceCard';
export function CoursePage() {
	const { courseCode } = useParams();
	const [items, setItems] = useState([]);
	const [loading, setLoading] = useState(true);
	useEffect(() => {
		fetchResources()
			.then((r) => setItems(r.filter((x) => x.course_code === courseCode)))
			.finally(() => setLoading(false));
	}, [courseCode]);

	const download = async (r) => {
		const { downloadUrl, fileName } = await downloadResource(r);
		saveDownload(downloadUrl, fileName);
	};

	const course = items[0];
	return (
		<main className='page-shell browse-page'>
			<Link
				to='/browse'
				className='back-link'
			>
				<ArrowLeft size={16} /> Back to library
			</Link>

			{loading ? (
				<div className='skeleton h-52' />
			) : (
				<>
					<div className='course-hero'>
						<span className='course-icon'>
							<Files />
						</span>
						<div>
							<p className='eyebrow'>
								{course?.department || 'Course library'}
							</p>
							<h1>{course?.course_name || courseCode}</h1>
							<p>
								{course?.course_name
									? `${course.course_name} · Level ${course.level} · ${course.semester}`
									: 'Materials shared for this course'}
							</p>
						</div>
					</div>

					<div className='results-head'>
						<p>
							<b>{items.length}</b> course resources
						</p>
					</div>

					<section className='resource-grid'>
						{items.length ? (
							items.map((r) => (
								<ResourceCard
									key={r.id}
									resource={r}
									onDownload={download}
								/>
							))
						) : (
							<div className='empty-state'>
								<h2>This course is waiting for its first resource.</h2>
								<Link
									to='/upload'
									className='primary-button mt-5'
								>
									Share a resource <Download size={16} />
								</Link>
							</div>
						)}
					</section>
				</>
			)}
		</main>
	);
}
