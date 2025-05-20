# Welcome to BlockReceipt: Abans General Upholstery Blockchain-Based Receipt

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo


## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Build Your Apk **note: you must have an expo account**

1. Install the latest EAS CLI

```bash

npm install -g eas-cli

```

2. Log in to your Expo account

```bash

eas build:configure

```

After configuration, it will generate eas.json. from there, add this for production.

```bash

    "production": {
      "autoIncrement": true,
      "android": {
        "buildType": "apk"
      }
   }

````

3. Generate the APK build for production

```bash

eas build -p android --profile production

```

reference - [EAS BUILD](https://docs.expo.dev/build/setup/)

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
