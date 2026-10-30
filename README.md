# WOLFPACK 筹码观察室

中文链上行情监控网站，采用暖白、陶土橙配色。无需安装依赖或构建。

**在线网站：** https://wolfpack-observer-5199.brawnypixie21.chatgpt.site/

**监控合约：** `0x5199ea953d71d6a5413be1b2efecd26aacab0000`  
**网络：** Robinhood Chain

## 本地运行

需要 Python 3。在仓库根目录运行：

```sh
python3 -m http.server 8765 --directory dist
```

浏览器访问 http://localhost:8765 。也可以将 `dist/` 部署到任意静态网站托管服务。

## 功能

- 默认每1秒自动获取行情，可选3秒、5秒、10秒或30秒，并支持暂停、手动刷新。
- 价格、市值、成交额与流动性监控，交易池切换。
- 买卖笔数占比环形图、多窗口涨跌图、成交额柱状图。
- 已发现交易池的流动性估值分布。
- 价格与流动性双线对比，或单独查看USD采样走势。
- 图表点击切换时间窗口及交易池，悬停查看采样值。
- 本地浏览器采样存储及CSV导出。
- 价格跌幅及相邻样本流动性下降的页面内提示。
- 缺失字段、请求失败和过期数据状态提示。

## 数据与限制

数据来自 [DEX Screener 公共API](https://docs.dexscreener.com/api/reference)，仅接受链与基础代币合约完全匹配的交易池。行情获取时间不等于链上成交时间，上游可能存在索引延迟。默认交易池为 WOLFPACK/hXMAX。

页面打开时采样，关闭后停止。最多保存12000条各池采样，数据保存在当前浏览器的 localStorage 中，不同步到服务器。图表只绘制真实采样点，超过5分钟的间隔断开连线。双线指数以首个可见共同有效样本为100。

此接口不提供大户余额时序、关联钱包及买卖分项金额。买卖笔数占比不能替代金额占比，成交信号不能确认主力吸筹。多个滚动窗口重叠，不可相加。流动性USD估值变化也可能来自资产价格波动，不等于撤池。异常提示仅显示在页面内，不发送外部通知。

仅用于公开数据研究，不构成买卖建议。

## 文件

- `dist/index.html`：页面结构。
- `dist/style.css`：响应式样式。
- `dist/app.js`：行情获取、数据校验、本地存储、图表与交互。

检查JavaScript语法：

```sh
node --check dist/app.js
```

## Vercel 部署

仓库已包含 `vercel.json`，将静态输出目录指定为 `dist`，不需要安装依赖或执行构建。Vercel 项目设置的 Root Directory 请保持仓库根目录（留空）；框架选择 Other。连接本仓库的 `main` 分支后，推送将触发自动部署。

如果之前访问出现 `404 NOT_FOUND`，请确认最新部署包含 `vercel.json`，并在 Deployments 中查看最新提交的部署结果；必要时重新部署最新提交，而不是重新部署旧版本。

## 近实时刷新与 Logo

默认每1秒发起一次行情轮询，单次请求未完成时不会发起新请求。429限流遵守 Retry-After，网络故障采用指数退避。它是REST快照轮询，不是WebSocket逐笔推送，上游索引或缓存仍可能延迟。页面同时显示当前北京时间、最近成功获取时间、请求耗时和距观察数值变化的时间；观察值变化时间并不等于最后成交时间。

项目Logo引用该合约DEX Screener资料所展示的图标：
https://cdn.dexscreener.com/cms/images/__G2dKANZJ92QtC3?fit=crop&format=auto&height=128&quality=95&width=128

## 行情新鲜度与平台价差

当前数据为DEX Screener返回的所选交易池参考价，不等于全市场统一报价。本接口未返回行情生成时间，因此成功获取不能确认报价新鲜度。页面明确标记“行情时间未核验”，并暂停吸筹判断，保留来源快照供参考。与OKX的价差可能涉及数据时点、池子或美元估值口径，尚未确定具体原因。当前没有接入OKX行情API，页面提供同合约OKX行情对照入口。

## 链上主价格

主价格模块 `dist/chain-price.mjs` 直接读取 Robinhood 官方 RPC（https://rpc.mainnet.chain.robinhood.com），验证链 ID 4663，取得最新区块，在同一个区块号上读取两个 Uniswap V4 池的 getSlot0，计算 WOLFPACK → hXMAX → USDG。节点区块超过30秒、未来超过10秒、返回错误或区块哈希重组时拒绝报价；主价格不会静默回退到聚合器。

WOLFPACK/hXMAX池：0x6042253a4cb13a33c83959ca75787197d7b211a4cd7d7ee0308140fbb52cbb58

USDG/hXMAX池：0x4be9bdfcff70326169d9a871974f0e15d18d07ce424678c40aaeef295decb1ae

计价单位为USDG，不假定其严格等于USD。展示池状态的中间价；两个池均有Hook，实际交易价格还涉及Hook、手续费和滑点，因此不称作可成交报价。主价格固定主池，与下方聚合器交易池选择独立。聚合器数据默认30秒更新，仅作对照。

`dist/live-chain.mjs` 负责独立刷新、状态与近120个区块采样图。页面开启时目标每1秒读取，不重叠请求；节点限流和故障自动退避，关闭页面停止读取。
