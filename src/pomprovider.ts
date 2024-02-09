/**
 * Generates a dummy POM file for Gradle, so that it can correctly
 * resolve the artifact
 * @param platform The platform the artifact is served from
 * @param slug The "slug" or identifier for the artifact
 * @param fileid The file identifier
 */
export const generatePom = (platform: string, slug: string, fileid: string) => {
	return `<?xml version="1.0" encoding="UTF-8"?>
    <project xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd" xmlns="http://maven.apache.org/POM/4.0.0"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
      <modelVersion>4.0.0</modelVersion>
      <groupId>unimaven.${platform}</groupId>
      <artifactId>${slug}</artifactId>
      <version>${fileid}</version>
    </project>`;
}
