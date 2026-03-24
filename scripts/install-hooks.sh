#!/bin/sh

set -eu

REPO_ROOT=$(git rev-parse --show-toplevel)
HOOKS_DIR="$REPO_ROOT/.git/hooks"

mkdir -p "$HOOKS_DIR"

cat > "$HOOKS_DIR/pre-commit" <<EOF
#!/bin/sh
exec "$REPO_ROOT/scripts/hooks/pre-commit.sh" "\$@"
EOF

chmod +x \
  "$HOOKS_DIR/pre-commit" \
  "$REPO_ROOT/scripts/hooks/env.sh" \
  "$REPO_ROOT/scripts/hooks/pre-commit.sh" \
  "$REPO_ROOT/scripts/install-hooks.sh"

rm -f "$HOOKS_DIR/post-commit"

echo "Installed git hooks into $HOOKS_DIR"
