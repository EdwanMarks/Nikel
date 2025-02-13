const myModal = new bootstrap.Modal("#transaction-modal");
let loggedUser = sessionStorage.getItem("logged") || localStorage.getItem("session");
let userData = {
  transactions: []
};

// Elementos DOM
const logoutButton = document.getElementById("logout-button"); // Corrigido o ID
const transactionForm = document.getElementById("transaction-form");
const transactionsList = document.getElementById("transactions-list");

// Event Listeners
document.addEventListener("DOMContentLoaded", initApp);
logoutButton.addEventListener("click", logout);
transactionForm.addEventListener("submit", handleTransactionSubmit);

async function initApp() {
  try {
    await checkLogged();
    getTransactions();
  } catch (error) {
    showFeedback(error.message, 'error');
    logout();
  }
}

async function handleTransactionSubmit(e) {
  e.preventDefault();

  try {
    const value = parseFloat(document.getElementById("value-input").value);
    const description = sanitizeInput(document.getElementById("description-input").value);
    const date = document.getElementById("date-input").value;
    const type = document.querySelector('input[name="type-input"]:checked').value;

    // Validações
    if (isNaN(value) || value <= 0) throw new Error('Valor inválido');
    if (!description || description.length < 3) throw new Error('Descrição muito curta');
    if (!date) throw new Error('Data inválida');

    // Adicionar transação
    userData.transactions.unshift({
      value: value,
      type: type,
      description: description,
      date: new Date(date).toISOString().split('T')[0] // Formatar data
    });

    await saveData();
    transactionForm.reset();
    myModal.hide();
    getTransactions();
    showFeedback('Lançamento adicionado com sucesso!', 'success');

  } catch (error) {
    showFeedback(error.message, 'error');
  }
}

async function checkLogged() {
  if (!loggedUser) {
    window.location.href = "index.html";
    return;
  }

  const storedData = localStorage.getItem(loggedUser);
  if (!storedData) throw new Error('Dados do usuário não encontrados');
  
  userData = JSON.parse(storedData);
  sessionStorage.setItem("logged", loggedUser);
}

function logout() {
  sessionStorage.clear();
  localStorage.removeItem("session");
  window.location.href = "index.html";
}

function getTransactions() {
  transactionsList.innerHTML = userData.transactions
    .map(transaction => `
      <tr>
        <td>${transaction.date}</td>
        <td class="${transaction.type === '1' ? 'text-success' : 'text-danger'}">
          R$ ${transaction.value.toFixed(2)}
        </td>
        <td>${transaction.type === '1' ? 'Entrada' : 'Saída'}</td>
        <td>${transaction.description}</td>
      </tr>
    `).join('') || '<tr><td colspan="4">Nenhuma transação registrada</td></tr>';
}

async function saveData() {
  try {
    localStorage.setItem(loggedUser, JSON.stringify(userData));
  } catch (error) {
    throw new Error('Erro ao salvar dados: ' + error.message);
  }
}

// Funções auxiliares
function sanitizeInput(input) {
  return input.replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function showFeedback(message, type = 'success') {
  const alert = document.createElement('div');
  alert.className = `alert alert-${type} alert-dismissible fade show fixed-top`;
  alert.innerHTML = `
    ${message}
    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
  `;
  document.body.prepend(alert);
  setTimeout(() => alert.remove(), 5000);
}
