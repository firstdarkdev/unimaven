import { MiddlewareHandler } from 'hono';

/**
 * Simple Middleware to validate that the maven string is correct
 * and to pass the required info to the context handler
 * @constructor
 */
export const ArtifactFormatter = (): MiddlewareHandler => {
	return async (c, next) => {
		// @ts-ignore
		const { platform, slug, fileid } = c.req.param();

		// Check if all 3 required parameters are met
		if (!platform || !slug || !fileid) {
			return c.text("Invalid parameters", 403);
		}

		// Add them to the Context Handler
		c.set("slug", slug);
		c.set("platform", platform);
		c.set("fileid", fileid);

		// Continue the request
		await next();
	}
}
