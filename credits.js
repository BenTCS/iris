const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };


export const DAILY_CREDIT_ALLOTMENT = 1000;

// Local calendar-day string in the user's timezone (YYYY-MM-DD).
export function todayStr(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// Milliseconds until the next local midnight — used for the "resets in" countdown.
export function msUntilMidnight(now = new Date()) {
  const next = new Date(now);
  next.setHours(24, 0, 0, 0);
  return next.getTime() - now.getTime();
}

export function formatDuration(ms) {
  const totalMinutes = Math.max(0, Math.floor(ms / 60000));
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

/**
 * If the user's stored reset date is not today, top credits back up to the
 * daily allotment and stamp today's date. Returns the (possibly updated) user.
 * Safe to call repeatedly — no-op when already reset for today.
 */
export async function ensureDailyCredits(user) {
  if (!user) return user;
  const today = todayStr();
  if (user.last_credits_reset_date === today) return user;

  try {
    await db.auth.updateMe({
      credits: DAILY_CREDIT_ALLOTMENT,
      last_credits_reset_date: today,
    });
    return { ...user, credits: DAILY_CREDIT_ALLOTMENT, last_credits_reset_date: today };
  } catch (e) {
    return user;
  }
}