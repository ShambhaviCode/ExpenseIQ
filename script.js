const modal = document.getElementById("modal");
const addBtn = document.getElementById("addBtn");
const closeBtn = document.getElementById("closeBtn");
const saveBtn = document.getElementById("saveBtn");

const titleInput = document.getElementById("title");
const amountInput = document.getElementById("amount");
const typeInput = document.getElementById("type");
const categoryInput = document.getElementById("category");
const dateInput = document.getElementById("date");

const balanceEl = document.getElementById("balance");
const incomeEl = document.getElementById("income");
const expenseEl = document.getElementById("expense");

const transactionList = document.getElementById("transactionList");
const searchInput = document.getElementById("search");

let transactions = loadTransactions();

let chart;

// Open Modal
addBtn.addEventListener("click", () => {
    modal.style.display = "flex";
});

// Close Modal
closeBtn.addEventListener("click", () => {
    modal.style.display = "none";
});

// Save Transaction
saveBtn.addEventListener("click", () => {

    const title = titleInput.value.trim();
    const amount = Number(amountInput.value);
    const type = typeInput.value;
    const category = categoryInput.value;
    const date = dateInput.value;

    if (!title || !date) {
        alert("Please fill all fields");
        return;
    }

    // The type select decides the sign, so the amount itself must be positive.
    // A negative "expense" would otherwise be stored as income.
    if (!Number.isFinite(amount) || amount <= 0) {
        alert("Amount must be greater than 0");
        return;
    }

    const transaction = {
        id: Date.now(),
        title,
        category,
        amount: type === "expense"
            ? -amount
            : amount,
        date
    };

    transactions.push(transaction);

    saveData();
    renderTransactions();
    updateSummary();
    updateChart();

    titleInput.value = "";
    amountInput.value = "";
    dateInput.value = "";

    modal.style.display = "none";
});

// Load Local Storage
function loadTransactions() {
    try {
        const saved = JSON.parse(localStorage.getItem("expenseiq"));
        return Array.isArray(saved) ? saved : [];
    } catch {
        // Corrupt data shouldn't stop the whole app from loading.
        return [];
    }
}

// Save Local Storage
function saveData() {
    localStorage.setItem(
        "expenseiq",
        JSON.stringify(transactions)
    );
}

// Delete Transaction
function deleteTransaction(id) {

    transactions =
        transactions.filter(
            t => t.id !== id
        );

    saveData();
    renderTransactions();
    updateSummary();
    updateChart();
}

// Render Table
function renderTransactions() {

    transactionList.innerHTML = "";

    const keyword =
        searchInput.value.toLowerCase();

    transactions
        .filter(t =>
            t.title
            .toLowerCase()
            .includes(keyword)
        )
        .reverse()
        .forEach(t => {

            // Build cells with textContent so titles like
            // "<img src=x onerror=...>" are shown, not executed.
            const row = document.createElement("tr");

            [
                t.title,
                t.category,
                `${t.amount < 0 ? "-" : "+"}${formatMoney(Math.abs(t.amount))}`,
                t.date
            ].forEach(text => {
                const cell = document.createElement("td");
                cell.textContent = text;
                row.appendChild(cell);
            });

            const actionCell = document.createElement("td");
            const deleteBtn = document.createElement("button");
            deleteBtn.className = "delete-btn";
            deleteBtn.textContent = "Delete";
            deleteBtn.addEventListener(
                "click",
                () => deleteTransaction(t.id)
            );
            actionCell.appendChild(deleteBtn);
            row.appendChild(actionCell);

            transactionList.appendChild(row);

        });

}

// Update Cards
function updateSummary() {

    let income = 0;
    let expense = 0;

    transactions.forEach(t => {

        if (t.amount > 0)
            income += t.amount;
        else
            expense += Math.abs(t.amount);

    });

    const balance = income - expense;

    balanceEl.textContent =
        `${balance < 0 ? "-" : ""}${formatMoney(Math.abs(balance))}`;

    incomeEl.textContent =
        formatMoney(income);

    expenseEl.textContent =
        formatMoney(expense);
}

// Round to paise so sums like 0.1 + 0.2 don't show
// as ₹0.30000000000000004.
function formatMoney(value) {
    return `₹${value.toLocaleString("en-IN", {
        maximumFractionDigits: 2
    })}`;
}

// Chart
function updateChart() {

    let income = 0;
    let expense = 0;

    transactions.forEach(t => {

        if (t.amount > 0)
            income += t.amount;
        else
            expense += Math.abs(t.amount);

    });

    if (chart)
        chart.destroy();

    chart = new Chart(
        document.getElementById("expenseChart"),
        {
            type: "doughnut",
            data: {
                labels: [
                    "Income",
                    "Expense"
                ],
                datasets: [{
                    data: [
                        income,
                        expense
                    ]
                }]
            }
        }
    );
}

// Search
searchInput.addEventListener(
    "input",
    renderTransactions
);

// Initial Load
renderTransactions();
updateSummary();
updateChart();