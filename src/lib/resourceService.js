import { isSupabaseConfigured, supabase } from './supabase';
import { RESOURCE_UPLOADER_ENDPOINT, uploadFiles } from './uploadthing';

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
	// New UploadThing columns; legacy rows only have file_path.
	file_url: item.file_url || null,
	file_key: item.file_key || null,
});

export async function fetchResources() {
	if (!isSupabaseConfigured || !supabase) {
		throw new Error(
			'Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY and restart the app.',
		);
	}
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

	const { data: duplicate, error: duplicateError } = await supabase
		.from('resources')
		.select('id')
		.eq('course_code', payload.course_code.toUpperCase())
		.eq('category', payload.category)
		.eq('file_name', payload.file.name)
		.maybeSingle();
	if (duplicate) {
		throw new Error(
			'This file has already been uploaded for the selected course and type.',
		);
	}
	if (duplicateError) {
		console.warn('Duplicate check error:', duplicateError.message);
	}
	onProgress?.(10);

	// 1. File bytes go to UploadThing via /api/uploadthing.
	let uploaded;
	try {
		const result = await uploadFiles(RESOURCE_UPLOADER_ENDPOINT, {
			files: [payload.file],
			onUploadProgress: ({ progress }) => {
				// Reserve 10% for the duplicate check and 25% for the DB insert.
				onProgress?.(Math.round(10 + (progress / 100) * 65));
			},
		});
		uploaded = result?.[0];
	} catch (err) {
		console.error('UploadThing upload failed:', err);
		throw new Error(
			'File upload failed. If running locally with `vite`, use `vercel dev` so /api/uploadthing exists, or deploy a preview.',
		);
	}
	const fileUrl = uploaded?.ufsUrl || uploaded?.url;
	const fileKey = uploaded?.key;
	if (!fileUrl || !fileKey) {
		throw new Error('File upload failed. Please try again.');
	}
	onProgress?.(80);

	// 2. Metadata row stays in Supabase so browsing/filtering is unchanged.
	// file_path keeps the UploadThing key for backwards compatibility
	// with the NOT NULL constraint on older projects.
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
		file_path: fileKey,
		file_size: payload.file.size,
		file_url: fileUrl,
		file_key: fileKey,
	};
	if (payload.course_name) row.course_name = payload.course_name;

	let insertResult = await supabase
		.from('resources')
		.insert(row)
		.select()
		.single();
	if (
		insertResult.error &&
		(insertResult.error.message?.includes('course_name') ||
			insertResult.error.message?.includes('file_url') ||
			insertResult.error.message?.includes('file_key'))
	) {
		// Older DB without the newer columns: retry with only legacy fields.
		// Run supabase/uploadthing-migration.sql to stop hitting this path.
		delete row.course_name;
		delete row.file_url;
		delete row.file_key;
		row.file_path = fileUrl;
		insertResult = await supabase.from('resources').insert(row).select().single();
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

	const bumpCounter = async () => {
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
	};

	// New UploadThing rows: files live on the UploadThing CDN, open directly.
	const directUrl = resource.file_url || (resource.file_path?.startsWith('http') ? resource.file_path : null);
	if (directUrl) {
		await bumpCounter();
		return { downloadUrl: directUrl, fileName: resource.file_name || 'nupsg-resource' };
	}

	// Legacy rows: files live in the Supabase Storage bucket.
	await bumpCounter();
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
