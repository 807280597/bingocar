@echo off
chcp 65001 >nul
echo ===== 自动Git推送脚本 =====
echo 开始推送代码到GitHub...

cd /d "d:\生财有术\汽车"

echo 添加所有更改...
git add .

echo 提交更改...
git commit -m "自动更新 - %date% %time%"

echo 拉取远程更改...
git pull origin main

echo 推送到远程仓库...
git push origin main

if %errorlevel% neq 0 (
    echo 推送失败，尝试使用强制推送...
    git push -f origin main
)

echo ===== 推送完成 =====
timeout /t 5