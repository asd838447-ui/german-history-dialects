@echo off
chcp 65001 >nul
echo ====================================================
echo  Публикация проекта на GitHub
echo ====================================================
echo.
set /p REPO_URL="Вставьте ссылку на ваш GitHub репозиторий (например, https://github.com/username/username.github.io.git): "
if "%REPO_URL%"=="" goto end

"C:\Program Files\Git\cmd\git.exe" remote remove origin 2>nul
"C:\Program Files\Git\cmd\git.exe" remote add origin %REPO_URL%
"C:\Program Files\Git\cmd\git.exe" branch -M main
echo.
echo Отправка файлов в репозиторий...
"C:\Program Files\Git\cmd\git.exe" push -u origin main
echo.
echo Готово! Теперь в настройках репозитория (Settings -> Pages) выберите ветку main.
pause
:end
