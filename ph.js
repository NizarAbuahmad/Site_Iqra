/*
 * PostHog — the same project the app reports to, so the funnel is one funnel.
 *
 * Kept in a file rather than inline in five <head>s because the project token
 * and the loader blob would otherwise be copy-pasted per page, and the generated
 * manhaj pages would carry a sixth copy. Pages reference it with
 * `<script src="/ph.js" defer></script>`.
 *
 * The token is public by design — it only permits writing events, and any
 * browser that loads this file can read it. That is why it is committed here in
 * plain sight rather than injected at build time: the site has no build step for
 * the hand-written pages, and hiding it from the repo would not hide it from the
 * browser.
 *
 * Loader snippet verbatim from posthog.com/docs/libraries/js. It replaces
 * `.i.posthog.com` with `-assets.i.posthog.com` in api_host to find array.js, so
 * the two hosts below are not independently editable — change api_host and the
 * asset host follows.
 */
!function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.crossOrigin="anonymous",p.async=!0,p.src=s.api_host.replace(".i.posthog.com","-assets.i.posthog.com")+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],Object.defineProperty(u,"toString",{configurable:!0,enumerable:!0,writable:!0,value:function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e}}),Object.defineProperty(u.people,"toString",{configurable:!0,enumerable:!0,writable:!0,value:function(){return u.toString(1)+".people (stub)"}}),o="init capture register register_once register_for_session unregister unregister_for_session getFeatureFlag getFeatureFlagResult isFeatureEnabled reloadFeatureFlags updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures on onFeatureFlags onSessionId getSurveys getActiveMatchingSurveys renderSurvey canRenderSurvey getNextSurveyStep identify setPersonProperties group resetGroups setPersonPropertiesForFlags resetPersonPropertiesForFlags setGroupPropertiesForFlags resetGroupPropertiesForFlags reset get_distinct_id getGroups get_session_id get_session_replay_url alias set_config startSessionRecording stopSessionRecording sessionRecordingStarted captureException loadToolbar get_property getSessionProperty createPersonProfile opt_in_capturing opt_out_capturing has_opted_in_capturing has_opted_out_capturing clear_opt_in_out_capturing debug".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);

posthog.init('phc_t7Gd3Z4L7v3zDkPAciXoCvndiVqGfVxzGquEfbJPq9r8', {
  api_host: 'https://us.i.posthog.com',
  defaults: '2026-05-30',
  // Off deliberately. privacy.html declares PostHog for "أحداث الاستخدام" —
  // usage events — and recording a visitor's screen is not that. Turning it on
  // means editing the policy first, in both this repo and the app's.
  disable_session_recording: true,
});
