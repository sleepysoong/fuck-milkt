#!/bin/sh

set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
. "$SCRIPT_DIR/env.sh"

TMP_DIR=$(mktemp -d)
restore_files() {
  cp "$TMP_DIR/package.json" "$REPO_ROOT/package.json"
  cp "$TMP_DIR/package-lock.json" "$REPO_ROOT/package-lock.json"
  cp "$TMP_DIR/build.gradle" "$REPO_ROOT/android/app/build.gradle"
  rm -f "$REPO_ROOT/outputs"/calculator_v*.apk
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

OUTPUTS_DIR="$REPO_ROOT/outputs"
OUTPUT_APK="$OUTPUTS_DIR/calculator_v${VERSION}.apk"
SOURCE_APK="$REPO_ROOT/android/app/build/outputs/apk/release/app-arm64-v8a-release.apk"

echo "[pre-commit] Building release APK for v$VERSION..."
./android/gradlew -p android assembleRelease

mkdir -p "$OUTPUTS_DIR"
cp "$SOURCE_APK" "$OUTPUT_APK"
git add "$OUTPUT_APK"

echo "[pre-commit] APK exported to $OUTPUT_APK"
