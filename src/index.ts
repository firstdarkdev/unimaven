import { Hono } from 'hono'
import { ArtifactFormatter } from './middleware/artifactformatter';
import { generatePom } from './pomprovider';
import { Utils } from './utils';

/**
 * Main server entry point
 */
type Bindings = {
	CURSEFORGE_API_KEY: string
}

// Setup the API server and utility class
const app = new Hono<{ Bindings: Bindings}>();
const util = new Utils();

// Register the Validator middleware. Is this really even needed?
app.use("/unimaven/:platform/:slug/:fileid/*", ArtifactFormatter());

app.get("/", (c) => {
	return c.text("Hello World from Unimaven");
})

/**
 * Try to resolve the JAR artifact from the platform it's meant to be served from
 */
app.get("/unimaven/:platform/:slug/:fileid/*.jar", async (c) => {
	const { platform, slug, fileid } = c.req.param();

	// CurseForge
	if (platform === 'curseforge') {
		const cfurl = await util.getCurseforgeUrl(slug, fileid, c.env.CURSEFORGE_API_KEY);

		if (cfurl) {
			return c.redirect(cfurl);
		} else {
			return c.text("File not found", 404);
		}
	}

	// Modrinth
	if (platform === 'modrinth') {
		const mrurl = await util.getModrinthUrl(slug, fileid);

		if (mrurl) {
			return c.redirect(mrurl);
		} else {
			return c.text("File not found", 404);
		}
	}

	// GitHub releases
	if (platform.startsWith("github")) {
		const newPlatform = platform.replace("github-", "");
		return c.redirect(util.getGitHubUrl(newPlatform, slug, fileid));
	}

	return c.text("Unsupported Platform", 400);
});

/**
 * Handle the requests from Gradle for the POM file of an artifact
 */
app.get("/unimaven/:platform/:slug/:fileid/*.pom", (c) => {
	// @ts-ignore
	return c.text(generatePom(c.get("platform"), c.get("slug"), c.get("fileid")));
})

export default app;
