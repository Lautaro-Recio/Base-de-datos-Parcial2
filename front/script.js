let lista;

document.addEventListener('DOMContentLoaded', function () { // Al cargar la pagina
    const tableBody = document.getElementById('tableBody'); // Obtiene el elemento tableBody
    const contextMenu = document.getElementById('contextMenu'); // Obtiene el elemento contextMenu
    const addBtn = document.getElementById('addBtn'); // Obtiene el elemento addBtn
    const recordModal = document.getElementById('recordModal'); // Obtiene el elemento recordModal
    const recordForm = document.getElementById('recordForm'); // Obtiene el elemento recordForm
    const cancelBtn = document.getElementById('cancelBtn'); // Obtiene el elemento cancelBtn
    const modalTitle = document.getElementById('modalTitle'); // Obtiene el elemento modalTitle

    let selectedRow = null; // Selecciona la fila seleccionada

    //Crea las distintias colecciones
    let datos = []; 
    let multasDict = {}; 
    let multasById = {};
    
    populateViolationsSelect(); // Llama a la funcion populateViolationsSelect que llena el select de infracciones

    async function loadConductores() { //Carga los conductores
        try {
            const data = await conductores(); // obtiene los conductores
            lista = await multas(); // obtiene las multas
            datos = data.map(c => ({ // crea un array de conductores
                id: c._id,
                nombre: c.nombre ?? '',
                apellido: c.apellido ?? '',
                dni: c.dni ?? '',
                telefono: c.telefono ?? '',
                patente: c.patente ?? '',           
                multas: (c.infracciones || [])
            }));
            displayRecords(); // Muestra los conductores
        } catch (e) { console.error('Error cargando conductores:', e); }
    }
    loadConductores();


    function displayRecords(searchTerm = '') { // grafica los conductores
        tableBody.innerHTML = ''; //limpia la tabla

        datos.forEach(record => { //recorre el array de conductores
            const row = document.createElement('tr'); //crea una fila
            row.setAttribute('data-id', record.id); //asigna el id del conductor

            const labels = Array.isArray(record.multas)     //si el conductor tiene infracciones
                ? record.multas.map(id => multasDict[String(id)] || String(id)) //obtiene el nombre de la infraccion
                : [];
            const violationsList = labels.length
                ? labels.map(lbl => `<li>${lbl}</li>`).join('') //crea una lista de infracciones
                : '';

            row.innerHTML = `
                <td>${record.nombre || ''}</td>
                <td>${record.apellido || ''}</td>
                <td>${record.dni || ''}</td>
                <td>${record.telefono || ''}</td>
                <td>${record.patente || ''}</td>
                <td>${violationsList ? `Posee infracciones` : 'No posee infracciones'}</td>
            `; //arma la fila y la agrega a la tabla
            tableBody.appendChild(row);
        });

        const viewFinesBtn = document.getElementById('viewFinesBtn'); //obtiene el boton de ver multas
        if (viewFinesBtn) { //si existe el boton
            viewFinesBtn.addEventListener('click', function () { //agrega un evento al boton
                if (!selectedRow) return; //si no hay una fila seleccionada, sale

                // si hay una fila seleccionada hace lo siguiente

                const id = selectedRow.dataset.id; //obtiene el id de la fila seleccionada
                const conductor = datos.find(r => String(r.id) === String(id)); //busca el conductor con el id seleccionado
                const container = document.getElementById('fines-container'); //obtiene el contenedor de las multas
                const tbody = document.getElementById('fines-tbody'); //obtiene el tbody de las multas
                if (!conductor || !container || !tbody) return; //si no hay conductor, contenedor o tbody, sale

                const multas = lista; // lista de multas
                const rows = conductor.multas.map(mid => {  
                    console.log(conductor.multas) 
                    const multa = multas.find(m => String(m._id) === String(mid.multa));
                    return { // retorna un objeto con la multa
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
    window.displayRecords = displayRecords; // agrega la funcion displayRecords al objeto window

    tableBody.addEventListener('contextmenu', function (e) { // agrega un evento al tableBody
        e.preventDefault(); // evita que el evento se propague
        const row = e.target.closest('tr'); // obtiene la fila seleccionada
        if (!row) return; // si no hay fila seleccionada, sale

        selectedRow = row; // selecciona la fila

        const x = e.clientX; // obtiene la coordenada x del cursor
        const y = e.clientY; // obtiene la coordenada y del cursor

        contextMenu.style.display = 'block'; // muestra el menu contextual (Actualizar, Ver multas y Borrar)

        const menuWidth = contextMenu.offsetWidth; // obtiene el ancho del menu contextual
        const menuHeight = contextMenu.offsetHeight; // obtiene el alto del menu contextual
        const windowWidth = window.innerWidth; // obtiene el ancho de la ventana
        const windowHeight = window.innerHeight; // obtiene el alto de la ventana

        contextMenu.style.left = (x + menuWidth > windowWidth) ? `${windowWidth - menuWidth - 5}px` : `${x}px`;
        contextMenu.style.top = (y + menuHeight > windowHeight) ? `${windowHeight - menuHeight - 5}px` : `${y}px`;
    });

    document.addEventListener('click', function () {
        contextMenu.style.display = 'none'; // oculta el menu contextual
    });

    contextMenu.addEventListener('click', function (e) {
        e.stopPropagation(); //evita que el evento se propague
    });

    document.getElementById('updateBtn').addEventListener('click', async function () {
        if (!selectedRow) return; // si no hay fila seleccionada, sale
        const id = selectedRow.dataset.id; // obtiene el id de la fila seleccionada
        const record = datos.find(r => String(r.id) === String(id));

        if (record) { // si hay registro
            const setVal = (elId, val) => {
                const el = document.getElementById(elId); // obtiene el elemento
                if (el) el.value = val ?? '';
            };

            document.getElementById('recordId').value = record.id; // asigna el id del registro
            setVal('nombre', record.nombre); // asigna el nombre del registro
            setVal('apellido', record.apellido); // asigna el apellido del registro
            setVal('dni', record.dni); // asigna el dni del registro
            setVal('telefono', record.telefono); // asigna el telefono del registro
            setVal('patente', record.patente); // asigna la patente del registro

            await populateViolationsSelect(); // pobla el select de infracciones

            const violationsSelect = document.getElementById('multas'); // obtiene el select de infracciones
            if (violationsSelect) { // si hay select de infracciones
                const selectedMultas = Array.isArray(record.multas) ? // si el registro tiene infracciones
                    record.multas.map(m => String(m.multa || m)) : [];

                Array.from(violationsSelect.options).forEach(option => { // recorre el select de infracciones
                    option.selected = selectedMultas.includes(String(option.value)); // selecciona las infracciones
                });

                console.log('Multas seleccionadas:', selectedMultas); // muestra las infracciones seleccionadas
            }

            modalTitle.textContent = 'Actualizar Registro';
            recordModal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }

        contextMenu.style.display = 'none';
    });

    const deleteModal = document.getElementById('deleteModal'); // obtiene el modal de eliminacion
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn'); // obtiene el boton de confirmacion de eliminacion
    const cancelDeleteBtn = document.getElementById('cancelDeleteBtn'); // obtiene el boton de cancelacion de eliminacion
    const closeModalBtn = document.querySelector('.close-modal'); // obtiene el boton de cierre de modal

    function showDeleteModal() {
        deleteModal.style.display = 'flex'; // muestra el modal de eliminacion
        setTimeout(() => deleteModal.classList.add('show'), 10);
    }

    function hideDeleteModal() {
        deleteModal.classList.remove('show'); // oculta el modal de eliminacion quita
        setTimeout(() => {
            deleteModal.style.display = 'none'; // oculta el modal de eliminacion sacandole la clase show
        }, 300);
    }

    document.getElementById('deleteBtn').addEventListener('click', function () {
        if (!selectedRow) return;
        showDeleteModal(); // llama a la funcion que muestra el modal de eliminacion
    });

    confirmDeleteBtn.addEventListener('click', function () { //llama a la funcion que confirma la eliminacion
        if (!selectedRow) return

        const id = selectedRow.dataset.id
        eliminarConductor(id) // llama a la funcion que elimina el conductor
        displayRecords() // se refrescan los registros
        showNotification('Registro eliminado correctamente', 'success'); // muestra una notificacion de exito
        loadConductores() // se refrescan los conductores
        hideDeleteModal() // oculta el modal de eliminacion
        contextMenu.style.display = 'none' // oculta el menu contextual
    });

    cancelDeleteBtn.addEventListener('click', hideDeleteModal); // llama a la funcion que oculta el modal de eliminacion
    closeModalBtn.addEventListener('click', hideDeleteModal); // llama a la funcion que oculta el modal de eliminacion

    deleteModal.addEventListener('click', function (e) {
        if (e.target === deleteModal) {
            hideDeleteModal();
        }
    });

    function showNotification(message, type = 'info') { // Muestra una alerta o notificacion
        const existingNotifications = document.querySelectorAll('.notification'); // Obtiene todas las notificaciones
        existingNotifications.forEach(notif => {
            notif.classList.remove('show'); // Oculta la notificacion
            setTimeout(() => notif.remove(), 300); // Elimina la notificacion
        });

        const notification = document.createElement('div'); // Crea un div para la notificacion
        notification.className = `notification ${type}`; // Agrega la clase notification y el tipo de notificacion

        const messageContainer = document.createElement('div'); // Crea un div para el mensaje
        messageContainer.className = 'notification-message'; // Agrega la clase notification-message
        messageContainer.textContent = message; // Agrega el mensaje

        notification.appendChild(messageContainer); // Agrega el mensaje al div de la notificacion

        const closeButton = document.createElement('button'); // Crea un boton para cerrar la notificacion
        closeButton.className = 'notification-close'; // Agrega la clase notification-close
        closeButton.innerHTML = '&times;'; // Agrega el texto del boton
        closeButton.addEventListener('click', () => { // Agrega un evento al boton
            notification.classList.remove('show'); // Oculta la notificacion
            setTimeout(() => notification.remove(), 300); // Elimina la notificacion
        });

        notification.appendChild(closeButton); // Agrega el boton al div de la notificacion
        document.body.appendChild(notification); // Agrega la notificacion al body

        void notification.offsetWidth;

        notification.classList.add('show');

        let timeoutId = setTimeout(() => { // Agrega un timeout para cerrar la notificacion
            notification.classList.remove('show'); // Oculta la notificacion
            setTimeout(() => notification.remove(), 300); // Elimina la notificacion
        }, 4000);

        notification.addEventListener('mouseenter', () => { // Agrega un evento al div de la notificacion, Detecta cuando el mouse entra dentro de la notificación.
            clearTimeout(timeoutId); // Limpia el timeout
        });

        notification.addEventListener('mouseleave', () => { // Agrega un evento al div de la notificacion, Detecta cuando el mouse sale de la notificación.
            timeoutId = setTimeout(() => { // Agrega un timeout para cerrar la notificacion
                notification.classList.remove('show'); // Oculta la notificacion
                setTimeout(() => notification.remove(), 300); // Elimina la notificacion
            }, 1000); // Cierra la notificacion despues de 1 segundo
        });
    }

    addBtn.addEventListener('click', async function () { // Agrega un evento al boton de agregar
        document.getElementById('recordForm').reset(); // Resetea el formulario
        document.getElementById('recordId').value = '';
        await populateViolationsSelect(); // Rellena el select de infracciones
        modalTitle.textContent = 'Agregar Nuevo Registro'; // Cambia el titulo del modal
        recordModal.style.display = 'flex'; // Muestra el modal
        document.body.style.overflow = 'hidden'; // Oculta el scroll
    });

    function closeModal() { // Cierra el modal
        recordModal.style.display = 'none';
        document.body.style.overflow = ''; 
    }

    cancelBtn.addEventListener('click', closeModal); // Cierra el modal

    window.addEventListener('click', function (e) { // Si clickea fuera del modal se cierra
        if (e.target === recordModal) {
            closeModal();
        }
    });

    document.addEventListener('keydown', function (e) { // Cierra el modal si se presiona la tecla escape
        if (e.key === 'Escape' && recordModal.style.display === 'flex') {
            closeModal();
        }
    });

    recordForm.addEventListener('submit', function (e) { // Agrega un evento al formulario
        e.preventDefault(); // Previene el comportamiento por defecto del formulario

        const id = document.getElementById('recordId').value; // Obtiene el id del formulario
        const getSelectedMultaIds = getSelectedViolationIds(); // Obtiene las infracciones seleccionadas
        console.log(getSelectedMultaIds)
        const multasSeleccionadasConEstado = getSelectedMultaIds.map(multa => {
            let estado = "Por pagar"; // Por defecto, el estado es "Por pagar"
            if (multa.opciones.includes("adelantado")) { // Si la multa tiene la opcion "adelantado"
                estado = "Pagada por adelantado"; // El estado es "Pagada por adelantado"
            }

            return {
                multa: multa.id,
                estado: estado
            };
        });
        console.log(multasSeleccionadasConEstado)
        const record = { // Crea un objeto con los datos del formulario
            nombre: document.getElementById('nombre').value.trim(), // Obtiene el nombre del formulario y elimina los espacios en blanco con trim
            apellido: document.getElementById('apellido').value.trim(), // Obtiene el apellido del formulario y elimina los espacios en blanco con trim
            dni: document.getElementById('dni').value.trim(), // Obtiene el dni del formulario y elimina los espacios en blanco con trim
            telefono: document.getElementById('telefono').value.trim(), // Obtiene el telefono del formulario y elimina los espacios en blanco con trim
            patente: document.getElementById('patente').value.trim(), // Obtiene la patente del formulario y elimina los espacios en blanco con trim
            infracciones: multasSeleccionadasConEstado, // Obtiene las infracciones seleccionadas
        };


        if (id) { // Si hay un id, es porque se esta editando un registro
            updateConductores(id, record) // Actualiza el registro
            loadConductores(); // Carga los conductores

            showNotification('Registro actualizado correctamente', 'success'); // Muestra una notificacion de exito
        } else { // Si no hay un id, es porque se esta agregando un nuevo registro
            postConductores(record) // Agrega un nuevo registro
            loadConductores(); // Carga los conductores

            showNotification('Conductor agregado correctamente', 'success'); // Muestra una notificacion de exito
        }

        displayRecords(); // Actualiza los conductores
        closeModal(); // Cierra el modal
    });

    displayRecords(); // Muestra los conductores

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


const API_URL = "http://localhost:3000"; // URL de la API

//El método fetch() es una función nativa de JavaScript que sirve para hacer peticiones HTTP desde el navegador

const conductores = async () => {
    const resp = await fetch(`${API_URL}/conductores`); // Obtiene a todos los conductores
    if (!resp.ok) { // si no responde
        const msg = await resp.text().catch(() => ''); // Muestra un mensaje de error 
        throw new Error(`Error ${resp.status}: ${msg || 'No se pudieron obtener los conductores'}`); // Lanza un error
    }
    return resp.json(); // Retorna los conductores
};

async function postConductores(record) { // Agrega un nuevo conductor
    const resp = await fetch(`${API_URL}/conductores`, {
        method: 'POST', // Indica que es un POST
        headers: { 'Content-Type': 'application/json' }, // Indica que el contenido es JSON
        body: JSON.stringify({ // Convierte el objeto a JSON
            nombre: record.nombre, // Nombre del conductor
            apellido: record.apellido, // Apellido del conductor
            dni: record.dni, // DNI del conductor
            telefono: record.telefono, // Telefono del conductor
            patente: record.patente, // Patente del conductor
            infracciones: record.infracciones
        })
    });
    if (!resp.ok) throw new Error('No se pudo agregar el conductor');
    return resp.json();
}

async function eliminarConductor(id) { // Elimina un conductor
    const resp = await fetch(`${API_URL}/conductores/${id}`, { method: 'DELETE' }); //Hace la peticion para eliminar un conductor
    if (!resp.ok) { // Si no responde
        const err = await resp.text().catch(() => ''); // Muestra un mensaje de error 
        throw new Error(`No se pudo borrar el conductor: ${resp.status} ${err}`); // Lanza un error
    }
    return resp.json() // si no retorna el conductor eliminado
}

async function updateConductores(id, params) { // Actualiza el conductor
    const resp = await fetch(`${API_URL}/conductores/${id}`, {
        method: 'PUT', // Indica que es un PUT, osea una actualizacion
        headers: {
            'Content-Type': 'application/json' // Indica que el contenido es JSON
        },
        body: JSON.stringify(params) // Convierte el objeto a JSON
    });
    if (!resp.ok) throw new Error('No se pudo actualizar el conductor'); // Si no responde
    return resp.json(); // Retorna el conductor actualizado
}



const multas = async () => {
    const resp = await fetch(`${API_URL}/multas`); // Obtiene a todas las multas
    if (!resp.ok) { // Si no responde
        const msg = await resp.text().catch(() => ''); // Muestra un mensaje de error 
        throw new Error(`Error ${resp.status}: ${msg || 'No se pudieron obtener las multas'}`); // Lanza un error
    }
    return resp.json(); // Retorna las multas
};

let multasDict = {}; // Objeto de multas
let multasById = {}; // Objeto de multas por id

async function populateViolationsSelect() {
    try {
        const cont = document.getElementById('multas-container'); // Obtiene el contenedor de las multas
        if (!cont) return; // Si no existe el contenedor, retorna

        if (!lista || lista.length === 0) { // Si no hay lista o la lista esta vacia
            lista = await multas(); // Obtiene las multas
        }

        multasDict = {};
        multasById = {};

        cont.innerHTML = '';

        lista.forEach(m => {
            const label = m.motivo ? m.motivo : (m.tipo ?? "Multa"); // Obtiene el motivo de la multa
            const multaId = m._id; // Obtiene el id de la multa

            const div = document.createElement("div"); // Crea un div
            div.classList.add("multa-item"); // Agrega la clase multa-item

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


            multasDict[m._id] = label; // Agrega la multa al diccionario
            multasById[m._id] = m; // Agrega la multa al diccionario por id

            cont.appendChild(div); // Agrega el div al contenedor
        });

        document.querySelectorAll(".btn-pagar").forEach(btn => {
            btn.addEventListener("click", async e => { // Agrega un evento al boton pagar
                const id = e.target.dataset.id;
                pagarMulta(id); // Paga la multa
            });
        });

    } catch (e) {
        console.error("Error cargando multas:", e);
    }
}


function getSelectedViolationIds() { // Obtiene los ids de las multas seleccionadas
    const checkboxesMarcados = document.querySelectorAll('#multas-container input[type="checkbox"]:checked'); // Obtiene los checkboxes marcados

    console.log("Checkboxes marcados:", checkboxesMarcados);

    const multasSeleccionadas = []; // Array de multas seleccionadas

    checkboxesMarcados.forEach(checkbox => { // Recorre los checkboxes marcados
        const id = checkbox.dataset.id; // Obtiene el id de la multa
        const name = checkbox.name; // Obtiene el nombre del checkbox

        let opcion;
        if (name.startsWith('multa_pagada_')) { // Si el checkbox es de pagada
            opcion = 'adelantado'; 
        } else if (name.startsWith('multa_seleccionada_')) { // Si el checkbox es de seleccionada
            opcion = 'seleccionar'; 
        } else {
            return; 
        }

    // Busca si la multa ya existe en el array
        let multaExistente = multasSeleccionadas.find(m => m.id === id); // Busca si la multa ya existe en el array

        if (!multaExistente) { // Si no existe
            multaExistente = {
                id: id,
                opciones: []
            };
            multasSeleccionadas.push(multaExistente);
        }

        multaExistente.opciones.push(opcion); // Agrega la opcion al array de opciones
    });

    return multasSeleccionadas;
}