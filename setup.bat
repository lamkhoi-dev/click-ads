@echo off
echo ================================
echo Click Ads Setup Script
echo ================================
echo.

echo [1/5] Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo Error: npm install failed
    pause
    exit /b 1
)

echo.
echo [2/5] Generating Prisma Client...
call npx prisma generate
if %errorlevel% neq 0 (
    echo Error: Prisma generate failed
    pause
    exit /b 1
)

echo.
echo [3/5] Running database migrations...
echo Note: Make sure PostgreSQL is running or update .env.local to use SQLite
call npx prisma migrate dev --name init
if %errorlevel% neq 0 (
    echo.
    echo ============================================
    echo Database migration failed!
    echo.
    echo Option 1: Install PostgreSQL and create 'clickads' database
    echo Option 2: Use SQLite for local development
    echo.
    echo To use SQLite, edit prisma/schema.prisma:
    echo   datasource db {
    echo     provider = "sqlite"
    echo     url      = "file:./dev.db"
    echo   }
    echo.
    echo Then run: npx prisma migrate dev --name init
    echo ============================================
    pause
    exit /b 1
)

echo.
echo [4/5] Seeding database...
call npx prisma db seed
if %errorlevel% neq 0 (
    echo Warning: Seeding failed, you may need to create admin manually
)

echo.
echo [5/5] Setup complete!
echo.
echo ================================
echo Next steps:
echo   1. Run: npm run dev
echo   2. Open: http://localhost:3000
echo   3. Admin: http://localhost:3000/admin
echo.
echo Default admin credentials:
echo   Username: admin
echo   Password: admin123
echo ================================
pause
