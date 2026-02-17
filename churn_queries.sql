-- ================================================================
-- Customer Churn Prediction & Retention Analysis
-- SQL Queries for Data Extraction
-- ================================================================


-- ─── 1. MAIN FEATURE TABLE ──────────────────────────────────────
-- Pull all features needed for the churn prediction model

SELECT
    c.customer_id,
    c.company_name,
    c.segment,
    c.monthly_revenue,
    c.contract_start_date,
    DATEDIFF(CURRENT_DATE, c.contract_start_date)    AS contract_age_days,
    DATEDIFF(CURRENT_DATE, a.last_login_date)         AS days_since_login,
    COALESCE(t.ticket_count, 0)                       AS support_tickets,
    COALESCE(f.features_used / f.features_available, 0) AS feature_adoption_rate,
    COALESCE(n.nps_score, 0)                          AS nps_score,
    COALESCE(p.payment_delays, 0)                     AS payment_delays,
    CASE WHEN c.churned_date IS NOT NULL THEN 1 ELSE 0 END AS churn_label

FROM customers c

LEFT JOIN activity_log a
    ON c.customer_id = a.customer_id
    AND a.log_date = (
        SELECT MAX(log_date) FROM activity_log
        WHERE customer_id = c.customer_id
    )

LEFT JOIN (
    SELECT customer_id, COUNT(*) AS ticket_count
    FROM support_tickets
    WHERE created_at >= DATEADD(month, -3, CURRENT_DATE)
    GROUP BY customer_id
) t ON c.customer_id = t.customer_id

LEFT JOIN (
    SELECT customer_id,
           COUNT(DISTINCT feature_id)   AS features_used,
           MAX(total_features)          AS features_available
    FROM feature_usage
    GROUP BY customer_id
) f ON c.customer_id = f.customer_id

LEFT JOIN nps_responses n
    ON c.customer_id = n.customer_id
    AND n.survey_date = (
        SELECT MAX(survey_date) FROM nps_responses
        WHERE customer_id = c.customer_id
    )

LEFT JOIN (
    SELECT customer_id, COUNT(*) AS payment_delays
    FROM payments
    WHERE days_overdue > 7
    AND payment_date >= DATEADD(month, -6, CURRENT_DATE)
    GROUP BY customer_id
) p ON c.customer_id = p.customer_id

WHERE c.created_at <= DATEADD(month, -1, CURRENT_DATE);


-- ─── 2. CHURN RATE BY SEGMENT ───────────────────────────────────

SELECT
    segment,
    COUNT(*)                                         AS total_customers,
    SUM(CASE WHEN churned_date IS NOT NULL THEN 1 ELSE 0 END) AS churned,
    ROUND(
        100.0 * SUM(CASE WHEN churned_date IS NOT NULL THEN 1 ELSE 0 END)
        / COUNT(*), 2
    )                                                AS churn_rate_pct,
    SUM(monthly_revenue)                             AS total_mrr,
    SUM(CASE WHEN churned_date IS NOT NULL THEN monthly_revenue ELSE 0 END) AS lost_mrr
FROM customers
GROUP BY segment
ORDER BY churn_rate_pct DESC;


-- ─── 3. COHORT RETENTION ANALYSIS ───────────────────────────────

WITH cohorts AS (
    SELECT
        customer_id,
        DATE_FORMAT(created_at, '%Y-%m')   AS cohort_month,
        created_at                          AS join_date
    FROM customers
),
activity AS (
    SELECT
        c.customer_id,
        c.cohort_month,
        PERIOD_DIFF(
            DATE_FORMAT(a.activity_date, '%Y%m'),
            DATE_FORMAT(c.join_date, '%Y%m')
        )                                   AS months_since_join
    FROM cohorts c
    JOIN customer_activity a ON c.customer_id = a.customer_id
    GROUP BY c.customer_id, c.cohort_month, months_since_join
)
SELECT
    cohort_month,
    months_since_join                        AS month_number,
    COUNT(DISTINCT customer_id)              AS active_customers,
    ROUND(100.0 * COUNT(DISTINCT customer_id)
        / FIRST_VALUE(COUNT(DISTINCT customer_id))
          OVER (PARTITION BY cohort_month ORDER BY months_since_join), 1
    )                                        AS retention_pct
FROM activity
GROUP BY cohort_month, months_since_join
ORDER BY cohort_month, months_since_join;


-- ─── 4. AT-RISK CUSTOMERS (POST-MODEL) ──────────────────────────
-- Run after scoring customers with the Python model
-- Assumes churn_scores table has been populated from model output

SELECT
    cs.customer_id,
    c.company_name,
    c.segment,
    c.monthly_revenue,
    cs.churn_score,
    CASE
        WHEN cs.churn_score >= 85 THEN 'Critical'
        WHEN cs.churn_score >= 70 THEN 'High'
        WHEN cs.churn_score >= 50 THEN 'Medium'
        ELSE 'Low'
    END                                              AS risk_level,
    DATEDIFF(CURRENT_DATE, a.last_login_date)        AS days_inactive,
    am.account_manager_name
FROM churn_scores cs
JOIN customers c       ON cs.customer_id = c.customer_id
JOIN activity_log a    ON cs.customer_id = a.customer_id
LEFT JOIN account_managers am ON c.account_manager_id = am.id
WHERE cs.churn_score >= 70
  AND cs.scored_at = CURRENT_DATE
ORDER BY cs.churn_score DESC, c.monthly_revenue DESC;


-- ─── 5. RETENTION TREND (MONTHLY) ───────────────────────────────

SELECT
    DATE_FORMAT(month_date, '%Y-%m')                 AS month,
    total_customers,
    churned_customers,
    total_customers - churned_customers               AS retained_customers,
    ROUND(100.0 * (total_customers - churned_customers)
        / total_customers, 2)                        AS retention_rate_pct
FROM (
    SELECT
        DATE_FORMAT(created_at, '%Y-%m-01')          AS month_date,
        COUNT(*)                                     AS total_customers,
        SUM(CASE
            WHEN churned_date IS NOT NULL
            AND DATE_FORMAT(churned_date, '%Y-%m') = DATE_FORMAT(created_at, '%Y-%m')
            THEN 1 ELSE 0
        END)                                         AS churned_customers
    FROM customers
    GROUP BY DATE_FORMAT(created_at, '%Y-%m-01')
) monthly
ORDER BY month_date;


-- ─── 6. REVENUE AT RISK ─────────────────────────────────────────

SELECT
    risk_level,
    COUNT(*)                                         AS customer_count,
    SUM(c.monthly_revenue)                           AS mrr_at_risk,
    SUM(c.monthly_revenue * 12)                      AS arr_at_risk,
    AVG(cs.churn_score)                              AS avg_churn_score
FROM churn_scores cs
JOIN customers c ON cs.customer_id = c.customer_id
CROSS JOIN (
    SELECT
        CASE
            WHEN churn_score >= 85 THEN 'Critical'
            WHEN churn_score >= 70 THEN 'High'
            WHEN churn_score >= 50 THEN 'Medium'
            ELSE 'Low'
        END AS risk_level
    FROM churn_scores
) r
WHERE cs.scored_at = CURRENT_DATE
GROUP BY risk_level
ORDER BY mrr_at_risk DESC;
