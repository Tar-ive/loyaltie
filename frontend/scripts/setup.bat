@echo off
echo 🚀 Setting up Clay Pit Chat Frontend...

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ first.
    pause
    exit /b 1
)

echo ✅ Node.js detected
echo.

REM Install dependencies
echo 📦 Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)

REM Create .env.local if it doesn't exist
if not exist .env.local (
    echo 📝 Creating .env.local file...
    (
        echo # API Configuration
        echo NEXT_PUBLIC_API_URL=http://localhost:8000
        echo.
        echo # Optional: Enable debug mode
        echo NEXT_PUBLIC_DEBUG=false
    ) > .env.local
    echo ✅ Created .env.local file
) else (
    echo ✅ .env.local already exists
)

REM Check if backend is running
echo 🔍 Checking backend connection...
curl -s http://localhost:8000/health >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Backend is running on http://localhost:8000
) else (
    echo ⚠️  Backend is not running. Please start the backend server first.
    echo    Run: cd ../backend ^&^& python main.py
)

echo.
echo 🎉 Setup complete!
echo.
echo To start the development server:
echo   npm run dev
echo.
echo Then open http://localhost:3000 in your browser
echo.
echo Make sure your backend is running on http://localhost:8000
pause
