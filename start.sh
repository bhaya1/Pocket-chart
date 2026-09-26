#!/usr/bin/env bash
set -e
cd "$(dirname "$0")"
command -v node >/dev/null || { echo "Node.js is not installed. Get it from https://nodejs.org"; exit 1; }
[ -d node_modules ] || { echo "Installing dependencies..."; npm install; }
npm run dev
