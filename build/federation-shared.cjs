'use strict';

/**
 * The shared section of every Module Federation config.
 *
 * Kept in one file on purpose: three copies of this map would eventually
 * disagree, and a disagreement here does not fail the build — it produces a
 * second copy of React or of the event bus at runtime, which is much harder
 * to notice.
 *
 * Only packages whose *identity* matters are singletons: React contexts, the
 * router history, the design system (its Radix primitives live on contexts and
 * portals) and the contract that owns the event bus.
 *
 * Everything stateless is left alone, and that includes the API client:
 * duplicating it costs bytes, not correctness, because the source of truth
 * lives behind the network rather than in a module the bundles share.
 */
module.exports = function federationShared(pkg) {
  const dependencies = pkg.dependencies ?? {};
  const shared = {};

  const shareNpmPackage = (name, requiredVersion) => {
    if (!requiredVersion) return;
    shared[name] = { singleton: true, requiredVersion };
  };

  shareNpmPackage('react', dependencies.react);
  shareNpmPackage('react-dom', dependencies['react-dom']);
  // The automatic JSX runtime is a separate request and would not be covered
  // by the `react` entry alone.
  shareNpmPackage('react/jsx-runtime', dependencies.react);
  shareNpmPackage('react-router', dependencies['react-router']);

  // Workspace packages: `workspace:*` is not a semver range, so version
  // negotiation is switched off explicitly instead of being left to fail
  // to parse. The provided version still comes from each package.json.
  for (const name of ['@people-hub/contracts', '@people-hub/ui']) {
    if (dependencies[name]) {
      shared[name] = { singleton: true, requiredVersion: false };
    }
  }

  return shared;
};
