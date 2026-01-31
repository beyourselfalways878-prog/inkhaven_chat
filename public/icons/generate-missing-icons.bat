@echo off
echo Generating missing iOS and favicon icons from 512x512...
echo.

REM Check if ImageMagick is installed
where magick >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ImageMagick not found. Installing via winget...
    winget install ImageMagick.ImageMagick
    if %ERRORLEVEL% NEQ 0 (
        echo.
        echo Manual alternative:
        echo 1. Go to https://favicon.io/favicon-converter/
        echo 2. Upload icon-512x512.png
        echo 3. Download and extract
        echo 4. Copy apple-touch-icon.png to icon-152x152.png
        echo 5. Copy favicon-16x16.png to icon-16x16.png
        pause
        exit /b
    )
)

echo Generating icon-152x152.png...
magick "icon-512x512.png" -resize 152x152 "icon-152x152.png"

echo Generating icon-16x16.png...
magick "icon-512x512.png" -resize 16x16 "icon-16x16.png"

echo.
echo Done! All icons generated successfully!
echo.
dir *.png
pause
