const myModal = new bootstrap.Modal("#transaction-modal");
const loggedUser = sessionStorage.getItem("logged") || localStorage.getItem("session");
let data = {
  transactions: []
};

// Validação de DOM carregado
document.addEventListener("DOMContentLoaded", () => {
  checkLogged();
  
  document.getElementById("button-logout").addEventListener("click", logout); // Corrigido ID do botão
  document.getElementById("transaction-button").addEventListener("click", () => {
    window.location.href = "transactions.html";
  });

  // Adicionar Lançamento
  document.getElementById("transaction-form").addEventListener("submit", handleTransactionSubmit);
});

function handleTransactionSubmit(e) {
  e.preventDefault();

  const valueInput = document.getElementById("value-input");
  const descriptionInput = document.getElementById("description-input");
  const dateInput = document.getElementById("date-input");

  // Validação dos campos
  const value = parseFloat(valueInput.value);
  if (isNaN(value) {
    showError("Valor inválido");
    return;
  }

  const description = sanitizeInput(descriptionInput.value);
  const date = new Date(dateInput.value);
  if (isNaN(date.getTime())) {
    showError("Data inválida");
    return;
  }

  const type = document.querySelector('input[name="type-input"]:checked').value;

  data.transactions.unshift({
    value: value,
    type: type,
    description: description,
    date: dateInput.value // Mantém o formato original
  });

  saveData(data);
  e.target.reset();
  myModal.hide();

  updateDashboard();
  showSuccess("Lançamento adicionado com sucesso!");
}

function checkLogged() {
  if (!loggedUser) {
    window.location.href = "index.html";
    return;
  }

  const storedData = localStorage.getItem(loggedUser);
  if (storedData) {
    try {
      data = JSON.parse(storedData);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      logout();
    }
  }
  updateDashboard();
}

function logout() {
  sessionStorage.removeItem("logged");
  localStorage.removeItem("session");
  window.location.href = "index.html";
}

function updateDashboard() {
  getCashIn();
  getCashOut();
  getTotal();
}

function getCashIn() {
  renderTransactionList("1", "cash-in-list");
}

function getCashOut() {
  renderTransactionList("2", "cash-out-list");
}

function renderTransactionList(type, elementId) {
  const transactions = data.transactions
    .filter(item => item.type === type)
    .slice(0, 5); // Limite de 5 itens

  const container = document.getElementById(elementId);
  container.innerHTML = transactions.length > 0 
    ? transactions.map(transaction => `
        <div class="row mb-4">
          <div class="col-12">
            <h3 class="fs-2">R$ ${transaction.value.toFixed(2)}</h3>
            <div class="container p-0">
              <div class="row">
                <div class="col-12 col-md-8">${sanitizeInput(transaction.description)}</div>
                <div class="col-12 col-md-3 d-flex justify-content-end">
                  ${transaction.date}
                </div>
              </div>
            </div>
          </div>
        </div>
      `).join("")
    : `<div class="text-muted">Nenhuma transação encontrada</div>`;
}

function getTotal() {
  const total = data.transactions.reduce((acc, item) => {
    return item.type === "1" ? acc + item.value : acc - item.value;
  }, 0);
  
  document.getElementById("total").textContent = `R$ ${total.toFixed(2)}`;
}

function saveData() {
  try {
    localStorage.setItem(loggedUser, JSON.stringify(data));
  } catch (error) {
    console.error("Erro ao salvar dados:", error);
    showError("Erro ao salvar os dados. Tente novamente.");
  }
}

// Funções auxiliares de segurança
function sanitizeInput(input) {
  const div = document.createElement("div");
  div.textContent = input;
  return div.innerHTML;
}

function showError(message) {
  alert(`Erro: ${message}`);
}

function showSuccess(message) {
  alert(`Sucesso: ${message}`);
}
