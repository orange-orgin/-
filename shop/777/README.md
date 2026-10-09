# 校园点餐商家管理后台

基于 Vue3 + Element Plus + Vite 开发的校园点餐 PC 商家管理后台 Demo。

## 技术栈

- Vue 3 (Composition API + &lt;script setup&gt;)
- Element Plus
- Vite
- Vue Router 4
- Pinia
- ECharts
- Axios
- Mock.js

## 功能模块

### 1. 登录模块
- 商家账号密码登录（Mock 校验）
- 账号：shop1 / 123456、shop2 / 123456
- 记住密码、Token 持久化（localStorage）

### 2. 订单管理
- 订单列表：多状态筛选（待接单/制作中/已完成/已取消）
- 时间筛选、订单号搜索
- 新订单弹窗提醒 + 提示音
- 接单/拒单操作（拒单需填备注）
- 订单状态流转：待接单 → 制作中 → 已完成
- 订单详情弹窗
- 小票打印模拟

### 3. 菜品管理
- 菜品分类管理：增删改查
- 菜品列表：分类筛选、上下架状态
- 菜品新增/编辑：名称、价格、图片、库存、描述
- 菜品上下架一键切换
- 库存增减（快捷按钮 +1/-1）
- 批量操作：批量上架/下架

### 4. 数据统计
- 销售统计：日/周/月切换
- 图表展示（ECharts）：
  - 折线图：销售额趋势
  - 柱状图：每日订单数
  - 饼图：菜品分类销量占比
  - 热卖菜品 TOP 10

### 5. 评价管理
- 评价列表：评分、用户、内容、图片
- 评价回复（商家回复）
- 评分筛选、关键词搜索

### 6. 店铺设置
- 店名、营业时间、店铺公告
- 店铺 Logo 上传预览
- 营业状态切换（营业中/休息中）

## 项目结构

```
src/
├── views/           # 页面视图
│   ├── Login.vue       # 登录页面
│   ├── Dashboard.vue   # 工作台
│   ├── Orders.vue      # 订单管理
│   ├── Dishes.vue      # 菜品管理
│   ├── Categories.vue  # 分类管理
│   ├── Statistics.vue  # 数据统计
│   ├── Reviews.vue     # 评价管理
│   └── Store.vue       # 店铺设置
├── components/       # 公共组件
│   ├── Layout.vue      # 布局组件
│   └── NewOrderModal.vue # 新订单弹窗
├── router/           # 路由配置
│   └── index.js
├── store/            # Pinia 状态管理
│   ├── auth.js         # 认证状态
│   ├── orders.js       # 订单状态
│   └── dishes.js       # 菜品状态
├── api/              # API 请求封装
│   └── index.js
├── mock/             # Mock 数据
│   ├── index.js        # Mock 服务配置
│   └── data.js         # 模拟数据
├── utils/            # 工具函数
│   └── index.js
├── App.vue
└── main.js
```

## 快速开始

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

### 生产构建

```bash
npm run build
```

### 预览构建结果

```bash
npm run preview
```

## 登录账号

- **账号**: shop1 / 密码: 123456
- **账号**: shop2 / 密码: 123456

## 说明

- 所有数据均为 Mock 模拟数据
- 新订单会每隔 10 秒随机生成（模拟真实订单场景）
- 页面布局适配 PC 大屏（最小 1280px）
