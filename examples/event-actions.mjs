// Pure example. Consumers supply the approved registry and transport for their platform.
// This module does not implement a bridge, native RPC, Smartico action or acknowledgment.
export function createActionNavigator({productOrigin, isAllowedAction, dispatchToHost, navigateStandalone}) {
  const url = new URL(productOrigin);
  if (url.protocol !== 'https:' || url.username || url.password || url.href !== url.origin + '/') {
    throw new Error('Expected a reviewed HTTPS product origin, without credentials/path/query');
  }
  if (typeof isAllowedAction !== 'function') throw new Error('An approved action registry is required');
  function check(action) {
    if (typeof action !== 'string' || !action.startsWith('event_action/') ||
        /[\s#]/u.test(action) || !isAllowedAction(action)) throw new Error('Unsupported event action');
    const target = new URL('/' + action, url.origin);
    if (target.origin !== url.origin || !target.pathname.startsWith('/event_action/')) throw new Error('Invalid route');
    // Prevent dot-segment/backslash normalization from changing the permitted action.
    // Parameters must already be encoded according to the approved product contract.
    if (target.pathname + target.search !== '/' + action) throw new Error('Route normalization changed the action');
    return target.href;
  }
  return {
    href: check,
    navigate(action, {embedded, connected}) {
      if (typeof embedded !== 'boolean') throw new Error('Expected explicit integration context');
      const href = check(action);
      if (embedded) {
        if (connected !== true || typeof dispatchToHost !== 'function') throw new Error('Disconnected host channel');
        dispatchToHost(action);
        // Delivery is not an acknowledgment of navigation, participation or a reward.
        return {channel: 'host', delivered: true};
      }
      if (typeof navigateStandalone !== 'function') throw new Error('Standalone handler unavailable');
      navigateStandalone(href);
      return {channel: 'standalone', delivered: true};
    }
  };
}
