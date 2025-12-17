#!/bin/bash
echo "🚀 Matcher Mobile App - Quick Start"
echo "===================================="
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo ""
fi

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "⚙️  Creating .env file..."
    echo "EXPO_PUBLIC_API_URL=http://localhost:5173" > .env
    echo "✅ Created .env file"
    echo ""
fi

# Check if assets directory exists
if [ ! -d "assets" ]; then
    echo "📁 Creating assets directory..."
    mkdir -p assets
    echo "⚠️  Note: You'll need to add actual icon.png, splash.png, etc. later"
    echo ""
fi

echo "✅ Setup complete!"
echo ""
echo "📱 To start the app:"
echo "   npm start"
echo ""
echo "📖 For detailed testing instructions, see TESTING.md"
