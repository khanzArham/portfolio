// Every page on the site. Needs the "_fixture" dossier: CI builds with
// CONTENT_FIXTURES=1, and Playwright passes it to the dev server too.
export const routes = [
  "/",
  "/projects",
  "/projects/fixture",
  "/experience",
  "/skills",
  "/lab",
  "/about",
  "/contact",
];
