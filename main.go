package main

import (
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"net/http"
	"os"
	"strings"
)

// Main Entry Point
func main() {
	e := echo.New()

	e.Use(middleware.CORS())
	e.Static("/", "webcontent")
	util := Utils{}

	e.GET("/resolve_cf_slug/:slug", func(c echo.Context) error {
		slug := c.Param("slug")

		cfurl, err := util.GetCurseforgeIdFromSlug(slug, os.Getenv("CURSE_API_TOKEN"))
		if err != nil {
			return c.String(http.StatusInternalServerError, err.Error())
		}

		return c.String(http.StatusOK, cfurl)
	})

	// Dummy request handler as gradle now want to use HEAD requests
	e.HEAD("/unimaven/:platform/:slug/:fileid/:type", func(c echo.Context) error {
		return c.NoContent(http.StatusOK)
	})

	// Generic route to handle both .jar and .pom requests from gradle
	e.GET("/unimaven/:platform/:slug/:fileid/:type", func(c echo.Context) error {
		// Extract the required values from the URL
		platform := c.Param("platform")
		slug := c.Param("slug")
		fileid := c.Param("fileid")
		ftype := c.Param("type")

		// Gradle requested the .pom file for the artifact, so we generate and return it
		if strings.HasSuffix(ftype, ".pom") {
			pom := generatePom(platform, slug, fileid)
			return c.XMLBlob(http.StatusOK, []byte(pom))
		}

		// If the request is not for a .jar or .pom, we return a 404 not found
		if !strings.HasSuffix(ftype, ".jar") {
			return c.String(http.StatusNotFound, "Not Found")
		}

		// Handle CurseForge artifacts
		if platform == "curseforge" {
			cfurl, err := util.GetCurseforgeUrl(slug, fileid, os.Getenv("CURSE_API_TOKEN"))
			if err != nil {
				return c.String(http.StatusInternalServerError, err.Error())
			}

			return c.Redirect(http.StatusFound, cfurl)
		}

		// Handle NightBloom artifacts
		if platform == "nightbloom" {
			nburl, err := util.GetNightBloomUrl(slug, fileid)
			if err != nil {
				return c.String(http.StatusInternalServerError, err.Error())
			}

			return c.Redirect(http.StatusFound, nburl)
		}

		// Handle Modrinth artifacts
		if platform == "modrinth" {
			mrurl, err := util.GetModrinthUrl(slug, fileid)
			if err != nil {
				return c.String(http.StatusInternalServerError, err.Error())
			}

			return c.Redirect(http.StatusFound, mrurl)
		}

		// Handle GitHub releases
		if strings.HasPrefix(platform, "github") {
			newPlatform := strings.Replace(platform, "github-", "", 1)
			return c.Redirect(http.StatusFound, util.GetGitHubUrl(newPlatform, slug, fileid))
		}

		// Unsupported platform, so we return a 404
		return c.String(http.StatusNotFound, "Not Found")
	})

	// Start the server
	err := e.Start(":8080")
	if err != nil {
		return
	}
}
