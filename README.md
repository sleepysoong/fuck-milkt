# Calculator

Android-only React Native dummy app.

## Behavior

- Package name: `com.sec.android.app.popupcalculator`
- App name: `Calculator`
- Launch behavior: open `https://www.google.com` inside a WebView
- Minimum Android version: Android 8.0 (API 26)
- Pre-commit behavior: bump version, build release APK, export to `outputs/calculator_v{version}.apk`, and stage that APK for commit

## Commands

```sh
npm install
npm run install:hooks
npm start
npm run android
npm run build:apk
```

## Notes

- iOS support has been removed from this project.
- GitHub Actions release automation has been removed.
- Local git hooks now handle version bumps, local APK export, and APK staging only.
