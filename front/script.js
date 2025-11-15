let lista;

document.addEventListener('DOMContentLoaded', function () {
    // Elementos del DOM
    const tableBody = document.getElementById('tableBody');
    const contextMenu = document.getElementById('contextMenu');
    const addBtn = document.getElementById('addBtn');
    const recordModal = document.getElementById('recordModal');
    const recordForm = document.getElementById('recordForm');
    const cancelBtn = document.getElementById('cancelBtn');
    const modalTitle = document.getElementById('modalTitle');

    // Variables de estado
    let selectedRow = null;
    // al inicio, dentro del primer DOMContentLoaded:
    let datos = [];
    let multasDict = {}; // id -> etiqueta
    let multasById = {}; // id -> objeto multa completo
    populateViolationsSelect();

    // Cargar conductores desde backend y renderizar
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
                patente: c.patente ?? '',            // usa c.patente (cambiaste el modelo)
                multas: (c.infracciones || [])// array de IDs
            }));
            displayRecords();
        } catch (e) { console.error('Error cargando conductores:', e); }
    }

    // llamada inicial
    loadConductores();


    function displayRecords(searchTerm = '') {
        tableBody.innerHTML = '';

        datos.forEach(record => {
            const row = document.createElement('tr');
            row.setAttribute('data-id', record.id);

            // Formatear lista de infracciones
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

        // Manejar clic en "Ver infracciones"
        const viewFinesBtn = document.getElementById('viewFinesBtn');
        if (viewFinesBtn) {
            viewFinesBtn.addEventListener('click', function () {
                if (!selectedRow) return;
                const id = selectedRow.dataset.id;
                const conductor = datos.find(r => String(r.id) === String(id));
                const container = document.getElementById('fines-container');
                const tbody = document.getElementById('fines-tbody');
                if (!conductor || !container || !tbody) return;

                // Compatibilidad: puede venir como subdocs (infracciones) o como IDs en multas
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

    // Mostrar el menú contextual al hacer clic derecho
    tableBody.addEventListener('contextmenu', function (e) {
        e.preventDefault();
        const row = e.target.closest('tr');
        if (!row) return;

        selectedRow = row;

        // Posicionar el menú contextual
        const x = e.clientX;
        const y = e.clientY;

        contextMenu.style.display = 'block';

        // Asegurar que el menú no se salga de la pantalla
        const menuWidth = contextMenu.offsetWidth;
        const menuHeight = contextMenu.offsetHeight;
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;

        contextMenu.style.left = (x + menuWidth > windowWidth) ? `${windowWidth - menuWidth - 5}px` : `${x}px`;
        contextMenu.style.top = (y + menuHeight > windowHeight) ? `${windowHeight - menuHeight - 5}px` : `${y}px`;
    });

    // Ocultar menú contextual al hacer clic en otra parte
    document.addEventListener('click', function () {
        contextMenu.style.display = 'none';
    });

    // Prevenir que el menú contextual se cierre al hacer clic en él
    contextMenu.addEventListener('click', function (e) {
        e.stopPropagation();
    });

    // Manejar clic en el botón Actualizar
    document.getElementById('updateBtn').addEventListener('click', async function () {
        if (!selectedRow) return;
        const id = selectedRow.dataset.id; // ObjectId string
        // Fuente de datos actual
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

            // Asegurarse de que las multas estén cargadas
            await populateViolationsSelect();

            const violationsSelect = document.getElementById('multas');
            if (violationsSelect) {
                // Obtener los IDs de las multas seleccionadas
                const selectedMultas = Array.isArray(record.multas) ?
                    record.multas.map(m => String(m.multa || m)) : [];

                // Marcar las opciones seleccionadas
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

    // Elementos del modal de confirmación
    const deleteModal = document.getElementById('deleteModal');
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
    const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
    const closeModalBtn = document.querySelector('.close-modal');

    // Función para mostrar el modal de confirmación
    function showDeleteModal() {
        deleteModal.style.display = 'flex';
        setTimeout(() => deleteModal.classList.add('show'), 10);
    }

    // Función para ocultar el modal de confirmación
    function hideDeleteModal() {
        deleteModal.classList.remove('show');
        setTimeout(() => {
            deleteModal.style.display = 'none';
        }, 300);
    }

    // Manejar clic en el botón Eliminar
    document.getElementById('deleteBtn').addEventListener('click', function () {
        if (!selectedRow) return;
        showDeleteModal();
    });

    // Confirmar eliminación
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

    // Cancelar eliminación
    cancelDeleteBtn.addEventListener('click', hideDeleteModal);
    closeModalBtn.addEventListener('click', hideDeleteModal);

    // Cerrar modal al hacer clic fuera del contenido
    deleteModal.addEventListener('click', function (e) {
        if (e.target === deleteModal) {
            hideDeleteModal();
        }
    });

    // Mostrar notificación mejorada
    function showNotification(message, type = 'info') {
        // Eliminar notificaciones existentes para evitar superposición
        const existingNotifications = document.querySelectorAll('.notification');
        existingNotifications.forEach(notif => {
            notif.classList.remove('show');
            setTimeout(() => notif.remove(), 300);
        });

        // Crear elemento de notificación
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;

        // Crear contenedor de mensaje
        const messageContainer = document.createElement('div');
        messageContainer.className = 'notification-message';
        messageContainer.textContent = message;

        // Agregar mensaje a la notificación
        notification.appendChild(messageContainer);

        // Agregar botón de cierre
        const closeButton = document.createElement('button');
        closeButton.className = 'notification-close';
        closeButton.innerHTML = '&times;';
        closeButton.addEventListener('click', () => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        });

        notification.appendChild(closeButton);
        document.body.appendChild(notification);

        // Forzar reflow para permitir la transición
        void notification.offsetWidth;

        // Mostrar notificación con animación
        notification.classList.add('show');

        // Configurar tiempo de cierre automático
        let timeoutId = setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 4000);

        // Pausar el cierre automático al hacer hover
        notification.addEventListener('mouseenter', () => {
            clearTimeout(timeoutId);
        });

        // Reanudar cuenta regresiva al salir del hover
        notification.addEventListener('mouseleave', () => {
            timeoutId = setTimeout(() => {
                notification.classList.remove('show');
                setTimeout(() => notification.remove(), 300);
            }, 1000);
        });
    }

    // Mostrar modal para agregar nuevo registro
    addBtn.addEventListener('click', async function () {
        document.getElementById('recordForm').reset();
        document.getElementById('recordId').value = '';
        // Asegurarse de que las multas estén cargadas
        await populateViolationsSelect();
        modalTitle.textContent = 'Agregar Nuevo Registro';
        recordModal.style.display = 'flex';
        document.body.style.overflow = 'hidden'; // Prevenir scroll
    });

    // Cerrar modal
    function closeModal() {
        recordModal.style.display = 'none';
        document.body.style.overflow = ''; // Restaurar scroll
    }

    // Cerrar modal al hacer clic en Cancelar
    cancelBtn.addEventListener('click', closeModal);

    // Cerrar modal al hacer clic fuera del contenido
    window.addEventListener('click', function (e) {
        if (e.target === recordModal) {
            closeModal();
        }
    });

    // Cerrar modal con la tecla Escape
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && recordModal.style.display === 'flex') {
            closeModal();
        }
    });

    // Manejar envío del formulario
    recordForm.addEventListener('submit', function (e) {
        e.preventDefault();

        const id = document.getElementById('recordId').value;
        const getSelectedMultaIds = getSelectedViolationIds();
        console.log(getSelectedMultaIds)
        const multasSeleccionadasConEstado = getSelectedMultaIds.map(multa => {
            let estado = "Por pagar"; // Estado por defecto si solo se marcó "seleccionar"

            if (multa.opciones.includes("adelantado")) {
                estado = "Pagada por adelantado";
            }

            return {
                multa: multa.id, // Se renombra a 'multa' para coincidir con el Schema (type: ObjectId, ref: "Multa")
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
            // Agregar nuevo registro
            postConductores(record)
            loadConductores();

            showNotification('Conductor agregado correctamente', 'success');
        }

        // Actualizar la tabla y cerrar el modal
        displayRecords();
        closeModal();
    });

    // Inicializar la tabla al cargar la página
    displayRecords();

    // Manejar búsqueda
    const searchInput = document.getElementById('searchInput');
    let searchTimeout;

    searchInput.addEventListener('input', function (e) {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            displayRecords(e.target.value.trim());
        }, 300);
    });

    // Permitir limpiar la búsqueda con la tecla Escape
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
    return resp.json(); // opcional, según lo que devuelva tu API
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
            const multaId = m._id; // Almacenamos el ID para usarlo en los names/ids

            const div = document.createElement("div");
            div.classList.add("multa-item");

            // --- MODIFICACIÓN CLAVE: Cambiar 'type="radio"' por 'type="checkbox"' ---
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

        // Eventos de los botones
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
    // 1. Obtener todos los checkboxes marcados dentro del contenedor principal.
    const checkboxesMarcados = document.querySelectorAll('#multas-container input[type="checkbox"]:checked');

    console.log("Checkboxes marcados:", checkboxesMarcados);

    const multasSeleccionadas = [];

    checkboxesMarcados.forEach(checkbox => {
        const id = checkbox.dataset.id;
        const name = checkbox.name;

        // Determinar qué opción se seleccionó
        let opcion;
        if (name.startsWith('multa_pagada_')) {
            opcion = 'adelantado'; // Usar 'adelantado' para coincidir con tu valor original si es necesario
        } else if (name.startsWith('multa_seleccionada_')) {
            opcion = 'seleccionar'; // Usar 'seleccionar' para coincidir con tu valor original si es necesario
        } else {
            return; // Ignorar otros checkboxes que no sigan el patrón
        }

        // 2. Agrupar las opciones por el ID de la multa.
        // Busca si esta multa (por ID) ya fue añadida al array de resultados.
        let multaExistente = multasSeleccionadas.find(m => m.id === id);

        if (!multaExistente) {
            // Si no existe, crea un nuevo objeto para la multa.
            multaExistente = {
                id: id,
                opciones: []
            };
            multasSeleccionadas.push(multaExistente);
        }

        // Agrega la opción seleccionada (pueden ser ambas: 'seleccionar' y 'adelantado').
        multaExistente.opciones.push(opcion);
    });

    // Devuelve un array con objetos que contienen el ID y un array de las opciones seleccionadas.
    return multasSeleccionadas;
}