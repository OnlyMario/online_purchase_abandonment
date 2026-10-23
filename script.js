// SHOPPING SOLVERS - REAL UCI DATASET
// Loads the prepared session data from data/analytics.json.

const $ = id => document.getElementById(id);

const visitorFilter = $("visitor");
const dayFilter = $("device");
const searchInput = $("search");

let shopperData = [];
let analyticsSummary = null;

function filteredData() {
  return shopperData.filter(row => {
    const visitorMatch =
      visitorFilter.value === "all" ||
      row.visitor === visitorFilter.value;

    const dayMatch =
      dayFilter.value === "all" ||
      (dayFilter.value === "weekend" && row.weekend) ||
      (dayFilter.value === "weekday" && !row.weekend);

    return visitorMatch && dayMatch;
  });
}

function averagePages(rows) {
  if (rows.length === 0) return 0;
  return rows.reduce((sum, row) => sum + row.productPages, 0) / rows.length;
}

function updateDashboard() {
  const rows = filteredData();
  const total = rows.length;
  const purchased = rows.filter(row => row.purchased);
  const noPurchase = rows.filter(row => !row.purchased);
  const completionRate = total ? purchased.length / total * 100 : 0;
  const noPurchaseRate = total ? noPurchase.length / total * 100 : 0;

  $("sessions").textContent = total.toLocaleString();
  $("completed").textContent = completionRate.toFixed(1) + "%";
  $("notcompleted").textContent = noPurchaseRate.toFixed(1) + "%";
  $("pages").textContent = averagePages(rows).toFixed(1);

  $("donutText").textContent = completionRate.toFixed(1) + "%";
  $("donut").style.background = `conic-gradient(
    var(--green) 0% ${completionRate}%,
    var(--blue) ${completionRate}% 100%
  )`;

  const purchasedAverage = averagePages(purchased);
  const noPurchaseAverage = averagePages(noPurchase);
  const maxValue = Math.max(purchasedAverage, noPurchaseAverage, 1);

  $("yesPages").textContent = purchasedAverage.toFixed(1);
  $("noPages").textContent = noPurchaseAverage.toFixed(1);
  $("yesBar").style.width = (purchasedAverage / maxValue * 100) + "%";
  $("noBar").style.width = (noPurchaseAverage / maxValue * 100) + "%";

  updateTable();
}

function visibleRows() {
  const searchTerm = searchInput.value.trim().toLowerCase();
  return filteredData().filter(row => {
    const outcome = row.purchased ? "purchased" : "no purchase";
    const day = row.weekend ? "weekend" : "weekday";
    const searchableText =
      `${row.session} ${row.visitor} ${day} ${row.month} ${row.productPages} ${outcome}`
        .toLowerCase();
    return searchableText.includes(searchTerm);
  });
}

function updateTable() {
  const rows = visibleRows();
  const tbody = $("rows");
  tbody.replaceChildren();

  rows.slice(0, 50).forEach(row => {
    const tr = document.createElement("tr");
    const values = [
      row.session,
      row.visitor.replace("_", " "),
      row.weekend ? "Weekend" : "Weekday",
      row.month,
      row.productPages,
      row.purchased ? "Purchased" : "No Purchase"
    ];

    values.forEach((value, index) => {
      const td = document.createElement("td");
      td.textContent = value;
      if (index === 5) td.className = row.purchased ? "yes" : "no";
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });

  const displayed = Math.min(rows.length, 50);
  $("rowCount").textContent = rows.length > 50
    ? `Showing first ${displayed.toLocaleString()} of ${rows.length.toLocaleString()} matching real sessions. Search or filter to narrow results.`
    : `Showing ${displayed.toLocaleString()} of ${shopperData.length.toLocaleString()} real sessions`;
}

function resetFilters() {
  visitorFilter.value = "all";
  dayFilter.value = "all";
  searchInput.value = "";
  updateDashboard();
}

function exportCSV() {
  const headers = ["Session", "Visitor", "DayType", "Month", "ProductPages", "Purchased"];
  const rows = visibleRows().map(row => [
    row.session,
    row.visitor,
    row.weekend ? "Weekend" : "Weekday",
    row.month,
    row.productPages,
    row.purchased
  ]);

  const escapeCSV = value => {
    const text = String(value);
    return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  };
  const csv = [headers, ...rows].map(row => row.map(escapeCSV).join(",")).join("\r\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "shopping_solvers_filtered_sessions.csv";
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

async function loadDashboard() {
  try {
    const response = await fetch("data/analytics.json");
    if (!response.ok) throw new Error(`Request failed: ${response.status}`);
    const data = await response.json();

    shopperData = data.sessions || [];
    analyticsSummary = data;

    if (!shopperData.length) {
      throw new Error("The analytics file did not contain session records.");
    }

    $("rowCount").textContent = `Loaded ${shopperData.length.toLocaleString()} real sessions.`;
    updateDashboard();
  } catch (error) {
    console.error("Could not load analytics data:", error);
    $("sessions").textContent = "Unavailable";
    $("completed").textContent = "—";
    $("notcompleted").textContent = "—";
    $("pages").textContent = "—";
    $("rowCount").textContent =
      "Analytics data could not be loaded. Check that data/analytics.json exists in the published website repository.";
  }
}

visitorFilter.addEventListener("change", updateDashboard);
dayFilter.addEventListener("change", updateDashboard);
searchInput.addEventListener("input", updateTable);
$("resetFilters").addEventListener("click", resetFilters);
$("exportCSV").addEventListener("click", exportCSV);

loadDashboard();
