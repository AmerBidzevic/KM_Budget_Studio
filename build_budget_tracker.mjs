import fs from "node:fs/promises";
import path from "node:path";
import { SpreadsheetFile, Workbook } from "@oai/artifact-tool";

const outDir = path.resolve("outputs", "budget_tracker");
await fs.mkdir(outDir, { recursive: true });

const workbook = Workbook.create();
const dashboard = workbook.worksheets.add("Dashboard");
const tx = workbook.worksheets.add("Transactions");
const budget = workbook.worksheets.add("Monthly Budget");
const categories = workbook.worksheets.add("Categories");

const colors = {
  navy: "#16324F",
  teal: "#1F7A8C",
  green: "#2E7D32",
  amber: "#B7791F",
  red: "#B42318",
  blueSoft: "#EAF3F8",
  tealSoft: "#E6F4F1",
  greenSoft: "#EAF6EA",
  amberSoft: "#FFF4DB",
  redSoft: "#FDEDEC",
  graySoft: "#F5F7FA",
  border: "#CBD5E1",
  text: "#1F2937",
  white: "#FFFFFF",
};

const incomeCategories = [
  ["Income", "Salary", 4000, "Primary paycheck"],
  ["Income", "Side Income", 300, "Freelance, gigs, resale"],
  ["Income", "Refunds/Reimbursements", 100, "Repayments, returns"],
  ["Income", "Other Income", 0, "Interest, gifts, misc."],
];

const expenseCategories = [
  ["Expense", "Rent/Mortgage", 1400, "Housing payment"],
  ["Expense", "Utilities", 220, "Electric, water, gas"],
  ["Expense", "Groceries", 550, "Food at home"],
  ["Expense", "Dining Out", 250, "Restaurants and cafes"],
  ["Expense", "Transportation", 300, "Fuel, transit, rideshare"],
  ["Expense", "Insurance", 180, "Auto, renters, health"],
  ["Expense", "Phone/Internet", 140, "Connectivity"],
  ["Expense", "Subscriptions", 80, "Streaming, software, memberships"],
  ["Expense", "Debt Payments", 250, "Cards, loans, installments"],
  ["Expense", "Savings/Investing", 500, "Savings or brokerage transfers"],
  ["Expense", "Health", 120, "Medical, pharmacy, fitness"],
  ["Expense", "Personal Care", 100, "Haircuts, toiletries"],
  ["Expense", "Shopping", 250, "Clothing, household goods"],
  ["Expense", "Entertainment", 150, "Events, games, hobbies"],
  ["Expense", "Travel", 150, "Trips, hotels, flights"],
  ["Expense", "Gifts/Donations", 100, "Giving and occasions"],
  ["Expense", "Pets", 75, "Food, vet, supplies"],
  ["Expense", "Education", 50, "Courses, books, tuition"],
  ["Expense", "Miscellaneous", 150, "Anything uncategorized"],
  ["Expense", "Buffer", 200, "Unplanned spending cushion"],
];

const allBudgetRows = [...incomeCategories, ...expenseCategories];
const startOfCurrentMonth = new Date(2026, 4, 1);

for (const sheet of [dashboard, tx, budget, categories]) {
  sheet.showGridLines = false;
}

function title(sheet, range, text) {
  const r = sheet.getRange(range);
  r.merge();
  r.values = [[text]];
  r.format = {
    fill: colors.navy,
    font: { bold: true, color: colors.white, size: 18 },
  };
}

function header(range) {
  range.format = {
    fill: colors.teal,
    font: { bold: true, color: colors.white },
  };
}

function panel(range, fill = colors.graySoft) {
  range.format = {
    fill,
  };
}

// Categories helper sheet.
title(categories, "A1:D1", "Budget Categories and Dropdown Lists");
categories.getRange("A3:D3").values = [["Type", "Category", "Default Monthly Budget", "Notes"]];
header(categories.getRange("A3:D3"));
categories.getRange(`A4:D${3 + allBudgetRows.length}`).values = allBudgetRows;
categories.getRange(`C4:C${3 + allBudgetRows.length}`).format.numberFormat = "$#,##0";
categories.getRange(`A4:D${3 + allBudgetRows.length}`).format = {
  fill: colors.white,
};
categories.getRange("F3:F5").values = [["Type List"], ["Expense"], ["Income"]];
header(categories.getRange("F3:F3"));
categories.getRange("H3:H9").values = [["Payment Method"], ["Credit Card"], ["Debit Card"], ["Cash"], ["Bank Transfer"], ["Check"], ["PayPal/Venmo"]];
header(categories.getRange("H3:H3"));
categories.getRange("J3:J5").values = [["Cleared"], ["Yes"], ["No"]];
header(categories.getRange("J3:J3"));
categories.getRange("A:A").format.columnWidthPx = 110;
categories.getRange("B:B").format.columnWidthPx = 180;
categories.getRange("C:C").format.columnWidthPx = 145;
categories.getRange("D:D").format.columnWidthPx = 260;
categories.getRange("F:F").format.columnWidthPx = 120;
categories.getRange("H:H").format.columnWidthPx = 150;
categories.getRange("J:J").format.columnWidthPx = 100;
categories.freezePanes.freezeRows(3);
categories.tables.add(`A3:D${3 + allBudgetRows.length}`, true, "CategoriesTable");

// Monthly budget sheet.
title(budget, "A1:D1", "Monthly Budget Planner");
budget.getRange("A3:D3").values = [["Planned Income", "Planned Spending", "Planned Leftover", "Notes"]];
header(budget.getRange("A3:D3"));
budget.getRange("A4").formulas = [[`=SUMIF($A$7:$A$${6 + allBudgetRows.length},"Income",$C$7:$C$${6 + allBudgetRows.length})`]];
budget.getRange("B4").formulas = [[`=SUMIF($A$7:$A$${6 + allBudgetRows.length},"Expense",$C$7:$C$${6 + allBudgetRows.length})`]];
budget.getRange("C4").formulas = [["=A4-B4"]];
budget.getRange("D4").values = [["Edit category names or planned amounts below."]];
budget.getRange("A4:C4").format = {
  fill: colors.blueSoft,
  font: { bold: true, color: colors.text },
};
budget.getRange("A4:C4").format.numberFormat = "$#,##0";
budget.getRange("A6:D6").values = [["Type", "Category", "Planned Monthly Amount", "Notes"]];
header(budget.getRange("A6:D6"));
budget.getRange(`A7:D${6 + allBudgetRows.length}`).values = allBudgetRows;
budget.getRange(`C7:C${6 + allBudgetRows.length}`).format.numberFormat = "$#,##0";
budget.getRange(`A7:D${6 + allBudgetRows.length}`).format = {
  fill: colors.white,
};
budget.getRange(`A7:A${6 + allBudgetRows.length}`).dataValidation = {
  rule: { type: "list", formula1: "Categories!$F$4:$F$5" },
};
budget.tables.add(`A6:D${6 + allBudgetRows.length}`, true, "BudgetTable");
budget.getRange("A:A").format.columnWidthPx = 105;
budget.getRange("B:B").format.columnWidthPx = 185;
budget.getRange("C:C").format.columnWidthPx = 160;
budget.getRange("D:D").format.columnWidthPx = 270;
budget.freezePanes.freezeRows(6);

// Transactions sheet.
title(tx, "A1:J1", "Transactions Log");
tx.getRange("A3:J3").values = [[
  "Date",
  "Type",
  "Category",
  "Description",
  "Payment Method",
  "Account",
  "Amount",
  "Month",
  "Notes",
  "Cleared",
]];
header(tx.getRange("A3:J3"));
const txRows = 500;
tx.getRange(`A4:J${3 + txRows}`).format = {
  fill: colors.white,
};
tx.getRange(`H4`).formulas = [["=IF(A4=\"\",\"\",DATE(YEAR(A4),MONTH(A4),1))"]];
tx.getRange(`H4:H${3 + txRows}`).fillDown();
tx.getRange(`A4:A${3 + txRows}`).format.numberFormat = "yyyy-mm-dd";
tx.getRange(`G4:G${3 + txRows}`).format.numberFormat = "$#,##0.00";
tx.getRange(`H4:H${3 + txRows}`).format.numberFormat = "mmm yyyy";
tx.getRange(`B4:B${3 + txRows}`).dataValidation = {
  rule: { type: "list", formula1: "Categories!$F$4:$F$5" },
};
tx.getRange(`C4:C${3 + txRows}`).dataValidation = {
  rule: { type: "list", formula1: "Categories!$B$4:$B$27" },
};
tx.getRange(`E4:E${3 + txRows}`).dataValidation = {
  rule: { type: "list", formula1: "Categories!$H$4:$H$10" },
};
tx.getRange(`J4:J${3 + txRows}`).dataValidation = {
  rule: { type: "list", formula1: "Categories!$J$4:$J$5" },
};
tx.getRange("A:A").format.columnWidthPx = 105;
tx.getRange("B:B").format.columnWidthPx = 95;
tx.getRange("C:C").format.columnWidthPx = 170;
tx.getRange("D:D").format.columnWidthPx = 230;
tx.getRange("E:E").format.columnWidthPx = 135;
tx.getRange("F:F").format.columnWidthPx = 130;
tx.getRange("G:G").format.columnWidthPx = 105;
tx.getRange("H:H").format.columnWidthPx = 100;
tx.getRange("I:I").format.columnWidthPx = 220;
tx.getRange("J:J").format.columnWidthPx = 90;
tx.freezePanes.freezeRows(3);
tx.tables.add(`A3:J${3 + txRows}`, true, "TransactionsTable");

// Dashboard.
title(dashboard, "A1:P1", "Budget and Spending Dashboard");
dashboard.getRange("A3:B3").values = [["Selected Month", startOfCurrentMonth]];
dashboard.getRange("A3").format = {
  fill: colors.blueSoft,
  font: { bold: true, color: colors.text },
};
dashboard.getRange("B3").format = {
  fill: colors.white,
  font: { bold: true, color: colors.text },
};
dashboard.getRange("B3").format.numberFormat = "mmmm yyyy";

dashboard.getRange("A5:G5").values = [[
  "Income",
  "Spending",
  "Net Cash Flow",
  "Budgeted Spending",
  "Budget Remaining",
  "Savings Rate",
  "Over Budget Categories",
]];
header(dashboard.getRange("A5:G5"));
dashboard.getRange("A6").formulas = [["=SUMIFS(Transactions!$G$4:$G$503,Transactions!$B$4:$B$503,\"Income\",Transactions!$H$4:$H$503,$B$3)"]];
dashboard.getRange("B6").formulas = [["=SUMIFS(Transactions!$G$4:$G$503,Transactions!$B$4:$B$503,\"Expense\",Transactions!$H$4:$H$503,$B$3)"]];
dashboard.getRange("C6").formulas = [["=A6-B6"]];
dashboard.getRange("D6").formulas = [[`=SUMIF('Monthly Budget'!$A$7:$A$${6 + allBudgetRows.length},"Expense",'Monthly Budget'!$C$7:$C$${6 + allBudgetRows.length})`]];
dashboard.getRange("E6").formulas = [["=D6-B6"]];
dashboard.getRange("F6").formulas = [["=IF(A6=0,0,C6/A6)"]];
dashboard.getRange("G6").formulas = [["=COUNTIF(F13:F32,\"Over budget\")"]];
dashboard.getRange("A6:E6").format.numberFormat = "$#,##0";
dashboard.getRange("F6").format.numberFormat = "0.0%";
dashboard.getRange("G6").format.numberFormat = "0";
dashboard.getRange("A6:G6").format = {
  fill: colors.graySoft,
  font: { bold: true, size: 13, color: colors.text },
};

dashboard.getRange("A9:F9").values = [["Category", "Budget", "Actual", "Remaining", "% Used", "Status"]];
header(dashboard.getRange("A9:F9"));
for (let i = 0; i < expenseCategories.length; i++) {
  const row = 10 + i;
  const budgetRow = 11 + i;
  dashboard.getRange(`A${row}`).formulas = [[`='Monthly Budget'!B${budgetRow}`]];
  dashboard.getRange(`B${row}`).formulas = [[`='Monthly Budget'!C${budgetRow}`]];
  dashboard.getRange(`C${row}`).formulas = [[`=IF($A${row}="","",SUMIFS(Transactions!$G$4:$G$503,Transactions!$B$4:$B$503,"Expense",Transactions!$C$4:$C$503,$A${row},Transactions!$H$4:$H$503,$B$3))`]];
  dashboard.getRange(`D${row}`).formulas = [[`=IF($A${row}="","",$B${row}-$C${row})`]];
  dashboard.getRange(`E${row}`).formulas = [[`=IF($B${row}=0,"",$C${row}/$B${row})`]];
  dashboard.getRange(`F${row}`).formulas = [[`=IF($A${row}="","",IF($C${row}=0,"No spend yet",IF($E${row}>1,"Over budget",IF($E${row}>0.85,"Watch","On track"))))`]];
}
dashboard.getRange("A10:F32").format = {
  fill: colors.white,
};
dashboard.getRange("B10:D32").format.numberFormat = "$#,##0";
dashboard.getRange("E10:E32").format.numberFormat = "0%";

dashboard.getRange("A35:D35").values = [["Month", "Income", "Spending", "Net"]];
header(dashboard.getRange("A35:D35"));
dashboard.getRange("A36").formulas = [["=EDATE($B$3,-11)"]];
dashboard.getRange("A37").formulas = [["=EDATE(A36,1)"]];
dashboard.getRange("A37:A47").fillDown();
for (let row = 36; row <= 47; row++) {
  dashboard.getRange(`B${row}`).formulas = [[`=SUMIFS(Transactions!$G$4:$G$503,Transactions!$B$4:$B$503,"Income",Transactions!$H$4:$H$503,$A${row})`]];
  dashboard.getRange(`C${row}`).formulas = [[`=SUMIFS(Transactions!$G$4:$G$503,Transactions!$B$4:$B$503,"Expense",Transactions!$H$4:$H$503,$A${row})`]];
  dashboard.getRange(`D${row}`).formulas = [[`=B${row}-C${row}`]];
}
dashboard.getRange("A36:A47").format.numberFormat = "mmm yyyy";
dashboard.getRange("B36:D47").format.numberFormat = "$#,##0";
dashboard.getRange("A36:D47").format = {
  fill: colors.white,
};

dashboard.getRange("A:A").format.columnWidthPx = 165;
for (const col of ["B", "C", "D", "E", "F", "G"]) {
  dashboard.getRange(`${col}:${col}`).format.columnWidthPx = 115;
}
for (const col of ["H", "I", "J", "K", "L", "M", "N", "O", "P"]) {
  dashboard.getRange(`${col}:${col}`).format.columnWidthPx = 90;
}
dashboard.freezePanes.freezeRows(5);

for (const sheet of [dashboard, tx, budget, categories]) {
  const used = sheet.getUsedRange();
  used.format.font = { name: "Aptos", color: colors.text };
}

// Reapply title/header formatting after workbook-level font pass.
title(dashboard, "A1:P1", "Budget and Spending Dashboard");
title(tx, "A1:J1", "Transactions Log");
title(budget, "A1:D1", "Monthly Budget Planner");
title(categories, "A1:D1", "Budget Categories and Dropdown Lists");
header(dashboard.getRange("A5:G5"));
header(dashboard.getRange("A9:F9"));
header(dashboard.getRange("A35:D35"));
header(tx.getRange("A3:J3"));
header(budget.getRange("A3:D3"));
header(budget.getRange("A6:D6"));
header(categories.getRange("A3:D3"));
header(categories.getRange("F3:F3"));
header(categories.getRange("H3:H3"));
header(categories.getRange("J3:J3"));

const dashboardInspect = await workbook.inspect({
  kind: "table",
  range: "Dashboard!A1:G18",
  include: "values,formulas",
  tableMaxRows: 18,
  tableMaxCols: 8,
  maxChars: 4000,
});
console.log(dashboardInspect.ndjson);

const errors = await workbook.inspect({
  kind: "match",
  searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A",
  options: { useRegex: true, maxResults: 300 },
  summary: "final formula error scan",
  maxChars: 3000,
});
console.log(errors.ndjson);

for (const sheetName of ["Dashboard", "Transactions", "Monthly Budget", "Categories"]) {
  const preview = await workbook.render({
    sheetName,
    autoCrop: "all",
    scale: 1,
    format: "png",
  });
  await fs.writeFile(
    path.join(outDir, `${sheetName.replace(/\s+/g, "_").toLowerCase()}_preview.png`),
    new Uint8Array(await preview.arrayBuffer()),
  );
}

const output = await SpreadsheetFile.exportXlsx(workbook);
await output.save(path.join(outDir, "budget_spending_tracker.xlsx"));
console.log(path.join(outDir, "budget_spending_tracker.xlsx"));
