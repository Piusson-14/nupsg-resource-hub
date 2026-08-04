import { mockResources } from '../data/mockResources';
import { isSupabaseConfigured, supabase } from './supabase';

const BUCKET_NAME = 'nupsg-resources';
export const categories = [
	{ value: 'slides', label: 'Lecture slides' },
	{ value: 'past_questions', label: 'Past questions' },
];
export const SEMESTERS = ['First Semester', 'Second Semester'];
export const UPSA_DEPARTMENTS = [
	'Accounting',
	'Banking and Finance',
	'Economics and Actuarial Science',
	'Business Administration',
	'Marketing',
	'Information Technology Studies',
	'Communication Studies',
	'Law',
];
const normalize = (item) => ({
	...item,
	downloads: Number(item.downloads || 0),
	file_size: Number(item.file_size || 0),
});

export async function fetchResources() {
	if (!isSupabaseConfigured || !supabase) return mockResources.map(normalize);
	const { data, error } = await supabase
		.from('resources')
		.select('*')
		.order('created_at', { ascending: false });
	if (error) throw error;
	return (data || []).map(normalize);
}

export async function uploadResource(payload, onProgress) {
	if (!isSupabaseConfigured || !supabase)
		throw new Error(
			'Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to upload files.',
		);
	const safeName = payload.file.name.replace(/[^a-zA-Z0-9._-]/g, '-');
	const safeCourse = payload.course_code
		.replace(/[^a-zA-Z0-9]+/g, '-')
		.toLowerCase();
	const filePath = `${safeCourse}/${Date.now()}-${safeName}`;
	onProgress?.(20);
	const { error: uploadError } = await supabase.storage
		.from(BUCKET_NAME)
		.upload(filePath, payload.file, {
			cacheControl: '3600',
			upsert: false,
			contentType: payload.file.type,
		});
	if (uploadError) throw uploadError;
	onProgress?.(75);
	const row = {
		title: payload.title,
		description: payload.description || '',
		university: payload.university,
		department: payload.department,
		course_code: payload.course_code.toUpperCase(),
		level: payload.level,
		semester: payload.semester,
		category: payload.category,
		file_name: payload.file.name,
		file_path: filePath,
		file_size: payload.file.size,
	};
	if (payload.course_name) row.course_name = payload.course_name;

	let insertResult = await supabase
		.from('resources')
		.insert(row)
		.select()
		.single();
	if (
		insertResult.error &&
		insertResult.error.message?.includes('course_name')
	) {
		delete row.course_name;
		insertResult = await supabase
			.from('resources')
			.insert(row)
			.select()
			.single();
	}
	if (insertResult.error) throw insertResult.error;
	const { data } = insertResult;
	onProgress?.(100);
	return normalize(data);
}

export async function downloadResource(resource) {
	const demoFile = () => {
		const message = `NUPS-G Resource Hub demo\n\n${resource.title}\n${resource.course_code} · ${resource.course_name || ''}\n\nConnect Supabase and upload the original file to make it available here.`;
		return {
			downloadUrl: URL.createObjectURL(
				new Blob([message], { type: 'text/plain' }),
			),
			fileName: `${resource.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-demo.txt`,
		};
	};
	// Starter resources are intentionally local placeholders, not files in Storage.
	if (
		!resource.file_path ||
		!isSupabaseConfigured ||
		!supabase ||
		resource.file_path.startsWith('/files/')
	)
		return demoFile();

	const { error } = await supabase.rpc('increment_resource_downloads', {
		resource_id: resource.id,
	});
	// Supports projects created with the earlier migration, before the RPC was added.
	if (error) {
		const { error: updateError } = await supabase
			.from('resources')
			.update({ downloads: Number(resource.downloads || 0) + 1 })
			.eq('id', resource.id);
		if (updateError)
			console.warn(
				'Download counter could not be updated:',
				updateError.message,
			);
	}
	const { data, error: fileError } = await supabase.storage
		.from(BUCKET_NAME)
		.download(resource.file_path);
	if (fileError) {
		console.warn('Storage file could not be downloaded:', fileError.message);
		return demoFile();
	}
	return {
		downloadUrl: URL.createObjectURL(data),
		fileName: resource.file_name || 'nupsg-resource',
	};
}

export async function incrementResourceDownload(resource) {
	return downloadResource(resource);
}

export function saveDownload(url, fileName) {
	const link = document.createElement('a');
	link.href = url;
	link.download = fileName;
	document.body.appendChild(link);
	link.click();
	link.remove();
	window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
