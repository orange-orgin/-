---
AIGC:
    Label: "1"
    ContentProducer: 001191440300708461136T1XGW3
    ProduceID: cc4a193e4259db83e7542daa277d3ab1_fdf6cbf463da11f196be5254006c9bbf
    ReservedCode1: zlb8hk6pDkeQ3mn109Kib9aJB2TB0k3sMG4mntKlCh9khqgVuBb5zbL5k+MxsxjAKn4yfOeYpW5gNc1UCfdzOIVflfomtjVD0YAX29vyTFMi+r3oS823BR1F8GPdn/sOQHGdWgRg4+Q0cRID0+1pwzpri9TudfPj8ZyUzWXS1AxhW0+HYhZ3q2JAgrg=
    ContentPropagator: 001191440300708461136T1XGW3
    PropagateID: cc4a193e4259db83e7542daa277d3ab1_fdf6cbf463da11f196be5254006c9bbf
    ReservedCode2: zlb8hk6pDkeQ3mn109Kib9aJB2TB0k3sMG4mntKlCh9khqgVuBb5zbL5k+MxsxjAKn4yfOeYpW5gNc1UCfdzOIVflfomtjVD0YAX29vyTFMi+r3oS823BR1F8GPdn/sOQHGdWgRg4+Q0cRID0+1pwzpri9TudfPj8ZyUzWXS1AxhW0+HYhZ3q2JAgrg=
---

# 校园线上点餐系统 — 项目概览

## 项目架构

| 端 | 技术栈 | 入口 | 角色 |
|---|---|---|---|
| 共享后端 | Node.js + Express.js (端口 3000) | `server/server.js` | 数据存储与业务逻辑 |
| 商家后台 (PC) | Vue3 + Element Plus + ECharts | `shop/777/` | 商家管理订单/菜品/店铺 |
| 学生端 (移动) | 微信原生小程序 | `student/` | 学生浏览/点餐/支付 |
| 监管方工作台 (PC) | Vue3 CDN + Element Plus CDN | `supervisor/index.html` | 平台监管/审核/考评 |
| 数据持久化 | JSON 文件，100ms 防抖自动保存 | `server/data-persist.json` | 程序重启数据不丢失 |

## 目录结构

```
课设/
├── server/
│   ├── server.js              # 全部 API 路由和业务逻辑
│   └── data-persist.json       # 持久化数据文件
├── shop/
│   └── 777/                    # Vue3 商家后台项目
│       ├── src/
│       │   ├── views/          # 页面组件
│       │   ├── router/         # 路由配置
│       │   └── api/            # 接口封装
│       └── package.json
├── student/                    # 微信原生小程序
│   ├── pages/                  # 页面目录
│   ├── utils/                  # 工具函数
│   └── app.js / app.json       # 小程序入口
└── supervisor/
    └── index.html              # 监管方工作台（CDN 单文件）
```

## 关键文件职责

| 文件 | 职责 |
|---|---|
| `server/server.js` | 全部 API 路由：商家认证、订单管理、菜品管理、分类管理、评价管理、数据统计、学生端专用接口、商家注册审核、监管方考评奖励 |
| `server/data-persist.json` | 系统全部数据：商家信息、菜品、订单、评价、分类、统计数据、注册申请、考评记录、奖励记录 |
| `shop/777/src/views/` | 商家后台 7 个页面：Dashboard、订单、菜品、分类、统计、评价、店铺设置 |
| `student/pages/` | 学生端 10 个页面：首页、商家详情、菜品详情、购物车、确认下单、订单列表、订单详情、评价、个人中心 |
| `supervisor/index.html` | 监管方工作台 5 个 Tab：工作台、商家管理、考评记录、注册审核、平台奖励 |

## 数据流

```
学生端下单 → POST /api/student/orders → 写入共享 orders[] → 自动扣库存
      ↓
商家后台 10 秒轮询 → 发现新订单 → 铃铛提醒
      ↓
商家操作（接单/拒单/完成）→ 更新 orders[] 状态
      ↓
学生端刷新 → 状态变更可见
```

## 约定信息

- 商家初始密码：`123456`
- 监管方账号：`admin` / 密码：`admin123`
- 后端端口：`3000`
- API 返回格式：`{ code, data, message }`
- 学生端 userId 模拟：通过微信登录获取或游客模式生成

## 已完成功能清单

### 后端 API
- 商家/监管方登录认证
- 店铺信息 CRUD + 营业状态切换
- 菜品 CRUD + 库存管理 + 上/下架 + 批量操作
- 分类 CRUD + 删除保护
- 订单状态流转（pending→processing→completed / cancelled）+ 合法转换校验
- 学生端：商家列表、菜品搜索、库存校验、创建订单（自动扣库存+取餐码）、取消订单（恢复库存）、提交评价（防重复）
- 商家注册提交 + 监管方审核（批准自动建账号 / 驳回填原因）
- 监管方考评（四维度 0-100）+ 综合评分自动汇总 + 平台奖励
- 数据统计（日/周/月销售额、订单数、分类占比、热卖 TOP 10）
- 数据持久化 JSON 文件 100ms 防抖自动保存

### 商家后台（7 个页面）
- 工作台：统计卡片 + ECharts 图表 + 最新订单 + 新订单轮询提醒
- 订单管理：多 Tab + 搜索筛选 + 接单/拒单/完成
- 菜品管理：列表/新增/编辑/上下架/库存增减/批量操作
- 分类管理：增删改查 + 拖拽排序
- 数据统计：日/周/月 + ECharts 可视化
- 评价管理：星级筛选 + 商家回复
- 店铺设置：信息编辑 + Logo + 营业状态

### 学生端（10 个页面 + TabBar）
- 首页：轮播公告 + 分类滑动 + 商家列表 + 菜品搜索
- 商家详情/菜品详情 + 加入购物车（抛物线动画）
- 购物车：同商家校验 + 库存不足标红 + 下单前库存校验
- 确认下单：备注 + 优惠券模拟 + 模拟支付（95% 成功率）
- 订单列表/详情：状态 Tab + 取餐码 + 取消/再来一单/评价
- 评价：星级评分 + 预设标签 + 文字评价
- 个人中心：统计 + 退出

### 监管方工作台（5 个 Tab）
- 工作台：统计卡片 + 商家综合排名
- 商家管理：考评 + 奖励发放
- 考评记录：列表 + 删除（自动重算评分）
- 注册审核：批准/驳回
- 平台奖励：记录列表
*（内容由AI生成，仅供参考）*
