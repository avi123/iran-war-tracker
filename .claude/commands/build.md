Build the site locally by running `./build.sh` from the iran-war-tracker project root.

This transforms `src/iran-war-goals.jsx` into `docs/index.html` with:
- React/Babel browser globals (replacing ES module imports)
- UTC build timestamp in the header
- Copyright in the footer

Report the build output to the user.