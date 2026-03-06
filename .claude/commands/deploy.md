Deploy the iran-war-tracker to GitHub Pages.

Steps:
1. Run `./build.sh` to rebuild `docs/index.html` with a fresh timestamp
2. Stage changed files: `git add docs/ src/ data/`
3. Commit with a descriptive message summarizing what changed
4. Push to origin using: `git push origin main`

Important:
- This repo uses a custom SSH key. The local git config has `core.sshCommand` set — just use `git push` normally.
- The git user for this repo is `avi123` (local config).
- After pushing, the site updates at: https://avi123.github.io/iran-war-tracker/
- Report the commit hash and confirm the push succeeded.