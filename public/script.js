// Função para abrir modal
function openModal(content, button) {
  const modal = document.getElementById("modal");
  const modalResponse = document.getElementById("modalResponse");
  modalResponse.textContent = content;
  modal.style.display = "flex";

  // Guardar referência direta ao botão
  modal.currentButton = button;
}

// Função para fechar modal e reativar botão
function closeModal() {
  const modal = document.getElementById("modal");
  modal.style.display = "none";

  // Reativar botão se existir referência
  if (modal.currentButton) {
    modal.currentButton.disabled = false;
    modal.currentButton.textContent = modal.currentButton.dataset.originalText;
    modal.currentButton = null; // limpa referência
  }
}

// Eventos de fechar modal
document.getElementById("closeModal").addEventListener("click", closeModal);
window.addEventListener("click", (event) => {
  const modal = document.getElementById("modal");
  if (event.target === modal) {
    closeModal();
  }
});

// Função auxiliar para enviar formulário
async function sendForm(formId, endpoint) {
  const form = document.getElementById(formId);
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const button = form.querySelector("button[type='submit']");
    button.disabled = true;
    button.dataset.originalText = button.textContent;
    button.textContent = "Processando...";

    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      openModal(JSON.stringify(data, null, 2), button);
    } catch (err) {
      openModal("Erro ao enviar requisição: " + err.message, button);
    }
  });
}

// Conecta formulários ao backend
sendForm("formImediato", "/api/pix/imediato");
sendForm("formAgendado", "/api/pix/agendado");
