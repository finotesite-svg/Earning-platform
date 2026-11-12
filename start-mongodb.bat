@echo off
echo Starting MongoDB locally...
echo.
echo Creating data directory...
mkdir data\db 2>nul

echo.
echo Starting MongoDB server...
echo MongoDB will run on port 27017
echo.
echo IMPORTANT: Keep this window open while using the application!
echo.

mongod --dbpath data\db --port 27017
