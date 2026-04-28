/**
 * Lógica de Autenticação e Controle de Acesso - Portal Alpitel
 */

const initialUsers = {
    'admin': { password: '12345', role: 'admin', name: 'Wilson Borges (Dev/Admin)' },
    'supervisor': { password: '12345', role: 'supervisor', name: 'Supervisor(a) Operacional' },
    'gestao': { password: '12345', role: 'gestao', name: 'Coordenador(a)' },
    'manutencao': { password: '12345', role: 'manutencao', name: 'Equipe de Manutenção' },
    'colaborador': { password: '12345', role: 'colaborador', name: 'Colaborador(a) de Campo' }
};

const USERS = JSON.parse(localStorage.getItem('alpitel_users')) || initialUsers;
if (!localStorage.getItem('alpitel_users')) {
    localStorage.setItem('alpitel_users', JSON.stringify(initialUsers));
}

const MODULES = [
    { id: 'frota', name: 'Operação', desc: 'Controle de veículos', path: 'frota.html', roles: ['admin', 'supervisor', 'gestao', 'manutencao', 'colaborador', 'frota'] },
    { id: 'oficina', name: 'Analise Frota', desc: 'Monitoramento de Avarias', path: 'oficina.html', roles: ['admin', 'gestao', 'frota'] },
    { id: 'mecanico', name: 'Oficina Mecânica', desc: 'Painel de Serviços para Mecânicos', path: 'mecanico.html', roles: ['admin', 'manutencao'] },
    { id: 'usuarios', name: 'Gestão de Acessos', desc: 'Criar logins e gerenciar cargos', path: 'usuarios.html', roles: ['admin', 'gestao', 'frota', 'supervisor'] }
];

const loginForm = document.getElementById('login-form');
if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const user = document.getElementById('username').value;
        const pass = document.getElementById('password').value;
        const errorMsg = document.getElementById('error-msg');

        if (USERS[user] && USERS[user].password === pass) {
            const sessionData = {
                username: user,
                role: USERS[user].role,
                name: USERS[user].name,
                token: Date.now()
            };
            sessionStorage.setItem('alpitel_session', JSON.stringify(sessionData));
            window.location.href = 'dashboard.html';
        } else {
            errorMsg.classList.remove('hidden');
        }
    });
}

if (window.location.pathname.includes('dashboard.html')) {
    const session = JSON.parse(sessionStorage.getItem('alpitel_session'));

    if (!session) {
        window.location.href = 'index.html';
    } else {
        document.getElementById('user-display').textContent = session.name;
        renderApps(session.role);
    }

    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            sessionStorage.removeItem('alpitel_session');
            window.location.href = 'index.html';
        });
    }
}

function renderApps(role) {
    const grid = document.getElementById('apps-grid');
    if (!grid) return;

    const allowedModules = MODULES.filter(mod => mod.roles.includes(role));

    grid.innerHTML = allowedModules.map(mod => `
        <a href="${mod.path}" class="app-card">
            <h3>${mod.name}</h3>
            <p>${mod.desc}</p>
        </a>
    `).join('');
}

function protectProject() {
    const session = JSON.parse(sessionStorage.getItem('alpitel_session'));
    if (!session) {
        window.location.href = 'index.html';
    }
}

// Proteção simplificada: se não for a página de login, verifica sessão
if (!window.location.pathname.endsWith('index.html') && !window.location.pathname.endsWith('/') && window.location.pathname !== '') {
    protectProject();
}
