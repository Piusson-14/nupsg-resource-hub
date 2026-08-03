import { mockResources } from '../data/mockResources';
import { supabase, isSupabaseConfigured } from './supabase';

const BUCKET_NAME = 'nupsg-resources';

function normalizeResource(resource) {
	return {
		...resource,
		downloads: Number(resource.downloads || 0),
		file_size: Number(resource.file_size || 0),
		created_at: resource.created_at || new Date().toISOString(),
	};
}

export async function fetchResources() {
	if (!isSupabaseConfigured || !supabase) {
		return mockResources;
	}

	const { data, error } = await supabase
		.from('resources')
		.select('*')
		.order('created_at', { ascending: false });

	if (error) {
		throw error;
	}

	return (data || []).map(normalizeResource);
}

export async function uploadResource(payload) {
	if (!isSupabaseConfigured || !supabase) {
		throw new Error(
			'Supabase is not configured yet. Add your project URL and anon key first.',
		);
	}

	const fileName = `${Date.now()}-${payload.file.name.replace(/\s+/g, '-')}`;
	const storagePath = `resources/${fileName}`;

	const { error: uploadError } = await supabase.storage
		.from(BUCKET_NAME)
		.upload(storagePath, payload.file, {
			cacheControl: '3600',
			upsert: false,
		});

	if (uploadError) {
		throw uploadError;
	}

	const { data: publicUrlData } = supabase.storage
		.from(BUCKET_NAME)
		.getPublicUrl(storagePath);

	const resourcePayload = {
		id: crypto.randomUUID
			? crypto.randomUUID()
			: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
		title: payload.title,
		description: payload.description,
		university: payload.university,
		department: payload.department,
		course_code: payload.course_code,
		level: payload.level,
		semester: payload.semester,
		category: payload.category,
		file_name: payload.file.name,
		file_path: storagePath,
		file_size: payload.file.size,
		downloads: 0,
		created_at: new Date().toISOString(),
	};

	const { data, error } = await supabase
		.from('resources')
		.insert([resourcePayload])
		.select()
		.single();

	if (error) {
		throw error;
	}

	return normalizeResource({ ...data, publicUrl: publicUrlData?.publicUrl });
}

export async function incrementResourceDownload(resource) {
	if (!isSupabaseConfigured || !supabase) {
		return { downloadUrl: null };
	}

	const { error } = await supabase
		.from('resources')
		.update({ downloads: (resource.downloads || 0) + 1 })
		.eq('id', resource.id);

	if (error) {
		throw error;
	}

	if (resource.file_path?.startsWith('http')) {
		return { downloadUrl: resource.file_path };
	}

	const { data } = supabase.storage
		.from(BUCKET_NAME)
		.getPublicUrl(resource.file_path);
	return { downloadUrl: data?.publicUrl || null };
}
