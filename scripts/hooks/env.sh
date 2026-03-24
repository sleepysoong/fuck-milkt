#!/bin/sh

set -eu

export PATH="/opt/homebrew/bin:/opt/homebrew/opt/node@22/bin:$HOME/.local/bin:$PATH"
export JAVA_HOME="/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home"
export ANDROID_HOME="/opt/homebrew/share/android-commandlinetools"
export ANDROID_SDK_ROOT="$ANDROID_HOME"

REPO_ROOT=$(git rev-parse --show-toplevel)
export REPO_ROOT

cd "$REPO_ROOT"
