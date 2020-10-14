let transactions = [];
let myChart;

fetch("/api/transaction/all")
  .then(response => {
    return response.json();
  })
  .then(data => {
    // Save db data on global variable
    transactions = data;

    populateTotal();
    populateTable();
    populateChart();
  });

function populateTotal() {
  // reduce transaction amounts to a single total value
  // array.reduce(function(total, currentValue, currentIndex, arr), initialValue)
  // (total: required, currentValue: required, currentIndex: optional, arr: optional, initialValue: Optional)
  // https://www.w3schools.com/jsref/jsref_reduce.asp
  let total = transactions.reduce((total, t) => {
    return total + parseInt(t.value);
  }, 0);

  let totalEl = document.querySelector("#total");
  totalEl.textContent = total;
}

function populateTable() {
  let tbody = document.querySelector("#tbody");
  tbody.innerHTML = "";

  transactions.forEach(transaction => {
    let tr = document.createElement("tr");
    tr.innerHTML = `
            <td>${transaction.name}</td>
            <td>${transaction.value}</td>
          `;
    tbody.appendChild(tr);
  });
}

function populateChart() {
  // Copy array and reverse it
  // https://www.w3schools.com/jsref/jsref_slice_array.asp
  let reversed = transactions.slice().reverse();
  let sum = 0;

  // Create date labels for chart
  let labels = reversed.map(t => {
    let date = new Date(t.date);
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}}`;
  });
  // Create incremental values for chart
  let data = reversed.map(t => {
    sum += parseInt(t.value);
    return sum;
  });
  // Remove old chart if it exists
  if (myChart) {
    myChart.destroy();
  }

  let ctx = document.getElementById("myChart").getContext("2d");

  myChart = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "Total Over Time",
          fill: true,
          borderColor: "rgb(91, 155, 105)",
          backgroundColor: "rgb(91, 155, 105, 0.5)",
          data
        }
      ]
    }
  });
}

function sendTransaction(isAdding) {
  let nameEl = document.querySelector("#t-name");
  let amountEl = document.querySelector("#t-amount");
  let errorEl = document.querySelector(".form .error");

  // validate form
  if (nameEl.value === "" || amountEl.value === "") {
    errorEl.textContent = "Missing Information";
    return;
  } else {
    errorEl.textContent = "";
  }

  // create record
  let transaction = {
    name: nameEl.value,
    value: amountEl.value,
    date: new Date().toISOString()
  };

  // if subtracting funds, convert amount to negative number
  if (!isAdding) {
    transaction.value *= -1;
  }

  // add to beginning of current array of data
  transactions.unshift(transaction);

  // re-run logic to populate ui with new record
  populateChart();
  populateTable();
  populateTotal();

  // also send to server
  fetch("/api/transaction", {
    method: "POST",
    body: JSON.stringify(transaction),
    headers: {
      Accept: "application/json, text/plain, */*",
      "Content-Type": "application/json"
    }
  })
    .then(response => {
      // Update cache by fetching all transactions, including the one just posted
      fetch("/api/transaction/all");

      // HTTP response for post route
      return response.json();
    })
    .then(data => {
      if (data.errors) {
        errorEl.textContent = "Missing Information";
      } else {
        // clear form
        nameEl.value = "";
        amountEl.value = "";
      }
    })
    .catch(err => {
      // fetch failed, so save in indexed db
      saveRecord(transaction);

      // clear form
      nameEl.value = "";
      amountEl.value = "";
    });
}

document.querySelector("#add-btn").onclick = function() {
  sendTransaction(true);
};

document.querySelector("#sub-btn").onclick = function() {
  sendTransaction(false);
};

// 3 seconds after page load, fetch API data
// So that service worker will cache it without user having to refresh page
window.addEventListener("load", () => {
  window.setTimeout(() => {
    fetch("/api/transaction/all").then(response => {
      return response.json();
    });
  }, 3000);
});