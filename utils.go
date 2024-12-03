package main

import (
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"regexp"
	"strconv"
	"strings"
)

type Utils struct{}

// Get the direct download link of a file from CurseForge
func (u *Utils) GetCurseDownloadUrl(projectID, fileID, token string) (string, error) {
	// Request the direct link from the API
	url := fmt.Sprintf("https://api.curseforge.com/v1/mods/%s/files/%s/download-url", projectID, fileID)

	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return "", err
	}

	req.Header["x-api-key"] = []string{token}
	req.Header.Set("User-Agent", "Unimaven (https://unimaven.cc)")
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	// Check if the API responded successfully and return the direct link
	if resp.StatusCode == http.StatusOK {
		var result struct {
			Data string `json:"data"`
		}
		if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
			return "", err
		}
		return result.Data, nil
	}

	return "", errors.New("failed to fetch CurseForge download URL")
}

// Convert CurseForge slug into ID
func (u *Utils) GetCurseforgeIdFromSlug(rawurl, token string) (string, error) {
	pattern := `mc-mods/([^/]+)/files/(\d+)`
	re := regexp.MustCompile(pattern)
	matches := re.FindStringSubmatch(rawurl)

	if len(matches) < 2 {
		return "", errors.New("failed to match regex")
	}

	// Request the mod information from the API
	url := fmt.Sprintf("https://api.curseforge.com/v1/mods/search?gameId=432&slug=%s", matches[1])

	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return "", err
	}

	req.Header["x-api-key"] = []string{token}
	req.Header.Set("User-Agent", "Unimaven (https://unimaven.cc)")
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	// Check if the API responded successfully and return the id
	if resp.StatusCode == http.StatusOK {
		var result struct {
			Data []struct {
				ID          int    `json:"id"`
				DisplayName string `json:"displayName"`
			} `json:"data"`
		}

		if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
			return "", err
		}

		if len(result.Data) > 0 {
			return fmt.Sprintf("unimaven.curseforge:%s-%s:%s", matches[1], strconv.Itoa(result.Data[0].ID), matches[2]), nil
		}
	}

	return "", errors.New("failed to fetch CurseForge project id")
}

// Helper method to convert the maven string into the required
func (u *Utils) GetCurseforgeUrl(slug, fileID, token string) (string, error) {
	// Extract the ID number from the slug.
	// Input format: jei-123456
	re := regexp.MustCompile(`\d+`)
	match := re.FindString(slug)

	// Check if the project ID was found in the slug. If not, we fail and burn
	if match != "" {
		return u.GetCurseDownloadUrl(match, fileID, token)
	}

	return "", errors.New("failed to extract project ID from slug")
}

// Request the Primary file of a Version from the Modrinth API
func (u *Utils) GetModrinthUrl(projectSlug, versionID string) (string, error) {
	// Request the version data from the Modrinth API
	url := fmt.Sprintf("https://api.modrinth.com/v2/project/%s/version/%s", projectSlug, versionID)

	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return "", err
	}

	req.Header.Set("User-Agent", "Unimaven (https://unimaven.cc)")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	// Extract the Primary file for that version and return the download URL
	if resp.StatusCode == http.StatusOK {
		var result struct {
			Files []struct {
				URL     string `json:"url"`
				Primary bool   `json:"primary"`
			} `json:"files"`
		}
		if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
			return "", err
		}

		for _, file := range result.Files {
			if file.Primary {
				return file.URL, nil
			}
		}
		return "", errors.New("no primary file found")
	}

	return "", errors.New("failed to fetch Modrinth version data")
}

// Request the file from the NightBloom API
func (u *Utils) GetNightBloomUrl(projectSlug, versionID string) (string, error) {
	// Request the version data from the NightBloom API
	url := fmt.Sprintf("https://api.nightbloom.cc/v1/projects/%s/files/%s", projectSlug, versionID)

	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return "", err
	}

	req.Header.Set("User-Agent", "Unimaven (https://unimaven.cc)")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	// Extract the url for that version and return the download URL
	if resp.StatusCode == http.StatusOK {
		var result struct {
			error   bool   `json:"error"`
			message string `json:"message"`
			Data    struct {
				Downloadurl string `json:"downloadurl"`
			} `json:"data"`
		}
		if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
			return "", err
		}

		if !result.error {
			return strings.Replace(result.Data.Downloadurl, "download", "raw_download", 1), nil
		}
		return "", errors.New("file Not Found")
	}

	return "", errors.New("failed to fetch Nightbloom version data")
}

// Simple, and not very robust. Convert the maven string into a GitHub releases URL
func (u *Utils) GetGitHubUrl(owner, repo, path string) string {
	parts := regexp.MustCompile(`\+`).Split(path, 2)
	tag := parts[0]
	file := parts[1]

	return fmt.Sprintf("https://github.com/%s/%s/releases/download/%s/%s.jar", owner, repo, tag, file)
}
