"""
=============================================================
  Customer Churn Prediction & Retention Analysis
  Author: Data Analytics Project
  Stack : Python · Scikit-learn · Pandas · Matplotlib · Seaborn
=============================================================
"""

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import matplotlib.ticker as mtick
import seaborn as sns
from sklearn.model_selection import train_test_split, StratifiedKFold, cross_val_score
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score, classification_report, confusion_matrix,
    roc_auc_score, roc_curve, ConfusionMatrixDisplay
)
from sklearn.pipeline import Pipeline
import warnings
warnings.filterwarnings("ignore")

# ──────────────────────────────────────────────
# 1.  SYNTHETIC DATASET GENERATION
# ──────────────────────────────────────────────
np.random.seed(42)
N = 5000

def generate_dataset(n):
    tenure         = np.random.randint(1, 73, n)
    monthly_charge = np.round(np.random.uniform(20, 120, n), 2)
    total_charges  = np.round(monthly_charge * tenure * np.random.uniform(0.85, 1.15, n), 2)
    num_products   = np.random.randint(1, 6, n)
    support_calls  = np.random.poisson(2, n)
    contract       = np.random.choice(["Month-to-Month", "One Year", "Two Year"],
                                       n, p=[0.55, 0.25, 0.20])
    payment_method = np.random.choice(
        ["Electronic Check", "Mailed Check", "Bank Transfer", "Credit Card"], n)
    internet       = np.random.choice(["DSL", "Fiber Optic", "No"], n, p=[0.35, 0.45, 0.20])
    senior         = np.random.choice([0, 1], n, p=[0.84, 0.16])
    partner        = np.random.choice([0, 1], n, p=[0.52, 0.48])

    # Churn probability engineered from features
    churn_prob = (
        0.30
        - 0.004 * tenure
        + 0.002 * monthly_charge
        - 0.03  * num_products
        + 0.04  * support_calls
        + 0.15  * (contract == "Month-to-Month").astype(int)
        - 0.08  * (contract == "Two Year").astype(int)
        + 0.10  * (internet == "Fiber Optic").astype(int)
        + 0.05  * senior
        + np.random.normal(0, 0.05, n)
    )
    churn_prob = np.clip(churn_prob, 0.02, 0.95)
    churn      = (np.random.rand(n) < churn_prob).astype(int)

    return pd.DataFrame({
        "CustomerID"    : [f"CUST-{i:05d}" for i in range(n)],
        "Tenure"        : tenure,
        "MonthlyCharges": monthly_charge,
        "TotalCharges"  : total_charges,
        "NumProducts"   : num_products,
        "SupportCalls"  : support_calls,
        "Contract"      : contract,
        "PaymentMethod" : payment_method,
        "InternetService": internet,
        "SeniorCitizen" : senior,
        "Partner"       : partner,
        "Churn"         : churn
    })

df = generate_dataset(N)
df.to_csv("customer_data.csv", index=False)
print("✅  Dataset generated:", df.shape)
print(df.head())

# ──────────────────────────────────────────────
# 2.  EXPLORATORY DATA ANALYSIS
# ──────────────────────────────────────────────
churn_rate = df["Churn"].mean() * 100
print(f"\n📊  Overall Churn Rate: {churn_rate:.1f}%")
print(df.describe().T[["mean", "std", "min", "max"]])

fig, axes = plt.subplots(2, 3, figsize=(16, 10))
fig.suptitle("Customer Churn – Exploratory Data Analysis", fontsize=16, fontweight="bold", y=1.01)

# Churn Distribution
ax = axes[0, 0]
labels = ["Retained", "Churned"]
colors = ["#4CAF50", "#F44336"]
counts = df["Churn"].value_counts().sort_index()
ax.pie(counts, labels=labels, colors=colors, autopct="%1.1f%%",
       startangle=90, wedgeprops=dict(edgecolor="white", linewidth=2))
ax.set_title("Churn Distribution", fontweight="bold")

# Tenure by Churn
ax = axes[0, 1]
for c, color, label in zip([0, 1], colors, labels):
    ax.hist(df[df["Churn"] == c]["Tenure"], bins=30, alpha=0.6,
            color=color, label=label, edgecolor="white")
ax.set_title("Tenure Distribution by Churn", fontweight="bold")
ax.set_xlabel("Tenure (Months)")
ax.set_ylabel("Count")
ax.legend()

# Monthly Charges by Churn
ax = axes[0, 2]
df.boxplot(column="MonthlyCharges", by="Churn", ax=ax,
           boxprops=dict(color="#1565C0"),
           medianprops=dict(color="#F44336", linewidth=2))
ax.set_title("Monthly Charges vs Churn", fontweight="bold")
ax.set_xlabel("Churn (0=No, 1=Yes)")
ax.set_ylabel("Monthly Charges ($)")
plt.sca(ax); plt.title("")

# Churn by Contract Type
ax = axes[1, 0]
contract_churn = df.groupby("Contract")["Churn"].mean() * 100
bars = ax.bar(contract_churn.index, contract_churn.values,
              color=["#2196F3", "#FF9800", "#9C27B0"], edgecolor="white", linewidth=1.2)
ax.set_title("Churn Rate by Contract Type", fontweight="bold")
ax.set_ylabel("Churn Rate (%)")
ax.yaxis.set_major_formatter(mtick.PercentFormatter())
for bar, val in zip(bars, contract_churn.values):
    ax.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 0.5,
            f"{val:.1f}%", ha="center", fontsize=9, fontweight="bold")

# Churn by Number of Products
ax = axes[1, 1]
prod_churn = df.groupby("NumProducts")["Churn"].mean() * 100
ax.plot(prod_churn.index, prod_churn.values, "o-", color="#E91E63",
        linewidth=2.5, markersize=8, markerfacecolor="white", markeredgewidth=2.5)
ax.fill_between(prod_churn.index, prod_churn.values, alpha=0.15, color="#E91E63")
ax.set_title("Churn Rate by Number of Products", fontweight="bold")
ax.set_xlabel("Number of Products")
ax.set_ylabel("Churn Rate (%)")
ax.yaxis.set_major_formatter(mtick.PercentFormatter())

# Support Calls vs Churn
ax = axes[1, 2]
call_churn = df.groupby("SupportCalls")["Churn"].mean() * 100
ax.bar(call_churn.index, call_churn.values, color="#00BCD4", edgecolor="white")
ax.set_title("Churn Rate by Support Calls", fontweight="bold")
ax.set_xlabel("Number of Support Calls")
ax.set_ylabel("Churn Rate (%)")
ax.yaxis.set_major_formatter(mtick.PercentFormatter())

plt.tight_layout()
plt.savefig("eda_analysis.png", dpi=150, bbox_inches="tight")
plt.close()
print("\n✅  EDA plot saved → eda_analysis.png")

# ──────────────────────────────────────────────
# 3.  FEATURE ENGINEERING & PREPROCESSING
# ──────────────────────────────────────────────
df_model = df.drop("CustomerID", axis=1).copy()

# Encode categoricals
le = LabelEncoder()
for col in ["Contract", "PaymentMethod", "InternetService"]:
    df_model[col] = le.fit_transform(df_model[col])

# Feature / target split
X = df_model.drop("Churn", axis=1)
y = df_model["Churn"]

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.20, random_state=42, stratify=y)

print(f"\n✅  Train size: {X_train.shape[0]} | Test size: {X_test.shape[0]}")

# ──────────────────────────────────────────────
# 4.  MODEL TRAINING – LOGISTIC REGRESSION
# ──────────────────────────────────────────────
pipeline = Pipeline([
    ("scaler", StandardScaler()),
    ("model",  LogisticRegression(max_iter=1000, class_weight="balanced", random_state=42))
])

pipeline.fit(X_train, y_train)
y_pred      = pipeline.predict(X_test)
y_prob      = pipeline.predict_proba(X_test)[:, 1]

accuracy    = accuracy_score(y_test, y_pred)
roc_auc     = roc_auc_score(y_test, y_prob)
cv_scores   = cross_val_score(pipeline, X, y, cv=StratifiedKFold(5), scoring="accuracy")

print(f"\n{'='*45}")
print(f"  MODEL PERFORMANCE SUMMARY")
print(f"{'='*45}")
print(f"  Accuracy   : {accuracy*100:.1f}%")
print(f"  ROC-AUC    : {roc_auc:.3f}")
print(f"  CV Accuracy: {cv_scores.mean()*100:.1f}% ± {cv_scores.std()*100:.1f}%")
print(f"{'='*45}")
print("\n📋  Classification Report:\n")
print(classification_report(y_test, y_pred, target_names=["Retained", "Churned"]))

# ──────────────────────────────────────────────
# 5.  VISUALISATIONS – MODEL RESULTS
# ──────────────────────────────────────────────
fig, axes = plt.subplots(1, 3, figsize=(18, 5))
fig.suptitle("Logistic Regression – Model Evaluation", fontsize=15, fontweight="bold")

# Confusion Matrix
cm = confusion_matrix(y_test, y_pred)
disp = ConfusionMatrixDisplay(confusion_matrix=cm, display_labels=["Retained", "Churned"])
disp.plot(ax=axes[0], colorbar=False, cmap="Blues")
axes[0].set_title(f"Confusion Matrix\n(Accuracy: {accuracy*100:.1f}%)", fontweight="bold")

# ROC Curve
fpr, tpr, _ = roc_curve(y_test, y_prob)
axes[1].plot(fpr, tpr, color="#1565C0", linewidth=2.5, label=f"AUC = {roc_auc:.3f}")
axes[1].plot([0,1],[0,1], "k--", linewidth=1, alpha=0.5)
axes[1].fill_between(fpr, tpr, alpha=0.1, color="#1565C0")
axes[1].set_title("ROC Curve", fontweight="bold")
axes[1].set_xlabel("False Positive Rate")
axes[1].set_ylabel("True Positive Rate")
axes[1].legend(loc="lower right")

# Feature Importance (coefficients)
coef = pipeline.named_steps["model"].coef_[0]
feat_imp = pd.Series(coef, index=X.columns).sort_values()
colors_fi = ["#F44336" if v > 0 else "#4CAF50" for v in feat_imp.values]
feat_imp.plot(kind="barh", ax=axes[2], color=colors_fi, edgecolor="white")
axes[2].set_title("Feature Coefficients\n(Red=Churn Risk ↑ | Green=Churn Risk ↓)", fontweight="bold")
axes[2].set_xlabel("Coefficient Value")
axes[2].axvline(0, color="black", linewidth=0.8)

plt.tight_layout()
plt.savefig("model_results.png", dpi=150, bbox_inches="tight")
plt.close()
print("\n✅  Model results saved → model_results.png")

# ──────────────────────────────────────────────
# 6.  COHORT RETENTION ANALYSIS
# ──────────────────────────────────────────────
df["TenureBucket"]  = pd.cut(df["Tenure"],  bins=[0,12,24,36,48,60,72],
                              labels=["0-12m","13-24m","25-36m","37-48m","49-60m","61-72m"])
df["ChargeBucket"]  = pd.cut(df["MonthlyCharges"], bins=[0,40,70,100,120],
                              labels=["Low","Medium","High","Premium"])

cohort = df.groupby(["TenureBucket","Contract"])["Churn"].mean().unstack() * 100
fig, ax = plt.subplots(figsize=(11, 5))
cohort.plot(kind="bar", ax=ax, colormap="Set2", edgecolor="white", width=0.75)
ax.set_title("Cohort Churn Rate: Tenure × Contract Type", fontsize=13, fontweight="bold")
ax.set_xlabel("Tenure Bucket")
ax.set_ylabel("Churn Rate (%)")
ax.yaxis.set_major_formatter(mtick.PercentFormatter())
ax.legend(title="Contract", bbox_to_anchor=(1.01, 1), loc="upper left")
ax.set_xticklabels(ax.get_xticklabels(), rotation=0)
plt.tight_layout()
plt.savefig("cohort_analysis.png", dpi=150, bbox_inches="tight")
plt.close()
print("✅  Cohort analysis saved → cohort_analysis.png")

# ──────────────────────────────────────────────
# 7.  AT-RISK CUSTOMER SCORING
# ──────────────────────────────────────────────
df["ChurnProbability"] = pipeline.predict_proba(
    pd.get_dummies(df.drop(["CustomerID","Churn","TenureBucket","ChargeBucket"], axis=1))
    .reindex(columns=X.columns, fill_value=0)
)[:, 1]

df["RiskSegment"] = pd.cut(df["ChurnProbability"],
                            bins=[0, 0.35, 0.60, 1.0],
                            labels=["Low Risk", "Medium Risk", "High Risk"])

risk_summary = df.groupby("RiskSegment").agg(
    Customers=("CustomerID", "count"),
    AvgChurnProb=("ChurnProbability", "mean"),
    AvgMonthlyCharge=("MonthlyCharges", "mean"),
    AvgTenure=("Tenure", "mean")
).round(2)

print("\n🎯  Risk Segment Summary:")
print(risk_summary.to_string())

at_risk = df[df["RiskSegment"] == "High Risk"][
    ["CustomerID","Tenure","MonthlyCharges","Contract","SupportCalls","ChurnProbability"]
].sort_values("ChurnProbability", ascending=False).head(20)

at_risk.to_csv("at_risk_customers.csv", index=False)
print(f"\n✅  Top at-risk customers saved → at_risk_customers.csv  ({len(at_risk)} records)")

# ──────────────────────────────────────────────
# 8.  RETENTION IMPACT ESTIMATE
# ──────────────────────────────────────────────
avg_revenue_per_customer = df["MonthlyCharges"].mean()
high_risk_count          = (df["RiskSegment"] == "High Risk").sum()
retention_improvement    = 0.12

saved_customers = int(high_risk_count * retention_improvement)
monthly_revenue_saved = saved_customers * avg_revenue_per_customer
annual_revenue_saved  = monthly_revenue_saved * 12

print(f"\n💰  RETENTION IMPACT ESTIMATE")
print(f"    High-Risk Customers          : {high_risk_count:,}")
print(f"    12% Retention Improvement    : {saved_customers:,} customers saved")
print(f"    Avg Monthly Revenue/Customer : ${avg_revenue_per_customer:.2f}")
print(f"    Estimated Monthly Revenue ↑  : ${monthly_revenue_saved:,.0f}")
print(f"    Estimated Annual Revenue  ↑  : ${annual_revenue_saved:,.0f}")

print("\n✅  All outputs generated successfully!")
