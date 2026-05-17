# KM Budget Studio

## Desktop app

Install dependencies once:

```powershell
cd desktop-app
npm install
```

Run as a desktop window:

```powershell
cd desktop-app
npm start
```

Build a Windows app folder with a clickable EXE:

```powershell
cd desktop-app
npm run build:unpacked
```

Open:

```text
desktop-app/dist/win-unpacked/KM Budget Studio.exe
```

The installer build is also available with `npm run build`, but on some Windows setups it needs symlink privileges for electron-builder's signing helper.

## Phone sync

Open `Settings` in the app and use:

- `Create sync string` to generate one copyable text string.
- `Import string` to paste a string from your phone or another PC.
- `Export backup` for a normal JSON file backup.

The sync string contains categories, budgets, transaction history, and active month.

## Mobile app

The Expo app lives in `mobile/`. After installing dependencies there, run:

```powershell
cd mobile
npm install
npx expo start
```

Scan the QR code with Expo Go first. Native builds can be made later with EAS once you are ready to install it permanently on your phone.
