#!/usr/bin/env python3
"""
SubSentry Python Report Generator

Generates PDF reports for a user by querying the MySQL subscriptions table.
Outputs structured JSON so the Java backend can persist metadata.
"""

import argparse
import datetime
import json
import logging
import os
from collections import defaultdict
from pathlib import Path
from typing import Any, Dict, List, Optional

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt  # noqa: E402
import pandas as pd  # noqa: E402
from dateutil.relativedelta import relativedelta  # noqa: E402
from mysql.connector import connect, Error as MySQLError  # noqa: E402
from reportlab.lib import colors  # noqa: E402
from reportlab.lib.pagesizes import A4  # noqa: E402
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle  # noqa: E402
from reportlab.lib.units import inch  # noqa: E402
from reportlab.platypus import (  # noqa: E402
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    PageBreak,
    Image,
)
from reportlab.pdfgen import canvas  # noqa: E402

LOGGER = logging.getLogger("python-report-generator")
logging.basicConfig(level=logging.INFO, format="%(message)s")

DB_CONFIG: Dict[str, Any] = {}
OUTPUT_DIR: Path = Path("./python-reports")


# --- Database Connection ---------------------------------------------------- #

def get_db_connection():
    if not DB_CONFIG:
        raise RuntimeError("Database configuration not provided.")
    return connect(**DB_CONFIG)


# --- Helper Functions ------------------------------------------------------- #

def _json_default(value: Any):
    if isinstance(value, (datetime.datetime, datetime.date)):
        return value.isoformat()
    return str(value)


def _normalize_monthly_cost(row: pd.Series) -> float:
    cycle = row.get("billing_cycle", "monthly")
    amount = float(row.get("amount", 0))
    if cycle == "monthly":
        return amount
    if cycle in {"annual", "yearly"}:
        return amount / 12
    if cycle == "quarterly":
        return amount / 3
    if cycle == "semi-annual":
        return amount / 6
    if cycle == "weekly":
        return amount * (52 / 12)
    return amount


def _graph_path(user_id: str, slug: str) -> Path:
    timestamp = datetime.datetime.now().strftime("%Y%m%d%H%M%S%f")
    return OUTPUT_DIR / f"{user_id}_{slug}_{timestamp}.png"


def _serialize_table(table: Any) -> Any:
    if isinstance(table, pd.DataFrame):
        return table.to_dict(orient="records")
    return table


# --- Report Logic ----------------------------------------------------------- #

def _generate_monthly_summary(user_id: str, conn) -> Dict[str, Any]:
    LOGGER.info("Generating Monthly Summary for user %s", user_id)
    query = """
        SELECT * FROM subscriptions
        WHERE user_id = %s AND status = 'active'
    """
    df = pd.read_sql(query, conn, params=(user_id,))
    if df.empty:
        return {"kpis": {}, "graphs": [], "tables": {}}

    today = datetime.date.today()
    start_of_month = today.replace(day=1)
    end_of_month = (start_of_month + relativedelta(months=1)) - relativedelta(days=1)

    df["monthly_cost"] = df.apply(_normalize_monthly_cost, axis=1)
    df["next_renewal_date"] = pd.to_datetime(df["next_renewal_date"]).dt.date

    total_mrr = float(df["monthly_cost"].sum())
    active_subs = len(df)

    renewals_df = df[
        (df["next_renewal_date"] >= start_of_month)
        & (df["next_renewal_date"] <= end_of_month)
    ]
    upcoming_renewal_count = len(renewals_df)
    upcoming_renewal_amount = float(renewals_df["amount"].sum())

    kpis = {
        "total_mrr": total_mrr,
        "active_subscriptions": active_subs,
        "upcoming_renewal_count": upcoming_renewal_count,
        "upcoming_renewal_amount": upcoming_renewal_amount,
    }

    category_spend = df.groupby("category")["monthly_cost"].sum()
    graph_path = _graph_path(user_id, "monthly_pie")
    plt.figure(figsize=(10, 7))
    colors_list = plt.cm.Set3(range(len(category_spend)))
    category_spend.plot(
        kind="pie",
        autopct=lambda pct: f"${pct/100*category_spend.sum():,.0f}\n({pct:.1f}%)",
        startangle=90,
        colors=colors_list,
        textprops={"fontsize": 10, "fontweight": "bold"},
    )
    plt.title("Monthly Spend by Category", fontsize=14, fontweight="bold", pad=20)
    plt.ylabel("")
    plt.tight_layout()
    plt.savefig(graph_path, bbox_inches="tight", dpi=300, facecolor="white")
    plt.close()

    tables = {
        "upcoming_renewals": renewals_df.to_dict(orient="records"),
    }
    return {"kpis": kpis, "graphs": [str(graph_path)], "tables": tables}


def _generate_category_breakdown(user_id: str, conn) -> Dict[str, Any]:
    LOGGER.info("Generating Category Breakdown for user %s", user_id)
    query = """
        SELECT * FROM subscriptions
        WHERE user_id = %s AND status = 'active'
    """
    df = pd.read_sql(query, conn, params=(user_id,))
    if df.empty:
        return {"kpis": {}, "graphs": [], "tables": {}}

    df["monthly_cost"] = df.apply(_normalize_monthly_cost, axis=1)
    grouped_df = (
        df.groupby("category")
        .agg(
            total_monthly_spend=("monthly_cost", "sum"),
            subscription_count=("id", "count"),
        )
        .reset_index()
        .sort_values(by="total_monthly_spend", ascending=False)
    )

    top_category = grouped_df.iloc[0] if not grouped_df.empty else None
    kpis = {
        "top_category_name": top_category["category"] if top_category is not None else "N/A",
        "top_category_spend": float(top_category["total_monthly_spend"]) if top_category is not None else 0,
    }

    graph_path = _graph_path(user_id, "category_bar")
    plt.figure(figsize=(12, 7))
    ax = grouped_df.plot(
        kind="bar",
        x="category",
        y="total_monthly_spend",
        legend=False,
        color="#1e40af",
        edgecolor="black",
        linewidth=1.5,
    )
    plt.title("Total Monthly Spend by Category", fontsize=14, fontweight="bold", pad=20)
    plt.xlabel("Category", fontsize=12, fontweight="bold")
    plt.ylabel("Monthly Spend ($)", fontsize=12, fontweight="bold")
    plt.xticks(rotation=45, ha="right")
    plt.grid(axis="y", alpha=0.3, linestyle="--")
    
    # Add value labels on bars
    for i, v in enumerate(grouped_df["total_monthly_spend"]):
        ax.text(i, v, f"${v:,.0f}", ha="center", va="bottom", fontweight="bold", fontsize=9)
    
    plt.tight_layout()
    plt.savefig(graph_path, bbox_inches="tight", dpi=300, facecolor="white")
    plt.close()

    tables = {"category_summary": grouped_df.to_dict(orient="records")}
    return {"kpis": kpis, "graphs": [str(graph_path)], "tables": tables}


def _generate_annual_projection(user_id: str, conn) -> Dict[str, Any]:
    LOGGER.info("Generating Annual Projection for user %s", user_id)
    query = """
        SELECT name, amount, billing_cycle, next_renewal_date
        FROM subscriptions
        WHERE user_id = %s AND status = 'active'
    """
    df = pd.read_sql(query, conn, params=(user_id,))
    if df.empty:
        return {"kpis": {}, "graphs": [], "tables": {}}

    df["next_renewal_date"] = pd.to_datetime(df["next_renewal_date"]).dt.date

    today = datetime.date.today()
    projection_end = today + relativedelta(years=1)
    monthly_projection: Dict[str, float] = defaultdict(float)

    for _, sub in df.iterrows():
        current_renewal = sub["next_renewal_date"]
        amount = float(sub["amount"])
        cycle = sub["billing_cycle"]

        if cycle == "monthly":
            delta = relativedelta(months=1)
        elif cycle in {"annual", "yearly"}:
            delta = relativedelta(years=1)
        elif cycle == "quarterly":
            delta = relativedelta(months=3)
        elif cycle == "semi-annual":
            delta = relativedelta(months=6)
        elif cycle == "weekly":
            delta = relativedelta(weeks=1)
        else:
            continue

        while current_renewal < projection_end:
            if current_renewal >= today:
                key = current_renewal.strftime("%Y-%m")
                monthly_projection[key] += amount
            current_renewal += delta

    if not monthly_projection:
        return {"kpis": {"total_projected_spend": 0}, "graphs": [], "tables": {}}

    sorted_months = sorted(monthly_projection)
    projection_df = pd.DataFrame(
        {
            "Month": sorted_months,
            "ProjectedSpend": [monthly_projection[m] for m in sorted_months],
        }
    )

    total_projected_spend = float(projection_df["ProjectedSpend"].sum())
    most_expensive_row = projection_df.loc[projection_df["ProjectedSpend"].idxmax()]
    kpis = {
        "total_projected_spend": total_projected_spend,
        "most_expensive_month": most_expensive_row["Month"],
        "most_expensive_month_amount": float(most_expensive_row["ProjectedSpend"]),
    }

    graph_path = _graph_path(user_id, "projection_bar")
    plt.figure(figsize=(14, 7))
    ax = projection_df.plot(
        kind="bar",
        x="Month",
        y="ProjectedSpend",
        legend=False,
        color="#10b981",
        edgecolor="black",
        linewidth=1.5,
    )
    plt.title("Projected Subscription Costs (Next 12 Months)", fontsize=14, fontweight="bold", pad=20)
    plt.xlabel("Month", fontsize=12, fontweight="bold")
    plt.ylabel("Projected Cost ($)", fontsize=12, fontweight="bold")
    plt.xticks(rotation=45, ha="right")
    plt.grid(axis="y", alpha=0.3, linestyle="--")
    
    # Add value labels on bars
    for i, v in enumerate(projection_df["ProjectedSpend"]):
        ax.text(i, v, f"${v:,.0f}", ha="center", va="bottom", fontweight="bold", fontsize=8, rotation=90)
    
    plt.tight_layout()
    plt.savefig(graph_path, bbox_inches="tight", dpi=300, facecolor="white")
    plt.close()

    tables = {"projection_data": projection_df.to_dict(orient="records")}
    return {"kpis": kpis, "graphs": [str(graph_path)], "tables": tables}


# --- PDF Builder ------------------------------------------------------------ #

def _format_currency(value: Any) -> str:
    """Format a value as currency."""
    try:
        num = float(value)
        return f"${num:,.2f}"
    except (ValueError, TypeError):
        return str(value)


def _format_number(value: Any) -> str:
    """Format a number with commas."""
    try:
        num = float(value)
        return f"{num:,.0f}" if num == int(num) else f"{num:,.2f}"
    except (ValueError, TypeError):
        return str(value)


def _create_header_footer(canvas_obj, doc):
    """Add header and footer to each page."""
    canvas_obj.saveState()
    
    # Header
    canvas_obj.setFont("Helvetica-Bold", 10)
    canvas_obj.setFillColor(colors.HexColor("#1e40af"))
    canvas_obj.drawString(72, A4[1] - 50, "SubSentry Subscription Report")
    
    # Footer
    canvas_obj.setFont("Helvetica", 8)
    canvas_obj.setFillColor(colors.grey)
    page_num = canvas_obj.getPageNumber()
    canvas_obj.drawString(72, 30, f"Page {page_num}")
    canvas_obj.drawRightString(A4[0] - 72, 30, datetime.datetime.now().strftime("%B %d, %Y"))
    
    canvas_obj.restoreState()


def _build_pdf_report(report_id: str, report_type: str, report_data: Dict[str, Any]) -> str:
    """Build a professional PDF report with structured sections."""
    LOGGER.info("Building PDF for report %s", report_id)
    pdf_path = OUTPUT_DIR / f"{report_id}.pdf"
    
    # Create document with custom page template
    doc = SimpleDocTemplate(
        str(pdf_path),
        pagesize=A4,
        rightMargin=72,
        leftMargin=72,
        topMargin=72,
        bottomMargin=72,
    )
    
    # Get styles
    styles = getSampleStyleSheet()
    
    # Custom styles
    title_style = ParagraphStyle(
        "CustomTitle",
        parent=styles["Heading1"],
        fontSize=24,
        textColor=colors.HexColor("#1e40af"),
        spaceAfter=30,
        alignment=1,  # Center
    )
    
    heading_style = ParagraphStyle(
        "CustomHeading",
        parent=styles["Heading2"],
        fontSize=16,
        textColor=colors.HexColor("#1e40af"),
        spaceAfter=12,
        spaceBefore=20,
    )
    
    subheading_style = ParagraphStyle(
        "CustomSubHeading",
        parent=styles["Heading3"],
        fontSize=14,
        textColor=colors.HexColor("#374151"),
        spaceAfter=10,
        spaceBefore=15,
    )
    
    # Build story (content)
    story = []
    
    # Cover page
    report_title = report_type.replace("_", " ").title()
    story.append(Paragraph("SubSentry", title_style))
    story.append(Spacer(1, 0.3 * inch))
    story.append(Paragraph(report_title, title_style))
    story.append(Spacer(1, 0.2 * inch))
    story.append(Paragraph(
        f"Generated on {datetime.datetime.now().strftime('%B %d, %Y at %I:%M %p')}",
        styles["Normal"]
    ))
    story.append(PageBreak())
    
    # Executive Summary
    story.append(Paragraph("Executive Summary", heading_style))
    kpis = report_data.get("kpis", {})
    
    if report_type == "monthly_summary":
        total_mrr = kpis.get("total_mrr", 0)
        active_subs = kpis.get("active_subscriptions", 0)
        renewals = kpis.get("upcoming_renewal_count", 0)
        renewal_amount = kpis.get("upcoming_renewal_amount", 0)
        
        summary_text = (
            f"This monthly summary report provides a comprehensive overview of your subscription portfolio. "
            f"You currently maintain <b>{active_subs}</b> active subscriptions with a total monthly recurring revenue (MRR) "
            f"of <b>{_format_currency(total_mrr)}</b>. "
        )
        if renewals > 0:
            summary_text += (
                f"Within the current month, <b>{renewals}</b> subscription(s) are scheduled for renewal, "
                f"representing <b>{_format_currency(renewal_amount)}</b> in upcoming charges. "
            )
        summary_text += (
            "The following sections provide detailed insights into your spending patterns, "
            "category distribution, and upcoming renewal schedule."
        )
        
    elif report_type == "category_breakdown":
        top_cat = kpis.get("top_category_name", "N/A")
        top_spend = kpis.get("top_category_spend", 0)
        
        summary_text = (
            f"This category breakdown analysis reveals your subscription spending distribution across different service categories. "
            f"Your highest spending category is <b>{top_cat}</b> with a monthly expenditure of <b>{_format_currency(top_spend)}</b>. "
            "Understanding your category distribution helps identify areas for potential optimization and cost management."
        )
        
    elif report_type == "annual_projection":
        total_projected = kpis.get("total_projected_spend", 0)
        expensive_month = kpis.get("most_expensive_month", "N/A")
        expensive_amount = kpis.get("most_expensive_month_amount", 0)
        
        summary_text = (
            f"This annual projection forecasts your subscription costs over the next 12 months. "
            f"Based on your current active subscriptions, you are projected to spend approximately "
            f"<b>{_format_currency(total_projected)}</b> over the next year. "
            f"The month with the highest projected spend is <b>{expensive_month}</b> at <b>{_format_currency(expensive_amount)}</b>. "
            "This projection helps with budget planning and financial forecasting."
        )
    else:
        summary_text = "This report provides detailed insights into your subscription portfolio."
    
    story.append(Paragraph(summary_text, styles["Normal"]))
    story.append(Spacer(1, 0.3 * inch))
    
    # Key Metrics Section
    story.append(Paragraph("Key Metrics", heading_style))
    
    # Create KPI table
    kpi_data = [["Metric", "Value"]]
    for key, value in kpis.items():
        label = key.replace("_", " ").title()
        if isinstance(value, (int, float)):
            # Check if this should be formatted as currency
            if any(term in key.lower() for term in ["amount", "spend", "mrr", "cost", "price"]):
                formatted_value = _format_currency(value)
            else:
                formatted_value = _format_number(value)
        else:
            formatted_value = str(value)
        kpi_data.append([label, formatted_value])
    
    kpi_table = Table(kpi_data, colWidths=[4 * inch, 2.5 * inch])
    kpi_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#1e40af")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.whitesmoke),
        ("ALIGN", (0, 0), (-1, -1), "LEFT"),
        ("ALIGN", (1, 0), (1, -1), "RIGHT"),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, 0), 12),
        ("BOTTOMPADDING", (0, 0), (-1, 0), 12),
        ("BACKGROUND", (0, 1), (-1, -1), colors.beige),
        ("GRID", (0, 0), (-1, -1), 1, colors.grey),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#f3f4f6")]),
    ]))
    story.append(kpi_table)
    story.append(Spacer(1, 0.3 * inch))
    
    # Charts Section
    graphs = report_data.get("graphs", [])
    if graphs:
        story.append(Paragraph("Visual Analysis", heading_style))
        
        for i, graph_file in enumerate(graphs, 1):
            if not os.path.exists(graph_file):
                continue
            
            # Chart caption based on report type
            if report_type == "monthly_summary":
                caption = "Monthly Spending Distribution by Category"
            elif report_type == "category_breakdown":
                caption = "Total Monthly Spend by Category"
            elif report_type == "annual_projection":
                caption = "Projected Subscription Costs (Next 12 Months)"
            else:
                caption = f"Chart {i}"
            
            story.append(Paragraph(caption, subheading_style))
            
            # Add image
            img = Image(graph_file, width=6 * inch, height=4.5 * inch)
            story.append(img)
            story.append(Spacer(1, 0.2 * inch))
    
    # Detailed Tables Section
    tables = report_data.get("tables", {})
    if tables:
        story.append(PageBreak())
        story.append(Paragraph("Detailed Data", heading_style))
        
        for table_name, table_data in tables.items():
            if not table_data:
                continue
            
            # Convert to DataFrame if it's a list of dicts
            if isinstance(table_data, list) and table_data:
                df = pd.DataFrame(table_data)
            elif isinstance(table_data, pd.DataFrame):
                df = table_data
            else:
                continue
            
            # Format table name
            section_title = table_name.replace("_", " ").title()
            story.append(Paragraph(section_title, subheading_style))
            
            # Prepare table data
            table_rows = [df.columns.tolist()]
            for _, row in df.iterrows():
                formatted_row = []
                for val in row:
                    if isinstance(val, (int, float)):
                        if "amount" in str(val).lower() or "spend" in str(val).lower() or "cost" in str(val).lower():
                            formatted_row.append(_format_currency(val))
                        else:
                            formatted_row.append(_format_number(val))
                    elif isinstance(val, (datetime.date, datetime.datetime)):
                        formatted_row.append(val.strftime("%Y-%m-%d"))
                    else:
                        formatted_row.append(str(val))
                table_rows.append(formatted_row)
            
            # Create table
            data_table = Table(table_rows, repeatRows=1)
            data_table.setStyle(TableStyle([
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#1e40af")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.whitesmoke),
                ("ALIGN", (0, 0), (-1, -1), "LEFT"),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("FONTSIZE", (0, 0), (-1, 0), 10),
                ("BOTTOMPADDING", (0, 0), (-1, 0), 12),
                ("BACKGROUND", (0, 1), (-1, -1), colors.white),
                ("GRID", (0, 0), (-1, -1), 1, colors.grey),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#f9fafb")]),
                ("FONTSIZE", (0, 1), (-1, -1), 9),
            ]))
            story.append(data_table)
            story.append(Spacer(1, 0.3 * inch))
    
    # Build PDF
    doc.build(story, onFirstPage=_create_header_footer, onLaterPages=_create_header_footer)
    return str(pdf_path)


# --- Controller ------------------------------------------------------------- #

REPORT_FUNCTIONS = {
    "monthly_summary": _generate_monthly_summary,
    "category_breakdown": _generate_category_breakdown,
    "annual_projection": _generate_annual_projection,
}


def generate_report(report_id: str, user_id: str, report_type: str) -> Dict[str, Any]:
    if report_type not in REPORT_FUNCTIONS:
        raise ValueError(f"Unknown report type: {report_type}")

    report_data: Optional[Dict[str, Any]] = None
    pdf_file: Optional[str] = None
    conn = None
    try:
        conn = get_db_connection()
        report_function = REPORT_FUNCTIONS[report_type]
        report_data = report_function(user_id, conn)

        if not report_data or not report_data.get("kpis"):
            return {"status": "no_data", "report_type": report_type}

        pdf_file = _build_pdf_report(report_id, report_type, report_data)
        result_payload = {
            "status": "success",
            "filename": pdf_file,
            "report_type": report_type,
            "data": {
                "kpis": report_data.get("kpis", {}),
                "graphs": report_data.get("graphs", []),
                "tables": {k: _serialize_table(v) for k, v in report_data.get("tables", {}).items()},
            },
        }
        LOGGER.info("Successfully generated %s", pdf_file)
        return result_payload

    except Exception as exc:  # pylint: disable=broad-except
        LOGGER.error("Error generating report %s: %s", report_id, exc)
        return {"status": "error", "message": str(exc), "report_type": report_type}

    finally:
        if conn:
            conn.close()
        if report_data:
            for graph_file in report_data.get("graphs", []):
                try:
                    if os.path.exists(graph_file):
                        os.remove(graph_file)
                        LOGGER.info("Removed temporary graph %s", graph_file)
                except OSError:
                    LOGGER.warning("Unable to delete temp graph %s", graph_file)


# --- CLI -------------------------------------------------------------------- #

def parse_args():
    parser = argparse.ArgumentParser(description="SubSentry Python Report Generator")
    parser.add_argument("--report-id", required=True)
    parser.add_argument("--user-id", required=True)
    parser.add_argument("--report-type", required=True)
    parser.add_argument("--db-host", required=True)
    parser.add_argument("--db-port", type=int, default=3306)
    parser.add_argument("--db-name", required=True)
    parser.add_argument("--db-user", required=True)
    parser.add_argument("--db-password", default="")
    parser.add_argument("--output-dir", default="./python-reports")
    return parser.parse_args()


def main():
    global OUTPUT_DIR  # noqa: PLW0603
    args = parse_args()

    OUTPUT_DIR = Path(args.output_dir).resolve()
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    DB_CONFIG.update(
        {
            "host": args.db_host,
            "port": args.db_port,
            "database": args.db_name,
            "user": args.db_user,
            "password": args.db_password,
        }
    )

    result = generate_report(args.report_id, args.user_id, args.report_type)
    print(json.dumps(result, default=_json_default))


if __name__ == "__main__":
    try:
        main()
    except MySQLError as db_err:
        error_payload = {"status": "error", "message": f"Database error: {db_err}"}
        print(json.dumps(error_payload))
    except Exception as err:  # pylint: disable=broad-except
        error_payload = {"status": "error", "message": str(err)}
        print(json.dumps(error_payload))

