# 悠纯财务经营分析 BI｜技术开发文档

| 项目 | 内容 |
|---|---|
| 版本 | V0.1（轻量实现设计） |
| 目标 | 将现有 Mock Excel 转为可筛选、可验证、可生成报告的本地 BI 看板 |
| 技术方案 | Python＋pandas＋SQLite＋Streamlit＋Plotly |
| 非目标 | 不做 React/FastAPI/PostgreSQL/Docker/微服务，不包装生产级平台 |

## 1. 设计原则

1. 面试优先：一条命令启动，代码能够讲清，失败时可直接展示 HTML 和 Excel。
2. 指标只算一次：SQL 视图或 Python 指标层统一服务页面、导出和报告。
3. 保留真实 SQL：SQLite 是单文件数据库，但筛选、连接、分组和窗口计算均真实执行。
4. 先聚合再连接：避免一对多费用、售后和出库造成收入重复。
5. 先生成核心故事：总览→单品→现金优先，其他页面复用同一指标层。
6. 所有计算可测试：现有 13 项生成校验和 19 项独立复核必须保留。

## 2. 总体架构

```text
18 个 Mock Excel 工作簿
        ↓ pandas 读取、字段映射、类型检查
SQLite youchun_bi.db
        ↓ 原始表＋SQL 指标视图
Python 指标服务与校验
        ↓
Streamlit 九个页面（含作品说明与技术架构）＋Plotly 图表
        ↓
CSV 导出＋Markdown/HTML 专项报告
```

### 技术职责

| 组件 | 职责 | 不负责 |
|---|---|---|
| pandas | Excel 导入、字段标准化、Mock 生成、部分指标计算 | 页面样式 |
| SQLite/SQL | 筛选、连接、汇总、同比和明细查询 | 文件生成与报告排版 |
| Streamlit | 页面、筛选器、表格、下载和交互 | 复杂账户权限 |
| Plotly | 趋势、瀑布、散点、账龄等图表 | 财务口径决策 |
| pytest/校验脚本 | 金标准、勾稽和回归 | 证明真实企业收益 |

## 3. 项目结构

```text
app.py
src/
  config.py
  import_excel.py
  db.py
  metrics.py
  queries.py
  charts.py
  reports.py
  quality.py
pages/
  00_作品总览.py
  01_假设与数据.py
  02_经营总览.py
  03_销售与单品盈利.py
  04_生产成本与库存.py
  05_费用分析.py
  06_现金流与营运资金.py
  07_专项报告与行动项.py
  08_技术架构与代码.py
data/
  raw_excel/
  youchun_bi.db
mock_data/
  generate_mock.py
  validate_mock.py
tests/
  test_metrics.py
  test_reconciliation.py
requirements.txt
README.md
```

结构可按 Streamlit 单页应用能力合并，避免为了目录整齐制造过多两层文件。

## 4. Excel 导入与 SQLite 表

### 4.1 表映射

| Excel | SQLite 表 | 主键/业务键 |
|---|---|---|
| `D_产品主数据.xlsx` | `dim_product` | `sku_id` |
| `D_渠道区域客户主数据.xlsx` | `dim_channel_region` | `channel_id, region_id` |
| `D_工厂供应商主数据.xlsx` | `dim_plant_supplier` | `record_type, id` |
| `F_销售订单汇总表.xlsx` | `fact_sales` | `sales_batch_id` |
| `F_产成品销售出库表.xlsx` | `fact_outbound` | `sales_batch_id` |
| `F_售后退款表.xlsx` | `fact_refund` | `sales_batch_id` |
| `F_原材料出库及生产成本宽表.xlsx` | `fact_production` | `production_batch_id` |
| `F_产成品库存批次.xlsx` | `fact_inventory` | `inventory_batch_id` |
| `F_渠道费用表.xlsx` | `fact_channel_expense` | `expense_line_id` |
| `F_期间费用与预算.xlsx` | `fact_public_expense` | `month, department, expense_account` |
| `F_采购订单.xlsx` | `fact_purchase` | `purchase_order_id` |
| `F_应收应付核销.xlsx` | `fact_ar_ap` | `open_item_id` |
| `F_银行现金流水.xlsx` | `fact_cash` | `month` |
| `F_现金流预测.xlsx` | `fact_cash_forecast` | `scenario, week_number` |
| `F_金昌投产情景.xlsx` | `fact_jinchang_scenario` | `month, scenario` |
| `F_经营行动项.xlsx` | `action_item` | `action_id` |

导入时将中文表头映射为稳定英文字段，原始中文名保留在字段字典。所有表保留 `data_mode=MOCK` 和导入批次号。

### 4.2 索引

```sql
CREATE INDEX IF NOT EXISTS idx_sales_month ON fact_sales(month);
CREATE INDEX IF NOT EXISTS idx_sales_batch ON fact_sales(sales_batch_id);
CREATE INDEX IF NOT EXISTS idx_sales_dimensions ON fact_sales(month, channel_id, region_id, sku_id);
CREATE INDEX IF NOT EXISTS idx_expense_batch ON fact_channel_expense(sales_batch_id, expense_type);
CREATE INDEX IF NOT EXISTS idx_inventory_month ON fact_inventory(month, plant_id, sku_id);
CREATE INDEX IF NOT EXISTS idx_arap_month ON fact_ar_ap(month, item_type, channel_id);
```

数据量不大，索引以简单可解释为主，不做无关数据库调优。

## 5. 指标层设计

### 5.1 分层

```text
原始表 fact_*
→ 批次指标视图 mart_sales_batch
→ 月度/渠道/SKU 指标视图 mart_operating_month / mart_sku_month
→ 页面与报告
```

### 5.2 批次指标 SQL 示例

必须先聚合费用，再连接销售：

```sql
WITH refund AS (
    SELECT
        sales_batch_id,
        SUM(refund_amount) AS refund_amount,
        SUM(resalable_return_cost) AS resalable_return_cost
    FROM fact_refund
    GROUP BY sales_batch_id
), expense AS (
    SELECT
        sales_batch_id,
        SUM(CASE WHEN expense_type = 'FULFILLMENT' THEN actual_amount ELSE 0 END) AS fulfillment,
        SUM(CASE WHEN expense_type = 'CHANNEL_FEE' THEN actual_amount ELSE 0 END) AS channel_fee,
        SUM(CASE WHEN expense_type = 'DIRECT_MARKETING' THEN actual_amount ELSE 0 END) AS direct_marketing,
        SUM(CASE WHEN expense_type = 'INFLUENCER' THEN actual_amount ELSE 0 END) AS influencer
    FROM fact_channel_expense
    GROUP BY sales_batch_id
)
SELECT
    s.month,
    s.sales_batch_id,
    s.channel_id,
    s.region_id,
    s.sku_id,
    s.confirmed_revenue - s.discount - r.refund_amount AS net_revenue,
    o.outbound_cost - r.resalable_return_cost AS cogs,
    s.confirmed_revenue - s.discount - r.refund_amount
        - o.outbound_cost + r.resalable_return_cost AS gross_profit,
    e.fulfillment,
    e.channel_fee,
    e.direct_marketing,
    e.influencer,
    o.allocated_spoilage_cost
FROM fact_sales s
JOIN refund r ON r.sales_batch_id = s.sales_batch_id
JOIN fact_outbound o ON o.sales_batch_id = s.sales_batch_id
JOIN expense e ON e.sales_batch_id = s.sales_batch_id;
```

贡献利润在下一层计算，避免长 SQL 难以阅读：

```text
contribution_1 = gross_profit - fulfillment - channel_fee - allocated_spoilage_cost
contribution_2 = contribution_1 - direct_marketing - influencer
```

### 5.3 Python 指标函数

```python
def safe_divide(numerator, denominator):
    if denominator is None or denominator == 0:
        return None
    return numerator / denominator


def add_profit_metrics(df):
    result = df.copy()
    result["cogs"] = result["outbound_cost"] - result["resalable_return_cost"]
    result["gross_profit"] = result["net_revenue"] - result["cogs"]
    result["contribution_1"] = (
        result["gross_profit"]
        - result["fulfillment"]
        - result["channel_fee"]
        - result["allocated_spoilage_cost"]
    )
    result["contribution_2"] = (
        result["contribution_1"]
        - result["direct_marketing"]
        - result["influencer"]
    )
    return result


def weighted_margin(df, profit_column="gross_profit"):
    return safe_divide(df[profit_column].sum(), df["net_revenue"].sum())
```

禁止用 `df["gross_margin"].mean()` 作为公司或渠道毛利率。

### 5.4 同比与环比

SQLite 可使用 `LAG` 窗口函数，也可在月度 SQL 汇总后由 pandas 计算：

```python
monthly = monthly.sort_values("month")
monthly["revenue_mom"] = monthly["net_revenue"].pct_change()
monthly["revenue_yoy"] = monthly["net_revenue"].pct_change(12)
monthly["gross_margin_yoy_pp"] = monthly["gross_margin"].diff(12)
```

同比必须保证连续完整月份；若筛选导致期间缺口，不用简单行偏移，应通过日期维度连接去年同期。

## 6. 页面与图表实现

### 6.1 全局筛选

```python
month = st.selectbox("分析月份", months, index=months.index("2026-09"))
channels = st.multiselect("渠道", channel_options, default=channel_options)
regions = st.multiselect("区域", region_options, default=region_options)
skus = st.multiselect("SKU", sku_options)
```

筛选条件通过 SQL 参数或 pandas 布尔过滤传递，不使用字符串拼接 SQL。

### 6.2 总览

- `st.metric` 展示六个 KPI 及同比/环比。
- Plotly 柱线组合：收入柱、毛利率线。
- Plotly 瀑布：净收入到管理经营利润。
- `st.dataframe` 展示区域经营和异常 Top 5。
- 默认只突出三个异常，其余进入“更多异常”。

### 6.3 单品盈利

- 渠道组合图和 SKU 散点图。
- 散点 X 为净收入、Y 为贡献利润率 II、颜色为品类。
- 点击/选择 SKU 后显示渠道对比和原始批次，不依赖复杂自定义组件。

### 6.4 成本库存

- 成本结构堆叠条形、单位成本趋势。
- 正常/临期/冻结库存堆叠条形。
- 低温 SKU 明细显示 DIO、临期和报损。

### 6.5 费用

- 实际与预算分组条形。
- 直接费用和公共费用分别汇总。
- 费用率趋势必须和收入趋势联动。

### 6.6 现金

- 现金收付组合、利润与现金对比。
- DIO/DSO/DPO 趋势、应收账龄、13 周预测及安全线。
- 金昌情景通过单独切换展示，不与历史事实混合。

### 6.7 报告

- 使用 Jinja2 或字符串模板生成 Markdown/HTML。
- 每个结论插入指标值、期间、筛选条件和证据表。
- 浏览器打印 PDF，不引入文档微服务。

## 7. 查询性能与缓存

- 原始数据导入只在文件变化或手动重建时执行。
- 月度指标和筛选后的汇总可使用 `st.cache_data`。
- 缓存键必须包含数据版本和筛选条件，不能切换月份后仍显示旧数据。
- 明细默认分页或限制前 200 行，汇总不受此限制。
- 常规查询目标 2 秒内完成；不为几万行数据引入分布式方案。

## 8. 数据质量与测试

### 8.1 导入时

- 文件和工作表齐全。
- 字段名、数据类型、主键和月份格式正确。
- SKU、渠道、区域、工厂和批次外键完整。
- 所有原始表有 `MOCK` 标识。

### 8.2 指标测试

```python
def test_company_gross_margin_uses_weighted_ratio():
    df = pd.DataFrame({
        "net_revenue": [95.0, 5.0],
        "gross_profit": [34.0, 2.5],
    })
    assert weighted_margin(df) == 36.5 / 100
```

必须覆盖：正常销售、退款、可售退货、零分母、负贡献、库存勾稽和应收应付勾稽。

### 8.3 连接防重复测试

```text
连接前销售控制总额
→ 连接费用、售后和出库
→ 再次计算销售控制总额
→ 差异必须为 0
```

### 8.4 端到端验收

1. 重建 Mock 数据并运行 `validate_mock.py`。
2. 导入 SQLite，核对各表行数和控制总额。
3. 比较 SQL、Python 与 `99_指标结果与勾稽校验.xlsx` 的 2026-09 指标。
4. 页面按默认故事完成总览→抖音→库存→现金→报告。
5. 导出与页面相同筛选的结果并复核。

## 9. 安装与运行

```bash
pip install -r requirements.txt
python mock_data/generate_mock.py
python mock_data/validate_mock.py
python src/import_excel.py
streamlit run app.py
```

依赖仅保留必要项：

```text
pandas
numpy
openpyxl
streamlit
plotly
pytest
```

如使用 `uv`，可按照实际命令环境运行，不需要 Docker。

## 10. 面试代码展示顺序

只展示三处：

1. `mart_sales_batch`：说明先聚合费用再连接，避免收入重复。
2. `add_profit_metrics`：说明毛利和贡献利润的计算层级。
3. `validate_mock.py`：说明独立重算和 19 项校验。

前端只展示一个页面筛选和一张图，不现场逐行读 CSS 或 Streamlit 页面代码。

## 11. 明确边界

- 本地作品没有生产级认证、权限、调度、审计和高可用。
- SQLite 适合演示和中小数据，不包装成企业大数据方案。
- 经营现金是管理 proxy，不替代法定现金流量表。
- Mock 数据验证计算与分析能力，不证明悠纯真实经营结果或 50% 实际收益。
