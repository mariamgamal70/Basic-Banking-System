function fillPage() {
  const userTableBody = document.querySelector(".table-body");
  const adminName = document.querySelector(".admin-name");
  const adminBalance = document.querySelector(".admin-balance");
  const historyTableBody = document.querySelector(".history-table-body");
  fetch("/users")
    .then((response) => {
      return response.json();
    })
    .then((result) => {
      if (result.status === "success") {
        const users = result.data;
        const history = result.history;
        users.forEach((user) => {
          if (user["Number"] != 0) {
            const row = document.createElement("tr");
            row.innerHTML = `
            <td>${user["Number"]}</td>
            <td>${user["Name"]}</td>
            <td>${user["Email"]}</td>
            <td>$${user["Balance"]}</td>`;
            userTableBody.appendChild(row);
          } else {
            adminBalance.innerHTML = user["Balance"];
            adminName.innerHTML = user["Name"];
          }
        });
        history.forEach((hist) => {
          const row = document.createElement("tr");
          row.innerHTML = `
        <td>${hist["Name"]}</td>
        <td>${hist["Email"]}</td>
        <td>$${hist["Amount"]}</td>
        <td>${hist["Date"]}</td>`;
          historyTableBody.appendChild(row);
        });
      } else {
        console.error("failed to fetch user data", result.error);
      }
    })
    .catch((error) => {
      console.error("Error fetching user data:", error);
    });
}

function updatePage(event) {
  event.preventDefault();
  const email = document.querySelector("#emailtransfer").value;
  const amount = document.querySelector("#amounttransfer").value;
  const data = {
    email: email,
    amount: amount,
  };
  fetch("/users", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json", // Set the content type to JSON
    },
    body: JSON.stringify(data),
  })
    .then((res) => {
      res ? alert("transfer successful") : alert("failed");
      location.reload();
    })
    .catch((err) => console.error(err));
}

document.addEventListener("DOMContentLoaded", fillPage);

document.addEventListener("submit", (event) => {
  updatePage(event);
});
