# Quick Testing Guide

## 🚀 Quick Start (3 Steps)

### 1. Install Dependencies
```bash
npm install
```

### 2. Create Environment File
```bash
echo "EXPO_PUBLIC_API_URL=http://localhost:5173" > .env
```

### 3. Start the App
```bash
npm start
```

Then:
- **Scan QR code** with Expo Go app on your phone
- **Press 'i'** for iOS simulator (macOS only)
- **Press 'a'** for Android emulator
- **Press 'w'** for web browser

## ⚠️ Important Notes

1. **Backend must be running**: Make sure your web app is running on `http://localhost:5173`
   ```bash
   cd ../web && npm run dev
   ```

2. **First run may take time**: Dependencies need to be installed and Metro bundler needs to start

3. **Common first-time issues**:
   - If you see "Module not found": Run `npm install` again
   - If API calls fail: Check backend is running and `.env` file exists
   - If design system imports fail: Verify `../design-system/` folder exists

## 📱 Testing Checklist

- [ ] App launches
- [ ] Login screen appears
- [ ] Can navigate between screens
- [ ] Theme toggle works
- [ ] Swipe cards display (after login)
- [ ] API calls work (backend running)

## 🐛 Troubleshooting

**Clear cache and restart:**
```bash
npm start -- --clear
```

**Reinstall dependencies:**
```bash
rm -rf node_modules
npm install
```

**Check TypeScript errors:**
```bash
npx tsc --noEmit
```

For detailed instructions, see `TESTING.md`
