/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Bind resources to your worker in `wrangler.jsonc`. After adding bindings, a type definition for the
 * `Env` object can be regenerated with `npm run cf-typegen`.
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

export default {
	async fetch(request, env, ctx) {
		const url = new URL(request.url);
		let targetUrl;

		if (url.pathname.startsWith('/server1')) {
			// Proxy to server1, strip /server1 from the path
			const newPath = url.pathname.replace(/^\/server1/, '') || '/';
			targetUrl = `http://localhost:6000${newPath}${url.search}`;
		} else {
			// Proxy to server2
			targetUrl = `http://localhost:4000${url.pathname}${url.search}`;
		}

		// Prepare the init object for fetch
		const init = {
			method: request.method,
			headers: request.headers,
			body: request.method !== 'GET' && request.method !== 'HEAD' ? await request.arrayBuffer() : undefined,
			redirect: 'manual',
		};

		// Proxy the request
		const response = await fetch(targetUrl, init);

		// Return the proxied response
		return response;
	},
} satisfies ExportedHandler<Env>;
