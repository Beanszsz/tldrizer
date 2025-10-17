@echo off
echo Creating directory structure...

if not exist src\app\api mkdir src\app\api
if not exist src\app\api\extract-url mkdir src\app\api\extract-url
if not exist src\app\api\extract-pdf mkdir src\app\api\extract-pdf
if not exist src\app\api\summarize mkdir src\app\api\summarize
if not exist src\components mkdir src\components

echo.
echo Moving files to correct locations...

if exist extract-url-route.js (
    copy /Y extract-url-route.js src\app\api\extract-url\route.js
    del extract-url-route.js
)

if exist extract-pdf-route.js (
    copy /Y extract-pdf-route.js src\app\api\extract-pdf\route.js
    del extract-pdf-route.js
)

if exist summarize-route.js (
    copy /Y summarize-route.js src\app\api\summarize\route.js
    del summarize-route.js
)

if exist FileUpload.jsx (
    copy /Y FileUpload.jsx src\components\FileUpload.jsx
    del FileUpload.jsx
)

if exist UrlInput.jsx (
    copy /Y UrlInput.jsx src\components\UrlInput.jsx
    del UrlInput.jsx
)

if exist SummaryDisplay.jsx (
    copy /Y SummaryDisplay.jsx src\components\SummaryDisplay.jsx
    del SummaryDisplay.jsx
)

if exist page-new.js (
    copy /Y page-new.js src\app\page.js
    del page-new.js
)

echo.
echo Cleaning up temporary files...

if exist setup-dirs.js del setup-dirs.js
if exist setup.bat del setup.bat

echo.
echo ========================================
echo Setup complete!
echo ========================================
echo.
echo Your TLDRizer app structure is ready.
echo.
echo Next steps:
echo 1. Make sure you have .env.local with HUGGINGFACE_API_KEY
echo 2. Run: npm run dev
echo 3. Open: http://localhost:3000
echo.
