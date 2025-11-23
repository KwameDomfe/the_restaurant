# Project Deployment Steps

This document outlines the steps to deploy the backend, web, and mobile applications.

## 1. Backend (Django)

- **Status**: ✅ Ready for deployment.
- **Hosting**: Heroku, Render, DigitalOcean, etc.

### Action Required

1.  **Create `.env` file**: In the `backend/` directory, create a file named `.env`.
2.  **Add Environment Variables**: Add the following to your `.env` file, replacing placeholder values.

    ```
    SECRET_KEY=your_strong_secret_key
    DEBUG=False
    ALLOWED_HOSTS=your_domain.com,localhost,127.0.0.1
    ```

3.  **Deploy**: Push your code to your chosen hosting provider. The `Procfile` will instruct the platform on how to run the application.

---

## 2. Web App (React)

- **Status**: ✅ Ready for deployment.
- **Hosting**: Vercel, Netlify, GitHub Pages, etc.

### Action Required

1.  **Deploy the `build` folder**: The `webapp/build` directory contains the static files for your web application.
2.  **Choose a service**:
    - **Vercel/Netlify**: You can connect your Git repository for continuous deployment or use their command-line tools to deploy the `webapp/build` folder directly.
      ```bash
      # Example with Vercel CLI
      npm install -g vercel
      vercel --prod webapp/build
      ```

---

## 3. Mobile App (React Native)

- **Status**: 🟡 Ready for building.
- **Service**: Expo Application Services (EAS)

### Action Required

1.  **Install EAS CLI**: If you haven't already, install the command-line tool.
    ```bash
    npm install -g eas-cli
    ```

2.  **Login to Expo**:
    ```bash
    eas login
    ```

3.  **Configure EAS Build**: Navigate to your mobile app's directory and run the configuration command. This will generate an `eas.json` file.
    ```bash
    cd mobile
    eas build:configure
    ```

4.  **Start a Build**:
    - **Android**:
      ```bash
      eas build -p android --profile preview
      ```
    - **iOS**:
      ```bash
      eas build -p ios --profile preview
      ```

5.  **Submit to Stores**: After the build completes, EAS provides a URL to your application's build page. From there, you can download the `.aab` (Android) or `.ipa` (iOS) file and upload it to the Google Play Console or Apple App Store Connect.
