# KM Budget Studio

A private budgeting and spending tracker built around KM currency. The main app runs locally on a computer, and the mobile app is there for quick daily expense entry when I am away from the PC.

The goal is simple: keep budgets, categories, income, expenses, backups, and phone-to-PC syncing in one place without needing an online account for the actual budget data.

## Features

- Dashboard with monthly income, expenses, remaining budget, and recent activity
- Transaction entry with date, type, category, note, account, cleared status, and amount
- Editable budgets and categories
- Searchable transaction history
- CSV export for transactions
- JSON backup export and import
- Sync string support between desktop and mobile
- Mobile expense entry for quick daily logging

## Project Structure

```text
.
+-- km-budget-studio.html      Main browser version
+-- desktop-app/               Electron desktop wrapper
+-- mobile/                    Expo mobile app
+-- build_budget_tracker.mjs   Browser app build script
+-- qa_budget_app.mjs          Basic app QA script
```

## Running The Browser App

Open `km-budget-studio.html` in a browser.

Budget data is stored locally in the browser. Use **Settings > Export backup** if you want a normal JSON backup file.

## Running The Desktop App

```powershell
cd desktop-app
npm install
npm start
```

To build the Windows desktop app:

```powershell
cd desktop-app
npm run build:unpacked
```

The unpacked executable is created at:

```text
desktop-app/dist/win-unpacked/KM Budget Studio.exe
```

## Running The Mobile App

```powershell
cd mobile
npm install
npm start
```

Scan the QR code with Expo Go to run it on a phone.

The mobile app is meant for quick spending entries. Each entry is saved with the phone's current date, and the full mobile history is included when creating a sync string.

## Building The Android App

The project is configured for EAS builds.

For an installable Android APK:

```powershell
cd mobile
$env:EAS_NO_VCS='1'; npm run build:android:apk
```

For a Play Store build:

```powershell
cd mobile
npm run build:android:store
```

## Syncing Desktop And Mobile

The app uses copyable sync strings instead of a server.

On desktop, open **Settings** and use:

- **Create sync string** to copy budget data
- **Import string** to paste data from the phone
- **Export backup** for a JSON backup file

On mobile, open **Sync** and use:

- **Create and copy sync string** to send phone entries to the PC
- **Import string** to bring PC data back to the phone

Sync strings include categories, budgets, active month, and transaction history.

## Notes

This is a local-first project. Data stays on the device unless it is exported, copied, or imported manually.
