-- ================================================================
--  Customer Churn Prediction & Retention Analysis
--  SQL Queries – Analytics Layer
--  Compatible with: PostgreSQL / MySQL / SQLite
-- ================================================================


-- ────────────────────────────────────────────
-- TABLE SCHEMA
-- ────────────────────────────────────────────
CREATE TABLE customers (
    CustomerID       VARCHAR(20) PRIMARY KEY,
    Tenure           INT,
    MonthlyCharges   DECIMAL(8,2),
    TotalCharges     DECIMAL(10,2),
    NumProducts      INT,
    SupportCalls     INT,
    Contract         VARCHAR(30),
    PaymentMethod    VARCHAR(30),
    InternetService  VARCHAR(20),
    SeniorCitizen    TINYINT,
    Partner          TINYINT,
    Churn            TINYINT         -- 0 = Retained, 1 = Churned
);

CREATE TABLE churn_scores (
    CustomerID       VARCHAR(20) PRIMARY KEY,
    ChurnProbability DECIMAL(5,4),
    RiskSegment      VARCHAR(20),     -- Low / Medium / High
    ScoredAt         TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (CustomerID) REFERENCES customers(CustomerID)
);


-- ════════════════════════════════════════════
-- 1.  HIGH-LEVEL CHURN KPIs
-- ════════════════════════════════════════════
SELECT
    COUNT(*)                                           AS TotalCustomers,
    SUM(Churn)                                         AS ChurnedCustomers,
    COUNT(*) - SUM(Churn)                              AS RetainedCustomers,
    ROUND(SUM(Churn) * 100.0 / COUNT(*), 2)            AS ChurnRatePct,
    ROUND(AVG(MonthlyCharges), 2)                      AS AvgMonthlyCharge,
    ROUND(SUM(CASE WHEN Churn=1 THEN MonthlyCharges END)
          * 12, 2)                                     AS EstAnnualRevenueLost
FROM customers;


-- ════════════════════════════════════════════
-- 2.  CHURN RATE BY CONTRACT TYPE
-- ════════════════════════════════════════════
SELECT
    Contract,
    COUNT(*)                                           AS TotalCustomers,
    SUM(Churn)                                         AS Churned,
    ROUND(SUM(Churn) * 100.0 / COUNT(*), 2)            AS ChurnRatePct,
    ROUND(AVG(MonthlyCharges), 2)                      AS AvgMonthlyCharge
FROM customers
GROUP BY Contract
ORDER BY ChurnRatePct DESC;


-- ════════════════════════════════════════════
-- 3.  TENURE COHORT ANALYSIS
-- ════════════════════════════════════════════
SELECT
    CASE
        WHEN Tenure BETWEEN  1 AND 12 THEN '0-12 Months'
        WHEN Tenure BETWEEN 13 AND 24 THEN '13-24 Months'
        WHEN Tenure BETWEEN 25 AND 36 THEN '25-36 Months'
        WHEN Tenure BETWEEN 37 AND 48 THEN '37-48 Months'
        WHEN Tenure BETWEEN 49 AND 60 THEN '49-60 Months'
        ELSE '61+ Months'
    END                                                AS TenureBucket,
    COUNT(*)                                           AS TotalCustomers,
    SUM(Churn)                                         AS Churned,
    ROUND(SUM(Churn) * 100.0 / COUNT(*), 2)            AS ChurnRatePct,
    ROUND(AVG(MonthlyCharges), 2)                      AS AvgMonthlyCharge
FROM customers
GROUP BY TenureBucket
ORDER BY MIN(Tenure);


-- ════════════════════════════════════════════
-- 4.  MONTHLY REVENUE AT RISK BY RISK SEGMENT
-- ════════════════════════════════════════════
SELECT
    cs.RiskSegment,
    COUNT(*)                                           AS Customers,
    ROUND(AVG(cs.ChurnProbability) * 100, 1)           AS AvgChurnProbPct,
    ROUND(AVG(c.MonthlyCharges), 2)                    AS AvgMonthlyCharge,
    ROUND(SUM(c.MonthlyCharges), 2)                    AS TotalMonthlyRevenue,
    ROUND(SUM(c.MonthlyCharges * cs.ChurnProbability),2) AS RevenueAtRisk
FROM churn_scores cs
JOIN customers c ON cs.CustomerID = c.CustomerID
GROUP BY cs.RiskSegment
ORDER BY RevenueAtRisk DESC;


-- ════════════════════════════════════════════
-- 5.  TOP 20 AT-RISK CUSTOMERS  (RETENTION PRIORITY)
-- ════════════════════════════════════════════
SELECT
    c.CustomerID,
    c.Tenure,
    c.MonthlyCharges,
    c.TotalCharges,
    c.Contract,
    c.SupportCalls,
    c.InternetService,
    cs.ChurnProbability,
    cs.RiskSegment,
    ROUND(c.MonthlyCharges * 12 * (1 - cs.ChurnProbability), 2) AS EstRetainableAnnualRevenue
FROM churn_scores cs
JOIN customers c ON cs.CustomerID = c.CustomerID
WHERE cs.RiskSegment = 'High Risk'
ORDER BY cs.ChurnProbability DESC
LIMIT 20;


-- ════════════════════════════════════════════
-- 6.  CHURN RATE BY INTERNET SERVICE × CONTRACT
-- ════════════════════════════════════════════
SELECT
    InternetService,
    Contract,
    COUNT(*)                                           AS Customers,
    ROUND(SUM(Churn) * 100.0 / COUNT(*), 2)            AS ChurnRatePct
FROM customers
GROUP BY InternetService, Contract
ORDER BY ChurnRatePct DESC;


-- ════════════════════════════════════════════
-- 7.  SUPPORT CALLS IMPACT ON CHURN
-- ════════════════════════════════════════════
SELECT
    SupportCalls,
    COUNT(*)                                           AS Customers,
    SUM(Churn)                                         AS Churned,
    ROUND(SUM(Churn) * 100.0 / COUNT(*), 2)            AS ChurnRatePct
FROM customers
GROUP BY SupportCalls
ORDER BY SupportCalls;


-- ════════════════════════════════════════════
-- 8.  MONTHLY REVENUE TREND BY CHARGE BUCKET
-- ════════════════════════════════════════════
SELECT
    CASE
        WHEN MonthlyCharges < 40  THEN 'Low ($0-40)'
        WHEN MonthlyCharges < 70  THEN 'Medium ($40-70)'
        WHEN MonthlyCharges < 100 THEN 'High ($70-100)'
        ELSE 'Premium ($100+)'
    END                                                AS ChargeBucket,
    COUNT(*)                                           AS Customers,
    ROUND(SUM(Churn) * 100.0 / COUNT(*), 2)            AS ChurnRatePct,
    ROUND(SUM(MonthlyCharges), 2)                      AS TotalMonthlyRevenue,
    ROUND(SUM(CASE WHEN Churn=1 THEN MonthlyCharges END), 2) AS LostMonthlyRevenue
FROM customers
GROUP BY ChargeBucket
ORDER BY MIN(MonthlyCharges);


-- ════════════════════════════════════════════
-- 9.  SENIOR CITIZEN CHURN COMPARISON
-- ════════════════════════════════════════════
SELECT
    CASE SeniorCitizen WHEN 1 THEN 'Senior' ELSE 'Non-Senior' END AS CustomerType,
    COUNT(*)                                           AS Customers,
    ROUND(SUM(Churn) * 100.0 / COUNT(*), 2)            AS ChurnRatePct,
    ROUND(AVG(MonthlyCharges), 2)                      AS AvgMonthlyCharge,
    ROUND(AVG(Tenure), 1)                              AS AvgTenure
FROM customers
GROUP BY SeniorCitizen;


-- ════════════════════════════════════════════
-- 10. RETENTION IMPROVEMENT IMPACT MODEL
--     Assumes 12% improvement in high-risk retention
-- ════════════════════════════════════════════
WITH high_risk AS (
    SELECT
        c.CustomerID,
        c.MonthlyCharges,
        cs.ChurnProbability
    FROM churn_scores cs
    JOIN customers c ON cs.CustomerID = c.CustomerID
    WHERE cs.RiskSegment = 'High Risk'
)
SELECT
    COUNT(*)                                           AS HighRiskCustomers,
    ROUND(COUNT(*) * 0.12)                             AS CustomersRetainedWith12PctImprovement,
    ROUND(AVG(MonthlyCharges), 2)                      AS AvgMonthlyCharge,
    ROUND(COUNT(*) * 0.12 * AVG(MonthlyCharges), 2)    AS EstMonthlySavings,
    ROUND(COUNT(*) * 0.12 * AVG(MonthlyCharges) * 12, 2) AS EstAnnualSavings
FROM high_risk;
