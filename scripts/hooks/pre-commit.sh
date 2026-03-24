#!/bin/sh

set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
. "$SCRIPT_DIR/env.sh"

if ! git remote get-url origin >/dev/null 2>&1; then
  echo "[pre-commit] origin remote is required." >&2
  exit 1
fi

if ! gh auth status >/dev/null 2>&1; then
  echo "[pre-commit] gh auth login is required before committing." >&2
  exit 1
fi

TMP_DIR=$(mktemp -d)
restore_files() {
  cp "$TMP_DIR/package.json" "$REPO_ROOT/package.json"
  cp "$TMP_DIR/package-lock.json" "$REPO_ROOT/package-lock.json"
  cp "$TMP_DIR/build.gradle" "$REPO_ROOT/android/app/build.gradle"
  git add "$REPO_ROOT/package.json" "$REPO_ROOT/package-lock.json" "$REPO_ROOT/android/app/build.gradle" >/dev/null 2>&1 || true
}

cleanup() {
  status=$?
  if [ "$status" -ne 0 ]; then
    restore_files
  fi
  rm -rf "$TMP_DIR"
}

trap cleanup EXIT

cp "$REPO_ROOT/package.json" "$TMP_DIR/package.json"
cp "$REPO_ROOT/package-lock.json" "$TMP_DIR/package-lock.json"
cp "$REPO_ROOT/android/app/build.gradle" "$TMP_DIR/build.gradle"

VERSION=$(node "$REPO_ROOT/scripts/bump-version.js")
git add "$REPO_ROOT/package.json" "$REPO_ROOT/package-lock.json" "$REPO_ROOT/android/app/build.gradle"

echo "[pre-commit] Building release APK for v$VERSION..."
./android/gradlew -p android assembleRelease

echo "[pre-commit] APK build complete." 
