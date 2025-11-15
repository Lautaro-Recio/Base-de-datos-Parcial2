let lista;

document.addEventListener('DOMContentLoaded', function () {
    const tableBody = document.getElementById('tableBody');
    const contextMenu = document.getElementById('contextMenu');
    const addBtn = document.getElementById('addBtn');
    const recordModal = document.getElementById('recordModal');
    const recordForm = document.getElementById('recordForm');
    const cancelBtn = document.getElementById('cancelBtn');
    const modalTitle = document.getElementById('modalTitle');

    let selectedRow = null;
    let datos = [];
    let multasDict = {}; 
    let multasById = {};
    populateViolationsSelect();

    async function loadConductores() {
        try {
            const data = await conductores();
            lista = await multas();
            datos = data.map(c => ({
                id: c._id,
                nombre: c.nombre ?? '',
                apellido: c.apellido ?? '',
                dni: c.dni ?? '',
                telefono: c.telefono ?? '',
                patente: c.patente ?? '',           
                multas: (c.infracciones || [])
            }));
            displayRecords();
        } catch (e) { console.error('Error cargando conductores:', e); }
    }
    loadConductores();


    function displayRecords(searchTerm = '') {
        tableBody.innerHTML = '';

        datos.forEach(record => {
            const row = document.createElement('tr');
            row.setAttribute('data-id', record.id);

            const labels = Array.isArray(record.multas)
                ? record.multas.map(id => multasDict[String(id)] || String(id))
                : [];
            const violationsList = labels.length
                ? labels.map(lbl => `<li>${lbl}</li>`).join('')
                : '';

            row.innerHTML = `
                <td>${record.nombre || ''}</td>
                <td>${record.apellido || ''}</td>
                <td>${record.dni || ''}</td>
                <td>${record.telefono || ''}</td>
                <td>${record.patente || ''}</td>
                <td>${violationsList ? `Posee infracciones` : 'No posee infracciones'}</td>
            `;
            tableBody.appendChild(row);
        });

        const viewFinesBtn = document.getElementById('viewFinesBtn');
        if (viewFinesBtn) {
            viewFinesBtn.addEventListener('click', function () {
                if (!selectedRow) return;
                const id = selectedRow.dataset.id;
                const conductor = datos.find(r => String(r.id) === String(id));
                const container = document.getElementById('fines-container');
                const tbody = document.getElementById('fines-tbody');
                if (!conductor || !container || !tbody) return;

                const multas = lista;
                const rows = conductor.multas.map(mid => {
                    console.log(conductor.multas)
                    const multa = multas.find(m => String(m._id) === String(mid.multa));
                    return {
                        motivo: multa.motivo,
                        estado: mid.estado,
                        monto: multa.monto
                    };
                });
                console.log(rows)
                tbody.innerHTML = rows.length ? rows.map(r => `
                <tr>
                    <td>${r.motivo}</td>
                    <td><span class="status-badge ${r.estado === 'Por pagar' ? 'status-vencido' : 'status-habilitado'}">${r.estado}</span></td>
                    <td>$${r.monto}</td>
                </tr>
            `).join('') : '<tr><td colspan="3" style="text-align:center;padding:12px">Sin infracciones</td></tr>';

                container.style.display = 'block';
                contextMenu.style.display = 'none';
            });
        }
    }
    window.displayRecords = displayRecords;

    tableBody.addEventListener('contextmenu', function (e) {
        e.preventDefault();
        const row = e.target.closest('tr');
        if (!row) return;

        selectedRow = row;

        const x = e.clientX;
        const y = e.clientY;

        contextMenu.style.display = 'block';

        const menuWidth = contextMenu.offsetWidth;
        const menuHeight = contextMenu.offsetHeight;
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;

        contextMenu.style.left = (x + menuWidth > windowWidth) ? `${windowWidth - menuWidth - 5}px` : `${x}px`;
        contextMenu.style.top = (y + menuHeight > windowHeight) ? `${windowHeight - menuHeight - 5}px` : `${y}px`;
    });

    document.addEventListener('click', function () {
        contextMenu.style.display = 'none';
    });

    contextMenu.addEventListener('click', function (e) {
        e.stopPropagation();
    });

    document.getElementById('updateBtn').addEventListener('click', async function () {
        if (!selectedRow) return;
        const id = selectedRow.dataset.id;
        const record = datos.find(r => String(r.id) === String(id));

        if (record) {
            const setVal = (elId, val) => {
                const el = document.getElementById(elId);
                if (el) el.value = val ?? '';
            };

            document.getElementById('recordId').value = record.id;
            setVal('nombre', record.nombre);
            setVal('apellido', record.apellido);
            setVal('dni', record.dni);
            setVal('telefono', record.telefono);
            setVal('patente', record.patente);

            await populateViolationsSelect();

            const violationsSelect = document.getElementById('multas');
            if (violationsSelect) {
                const selectedMultas = Array.isArray(record.multas) ?
                    record.multas.map(m => String(m.multa || m)) : [];

                Array.from(violationsSelect.options).forEach(option => {
                    option.selected = selectedMultas.includes(String(option.value));
                });

                console.log('Multas seleccionadas:', selectedMultas);
            }

            modalTitle.textContent = 'Actualizar Registro';
            recordModal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }

        contextMenu.style.display = 'none';
    });

    const deleteModal = document.getElementById('deleteModal');
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
    const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
    const closeModalBtn = document.querySelector('.close-modal');

    function showDeleteModal() {
        deleteModal.style.display = 'flex';
        setTimeout(() => deleteModal.classList.add('show'), 10);
    }

    function hideDeleteModal() {
        deleteModal.classList.remove('show');
        setTimeout(() => {
            deleteModal.style.display = 'none';
        }, 300);
    }

    document.getElementById('deleteBtn').addEventListener('click', function () {
        if (!selectedRow) return;
        showDeleteModal();
    });

    confirmDeleteBtn.addEventListener('click', function () {
        if (!selectedRow) return

        const id = selectedRow.dataset.id
        eliminarConductor(id)
        displayRecords()
        showNotification('Registro eliminado correctamente', 'success');
        loadConductores()
        hideDeleteModal()
        contextMenu.style.display = 'none'
    });

    cancelDeleteBtn.addEventListener('click', hideDeleteModal);
    closeModalBtn.addEventListener('click', hideDeleteModal);

    deleteModal.addEventListener('click', function (e) {
        if (e.target === deleteModal) {
            hideDeleteModal();
        }
    });

    function showNotification(message, type = 'info') {
        const existingNotifications = document.querySelectorAll('.notification');
        existingNotifications.forEach(notif => {
            notif.classList.remove('show');
            setTimeout(() => notif.remove(), 300);
        });

        const notification = document.createElement('div');
        notification.className = `notification ${type}`;

        const messageContainer = document.createElement('div');
        messageContainer.className = 'notification-message';
        messageContainer.textContent = message;

        notification.appendChild(messageContainer);

        const closeButton = document.createElement('button');
        closeButton.className = 'notification-close';
        closeButton.innerHTML = '&times;';
        closeButton.addEventListener('click', () => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        });

        notification.appendChild(closeButton);
        document.body.appendChild(notification);

        void notification.offsetWidth;

        notification.classList.add('show');

        let timeoutId = setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 4000);

        notification.addEventListener('mouseenter', () => {
            clearTimeout(timeoutId);
        });

        notification.addEventListener('mouseleave', () => {
            timeoutId = setTimeout(() => {
                notification.classList.remove('show');
                setTimeout(() => notification.remove(), 300);
            }, 1000);
        });
    }

    addBtn.addEventListener('click', async function () {
        document.getElementById('recordForm').reset();
        document.getElementById('recordId').value = '';
        await populateViolationsSelect();
        modalTitle.textContent = 'Agregar Nuevo Registro';
        recordModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    });

    function closeModal() {
        recordModal.style.display = 'none';
        document.body.style.overflow = ''; 
    }

    cancelBtn.addEventListener('click', closeModal);

    window.addEventListener('click', function (e) {
        if (e.target === recordModal) {
            closeModal();
        }
    });

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && recordModal.style.display === 'flex') {
            closeModal();
        }
    });

    recordForm.addEventListener('submit', function (e) {
        e.preventDefault();

        const id = document.getElementById('recordId').value;
        const getSelectedMultaIds = getSelectedViolationIds();
        console.log(getSelectedMultaIds)
        const multasSeleccionadasConEstado = getSelectedMultaIds.map(multa => {
            let estado = "Por pagar"; 
            if (multa.opciones.includes("adelantado")) {
                estado = "Pagada por adelantado";
            }

            return {
                multa: multa.id,
                estado: estado
            };
        });
        console.log(multasSeleccionadasConEstado)
        const record = {
            nombre: document.getElementById('nombre').value.trim(),
            apellido: document.getElementById('apellido').value.trim(),
            dni: document.getElementById('dni').value.trim(),
            telefono: document.getElementById('telefono').value.trim(),
            patente: document.getElementById('patente').value.trim(),
            infracciones: multasSeleccionadasConEstado,
        };


        if (id) {
            updateConductores(id, record)
            loadConductores();

            showNotification('Registro actualizado correctamente', 'success');
        } else {
            postConductores(record)
            loadConductores();

            showNotification('Conductor agregado correctamente', 'success');
        }

        displayRecords();
        closeModal();
    });

    displayRecords();

    const searchInput = document.getElementById('searchInput');
    let searchTimeout;

    searchInput.addEventListener('input', function (e) {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            displayRecords(e.target.value.trim());
        }, 300);
    });

    searchInput.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            this.value = '';
            displayRecords('');
        }
    });
});





/* DATOS */


const API_URL = "http://localhost:3000";

const conductores = async () => {
    const resp = await fetch(`${API_URL}/conductores`);
    if (!resp.ok) {
        const msg = await resp.text().catch(() => '');
        throw new Error(`Error ${resp.status}: ${msg || 'No se pudieron obtener los conductores'}`);
    }
    return resp.json();
};

async function postConductores(record) {
    const resp = await fetch(`${API_URL}/conductores`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            nombre: record.nombre,
            apellido: record.apellido,
            dni: record.dni,
            telefono: record.telefono,
            patente: record.patente,
            infracciones: record.infracciones
        })
    });
    if (!resp.ok) throw new Error('No se pudo agregar el conductor');
    return resp.json();
}

async function eliminarConductor(id) {
    const resp = await fetch(`${API_URL}/conductores/${id}`, { method: 'DELETE' });
    if (!resp.ok) {
        const err = await resp.text().catch(() => '');
        throw new Error(`No se pudo borrar el conductor: ${resp.status} ${err}`);
    }
    return resp.json()
}

async function updateConductores(id, params) {
    const resp = await fetch(`${API_URL}/conductores/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(params)
    });
    if (!resp.ok) throw new Error('No se pudo actualizar el conductor');
    return resp.json();
}



const multas = async () => {
    const resp = await fetch(`${API_URL}/multas`);
    if (!resp.ok) {
        const msg = await resp.text().catch(() => '');
        throw new Error(`Error ${resp.status}: ${msg || 'No se pudieron obtener las multas'}`);
    }
    return resp.json();
};

let multasDict = {};
let multasById = {};

async function populateViolationsSelect() {
    try {
        const cont = document.getElementById('multas-container');
        if (!cont) return;

        if (!lista || lista.length === 0) {
            lista = await multas();
        }

        multasDict = {};
        multasById = {};

        cont.innerHTML = '';

        lista.forEach(m => {
            const label = m.motivo ? m.motivo : (m.tipo ?? "Multa");
            const multaId = m._id;

            const div = document.createElement("div");
            div.classList.add("multa-item");

            div.innerHTML = `
                <span>${label}</span>
                <div class="multa-opciones">
                    <label>
                        <input type="checkbox" name="multa_seleccionada_${multaId}" value="true" data-id="${multaId}" class="multa-select">
                        Seleccionar
                    </label>

                    <label>
                        <input type="checkbox" name="multa_pagada_${multaId}" value="true" data-id="${multaId}" class="multa-pagada">
                        Pagada por adelantado
                    </label>`


            multasDict[m._id] = label;
            multasById[m._id] = m;

            cont.appendChild(div);
        });

        document.querySelectorAll(".btn-pagar").forEach(btn => {
            btn.addEventListener("click", async e => {
                const id = e.target.dataset.id;
                pagarMulta(id);
            });
        });

    } catch (e) {
        console.error("Error cargando multas:", e);
    }
}


function getSelectedViolationIds() {
    const checkboxesMarcados = document.querySelectorAll('#multas-container input[type="checkbox"]:checked');

    console.log("Checkboxes marcados:", checkboxesMarcados);

    const multasSeleccionadas = [];

    checkboxesMarcados.forEach(checkbox => {
        const id = checkbox.dataset.id;
        const name = checkbox.name;

        let opcion;
        if (name.startsWith('multa_pagada_')) {
            opcion = 'adelantado'; 
        } else if (name.startsWith('multa_seleccionada_')) {
            opcion = 'seleccionar'; 
        } else {
            return; 
        }

    
        let multaExistente = multasSeleccionadas.find(m => m.id === id);

        if (!multaExistente) {
            multaExistente = {
                id: id,
                opciones: []
            };
            multasSeleccionadas.push(multaExistente);
        }

        multaExistente.opciones.push(opcion);
    });

    return multasSeleccionadas;
}