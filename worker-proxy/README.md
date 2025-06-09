# Cloudflare Worker Smart Proxy

This project provides a Cloudflare Worker (run locally with Wrangler) that acts as a smart reverse proxy for two local Express servers:

- **Server 1:** Runs on `http://localhost:6000` (proxied via `/server1/*`)
- **Server 2:** Runs on `http://localhost:4000` (proxied via all other paths)

## Project Structure

- `server.js` / `server2.js`: Your Express servers (in the main project directory)
- `worker-proxy/`: The Cloudflare Worker project
  - `src/index.ts`: Worker code implementing the proxy logic
  - `wrangler.jsonc`: Wrangler configuration

## How It Works

- Requests to `/server1/*` on the Worker are proxied to Server 1 (`http://localhost:6000/*`), with `/server1` stripped from the path.
- All other requests are proxied to Server 2 (`http://localhost:4000/*`).
- The Worker runs locally on [http://localhost:8787](http://localhost:8787) by default.

## How the Worker Runs Locally

When you run `npm run start` inside the `worker-proxy` directory, Wrangler starts a local development server (by default at [http://localhost:8787](http://localhost:8787)). This simulates the Cloudflare edge environment on your local machine, allowing you to develop and test Workers before deploying them to Cloudflare.

**Request Flow in Local Development:**
1. You start both Express servers (on ports 6000 and 4000).
2. You start the Worker locally with Wrangler (`npm run start`).
3. When you visit [http://localhost:8787/](http://localhost:8787/) or [http://localhost:8787/server1/](http://localhost:8787/server1/), your browser sends the request to the local Worker.
4. The Worker receives the request and, based on the path, proxies it to the appropriate local Express server:
   - Requests to `/server1/*` are forwarded to `http://localhost:6000/*` (with `/server1` stripped from the path).
   - All other requests are forwarded to `http://localhost:4000/*`.
5. The Worker fetches the response from the target server and returns it to your browser, just as it would at the Cloudflare edge.

**Benefits of Local Development with Wrangler:**
- Fast feedback loop: No need to deploy to Cloudflare for every change.
- Simulates the real Worker runtime, so you can catch issues early.
- Supports local resources and APIs for full-stack development.

For more details, see the [Cloudflare Workers local development documentation](https://developers.cloudflare.com/workers/wrangler/local-development/).

## Setup Instructions

### 1. Start Your Express Servers

**Server 1:**
```bash
node server.js # or npm run start (if configured)
```
- Make sure it listens on port **6000** (update if needed).

**Server 2:**
```bash
node server2.js # or npm run start:server2
```
- Make sure it listens on port **4000**.

### 2. Start the Worker Proxy

In a new terminal:
```bash
cd worker-proxy
npm install # (first time only)
npm run start
```
- This starts the Worker locally at [http://localhost:8787](http://localhost:8787).

### 3. Test the Proxy

- Visit [http://localhost:8787/server1/](http://localhost:8787/server1/) to access Server 1's root page.
- Visit [http://localhost:8787/](http://localhost:8787/) to access Server 2's root page.
- Any other path not starting with `/server1` will be proxied to Server 2.

### 4. Stopping the Servers
- Press `Ctrl+C` in each terminal to stop the servers or Worker.

## Customization
- You can change the proxy logic in `worker-proxy/src/index.ts`.
- Update ports or paths as needed for your local setup.

## Troubleshooting
- If you see a static asset page or errors, ensure the `assets` section is removed or commented out in `wrangler.jsonc`.
- Make sure both Express servers are running before starting the Worker.
- If you change Worker code, restart the Worker with `npm run start`.

## Requirements
- Node.js v20+
- Express (for your servers)
- Wrangler (`npm install -g wrangler`)

## Useful Commands
- Start Server 1: `npm run start` (or `node server.js`)
- Start Server 2: `npm run start:server2` (or `node server2.js`)
- Start Worker: `cd worker-proxy && npm run start`

## About Cloudflare Workers, Caching, and Performance

### What Are Cloudflare Workers?
Cloudflare Workers are serverless functions that run at the edge of Cloudflare's global network. They allow you to intercept, modify, and respond to HTTP requests close to the user, enabling fast, programmable, and scalable web applications and APIs.

- **Edge Execution:** Workers run in data centers around the world, reducing latency for global users.
- **Isolation:** Each Worker runs in a lightweight, secure environment (not a full Node.js process).
- **Use Cases:** Proxies, API gateways, authentication, A/B testing, custom caching, and more.

### Caching in Workers
Cloudflare Workers can leverage Cloudflare's edge cache to store and serve responses, reducing load on your origin servers and improving performance for repeated requests.

- **Default Behavior (Local):** When running locally with Wrangler, no edge caching is performed—every request is proxied to your local servers.
- **In Production:** You can use the `caches.default` API in your Worker code to cache responses at the edge. This can dramatically reduce latency and server load for cacheable content.
- **Example:**
  ```js
  // In a Worker, to cache a response:
  await caches.default.put(request, response.clone());
  // To try to serve from cache first:
  let cached = await caches.default.match(request);
  ```
- **Cache Control:** Use HTTP headers (`Cache-Control`, `ETag`, etc.) to control what gets cached and for how long.

### Order of Execution and Latency Considerations

- **Request Path:**
  1. Client sends request to Worker (at the edge in production, or locally via Wrangler).
  2. Worker receives the request, runs your logic (e.g., path routing, header manipulation).
  3. Worker proxies the request to the appropriate backend (server1 or server2).
  4. Worker receives the backend response, optionally modifies/caches it, and returns it to the client.

- **Extra Latency:**
  - **Locally:** There is a small overhead for the Worker process, but both Worker and servers are on localhost, so latency is minimal.
  - **In Production:**
    - Requests hit the Cloudflare edge first (very close to the user), then are proxied to your origin server (which may be farther away).
    - If the Worker caches the response, subsequent requests can be served instantly from the edge, reducing latency.
    - If not cached, there is extra round-trip time from the edge to your origin server.

- **Performance Tips:**
  - Use caching for static or infrequently changing content.
  - Minimize heavy computation in Workers to keep response times low.
  - Monitor latency and cache hit rates using Cloudflare analytics.

### More Resources
- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
- [Cloudflare Cache API](https://developers.cloudflare.com/workers/runtime-apis/cache/)
- [Performance Best Practices](https://developers.cloudflare.com/workers/platform/benchmarks/)

---

For more details, see the code in `worker-proxy/src/index.ts` and the Wrangler documentation: https://developers.cloudflare.com/workers/ 