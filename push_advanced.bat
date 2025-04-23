@echo off
chcp 65001
echo 正在推送汽车网站代码到GitHub...

:: 添加所有更改
git add .

:: 提交更改
git commit -m "汽车网站更新: %date% %time%"

:: 尝试推送
echo 尝试直接推送...
git push

:: 检查是否推送成功
if %errorlevel% equ 0 (
    echo 推送成功！
) else (
    echo 直接推送失败，尝试使用代理...
    git config --global http.proxy http://127.0.0.1:7890
    git config --global https.proxy http://127.0.0.1:7890
    git push
    
    :: 推送后重置代理设置
    git config --global --unset http.proxy
    git config --global --unset https.proxy
)

echo 推送完成！
pause