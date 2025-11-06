/**
 * Polyfills for the application. We load Zone.js here so it's present for both
 * the application and the Karma test bundle early in the bootstrap.
 */

// Importing from the package root so Node's package "exports" is respected.
// The package.json for zone.js maps the default export to the correct file.
import 'zone.js';
