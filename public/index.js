let transactions = [];
let myChart;

fetch("/api/transaction")
  .then(response => response.json())
  .then(data => {
    // save db data on global variable
    transactions = data;
    displayTotalAmount();
    displayTable();
    displayChart();
  });

function displayTotalAmount() {
  // reduce transaction amounts to a single total value
  const total = transactions.reduce((total, t) => {
    return total + parseInt(t.value);
  }, 0);

  const total_element = document.querySelector("#total");
  total_element.textContent = total;
}

function displayTable() {
  const tbody = document.querySelector("#tbody");
  tbody.innerHTML = "";

  transactions.forEach(transaction => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${transaction.name}</td>
      <td>${transaction.value}</td>
    `;

    tbody.appendChild(tr);
  });
}

function displayChart() {
  const reversed = transactions.slice().reverse();
  let total_amount = 0;

  const labels = reversed.map(t => {
    const date = new Date(t.date);
    return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
  });

  const data = reversed.map(t => {
    total_amount += parseInt(t.value);
    return total_amount;
  });

  if (myChart) {
    myChart.destroy();
  }

  const ctx = document.getElementById("my-chart").getContext("2d");

  myChart = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "Total Over Time",
          fill: true,
          backgroundColor: "rgb(100, 100, 100,0.8)",
          data
        }
      ]
    }
  });
}

function sendTransaction(isAdding) {
  const name_element = document.querySelector("#t-name");
  const amount_element = document.querySelector("#t-amount");
  const error_element = document.querySelector("form .error");

  if (name_element.value === "" || amount_element.value === "") {
    error_element.textContent = "Missing Information";
    return;
  } else {
    error_element.textContent = "";
  }

  const transaction = {
    name: name_element.value,
    value: amount_element.value,
    date: new Date().toISOString()
  };

  if (!isAdding) {
    transaction.value *= -1;
  }

  transactions.unshift(transaction);

  displayChart();
  displayTable();
  displayTotalAmount();

  fetch("/api/transaction", {
    method: "POST",
    body: JSON.stringify(transaction),
    headers: {
      Accept: "application/json, text/plain, */*",
      "Content-Type": "application/json"
    }
  })
    .then(response => response.json())
    .then(data => {
      if (data.errors) {
        error_element.textContent = "Enter valid Data";
      } else {
        name_element.value = "";
        amount_element.value = "";
      }
    })
    .catch(err => {
      saveRecord(transaction);

      name_element.value = "";
      amount_element.value = "";
    });
}

document.querySelector("#add-btn").addEventListener("click", function(event) {
  event.preventDefault();
  sendTransaction(true);
});

document.querySelector("#sub-btn").addEventListener("click", function(event) {
  event.preventDefault();
  sendTransaction(false);
});

document.querySelector("#del-btn").addEventListener("click", function(event) {
  event.preventDefault();
  deletePending();
});
