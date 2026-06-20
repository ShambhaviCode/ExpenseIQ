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

let transactions =
JSON.parse(localStorage.getItem("expenseiq")) || [];

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

    if (!title || !amount || !date) {
        alert("Please fill all fields");
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

            transactionList.innerHTML += `
                <tr>
                    <td>${t.title}</td>
                    <td>${t.category}</td>
                    <td>₹${Math.abs(t.amount)}</td>
                    <td>${t.date}</td>
                    <td>
                        <button
                        class="delete-btn"
                        onclick="deleteTransaction(${t.id})">
                        Delete
                        </button>
                    </td>
                </tr>
            `;

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

    balanceEl.textContent =
        `₹${income - expense}`;

    incomeEl.textContent =
        `₹${income}`;

    expenseEl.textContent =
        `₹${expense}`;
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