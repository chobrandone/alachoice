import { createApp } from './app.js';
import { env } from './config/env.js';
import { runReminders } from './services/reminder.service.js';

const app = createApp();

app.listen(env.PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`🚀 ALA API listening on http://localhost:${env.PORT} (${env.NODE_ENV})`);
});

// Automation: periodic reminder pass (appointments + follow-up tasks).
if (env.REMINDERS_ENABLED && env.NODE_ENV !== 'test') {
  const tick = () =>
    runReminders()
      .then((r) => {
        if (r.appointments || r.tasks)
          console.log(`[reminders] sent ${r.appointments} appointment, ${r.tasks} task reminder(s)`);
      })
      .catch((e) => console.error('[reminders] pass failed:', e));
  // First pass shortly after boot, then on the configured interval.
  setTimeout(tick, 15_000);
  setInterval(tick, env.REMINDER_INTERVAL_MS);
}
