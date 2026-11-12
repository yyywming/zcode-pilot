# ZCode Pilot

ZCode 多账号管理与试用号切换器（Windows 桌面版）。

## 下载

- GitHub Releases：https://github.com/yyywming/zcode-pilot/releases/tag/v1.0.0
  - `ZCodePilot-Setup-1.0.0.exe` 安装版
  - `ZCodePilot-portable.exe` 免安装单文件
- 蓝奏云（国内镜像）：https://wwbdq.lanzouq.com/b0wa72asf 密码 `dg7n`

## 功能
- 账号列表、当前账号标记、一键切换
- 订阅号显示套餐额度；试用/免费号正常标注，不误报
- 添加账号：调用内置管理器完成 BigModel / z.ai OAuth 登录
- 活动领取：在内置管理器中操作
- 加密导出 / 导入（.zsb，PBKDF2 + AES-256-GCM）
- 数据：`%USERPROFILE%\.zcode-switch`

## 使用
1. 安装并启动 ZCode Pilot
2. 点「添加账号」，在管理器中登录；回到面板点「刷新」
3. 已有 ZCode 登录时可用「捕获当前登录」直接收录
4. 切换账号后按需重启 ZCode

## 说明
- 本版本为账号/额度管理工具，暂不含 API 网关
- 内置引擎为 MIT 开源的 Z·SWITCH，见 NOTICE.md / LICENSE

## 许可
- 本壳与打包: MIT
- 内置引擎: Z·SWITCH (MIT)
