# TechStore app

A mobile app for an estore.club shop: Expo, expo-router (the screens are the files under `app/`)
and `@estoreclub/app`, which reads the shop's catalogue, basket, checkout and customers.

```
npm install
cp .env.example .env.local   # then put your app key in EXPO_PUBLIC_APP_KEY
npm start                    # Expo's dev server: scan the QR code with Expo Go
```

| Command | What it does |
| --- | --- |
| `npm start` | The dev server. Open the app in Expo Go on your phone, or press `i` / `a` / `w` |
| `npm run ios` | The same, opened in the iOS simulator (macOS with Xcode) |
| `npm run android` | The same, opened in an Android emulator or a connected phone |
| `npm run web` | The same, in the browser |
| `npm run export:web` | A static web build in `./dist` |

`.env.local` holds two settings:

| Variable | What to put there |
| --- | --- |
| `EXPO_PUBLIC_SERVER_URL` | The estore.club API. Already set to `https://estore.club` |
| `EXPO_PUBLIC_APP_KEY` | Your shop's app key (`ak_...`): admin, Settings - For developers |

The app key only opens what a customer may do, so it is safe inside an app. Never put the
company API key (`ck_...`) here - the SDK refuses it.

To put the app on phones, push your changes, restore them in the designer and use
"Send to TestFlight" from its menu.
