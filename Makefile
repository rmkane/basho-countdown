# Basho countdown — Svelte build + Go static server
# Usage: make help

.PHONY: help install build test check dev preview server serve clean

help:
	@echo "Basho countdown — common targets"
	@echo ""
	@echo "  make install    pnpm install (deps)"
	@echo "  make build      production build -> dist/"
	@echo "  make test       vitest run (basho-logic regression tests)"
	@echo "  make check      svelte-check + TypeScript (no emit)"
	@echo "  make dev        Vite dev server (HMR)"
	@echo "  make preview    vite preview (needs dist/; runs build first)"
	@echo "  make server     build then go run . (serves dist/ on :8080)"
	@echo "  make serve      same as server"
	@echo "  make clean      remove node_modules and dist"
	@echo ""
	@echo "Port: PORT=3456 make server"

install:
	pnpm install

node_modules: package.json pnpm-lock.yaml
	pnpm install

build: node_modules
	pnpm run build

test: node_modules
	pnpm run test

check: node_modules
	pnpm run check

dev: node_modules
	pnpm dev

preview: build
	pnpm run preview

server: build
	go run .

serve: server

clean:
	rm -rf node_modules dist
