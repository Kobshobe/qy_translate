/**
 * Shim trustedTypes.createPolicy to avoid CSP violations when the page
 * restricts which policy names are allowed (e.g. does not allow 'vue').
 *
 * If the page enforces a trusted-types directive that doesn't include 'vue',
 * we silently return a dummy policy instead of letting Chrome log a CSP error.
 */

const win = window as any

if (win.trustedTypes) {
  const originalCreatePolicy = win.trustedTypes.createPolicy.bind(win.trustedTypes)

  win.trustedTypes.createPolicy = function (
    policyName: string,
    policyOptions: any,
  ): any {
    try {
      return originalCreatePolicy(policyName, policyOptions)
    } catch (_e) {
      // The page's CSP blocks this policy name (e.g. 'vue').
      // Return a dummy policy that passes through values unchanged.
      return {
        name: policyName,
        createHTML: (input: string) => input,
        createScript: (input: string) => input,
        createScriptURL: (input: string) => input,
      }
    }
  }
}
