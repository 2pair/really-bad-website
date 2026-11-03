/**
 * Storage cleanup utility and Tab exit notification handler.
 * 
 * Requirements:
 * 1. When the site loads it should look for storage left over from previous sessions and clean it up.
 * 2. Preserves the localStorage OOM crash log keys: 'memory_tried', 'memory_used', 'memory_high_watermark'.
 * 3. Cleans up old IndexedDB worker databases and stale session flags.
 * 4. If someone grants notifications, send them a notification to come back when they exit the browser or change tabs.
 */

export async function cleanupPreviousSessionStorage(): Promise<void> {
  if (typeof window === 'undefined') return;

  console.log('[StorageCleanup] Inspecting and cleaning up leftovers from previous sessions...');

  // 1. Clean up old worker IndexedDB databases
  try {
    if (typeof indexedDB !== 'undefined') {
      if (typeof indexedDB.databases === 'function') {
        const dbs = await indexedDB.databases();
        for (const dbInfo of dbs) {
          if (dbInfo.name && dbInfo.name.startsWith('ReallyBadWebsiteDB_')) {
            try {
              indexedDB.deleteDatabase(dbInfo.name);
              console.log(`[StorageCleanup] Removed previous session IndexedDB: ${dbInfo.name}`);
            } catch (e) {
              console.warn(`[StorageCleanup] Failed deleting ${dbInfo.name}`, e);
            }
          }
        }
      } else {
        // Fallback for browsers without indexedDB.databases() (e.g. older WebKit)
        for (let i = 0; i < 32; i++) {
          try {
            indexedDB.deleteDatabase(`ReallyBadWebsiteDB_${i}`);
          } catch (e) {}
        }
      }
    }
  } catch (err) {
    console.warn('[StorageCleanup] IndexedDB cleanup error', err);
  }

  // 2. Clean up previous session flags from sessionStorage so permissions and fresh telemetry prompt anew
  try {
    if (typeof sessionStorage !== 'undefined') {
      // Clear session dismissal states so user can re-verify permission prompts and dialogs
      sessionStorage.removeItem('rbw_permission_dismissed');
      sessionStorage.removeItem('rbw_newsletter_dismissed');
      sessionStorage.removeItem('rbw_cookie_accepted');
      console.log('[StorageCleanup] Cleared stale sessionStorage dismissal flags.');
    }
  } catch (err) {
    console.warn('[StorageCleanup] sessionStorage cleanup error', err);
  }

  // 3. Inspect localStorage: preserve OOM telemetry keys, purge any extraneous temp items
  try {
    if (typeof localStorage !== 'undefined') {
      const allowedKeys = new Set(['memory_tried', 'memory_used', 'memory_high_watermark', 'rbw_high_watermark', 'memory_alive']);
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (key && key.startsWith('rbw_temp_') && !allowedKeys.has(key)) {
          localStorage.removeItem(key);
        }
      }
    }
  } catch (err) {
    console.warn('[StorageCleanup] localStorage audit error', err);
  }
}

/**
 * Tab exit / switch notification:
 * When user leaves the tab (visibilityState === 'hidden' or pagehide),
 * if Notification.permission is 'granted', send a push notification inviting them back.
 */
let isNotificationListenerAttached = false;
let lastTabExitNotificationTime = 0;

export function setupTabExitNotification(): () => void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return () => {};
  if (isNotificationListenerAttached) return () => {};

  const sendComeBackNotification = () => {
    if (typeof Notification === 'undefined') return;
    if (Notification.permission !== 'granted') return;

    const now = Date.now();
    // Throttle: maximum once every 4 seconds to avoid flood on rapid switching
    if (now - lastTabExitNotificationTime < 4000) return;
    lastTabExitNotificationTime = now;

    const titles = [
      '⚠️ WAIT! Do NOT abandon Really Bad Website!',
      '🚨 UNCOMMITTED TELEMETRY STREAM DETECTED',
      '⚠️ YOU LEFT YOUR SESSION UNATTENDED!',
      '📉 HIGH WATERMARK PROTOCOL INTERRUPTED',
    ];
    const bodies = [
      'Your allocated memory is evaporating! Click here immediately to reclaim your buffer.',
      'Todd from Support is waiting with critical hardware telemetry. Return to your tab now!',
      'Warning: Leaving this tab may cause 836 certified syndicate partners to discard your session tokens.',
      'Background workers are still cycling 1024MB allocations. Click to re-enter the site.',
    ];

    const randomIdx = Math.floor(Math.random() * titles.length);

    try {
      const notif = new Notification(titles[randomIdx], {
        body: bodies[randomIdx],
        tag: 'rbw-come-back',
        icon: '/favicon.ico',
      });

      notif.onclick = () => {
        window.focus();
        notif.close();
      };
    } catch (e) {
      console.warn('[TabNotification] Failed to create exit notification', e);
    }
  };

  const handleVisibilityChange = () => {
    if (document.visibilityState === 'hidden') {
      sendComeBackNotification();
    }
  };

  const handlePageHide = () => {
    sendComeBackNotification();
  };

  document.addEventListener('visibilitychange', handleVisibilityChange);
  window.addEventListener('pagehide', handlePageHide);
  isNotificationListenerAttached = true;

  return () => {
    document.removeEventListener('visibilitychange', handleVisibilityChange);
    window.removeEventListener('pagehide', handlePageHide);
    isNotificationListenerAttached = false;
  };
}
