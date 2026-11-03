/**
 * Satirical developer console chaos logging:
 * Logs authentic-looking runtime errors, missing modules, divide-by-zero math warnings,
 * and broken source maps to the browser DevTools without breaking any actual functionality.
 */

export function initConsoleChaos(): void {
  if (typeof window === 'undefined') return;

  // Initial battery of realistic errors and warnings on load
  const initialLogs = [
    {
      type: 'error',
      msg: "Uncaught Error: Cannot find module '@bad-web/optical-retina-driver-v3' from '/src/telemetry/biometrics.ts'",
    },
    {
      type: 'warn',
      msg: "Warning: Division by zero encountered in ChronoShiftMatrix.calcTuesdayVoid(): 24.016 / 0. Invariant returned NaN; proceeding with undefined temporal state.",
    },
    {
      type: 'error',
      msg: "Uncaught (in promise) ModuleNotFoundError: Could not resolve module 'quantum-magnetron-overclock' at microwave-driver.js:42:19",
    },
    {
      type: 'warn',
      msg: "DevTools failed to load source map: Could not load content for https://reallybad.website/static/js/bundle.min.js.map: HTTP error: status code 404, net::ERR_HTTP_RESPONSE_CODE_FAILURE",
    },
    {
      type: 'error',
      msg: "DOMException: Failed to execute 'requestNotificationPermission' on 'Notification': Ephemeral user gesture expired while evaluating ad bidder syndicate #836",
    },
    {
      type: 'warn',
      msg: "Cross-Origin-Opener-Policy policy would block the window.postMessage call from 'https://ad-syndicate-node-77.darknet.biz'",
    },
    {
      type: 'error',
      msg: "Critical: Math error at /src/data/articles.ts:89: Divide by zero during metabolic cortisol-to-melatonin oscillation ratio normalization (4000 / (1 - 1)). Result: Infinity.",
    },
    {
      type: 'warn',
      msg: "[MemoryMarshal] High watermark telemetry buffer overflow: 0xDEADBEEF. Worker fleet duty cycle jitter exceeds +120ms.",
    },
  ];

  initialLogs.forEach((item, index) => {
    setTimeout(() => {
      if (item.type === 'error') {
        console.error(item.msg);
      } else {
        console.warn(item.msg);
      }
    }, index * 200 + 100);
  });

  // Subsequent periodic chaotic warnings as the user browses
  const periodicLogs = [
    {
      type: 'error',
      msg: "Uncaught RangeError: Maximum call stack size exceeded (recursing inside 836-partner privacy policy clause 4.2.1)",
    },
    {
      type: 'warn',
      msg: "Warning: Divide by zero in GPS sub-meter trilateration calculation: deltaLon = 0.000000. Bearing vector set to NaN.",
    },
    {
      type: 'error',
      msg: "Cannot find module 'corporate-acoustic-stabilizer-v19.wasm': HTTP 404 Not Found. Relaxing corporate theme song synthesized to increase ad tolerance by 12%.",
    },
    {
      type: 'warn',
      msg: "Violation: 'setTimeout' handler took 78.4ms. Micro-stutter frame budget violated by 62ms.",
    },
    {
      type: 'warn',
      msg: "Warning: 836 third-party tracking beacons failed to acknowledge ultrasonic audio beacon handshake within 500ms timeout.",
    },
  ];

  let periodicIndex = 0;
  setInterval(() => {
    const item = periodicLogs[periodicIndex % periodicLogs.length];
    if (item.type === 'error') {
      console.error(item.msg);
    } else {
      console.warn(item.msg);
    }
    periodicIndex++;
  }, 12000);
}

export function logNavigationChaos(articleId: string): void {
  console.warn(`[ChronoRouter] Route transition initiated to /article/${articleId}. Layout reflow cost: 242ms.`);
  console.error(`Uncaught Error: Cannot resolve dependency 'wasm-calendar-papal-sync' required for '${articleId}'. Falling back to uncalibrated Tuesday rendering.`);
  console.warn(`Warning: Division by zero at ChronoMetric.computeRelativeWeekday(): totalDays % 0 = NaN.`);
}
