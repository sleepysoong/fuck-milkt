#!/bin/sh

set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
. "$SCRIPT_DIR/env.sh"

GIT_DIR=$(git rev-parse --git-dir)
if [ -d "$GIT_DIR/rebase-merge" ] || [ -d "$GIT_DIR/rebase-apply" ]; then
  exit 0
fi

VERSION=$(node -p "require('./package.json').version")
TAG="v$VERSION"
BRANCH=$(git rev-parse --abbrev-ref HEAD)
APK_PATH="$REPO_ROOT/android/app/build/outputs/apk/release/app-release.apk"

if ! gh auth status >/dev/null 2>&1; then
  echo "[post-commit] gh auth login is required for release publishing." >&2
  exit 1
fi

if [ ! -f "$APK_PATH" ]; then
  echo "[post-commit] APK not found at $APK_PATH" >&2
  exit 1
fi

git push origin "$BRANCH"

if ! git rev-parse "$TAG" >/dev/null 2>&1; then
  git tag "$TAG"
fi

git push origin "$TAG"

if gh release view "$TAG" >/dev/null 2>&1; then
  gh release upload "$TAG" "$APK_PATH" --clobber
else
  gh release create "$TAG" "$APK_PATH" --title "$TAG" --generate-notes
fi
