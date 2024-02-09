/**
 * Utility class to handle URL generation for JARs and other stuff
 */
export class Utils {

	/**
	 * Get the direct download link of a file from CurseForge
	 * @param projectid The project ID the file belongs to
	 * @param fileid The ID of the file to "download"
	 * @param token CurseForge API Token
	 */
	public async getCurseDownloadUrl(projectid: any, fileid: any, token: any) {
		// Request the direct link from the API
		const data= await fetch(`https://api.curseforge.com/v1/mods/${projectid}/files/${fileid}/download-url`, {
			headers: {
				"x-api-key": token?? "",
				"User-Agent": "Unimaven (http://unimaven.cc)"
			}
		});

		// Check if the API responded successfully and return the direct link
		if (data.ok) {
			const json = await data.json() as any;
			return json.data;
		} else {
			return null;
		}
	}

	/**
	 * Helper method to convert the maven string into the required
	 * parameters for the CurseForge API
	 * @param slug The project slug with id
	 * @param fileid The ID of the file that is needed
	 * @param token CurseForge API token
	 */
	public async getCurseforgeUrl(slug: string, fileid: string, token: string) {
		// Extract the ID number from the slug.
		// Input format: jei-123456
		const regex = /\d+/;
		const match = slug.match(regex);

		// Check if the project ID was found in the slug. If not, we fail and burn
		if (match) {
			return await this.getCurseDownloadUrl(match[0], fileid, token);
		} else {
			return null;
		}
	}

	/**
	 * Request the Primary file of a Version from the Modrinth API
	 * @param projectslug The slug of the project. For example: fabric-api
	 * @param versionid The version ID of the artifact to server
	 */
	public async getModrinthUrl(projectslug: string, versionid: string) {
		// Request the version data from the Modrinth API
		const data = await fetch(`https://api.modrinth.com/v2/project/${projectslug}/version/${versionid}`, {
			headers: {
				"User-Agent": "Unimaven (http://unimaven.cc)"
			}
		});

		// Extract the Primary file for that version and return the download URL
		if (data.ok) {
			const json = await data.json() as any;
			// @ts-ignore
			const primaryfile = json.files.find(file => file.primary === true);

			if (primaryfile) {
				return primaryfile.url;
			}
		} else {
			return null;
		}
	}

	/**
	 * Simple, and not very robust. Convert the maven string into a GitHub releases URL
	 * @param owner The repository owner
	 * @param repo The repository
	 * @param path The tag and file name. Format: TAG+FILENAME
	 */
	public getGitHubUrl(owner: string, repo: string, path: string) {
		let tag = path.split("+")[0];
		let file = path.split("+")[1];
		return `https://github.com/${owner}/${repo}/releases/download/${tag}/${file}.jar`;
	}
}
