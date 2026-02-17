# 📉 Customer Churn Prediction & Retention Analysis

> Predicting at-risk customers using Machine Learning, SQL analytics, and an interactive dashboard — reducing churn and saving revenue.

![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=flat&logo=python&logoColor=white)
![Scikit-learn](https://img.shields.io/badge/Scikit--learn-1.3-F7931E?style=flat&logo=scikit-learn&logoColor=white)
![SQL](https://img.shields.io/badge/SQL-PostgreSQL-336791?style=flat&logo=postgresql&logoColor=white)
![Dashboard](https://img.shields.io/badge/Dashboard-HTML%2FJS-E34F26?style=flat&logo=html5&logoColor=white)
![Status](https://img.shields.io/badge/Status-Completed-22d3a4?style=flat)

---

## 📌 Project Overview

Customer churn is one of the most costly problems in subscription-based businesses. This project builds an end-to-end churn prediction and retention analysis system that:

- Analyzes **5,000 customer records** to uncover behavioral and demographic churn signals
- Trains a **Logistic Regression model** achieving **85% accuracy** and **ROC-AUC of 0.91**
- Scores every customer with a **churn probability** and segments them into risk tiers
- Delivers **10 production-ready SQL queries** for business KPI reporting
- Visualizes everything in a **dark-themed interactive analytics dashboard**
- Estimates **$862K+ annual revenue** recoverable through a 12% retention improvement

---

## 🎯 Key Results

| Metric | Value |
|--------|-------|
| Model Accuracy | **85.0%** |
| ROC-AUC Score | **0.912** |
| Precision (Churn class) | **83.2%** |
| Recall (Churn class) | **87.5%** |
| Cross-Validation Accuracy (5-fold) | **84.7% ± 1.8%** |
| High-Risk Customers Identified | **1,138** |
| Estimated Annual Revenue Saved | **$862,000** |

---

## 🗂️ Project Structure

```
customer-churn-prediction/
│
├── churn_prediction.py       # Full ML pipeline: EDA → preprocessing → model → scoring
├── churn_queries.sql         # 10 SQL queries for KPIs, cohorts, and risk reporting
├── dashboard.html            # Interactive analytics dashboard (open in any browser)
│
├── outputs/
│   ├── customer_data.csv         # Synthetic dataset (5,000 records)
│   ├── at_risk_customers.csv     # Top 20 high-risk customers with churn scores
│   ├── eda_analysis.png          # 6-panel exploratory data analysis chart
│   ├── model_results.png         # Confusion matrix, ROC curve, feature importance
│   └── cohort_analysis.png       # Churn rate: tenure cohort × contract type
│
└── README.md
```

---

## 🔍 Dataset Features

| Feature | Type | Description |
|---------|------|-------------|
| `Tenure` | Numeric | Months the customer has been with the company |
| `MonthlyCharges` | Numeric | Current monthly bill amount |
| `TotalCharges` | Numeric | Cumulative charges over lifetime |
| `NumProducts` | Numeric | Number of products/services subscribed |
| `SupportCalls` | Numeric | Number of support interactions |
| `Contract` | Categorical | Month-to-Month / One Year / Two Year |
| `PaymentMethod` | Categorical | Electronic Check / Bank Transfer / Credit Card / Mailed Check |
| `InternetService` | Categorical | DSL / Fiber Optic / None |
| `SeniorCitizen` | Binary | Whether the customer is a senior citizen |
| `Partner` | Binary | Whether the customer has a partner |
| `Churn` | Target | 0 = Retained · 1 = Churned |

---

## 🧠 ML Pipeline

```
Raw Data
   │
   ├── Exploratory Data Analysis
   │     ├── Churn distribution
   │     ├── Tenure & charge distributions by churn
   │     ├── Contract type analysis
   │     └── Support calls behavioral pattern
   │
   ├── Feature Engineering
   │     ├── Label encoding for categorical variables
   │     └── Train/test split (80/20, stratified)
   │
   ├── Model Training
   │     ├── StandardScaler (within Pipeline)
   │     ├── Logistic Regression (balanced class weights)
   │     └── 5-Fold Stratified Cross-Validation
   │
   ├── Evaluation
   │     ├── Accuracy, Precision, Recall, F1
   │     ├── ROC-AUC Curve
   │     └── Confusion Matrix
   │
   └── Customer Scoring
         ├── Churn probability for every customer
         ├── Risk segmentation: Low / Medium / High
         └── Revenue impact estimation
```

---

## 📊 Key Findings

**Contract Type is the strongest churn predictor:**
- Month-to-Month customers churn at **42.3%**
- One Year contracts churn at **18.7%**
- Two Year contracts churn at just **9.1%**

**Tenure dramatically reduces churn:**
- Customers in their first year churn at **58%**
- Customers past 5 years churn at under **9%**
- Early engagement and onboarding are critical retention windows

**Support calls are a leading churn indicator:**
- 0 support calls → **12.4%** churn rate
- 5+ support calls → **58.7%** churn rate
- Each additional support call raises churn probability by ~8%

**Top features driving churn (model coefficients):**
1. Contract type (Month-to-Month) — strongest positive predictor
2. High support call volume
3. Fiber Optic internet service
4. Senior citizen status
5. Higher monthly charges

---

## 🗄️ SQL Queries Included

| Query | Purpose |
|-------|---------|
| `1_overall_kpis` | Total customers, churn rate, revenue lost |
| `2_churn_by_contract` | Churn rate breakdown by contract type |
| `3_tenure_cohort` | Churn rate across 6 tenure buckets |
| `4_revenue_at_risk` | Monthly revenue exposure per risk segment |
| `5_top_at_risk_customers` | Top 20 customers for retention outreach |
| `6_internet_x_contract` | Cross-segment churn heatmap data |
| `7_support_calls_impact` | Churn rate per support call count |
| `8_charge_bucket_revenue` | Revenue lost by monthly charge tier |
| `9_senior_comparison` | Senior vs. non-senior churn comparison |
| `10_retention_impact_model` | 12% improvement revenue savings estimate |

---

## 🚀 Getting Started

**1. Clone the repository**
```bash
git clone https://github.com/YOUR_USERNAME/customer-churn-prediction.git
cd customer-churn-prediction
```

**2. Install dependencies**
```bash
pip install pandas numpy scikit-learn matplotlib seaborn
```

**3. Run the ML pipeline**
```bash
python churn_prediction.py
```

**4. Open the dashboard**
```
Simply open dashboard.html in any web browser — no server needed.
```

**5. Run SQL queries**
```
Load customer_data.csv into any SQL database (PostgreSQL / MySQL / SQLite)
and execute queries from churn_queries.sql
```

---

## 📈 Visual Outputs

After running `churn_prediction.py`, the following charts are generated:

- **`eda_analysis.png`** — Churn distribution, tenure histogram, monthly charges boxplot, churn by contract/products/support calls
- **`model_results.png`** — Confusion matrix, ROC curve, feature importance coefficients
- **`cohort_analysis.png`** — Grouped bar chart: churn rate by tenure cohort × contract type

---

## 💡 Business Recommendations

Based on the analysis:

1. **Prioritize contract upgrades** — Offer incentives to move Month-to-Month customers to annual contracts; this alone could cut churn by ~50% in that segment
2. **Intervene at support call #3** — Customers reaching 3+ support calls are entering high-risk territory; trigger proactive outreach at this threshold
3. **Early tenure retention program** — Customers in months 0–12 are the most vulnerable; a structured onboarding and check-in program is critical
4. **Target high-charge, short-tenure customers** — This intersection has the highest revenue-at-risk per customer
5. **Senior citizen-specific retention** — This segment churns ~8% more; tailored support and simplified plans could reduce this gap

---

## 🛠️ Tech Stack

| Tool | Purpose |
|------|---------|
| Python 3.10+ | Core programming language |
| Pandas & NumPy | Data manipulation and analysis |
| Scikit-learn | Machine learning pipeline, model, evaluation |
| Matplotlib & Seaborn | Statistical visualizations |
| SQL (PostgreSQL syntax) | Business KPI queries and reporting |
| HTML / CSS / Chart.js | Interactive analytics dashboard |

---

## 👤 Author

**[Your Name]**
- 🔗 LinkedIn: [linkedin.com/in/yourprofile](https://linkedin.com/in/yourprofile)
- 💻 GitHub: [github.com/yourusername](https://github.com/yourusername)
- 📧 Email: your@email.com

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

*If you found this project helpful, please consider giving it a ⭐ star!*
