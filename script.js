
// SHOPPING SOLVERS - MILESTONE 2
// Synthetic demonstration data.
// These are not actual UCI dataset records.

const shopperData = [
  ["S001", "Returning", "Desktop", "Oct", 12, true],
  ["S002", "New", "Mobile", "Oct", 3, false],
  ["S003", "Returning", "Mobile", "Sep", 8, true],
  ["S004", "New", "Desktop", "Sep", 5, false],
  ["S005", "Returning", "Desktop", "Aug", 15, true],
  ["S006", "New", "Mobile", "Aug", 2, false],
  ["S007", "Returning", "Mobile", "Jul", 6, false],
  ["S008", "New", "Desktop", "Jul", 9, true],
  ["S009", "Returning", "Desktop", "Jun", 11, true],
  ["S010", "New", "Mobile", "Jun", 4, false],
  ["S011", "Returning", "Mobile", "May", 7, true],
  ["S012", "New", "Desktop", "May", 3, false]
];

const $ = id => document.getElementById(id);

const visitorFilter = $("visitor");
const deviceFilter = $("device");
const searchInput = $("search");

// Filter by visitor type and device.
function filteredData() {
  return shopperData.filter(row => {
    const visitorMatch =
      visitorFilter.value === "all" ||
      row[1] === visitorFilter.value;

    const deviceMatch =
      deviceFilter.value === "all" ||
      row[2] === deviceFilter.value;

    return visitorMatch && deviceMatch;
  });
}

// Calculate average product pages.
function averagePages(rows) {
  if (rows.length === 0) return 0;

  const total = rows.reduce(
    (sum, row) => sum + row[4], 0
  );

  return total / rows.length;
}

// Update dashboard statistics and charts.
function updateDashboard() {
  const rows = filteredData();
  const total = rows.length;

  const purchased = rows.filter(row => row[5]);
  const noPurchase = rows.filter(row => !row[5]);

  const completionRate = total
    ? purchased.length / total * 100
    : 0;

  const noPurchaseRate = total
    ? noPurchase.length / total * 100
    : 0;

  $("sessions").textContent = total;

  $("completed").textContent =
    completionRate.toFixed(1) + "%";

  $("notcompleted").textContent =
    noPurchaseRate.toFixed(1) + "%";

  $("pages").textContent =
    averagePages(rows).toFixed(1);

  // Update donut chart.
  $("donutText").textContent =
    completionRate.toFixed(1) + "%";

  $("donut").style.background =
    `conic-gradient(
      var(--green) 0% ${completionRate}%,
      var(--blue) ${completionRate}% 100%
    )`;

  // Update comparison bars.
  const purchasedAverage = averagePages(purchased);
  const noPurchaseAverage = averagePages(noPurchase);

  const maxValue = Math.max(
    purchasedAverage,
    noPurchaseAverage,
    1
  );

  $("yesPages").textContent =
    purchasedAverage.toFixed(1);

  $("noPages").textContent =
    noPurchaseAverage.toFixed(1);

  $("yesBar").style.width =
    (purchasedAverage / maxValue * 100) + "%";

  $("noBar").style.width =
    (noPurchaseAverage / maxValue * 100) + "%";

  updateTable();
}

// Apply the table search.
function visibleRows() {
  const searchTerm =
    searchInput.value.trim().toLowerCase();

  return filteredData().filter(row => {
    const searchableText =
      row.slice(0, 4).join(" ").toLowerCase();

    const outcome = row[5]
      ? "purchased"
      : "no purchase";

    return (
      searchableText.includes(searchTerm) ||
      outcome.includes(searchTerm)
    );
  });
}

// Build the shopper table.
function updateTable() {
  const rows = visibleRows();
  const tbody = $("rows");

  tbody.replaceChildren();

  rows.forEach(row => {
    const tr = document.createElement("tr");

    const values = [
      row[0],
      row[1],
      row[2],
      row[3],
      row[4],
      row[5] ? "Purchased" : "No Purchase"
    ];

    values.forEach((value, index) => {
      const td = document.createElement("td");

      td.textContent = value;

      if (index === 5) {
        td.className = row[5] ? "yes" : "no";
      }

      tr.appendChild(td);
    });

    tbody.appendChild(tr);
  });

  $("rowCount").textContent =
    `Showing ${rows.length} of ${shopperData.length} synthetic sessions`;
}

// Reset all filters.
function resetFilters() {
  visitorFilter.value = "all";
  deviceFilter.value = "all";
  searchInput.value = "";

  updateDashboard();
}

// Export the visible table data as CSV.
function exportCSV() {
  const headers = [
    "Session",
    "Visitor",
    "Device",
    "Month",
    "ProductPages",
    "Purchased"
  ];

  const rows = visibleRows().map(row =>
    row.map(value => String(value)).join(",")
  );

  const csv = [
    headers.join(","),
    ...rows
  ].join("\r\n");

  const blob = new Blob(
    [csv],
    { type: "text/csv;charset=utf-8" }
  );

  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = "shopping_solvers_demo_sessions.csv";

  document.body.appendChild(link);
  link.click();
  link.remove();

  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// Connect buttons and filters.
visitorFilter.addEventListener(
  "change",
  updateDashboard
);

deviceFilter.addEventListener(
  "change",
  updateDashboard
);

searchInput.addEventListener(
  "input",
  updateTable
);

$("resetFilters").addEventListener(
  "click",
  resetFilters
);

$("exportCSV").addEventListener(
  "click",
  exportCSV
);

// Load the dashboard.
updateDashboard();
