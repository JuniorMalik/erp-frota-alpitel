/**
 * Sistema de Gestão de Avarias - Alpitel
 * @author Wilson Borges Xavier Júnior
 */


const initialFleet = [
    { id: 1, modelo: 'Fiat Fiorino', placa: 'ALP-1020', status: 'disponivel', km: 45200 },
    { id: 2, modelo: 'Fiat Argo', placa: 'ALP-2030', status: 'disponivel', km: 32150 },
    { id: 3, modelo: 'Mercedes-Benz Cesto Aéreo', placa: 'ALP-5050', status: 'em-servico', km: 12800 },
    { id: 4, modelo: 'Volkswagen Cesto Aéreo', placa: 'ALP-3040', status: 'manutencao', km: 88400 },
    { id: 5, modelo: 'Volkswagen Munck', placa: 'ALP-9090', status: 'disponivel', km: 15400 },
    { id: 6, modelo: 'Mercedes-Benz Munck', placa: 'AWP-2312', status: 'disponivel', km: 13455 },
];


let fleet = JSON.parse(localStorage.getItem('alpitel_fleet')) || initialFleet;
let logs = JSON.parse(localStorage.getItem('alpitel_logs')) || [];


const session = JSON.parse(sessionStorage.getItem('alpitel_session')) || { role: 'admin', name: 'Dev Mode' };
const userDisplay = document.getElementById('user-display');
if (userDisplay) {
    userDisplay.textContent = `${session.name} (${session.role.toUpperCase()})`;
}


const elements = {
    tableBody: document.querySelector('#fleet-table tbody'),
    selectMaintVeiculo: document.getElementById('maint-veiculo'),
    maintForm: document.getElementById('maintenance-form'),
    logList: document.getElementById('activity-log'),
    maintSection: document.getElementById('maintenance-section'),
    modal: document.getElementById('history-modal'),
    modalList: document.getElementById('vehicle-history-list'),
    modalTitle: document.getElementById('modal-veiculo-nome'),
    confirmModal: document.getElementById('confirm-modal'),
    confirmMsg: document.getElementById('confirm-message'),
    btnConfirmYes: document.getElementById('btn-confirm-yes'),
    btnConfirmNo: document.getElementById('btn-confirm-no'),
    allVehiclesTable: document.getElementById('all-vehicles-table'),
    maintenanceTrackerList: document.getElementById('maintenance-tracker-list'),
    navItems: document.querySelectorAll('#sidebar-nav li[data-target]'),
    tabContents: document.querySelectorAll('.tab-content'),
    stats: {
        total: document.getElementById('total-veiculos'),
        disponiveis: document.getElementById('veiculos-disponiveis'),
        manutencao: document.getElementById('veiculos-manutencao')
    }
};

function showToast(message, type = 'success') {
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    const icon = type === 'success' ? '✅' : '⚠️';
    toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => {
        toast.classList.add('fade-out');
        setTimeout(() => toast.remove(), 500);
    }, 3000);
}

function openConfirm(message) {
    return new Promise((resolve) => {
        elements.confirmMsg.textContent = message;
        elements.confirmModal.classList.remove('hidden');

        const handleYes = () => {
            elements.confirmModal.classList.add('hidden');
            cleanup();
            resolve(true);
        };

        const handleNo = () => {
            elements.confirmModal.classList.add('hidden');
            cleanup();
            resolve(false);
        };

        const cleanup = () => {
            elements.btnConfirmYes.removeEventListener('click', handleYes);
            elements.btnConfirmNo.removeEventListener('click', handleNo);
        };

        elements.btnConfirmYes.addEventListener('click', handleYes);
        elements.btnConfirmNo.addEventListener('click', handleNo);
    });
}

function applyPermissions() {
    const { role } = session;
    if (role === 'colaborador' || role === 'manutencao' || role === 'supervisor' || role === 'admin' || role === 'gestao' || role === 'frota') {
        if (elements.maintSection) elements.maintSection.classList.remove('hidden');
    }
}

function updateDashboardStats() {
    if (elements.stats.total) elements.stats.total.textContent = fleet.length;
    if (elements.stats.disponiveis) elements.stats.disponiveis.textContent = fleet.filter(v => v.status === 'disponivel').length;
    if (elements.stats.manutencao) elements.stats.manutencao.textContent = fleet.filter(v => v.status === 'manutencao' || v.status === 'aguardando_oficina' || v.status === 'reparo').length;
}

function renderFleetTable() {
    if (!elements.tableBody) return;
    elements.tableBody.innerHTML = '';
    elements.selectMaintVeiculo.innerHTML = '<option value="">Selecione...</option>';

    fleet.forEach(veiculo => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${veiculo.modelo}</strong></td>
            <td>${veiculo.placa}</td>
            <td><span class="badge ${veiculo.status}">${veiculo.status.replace(/[-_]/g, ' ')}</span></td>
            <td>${veiculo.km.toLocaleString()} km</td>
            <td>
                <div class="action-buttons">
                    <button class="btn-history" onclick="openHistory('${veiculo.placa}')">Histórico</button>
                    ${veiculo.status !== 'disponivel' ? `<span style="color: var(--gray); font-size: 0.8rem; font-weight: 600; margin-left: 10px;">Em Manutenção</span>` : ''}
                </div>
            </td>
        `;
        elements.tableBody.appendChild(tr);
        if(veiculo.status === 'disponivel') {
            const opt = new Option(`${veiculo.modelo} (${veiculo.placa})`, veiculo.id);
            elements.selectMaintVeiculo.add(opt);
        }
    });
}

function renderAllVehicles() {
    if (!elements.allVehiclesTable) return;
    elements.allVehiclesTable.innerHTML = '';
    
    const sortedFleet = [...fleet].sort((a, b) => a.modelo.localeCompare(b.modelo));

    sortedFleet.forEach(veiculo => {
        const tr = document.createElement('tr');
        tr.style.borderBottom = '1px solid #f1f5f9';
        tr.innerHTML = `
            <td style="padding: 12px;"><strong>${veiculo.modelo}</strong></td>
            <td style="padding: 12px;"><code style="background: #f1f5f9; padding: 2px 6px; border-radius: 4px;">${veiculo.placa}</code></td>
            <td style="padding: 12px;">${veiculo.km.toLocaleString()} km</td>
            <td style="padding: 12px;"><span class="badge ${veiculo.status}">${veiculo.status.toUpperCase().replace(/[-_]/g, ' ')}</span></td>
        `;
        elements.allVehiclesTable.appendChild(tr);
    });
}

function renderMaintenanceTracker() {
    if (!elements.maintenanceTrackerList) return;
    elements.maintenanceTrackerList.innerHTML = '';
    
    const trackerVehicles = fleet.filter(v => v.status === 'manutencao' || v.status === 'aguardando_oficina' || v.status === 'reparo');
    
    const recentFinishedLogs = [...logs].reverse().filter(l => l.type === 'manutencao_fim').slice(0, 3);
    const finishedPlates = recentFinishedLogs.map(l => l.veiculo);
    
    fleet.forEach(v => {
        if (v.status === 'disponivel' && finishedPlates.includes(v.placa)) {
            trackerVehicles.push(v);
        }
    });

    if (trackerVehicles.length === 0) {
        elements.maintenanceTrackerList.innerHTML = '<p style="color: var(--gray); text-align: center; padding: 20px;">Nenhuma manutenção recente para acompanhar.</p>';
        return;
    }

    trackerVehicles.forEach(veiculo => {
        const isFinished = veiculo.status === 'disponivel';
        const isReparo = veiculo.status === 'reparo';
        const isAguardando = veiculo.status === 'aguardando_oficina';
        const isManutencao = veiculo.status === 'manutencao'; 
        
        let progressWidth = '12.5%'; 
        if (isAguardando) progressWidth = '37.5%'; 
        if (isReparo) progressWidth = '62.5%'; 
        if (isFinished) progressWidth = '100%';
        
        const step1Class = true; 
        const step2Class = isAguardando || isReparo || isFinished; 
        const step3Class = isReparo || isFinished;
        const step4Class = isFinished;
        
        let statusColor = 'var(--secondary-color)';
        let statusText = 'SINALIZADO PARA FROTA';
        if (isAguardando) {
            statusColor = '#f97316'; 
            statusText = 'ENVIADO PARA OFICINA';
        }
        if (isReparo) {
            statusColor = '#eab308'; 
            statusText = 'EM MANUTENÇÃO (OFICINA)';
        }
        if (isFinished) {
            statusColor = 'var(--primary-color)';
            statusText = 'SERVIÇO CONCLUÍDO';
        }

        const card = document.createElement('div');
        card.style = `border: 1px solid var(--border-color); border-radius: 8px; padding: 20px; border-left: 5px solid ${statusColor};`;
        card.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <div>
                    <h4 style="margin: 0; font-size: 1.1rem;">${veiculo.modelo}</h4>
                    <code style="background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-size: 0.8rem;">${veiculo.placa}</code>
                </div>
                <span style="font-weight: 800; font-size: 0.8rem; color: ${statusColor};">${statusText}</span>
            </div>
            
            <div style="display: flex; justify-content: space-between; position: relative;">
                <div style="position: absolute; top: 12px; left: 0; right: 0; height: 3px; background: #e2e8f0; z-index: 1;"></div>
                <div style="position: absolute; top: 12px; left: 0; width: ${progressWidth}; height: 3px; background: ${statusColor}; z-index: 2; transition: 0.5s;"></div>
                
                <div style="position: relative; z-index: 3; text-align: center; width: 25%;">
                    <div style="width: 25px; height: 25px; border-radius: 50%; background: ${step1Class ? statusColor : '#e2e8f0'}; color: white; display: flex; align-items: center; justify-content: center; margin: 0 auto 5px; font-weight: bold; font-size: 0.8rem;">1</div>
                    <span style="font-size: 0.75rem; color: ${step1Class ? 'var(--dark)' : 'var(--gray)'}; font-weight: 600;">Sinalizado</span>
                </div>
                
                <div style="position: relative; z-index: 3; text-align: center; width: 25%;">
                    <div style="width: 25px; height: 25px; border-radius: 50%; background: ${step2Class ? statusColor : '#e2e8f0'}; color: white; display: flex; align-items: center; justify-content: center; margin: 0 auto 5px; font-weight: bold; font-size: 0.8rem;">2</div>
                    <span style="font-size: 0.75rem; color: ${step2Class ? 'var(--dark)' : 'var(--gray)'}; font-weight: 600;">Recebido na Frota</span>
                </div>

                <div style="position: relative; z-index: 3; text-align: center; width: 25%;">
                    <div style="width: 25px; height: 25px; border-radius: 50%; background: ${step3Class ? statusColor : 'white'}; border: 2px solid ${step3Class ? statusColor : '#e2e8f0'}; color: ${step3Class ? 'white' : 'transparent'}; display: flex; align-items: center; justify-content: center; margin: 0 auto 5px; font-weight: bold; font-size: 0.8rem;">3</div>
                    <span style="font-size: 0.75rem; color: ${step3Class ? 'var(--dark)' : 'var(--gray)'}; font-weight: 600;">Manutenção</span>
                </div>
                
                <div style="position: relative; z-index: 3; text-align: center; width: 25%;">
                    <div style="width: 25px; height: 25px; border-radius: 50%; background: ${step4Class ? statusColor : 'white'}; border: 2px solid ${step4Class ? statusColor : '#e2e8f0'}; color: ${step4Class ? 'white' : 'transparent'}; display: flex; align-items: center; justify-content: center; margin: 0 auto 5px; font-weight: bold; font-size: 0.8rem;">✓</div>
                    <span style="font-size: 0.75rem; color: ${step4Class ? 'var(--dark)' : 'var(--gray)'}; font-weight: 600;">Serviço Finalizado</span>
                </div>
            </div>
        `;
        elements.maintenanceTrackerList.appendChild(card);
    });
}

function renderLogs() {
    if (!elements.logList) return;
    elements.logList.innerHTML = '';
    const isAuthorized = session.role === 'admin' || session.role === 'gestao';
    const displayLogs = [...logs].reverse().slice(0, 15);
    
    displayLogs.forEach((log, index) => {
        const originalIndex = logs.length - 1 - index;
        const li = document.createElement('li');
        li.className = 'log-item';
        li.style.display = 'flex';
        li.style.justifyContent = 'space-between';
        li.style.alignItems = 'center';
        
        const icon = log.type === 'manutencao' ? '🔧' : '🚚';
        const content = `
            <div>
                ${icon} <strong>${log.veiculo}</strong>: ${log.msg}
                <div style="font-size: 0.75rem; color: #94a3b8; margin-top: 5px;">
                    ${log.date} às ${log.hora} ${log.autor ? `| Por: <strong>${log.autor}</strong>` : ''}
                </div>
            </div>`;
        
        const deleteBtn = isAuthorized 
            ? `<button onclick="deleteLog(${originalIndex})" style="background:none; border:none; color:var(--secondary-color); cursor:pointer; font-weight:bold; font-size:1.1rem; padding:0 10px;">&times;</button>`
            : '';

        li.innerHTML = content + deleteBtn;
        elements.logList.appendChild(li);
    });
}

window.deleteLog = async function(index) {
    if (await openConfirm('Deseja excluir este registro do histórico?')) {
        logs.splice(index, 1);
        syncStorage();
        renderLogs();
        showToast('Registro excluído!', 'error');
    }
}

function syncStorage() {
    localStorage.setItem('alpitel_fleet', JSON.stringify(fleet));
    localStorage.setItem('alpitel_logs', JSON.stringify(logs));
}

if (elements.maintForm) {
    elements.maintForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = parseInt(elements.selectMaintVeiculo.value);
        const problema = document.getElementById('problem-input').value;
        const obs = document.getElementById('obs-input').value;

        const v = fleet.find(item => item.id === id);
        v.status = 'manutencao';

        logs.push({
            id: Date.now(),
            type: 'manutencao',
            veiculo: v.placa,
            autor: session.name,
            hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            date: new Date().toLocaleDateString(),
            msg: `Avaria: ${problema} | Obs: ${obs}`
        });

        finalizeAction();
        elements.maintForm.reset();
        showToast(`Avaria registrada para o veículo ${v.placa}!`);
    });
}

function finalizeAction() {
    syncStorage();
    renderFleetTable();
    renderAllVehicles();
    renderMaintenanceTracker();
    renderLogs();
    updateDashboardStats();
}

window.returnVehicle = function(id) {
    const v = fleet.find(item => item.id === id);
    v.status = 'disponivel';
    finalizeAction();
    showToast(`Veículo ${v.placa} liberado!`);
};

window.openHistory = function(placa) {
    const v = fleet.find(item => item.placa === placa);
    if (elements.modalTitle) elements.modalTitle.textContent = `${v.modelo} (${v.placa})`;
    if (elements.modal) elements.modal.classList.remove('hidden');

    const history = logs.filter(log => log.veiculo === placa);
    if (elements.modalList) {
        elements.modalList.innerHTML = history.length > 0 
            ? history.map(log => `
                <li class="history-item">
                    <span class="date">${log.date || ''} ${log.hora}</span>
                    <p>${log.msg}</p>
                </li>
            `).reverse().join('')
            : '<li class="history-item">Nenhum histórico registrado para este veículo.</li>';
    }
}

window.closeModal = function() {
    if (elements.modal) elements.modal.classList.add('hidden');
}

const btnLogout = document.getElementById('btn-logout');
if (btnLogout) {
    btnLogout.addEventListener('click', () => {
        sessionStorage.removeItem('alpitel_session');
        window.location.href = 'index.html';
    });
}

elements.navItems.forEach(item => {
    item.addEventListener('click', () => {
        elements.navItems.forEach(nav => nav.classList.remove('active'));
        item.classList.add('active');

        // Hide all tabs
        elements.tabContents.forEach(tab => tab.classList.add('hidden'));
        
        // Show target tab
        const targetId = item.getAttribute('data-target');
        const targetTab = document.getElementById(targetId);
        if (targetTab) targetTab.classList.remove('hidden');
    });
});

const btnClearLogs = document.getElementById('btn-clear-logs');
if (btnClearLogs) {
    btnClearLogs.addEventListener('click', async () => {
        if (await openConfirm('Deseja realmente limpar TODO o histórico do sistema?')) {
            logs = [];
            syncStorage();
            renderLogs();
            showToast('Todo o histórico foi limpo!', 'error');
        }
    });
}

function bootstrap() {
    applyPermissions();
    const isAuthorized = session.role === 'admin' || session.role === 'gestao';
    if (!isAuthorized) {
        const btn = document.getElementById('btn-clear-logs');
        if (btn) btn.style.display = 'none';
    }
    renderFleetTable();
    renderAllVehicles();
    renderMaintenanceTracker();
    renderLogs();
    updateDashboardStats();
}

bootstrap();
