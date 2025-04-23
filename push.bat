@echo off
chcp 65001
echo 正在推送汽车网站代码到GitHub...
git add .
git commit -m "汽车网站更新: %date% %time%"
git push
echo 推送完成！
pause