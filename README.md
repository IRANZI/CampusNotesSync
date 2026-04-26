# Campus Notes Sync

Campus Notes Sync is a small Expo app built with React Native and NativeWind. It demonstrates offline-friendly note uploading, local persistence, and a polished UI using Tailwind-style classes.

## Features

- Upload notes and see them appear instantly in the uploaded list
- Queue notes while offline and sync them automatically when the connection returns
- Fetch sample posts from an API and cache them for offline viewing
- Persist uploaded notes across app restarts using AsyncStorage
- Modern UI styling using NativeWind + Tailwind-style classes

## Install

Install dependencies first:

```bash
npm install
```

If you add or update packages later, run it again.

## Run the app

Start Expo with a cleared cache:

```bash
npx expo start --clear
```

Then open the app on one of these targets:

- Expo Go on Android or iOS
- Android emulator
- iOS simulator
- Web browser at `http://localhost:8081`

## How to use the app

1. Open the app and wait for the main screen to load.
2. Tap **Fetch API Notes** to load a sample list of posts from the placeholder API.
3. Type a note into the **Upload Note** field.
4. Tap **Upload Note**.
   - If online, the note is added directly to the Uploaded Notes list.
   - If offline, the note is queued and shown in the Queued Notes section.
5. When the app regains internet access, queued notes automatically sync into uploaded notes.

## App structure

- `app/(tabs)/index.tsx` — main screen with note upload, queued note sync, and sample post fetching
- `app/_layout.tsx` — root layout for Expo Router and global style import
- `app/global.css` — NativeWind global stylesheet
- `tailwind.config.js` — Tailwind content configuration
- `babel.config.js` — enables NativeWind Babel transform
- `postcss.config.js` — configures Tailwind CSS and Autoprefixer

## Notes

- The app uses `@react-native-async-storage/async-storage` to save uploaded notes and pending actions.
- Offline notes are stored in `pendingActions` and automatically moved into `uploadedNotes` once connectivity returns.
- The progress bar is a simulated upload animation for a better user experience.

## Troubleshooting

If the app fails to start, try:

```bash
npm install
npx expo start --clear
```

If you see an error about `autoprefixer`, make sure it is installed as a dev dependency.

## Learn more

This project is based on Expo and React Native. For more information:

- [Expo documentation](https://docs.expo.dev)
- [NativeWind documentation](https://www.nativewind.dev)
- [AsyncStorage documentation](https://react-native-async-storage.github.io/async-storage/docs/install)
