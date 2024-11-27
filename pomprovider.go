package main

import "fmt"

// Generic POM file generator, to generate the most minimal POM file required by Gradle
func generatePom(platform, slug, fileID string) string {
	return fmt.Sprintf(`<project xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd" xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <modelVersion>4.0.0</modelVersion>
  <groupId>unimaven.%s</groupId>
  <artifactId>%s</artifactId>
  <version>%s</version>
  <packaging>jar</packaging>
</project>`, platform, slug, fileID)
}
