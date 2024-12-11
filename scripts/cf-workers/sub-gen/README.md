# README.md

## 功能概述

该脚本是一个 Cloudflare Worker，用于处理快速订阅请求和生成 VLESS 订阅链接。它实现了以下主要功能：

### 1. 快速订阅入口

- 通过 `mytoken` 变量配置快速订阅访问入口，留空则不启用快速订阅功能。

### 2. 优选地址配置

- 定义了一个优选地址列表 `addresses`，这些地址用于生成 VLESS 订阅链接。
- 支持从多个 API 地址获取优选地址，具体地址存储在 `addressesapi` 数组中。

### 3. 速度限制

- 通过 `DLS` 变量设置下载速度下限，确保生成的订阅链接符合速度要求。

### 4. 订阅转换后端

- 使用 `subconverter` 变量指定在线订阅转换后端，当前使用肥羊的订阅转换功能。

### 5. 订阅配置文件

- `subconfig` 变量指定了订阅配置文件的 URL，用于生成 Clash 格式的订阅链接。

### 6. 发送 Telegram 消息

- 实现了 [sendMessage](cci:1://file:///Users/cber/Work/euph/CF-GFW/scripts/cf-workers/sub-gen/index.js:65:0-86:1) 函数，用于通过 Telegram 发送消息，包含 IP 地址、国家、城市、组织和 ASN 信息。

### 7. 获取 API 地址

- 实现了 [getAddressesapi](cci:1://file:///Users/cber/Work/euph/CF-GFW/scripts/cf-workers/sub-gen/index.js:88:0-126:1) 函数，从指定的 API 地址获取优选地址，并返回有效的 IP 地址列表。

### 8. 获取 CSV 地址

- 实现了 [getAddressescsv](cci:1://file:///Users/cber/Work/euph/CF-GFW/scripts/cf-workers/sub-gen/index.js:128:0-187:1) 函数，从 CSV 文件中获取有效的 IP 地址，检查 TLS 状态和速度限制。

### 9. 处理订阅请求

- 在 [fetch](cci:1://file:///Users/cber/Work/euph/CF-GFW/scripts/cf-workers/sub-gen/index.js:191:1-461:2) 函数中，根据用户代理和请求格式，决定处理 Clash 格式或 VLESS 格式的订阅请求。
- 生成 VLESS 订阅链接时，使用 `addresses` 中的地址，并根据用户提供的参数生成最终的链接。

### 10. 错误处理

- 在 API 请求和 CSV 解析过程中，添加了错误处理逻辑，以确保脚本的健壮性.
