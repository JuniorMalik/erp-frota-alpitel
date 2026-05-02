/**
 * Portal Alpitel - Core de Autenticação (Versão Final Estável)
 */

const initialUsers = {
    'admin': { password: '12345', role: 'admin', name: 'Wilson Borges (Dev/Admin)' },
    'supervisor': { password: '12345', role: 'supervisor', name: 'Supervisor(a) Operacional' },
    'gestao': { password: '12345', role: 'gestao', name: 'Coordenador(a)' },
    'manutencao': { password: '12345', role: 'manutencao', name: 'Equipe de Manutenção' },
    'colaborador': { password: '12345', role: 'colaborador', name: 'Colaborador(a) de Campo' }
};

const MODULES = [
    { id: 'frota', name: 'Operação', desc: 'Controle de veículos', path: '/frota.html', roles: ['admin', 'supervisor', 'gestao', 'manutencao', 'colaborador', 'frota'] },
    { id: 'oficina', name: 'Analise Frota', desc: 'Monitoramento de Avarias', path: '/oficina.html', roles: ['admin', 'gestao', 'frota'] },
    { id: 'mecanico', name: 'Oficina Mecânica', desc: 'Painel de Serviços para Mecânicos', path: '/mecanico.html', roles: ['admin', 'manutencao'] },
    { id: 'checklist', name: 'Check-List Veicular', desc: 'Inspeção diária obrigatória', path: '/checklist.html', roles: ['admin', 'supervisor', 'gestao', 'manutencao', 'colaborador', 'frota'] },
    { id: 'usuarios', name: 'Gestão de Acessos', desc: 'Criar logins e gerenciar cargos', path: '/usuarios.html', roles: ['admin', 'gestao', 'frota', 'supervisor'] },
    { id: 'cadastro_veiculos', name: 'Gestão de Veículos', desc: 'Adicionar e remover veículos da frota', path: '/cadastro_veiculos.html', roles: ['admin'] },
    { id: 'almoxarifado', name: 'Almoxarifado', desc: 'Controle de peças e estoque', path: '/almoxarifado.html', roles: ['admin', 'gestao', 'frota'] }
];

// Garantia de Usuários no LocalStorage
if (!localStorage.getItem('alpitel_users')) {
    localStorage.setItem('alpitel_users', JSON.stringify(initialUsers));
}

function checkAuth() {
    let session = null;
    try {
        session = JSON.parse(localStorage.getItem('alpitel_session'));
    } catch (e) {
        console.error("Sessão inválida");
    }

    const isLogin = !!document.getElementById('login-form');

    if (session && isLogin) {
        window.location.replace('/dashboard.html');
        return;
    }
    if (!session && !isLogin) {
        window.location.replace('/index.html');
        return;
    }

    if (session) {
        // Lógica de injeção resiliente
        let attempts = 0;
        const initUI = setInterval(() => {
            const display = document.getElementById('user-display');
            const grid = document.getElementById('apps-grid');
            
            if (display) {
                display.textContent = session.name || session.username;
                display.style.setProperty('display', 'inline-block', 'important');
                display.style.setProperty('visibility', 'visible', 'important');
                display.style.setProperty('opacity', '1', 'important');
                display.style.setProperty('color', '#1e293b', 'important');
            }

            // Renderiza cards se achar o grid
            if (grid) {
                const allowed = MODULES.filter(m => m.roles.includes(session.role));
                grid.innerHTML = allowed.map(m => `
                    <a href="${m.path}" class="app-card">
                        <h3>${m.name}</h3>
                        <p>${m.desc}</p>
                    </a>
                `).join('');
            }

            // Se ambos foram resolvidos ou passou do tempo, para
            if ((display && grid) || attempts++ > 20) {
                clearInterval(initUI);
            }
        }, 100);

        // Logout Global
        document.addEventListener('click', (e) => {
            if (e.target.closest('#logout-btn') || e.target.closest('.btn-logout') || e.target.closest('#btn-logout')) {
                e.preventDefault();
                localStorage.removeItem('alpitel_session');
                window.location.replace('/index.html');
            }
        });
    }
}

// Inicialização
checkAuth();
document.addEventListener('DOMContentLoaded', checkAuth);

// Login Form
document.addEventListener('submit', (e) => {
    if (e.target.id === 'login-form') {
        e.preventDefault();
        const u = document.getElementById('username').value.trim();
        const p = document.getElementById('password').value.trim();
        const users = JSON.parse(localStorage.getItem('alpitel_users')) || initialUsers;

        if (users[u] && users[u].password === p) {
            const data = { username: u, role: users[u].role, name: users[u].name };
            localStorage.setItem('alpitel_session', JSON.stringify(data));
            window.location.replace('/dashboard.html');
        } else {
            const err = document.getElementById('error-msg');
            if (err) err.classList.remove('hidden');
        }
    }
});
