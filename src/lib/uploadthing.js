import { generateReactHelpers } from '@uploadthing/react';

// Points at the Vercel serverless route in /api/uploadthing.js.
// Same-origin by default, so no extra config is needed in production.
// Local `vite` dev server does not serve /api — run `vercel dev`
// (or deploy a preview) to exercise real uploads.
export const { useUploadThing, uploadFiles } = generateReactHelpers({
	url: '/api/uploadthing',
});

export const RESOURCE_UPLOADER_ENDPOINT = 'resourceUploader';

export const isUploadThingConfigured =
	typeof window !== 'undefined' && Boolean(window.location?.origin);
