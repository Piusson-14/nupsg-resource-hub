import { createRouteHandler, createUploadthing } from 'uploadthing/server';

const f = createUploadthing();

// Single public endpoint for lecture slides + past questions.
// No auth: this is a student-led open library (matches the existing
// open Supabase policies). Add auth in .middleware() if that changes.
export const ourFileRouter = {
	resourceUploader: f({
		pdf: { maxFileSize: '16MB', maxFileCount: 1 },
		text: { maxFileSize: '8MB', maxFileCount: 1 },
		image: { maxFileSize: '8MB', maxFileCount: 1 },
		video: { maxFileSize: '64MB', maxFileCount: 1 },
		audio: { maxFileSize: '16MB', maxFileCount: 1 },
		// DOCX / PPTX / ZIP etc. fall under blob
		blob: { maxFileSize: '32MB', maxFileCount: 1 },
	})
		.middleware(async () => ({}))
		.onUploadComplete(async ({ file }) => ({
			fileUrl: file.ufsUrl,
			fileKey: file.key,
		})),
};

const handlers = createRouteHandler({ router: ourFileRouter });

function getRawBody(req) {
	return new Promise((resolve, reject) => {
		// Vercel may pre-parse JSON bodies; reuse it when present.
		if (req.body !== undefined) {
			const body =
				typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
			return resolve(body);
		}
		let data = '';
		req.on('data', (chunk) => {
			data += chunk;
		});
		req.on('end', () => resolve(data));
		req.on('error', reject);
	});
}

// Vercel Node serverless bridge: convert (req, res) to a fetch
// Request, run the UploadThing handler, then pipe the Response back.
export default async function handler(req, res) {
	try {
		const protocol =
			req.headers['x-forwarded-proto'] ||
			(req.socket?.encrypted ? 'https' : 'http');
		const host =
			req.headers['x-forwarded-host'] || req.headers.host || 'localhost';
		const url = `${protocol}://${host}${req.url}`;

		const headers = new Headers();
		for (const [key, value] of Object.entries(req.headers)) {
			if (value === undefined) continue;
			headers.set(key, Array.isArray(value) ? value.join(', ') : String(value));
		}

		let webRequest;
		if (req.method === 'GET' || req.method === 'HEAD') {
			webRequest = new Request(url, { method: req.method, headers });
		} else {
			const rawBody = await getRawBody(req);
			webRequest = new Request(url, {
				method: req.method,
				headers,
				body: rawBody || null,
			});
		}

		const routeHandler = handlers[req.method];
		if (!routeHandler) {
			res.status(405).send('Method not allowed');
			return;
		}

		const webResponse = await routeHandler(webRequest);
		res.status(webResponse.status);
		webResponse.headers.forEach((value, key) => {
			res.setHeader(key, value);
		});
		const buffer = Buffer.from(await webResponse.arrayBuffer());
		res.send(buffer);
	} catch (error) {
		console.error('UploadThing handler failed:', error);
		res.status(500).json({ error: 'Upload handler failed' });
	}
}
