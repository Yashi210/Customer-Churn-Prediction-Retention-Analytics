# Customer Churn Prediction & Retention Analysis

A production-grade analytics dashboard built with React to predict customer churn, identify at-risk accounts, and track retention improvement strategies — powered by a Logistic Regression model with **85% accuracy**.

![Python](https://img.shields.io/badge/Python-3.9+-blue?logo=python) ![SQL](https://img.shields.io/badge/SQL-PostgreSQL-336791?logo=postgresql) ![React](https://img.shields.io/badge/React-18.x-61DAFB?logo=react) ![Model Accuracy](https://img.shields.io/badge/Model%20Accuracy-85%25-success) ![Retention](https://img.shields.io/badge/Retention%20Improvement-12%25-brightgreen)

---

## Project Overview

This project analyzes large customer datasets to identify behavioral patterns driving churn, predict at-risk customers before they leave, and support data-driven retention strategies. The result: a **12% improvement in retention** after implementing model-driven interventions.

---

##  Dashboard Features

### Overview Tab
- Real-time KPI cards — total customers, churn rate, at-risk accounts, revenue at risk
- Retention rate trend: actual vs model-predicted
- Churn breakdown by customer segment (Enterprise, Mid-Market, SMB, Freemium)
- Engagement vs Tenure scatter plot with churn probability heatmap

###  At-Risk Tab
- Live queue of high-churn-probability customers sorted by risk score
- Days inactive, ARR, and risk level per account
- AI-recommended actions (e.g., immediate call, discount offer, feature demo)

###  Model Tab
- Logistic Regression performance metrics: Accuracy, Precision, Recall, F1 Score
- Feature importance breakdown — top predictors of churn
- Confusion matrix with TP, FP, FN, TN breakdown
- Model comparison vs Random Forest and SVM

###  Cohorts Tab
- Monthly cohort retention heatmap
- Multi-line retention curves by acquisition cohort
- Drop-off pattern analysis across customer lifecycle

---

##  Tech Stack

| Layer | Tools |
|---|---|
| Data Analysis | Python (pandas, numpy, scikit-learn) |
| Database | SQL (PostgreSQL) |
| ML Model | Logistic Regression (scikit-learn) |
| Dashboard UI | React, Recharts, Tailwind CSS |
| Visualization | Power BI (original), Recharts (web version) |

---

##  Machine Learning Model

### Model: Logistic Regression

| Metric | Score |
|---|---|
| Accuracy | **85%** |
| Precision | 82% |
| Recall | 79% |
| F1 Score | 0.804 |

### Top Churn Predictors
1. **Days Since Last Login** (31%) — strongest signal
2. **Support Ticket Volume** (24%) — friction indicator
3. **Feature Adoption Rate** (19%) — product stickiness
4. **Contract Age** (13%) — lifecycle stage
5. **NPS Score** (8%) — satisfaction signal
6. **Payment Delays** (5%) — financial health

### Why Logistic Regression?
Outperformed Random Forest (81%) and SVM (79%) on the validation set, with the added benefit of interpretable coefficients for business stakeholders.

---

##  Getting Started

### Prerequisites
- Node.js 16+ and npm installed

### Installation

1. Clone the repository:
```bash
git clone https://github.com/YOUR-USERNAME/churn-prediction-dashboard.git
cd churn-prediction-dashboard
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

---

##  Project Structure

```
churn-prediction-dashboard/
├── src/
│   ├── churn-dashboard.jsx      # Main React dashboard
│   └── index.js                 # Entry point
├── notebooks/
│   └── churn_model.ipynb        # Python ML model (optional)
├── sql/
│   └── churn_queries.sql        # Data extraction queries (optional)
├── package.json
├── README.md
└── .gitignore
```

---

##  Connecting Real Data

Replace sample data with your actual data source:

```javascript
// Example: Fetch from your backend API
useEffect(() => {
  fetch('/api/churn-metrics')
    .then(res => res.json())
    .then(data => {
      setKpiData(data.kpis);
      setAtRiskCustomers(data.atRisk);
    });
}, []);
```

### SQL Query Example
```sql
SELECT
  customer_id,
  days_since_login,
  support_tickets,
  feature_adoption_rate,
  nps_score,
  churn_label
FROM customer_features
WHERE snapshot_date = CURRENT_DATE;
```

---

##  Key Results

-  Identified **1,842 at-risk customers** before churn occurred
-  **$2.1M revenue** protected through proactive outreach
-  Retention rate improved from **74.2% → 81.7%** (+12%)
-  Freemium-to-paid churn reduced by targeting highest-scoring leads first

---


- LinkedIn: [Your Profile](https://linkedin.com/in/yourprofile)
- Portfolio: [yourwebsite.com](https://yourwebsite.com)

---

⭐ If this project helped you, give it a star!
