# Daily calorie tracker

Run `npm run dev`, then open http://localhost:3000. No dependencies or build step required. Run `npm test` for data-model checks.

Enter a food on the left and calories on the right. Press Enter or leave the row to save; a blank row always stays at the top. Past foods appear as suggestions with their most recent calorie value. Use the arrow keys and Enter, or tap a suggestion. Saved rows can be edited directly and removed with an eight-second Undo window. The date picker and arrows let you view and add entries on past days.

Entries are stored in this browser's localStorage and persist across days and reloads. Export data downloads a JSON backup. There is no account or cross-device sync; clearing browser data removes the journal.

The service worker caches the app after the first visit for offline use. Serve the public folder over HTTPS for installation on a phone (localhost also supports service workers). On iPhone, use Safari's Share → Add to Home Screen. On compatible Android browsers, use Install app / Add to Home screen. A phone cannot access this computer using localhost; use an HTTPS deployment for normal phone use.
