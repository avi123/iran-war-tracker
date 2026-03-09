Deploy the iran-war-tracker to GitHub Pages.

Steps:
1. Run `./build.sh` to rebuild `docs/index.html` with a fresh timestamp
2. Switch gh auth: `/opt/homebrew/bin/gh auth switch --user avi123`
3. Stage changed files: `GIT_CONFIG_GLOBAL=/dev/null git add docs/ src/`
4. Commit with a descriptive message summarizing what changed
5. Push: `GIT_CONFIG_GLOBAL=/dev/null git push`
6. Switch gh auth back: `/opt/homebrew/bin/gh auth switch --user avi-berkowitz-instacart`

Important:
- MUST use `GIT_CONFIG_GLOBAL=/dev/null` for all git commands (bypasses global insteadOf rule)
- MUST switch gh auth to `avi123` before push, and back to `avi-berkowitz-instacart` after
- The repo uses a custom SSH key via local `core.sshCommand` config
- After pushing, the site updates at: https://2026iranwartracker.com
- Report the commit hash and confirm the push succeeded.