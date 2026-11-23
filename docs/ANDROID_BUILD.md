# Android build qo'llanmasi

Ilova React (Vite) + Capacitor'da yozilgan: web kod `dist/` ga yig'iladi, Capacitor uni
`android/` loyihasiga ko'chiradi, Gradle esa APK/AAB yasaydi.

## 1. Bir martalik tayyorgarlik (macOS)

### JDK 21

```bash
brew install --cask temurin@21
# ~/.zshrc ga:
export JAVA_HOME=$(/usr/libexec/java_home -v 21)
```

Tekshirish: `java -version` → `21.x`

### Android SDK

Eng oson yo'l — Android Studio (SDK, emulator va build-tools birga keladi):

```bash
brew install --cask android-studio
```

Android Studio'ni bir marta oching → **More Actions → SDK Manager** va quyidagilar o'rnatilganini tekshiring:

- **SDK Platforms:** Android 16 (API 36)
- **SDK Tools:** Android SDK Build-Tools, Platform-Tools, Command-line Tools

`~/.zshrc` ga:

```bash
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

Tekshirish: `adb version`

### Loyiha bog'liqliklari

```bash
cd mojiza-daftar
npm install
```

## 2. Telefonda sinash (eng tez yo'l)

1. Telefonda: **Sozlamalar → Telefon haqida → Build raqami** ni 7 marta bosing (Dasturchi rejimi yoqiladi)
2. **Sozlamalar → Dasturchilar uchun → USB orqali nosozliklarni tuzatish** ni yoqing
3. Telefonni USB bilan ulang, telefonda "Ruxsat berish" ni bosing. `adb devices` telefonni ko'rsatishi kerak
4. Ishga tushirish:

```bash
npm run android:open      # web build + sync + Android Studio ochiladi
```

Android Studio'da yuqorida qurilmangizni tanlab **▶ Run** ni bosing.

## 3. Debug APK (fayl qilib boshqa telefonga o'tkazish)

```bash
npm run android:apk
```

Natija: `android/app/build/outputs/apk/debug/app-debug.apk`

O'rnatish:

```bash
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
```

Yoki faylni Telegram/USB orqali telefonga yuborib, ochib o'rnating (telefon "noma'lum manbadan o'rnatish"ga ruxsat so'raydi).

## 4. Release (Play Market uchun)

### 4.1 Imzo kaliti (bir marta)

```bash
keytool -genkey -v -keystore ~/mojiza-daftar-release.jks \
  -keyalg RSA -keysize 2048 -validity 10000 -alias mojiza
```

**Bu faylni va parolni yo'qotmang** — yo'qolsa, Play Market'dagi ilovani yangilab bo'lmaydi.
Fayl repoga qo'shilmaydi (`.gitignore` da `*.jks`, `keystore.properties` bor).

### 4.2 `android/keystore.properties` (repoga kirmaydi)

```properties
storeFile=/Users/<siz>/mojiza-daftar-release.jks
storePassword=...
keyAlias=mojiza
keyPassword=...
```

### 4.3 `android/app/build.gradle` ga imzo sozlamasi

`android { ... }` blokidan **oldin**:

```gradle
def keystorePropertiesFile = rootProject.file("keystore.properties")
def keystoreProperties = new Properties()
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
}
```

`android { ... }` ichida:

```gradle
signingConfigs {
    release {
        if (keystorePropertiesFile.exists()) {
            storeFile file(keystoreProperties['storeFile'])
            storePassword keystoreProperties['storePassword']
            keyAlias keystoreProperties['keyAlias']
            keyPassword keystoreProperties['keyPassword']
        }
    }
}
buildTypes {
    release {
        signingConfig signingConfigs.release
        minifyEnabled false
        proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
    }
}
```

### 4.4 Versiya

Har yangi yuklashda `android/app/build.gradle` da:

```gradle
versionCode 2        // har safar +1 (butun son)
versionName "1.1"    // foydalanuvchiga ko'rinadigan versiya
```

### 4.5 Yig'ish

```bash
npm run android:release
```

- Play Market uchun: `android/app/build/outputs/bundle/release/app-release.aab`
- To'g'ridan-to'g'ri o'rnatish uchun: `android/app/build/outputs/apk/release/app-release.apk`

## 5. Ilova ikonkasi va splash

```bash
npm install -D @capacitor/assets
# assets/icon.png (1024x1024) va assets/splash.png (2732x2732) tayyorlang
npx capacitor-assets generate --android
```

## 6. Play Market: bolalar ilovasi talablari

Ilova 3–5 yoshlilar uchun, shuning uchun Play Console'da **"Families" (Oila) siyosati** talablari amal qiladi:

- **Maxfiylik siyosati (Privacy Policy)** sahifasi majburiy — ilova offlayn bo'lsa ham. Unda yozing:
  mikrofon (ota-ona ovozini yozish, sahnada gapni takrorlash) va kamera/galereya (rasm chizish)
  faqat qurilmada ishlatiladi, hech qayerga yuborilmaydi
- **Target audience:** "Ages 5 and under"
- **Data safety** formasi: ma'lumot to'planmaydi, uchinchi tomonga berilmaydi
- Reklama yo'q — bu ham afzallik

## 7. Muammolar va yechimlar

| Muammo | Yechim |
|---|---|
| `JAVA_HOME is not set` / noto'g'ri Java | `export JAVA_HOME=$(/usr/libexec/java_home -v 21)` |
| `SDK location not found` | `android/local.properties` ga `sdk.dir=/Users/<siz>/Library/Android/sdk` |
| Web o'zgarishlar telefonda ko'rinmayapti | Har doim `npm run android:sync` (build + sync) qiling |
| Mikrofon ishlamayapti | Telefon **Sozlamalar → Ilovalar → Mo'jiza Daftar → Ruxsatlar → Mikrofon** |
| Sahna (3D) sekin yoki qora ekran | **Android System WebView** ni Play Market'dan yangilang |
| `adb devices` bo'sh | Boshqa USB kabel (faqat zaryad emas, ma'lumot o'tkazadigan), telefonda ruxsatni qayta bering |

## 8. Foydali buyruqlar

| Buyruq | Nima qiladi |
|---|---|
| `npm run dev` | Brauzerda ishlab chiqish (http://localhost:5173) |
| `npm run android:sync` | Web build + Android'ga ko'chirish |
| `npm run android:open` | Sync + Android Studio'ni ochish |
| `npm run android:apk` | Debug APK |
| `npm run android:release` | Imzolangan AAB + APK |
| `adb logcat \| grep -i chromium` | Telefondagi JavaScript xatolarini ko'rish |

Telefonda ishlayotgan ilovani kompyuterdan tekshirish: Chrome'da `chrome://inspect` → qurilma → **inspect**.
