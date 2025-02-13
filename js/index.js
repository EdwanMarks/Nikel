(function() {
    const authModal = new bootstrap.Modal("#register-modal");
    const SESSION_KEY = 'financial_session';
    const MIN_PASSWORD_LENGTH = 8;

    // Verificar autenticação
    function checkAuth() {
        const session = JSON.parse(localStorage.getItem(SESSION_KEY));
        if (session?.token && session.expires > Date.now()) {
            window.location.href = "home.html";
        }
    }

    // Gerar token de sessão
    function generateSessionToken() {
        return crypto.randomUUID();
    }

    // Validar e-mail
    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    // Validar senha
    function isStrongPassword(password) {
        return password.length >= MIN_PASSWORD_LENGTH &&
               /[A-Z]/.test(password) &&
               /[0-9]/.test(password);
    }

    // Criptografar dados (simulado para exemplo)
    function secureEncrypt(data) {
        return btoa(unescape(encodeURIComponent(JSON.stringify(data)));
    }

    document.getElementById("login-form").addEventListener("submit", async (e) => {
        e.preventDefault();
        
        const email = document.getElementById("email-input").value.trim();
        const password = document.getElementById("password-input").value;
        const rememberMe = document.getElementById("session-check").checked;

        try {
            if (!isValidEmail(email)) throw new Error('E-mail inválido');
            if (!password) throw new Error('Senha obrigatória');

            const account = localStorage.getItem(email);
            if (!account) throw new Error('Credenciais inválidas');

            const userData = JSON.parse(account);
            if (userData.password !== password) throw new Error('Credenciais inválidas');

            // Criar sessão
            const sessionData = {
                token: generateSessionToken(),
                expires: rememberMe ? Date.now() + 30 * 24 * 60 * 60 * 1000 : Date.now() + 24 * 60 * 60 * 1000
            };

            localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
            sessionStorage.setItem('currentUser', secureEncrypt(userData));

            window.location.href = "home.html";
            
        } catch (error) {
            showFeedback(error.message, 'error');
        }
    });

    document.getElementById("create-form").addEventListener("submit", (e) => {
        e.preventDefault();
        
        const email = document.getElementById("email-create-input").value.trim();
        const password = document.getElementById("password-create-input").value;

        try {
            if (!isValidEmail(email)) throw new Error('Formato de e-mail inválido');
            if (localStorage.getItem(email)) throw new Error('E-mail já cadastrado');
            if (!isStrongPassword(password)) throw new Error(`Senha deve ter ${MIN_PASSWORD_LENGTH}+ caracteres com letras e números`);

            const userData = {
                login: email,
                password: password, // Em aplicação real, usar bcrypt
                transactions: [],
                createdAt: new Date().toISOString()
            };

            localStorage.setItem(email, JSON.stringify(userData));
            authModal.hide();
            showFeedback('Conta criada com sucesso!', 'success');

        } catch (error) {
            showFeedback(error.message, 'error');
        }
    });

    // Sistema de feedback visual
    function showFeedback(message, type = 'info') {
        const feedbackEl = document.createElement('div');
        feedbackEl.className = `alert alert-${type} fixed-top fade show`;
        feedbackEl.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        document.body.prepend(feedbackEl);
        setTimeout(() => feedbackEl.remove(), 5000);
    }

    checkAuth();
})();
