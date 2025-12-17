#!/bin/bash

echo "🔍 Checking Metro Bundler Status..."
echo ""

# Check if Metro is running
if curl -s http://localhost:8081/status > /dev/null 2>&1; then
    echo "✅ Metro bundler is running"
    curl -s http://localhost:8081/status | head -5
else
    echo "❌ Metro bundler is NOT running"
    echo "   Start it with: npm run start:lan"
fi

echo ""
echo "🌐 Network Information:"
echo "   Computer IP: $(ip addr show | grep -E 'inet ' | grep -v '127.0.0.1' | head -1 | awk '{print $2}' | cut -d'/' -f1)"
echo "   Metro Port: 8081"
echo ""

echo "📦 Bundle Size Check:"
echo "   node_modules size: $(du -sh node_modules 2>/dev/null | cut -f1)"
echo ""

echo "💡 Recommendations:"
echo "   1. If Metro is running but Expo Go fails, create a development build:"
echo "      npx expo prebuild && npx expo run:android"
echo ""
echo "   2. Test Metro accessibility from phone browser:"
echo "      http://$(ip addr show | grep -E 'inet ' | grep -v '127.0.0.1' | head -1 | awk '{print $2}' | cut -d'/' -f1):8081/status"
echo ""

