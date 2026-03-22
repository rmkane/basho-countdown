// Serve the Vite production build from ./dist (run `pnpm run build` first).
// From this directory: go run .
package main

import (
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strings"
)

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	const dist = "dist"
	if _, err := os.Stat(dist); os.IsNotExist(err) {
		log.Fatalf("missing %s/ — run: pnpm install && pnpm run build", dist)
	}

	mux := http.NewServeMux()
	mux.Handle("/", spaFileServer(dist))

	addr := ":" + port
	log.Printf("Basho countdown: http://localhost:%s/ (serving %s/%s)", port, mustGetwd(), dist)

	if err := http.ListenAndServe(addr, mux); err != nil {
		log.Fatal(err)
	}
}

// spaFileServer serves static files from root; unknown paths get index.html (client-side routes).
func spaFileServer(root string) http.Handler {
	fs := http.FileServer(http.Dir(root))
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet && r.Method != http.MethodHead {
			fs.ServeHTTP(w, r)
			return
		}
		p := filepath.Join(root, filepath.Clean("/"+r.URL.Path))
		absRoot, errRoot := filepath.Abs(root)
		absP, errP := filepath.Abs(p)
		if errRoot != nil || errP != nil {
			http.Error(w, "internal error", http.StatusInternalServerError)
			return
		}
		rel, errRel := filepath.Rel(absRoot, absP)
		if errRel != nil || strings.HasPrefix(rel, "..") {
			http.NotFound(w, r)
			return
		}
		fi, err := os.Stat(p)
		if err == nil && !fi.IsDir() {
			fs.ServeHTTP(w, r)
			return
		}
		if err == nil && fi.IsDir() {
			idx := filepath.Join(p, "index.html")
			if _, err := os.Stat(idx); err == nil {
				http.ServeFile(w, r, idx)
				return
			}
		}
		http.ServeFile(w, r, filepath.Join(root, "index.html"))
	})
}

func mustGetwd() string {
	wd, err := os.Getwd()
	if err != nil {
		return "."
	}
	return wd
}
