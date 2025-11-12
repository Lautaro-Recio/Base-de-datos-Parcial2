document.addEventListener('DOMContentLoaded', function() {
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
    let records = JSON.parse(localStorage.getItem('records')) || [];
    let nextId = records.length > 0 ? Math.max(...records.map(r => r.id)) + 1 : 1;

    // Función para verificar si un registro coincide con el término de búsqueda
    function recordMatchesSearch(record, searchTerm) {
        if (!searchTerm) return true;
        
        const searchableText = [
            record.license || '',
            record.name || '',
            record.lastname || '',
            record.dni || '',
            record.phone || '',
            record.vehicle || '',
            record.status || '',
            Array.isArray(record.violations) ? record.violations.join(' ') : ''
        ].join(' ').toLowerCase();
        
        return searchableText.includes(searchTerm.toLowerCase());
    }

    // Mostrar registros en la tabla
    function displayRecords(searchTerm = '') {
        tableBody.innerHTML = '';
        
        const filteredRecords = searchTerm 
            ? records.filter(record => recordMatchesSearch(record, searchTerm))
            : records;
            
        if (filteredRecords.length === 0) {
            const row = document.createElement('tr');
            row.innerHTML = '<td colspan="8" style="text-align: center; padding: 20px;">No se encontraron conductores que coincidan con la búsqueda</td>';
            tableBody.appendChild(row);
            return;
        }
            
        filteredRecords.forEach(record => {
            const row = document.createElement('tr');
            row.setAttribute('data-id', record.id);
            
            // Formatear lista de infracciones
            const violationsList = Array.isArray(record.violations) 
                ? record.violations.map(v => `<li>${v.replace(/_/g, ' ').replace(/\w\S*/g, txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase())}</li>`).join('')
                : '';
            
            // Determinar clase de estado
            const statusClass = `status-${record.status || 'habilitado'}`;
            const statusText = record.status ? record.status.charAt(0).toUpperCase() + record.status.slice(1) : 'Habilitado';
            
            row.innerHTML = `
                <td>${escapeHtml(record.license || '')}</td>
                <td>${escapeHtml(record.name || '')}</td>
                <td>${escapeHtml(record.lastname || '')}</td>
                <td>${escapeHtml(record.dni || '')}</td>
                <td>${escapeHtml(record.phone || '')}</td>
                <td>${escapeHtml(record.vehicle || '')}</td>
                <td>${violationsList ? `<ul class="violation-list">${violationsList}</ul>` : 'Ninguna'}</td>
                <td><span class="status-badge ${statusClass}">${statusText}</span></td>
            `;
            tableBody.appendChild(row);
        });
    }

    // Escapar HTML para prevenir XSS
    function escapeHtml(unsafe) {
        return unsafe
            .toString()
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    // Mostrar el menú contextual al hacer clic derecho
    tableBody.addEventListener('contextmenu', function(e) {
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
    document.addEventListener('click', function() {
        contextMenu.style.display = 'none';
    });

    // Prevenir que el menú contextual se cierre al hacer clic en él
    contextMenu.addEventListener('click', function(e) {
        e.stopPropagation();
    });

    // Manejar clic en el botón Actualizar
    document.getElementById('updateBtn').addEventListener('click', function() {
        if (!selectedRow) return;
        const id = parseInt(selectedRow.getAttribute('data-id'));
        const record = records.find(r => r.id === id);
        
        if (record) {
            // Llenar el formulario con los datos del registro
            document.getElementById('recordId').value = record.id;
            document.getElementById('license').value = record.license || '';
            document.getElementById('name').value = record.name || '';
            document.getElementById('lastname').value = record.lastname || '';
            document.getElementById('dni').value = record.dni || '';
            document.getElementById('phone').value = record.phone || '';
            document.getElementById('vehicle').value = record.vehicle || '';
            
            // Establecer las infracciones seleccionadas
            const violationsSelect = document.getElementById('violations');
            Array.from(violationsSelect.options).forEach(option => {
                option.selected = record.violations && record.violations.includes(option.value);
            });
            
            // Establecer el estado
            if (record.status) {
                document.getElementById('status').value = record.status;
            }
            
            // Mostrar el modal
            modalTitle.textContent = 'Actualizar Registro';
            recordModal.style.display = 'flex';
            document.body.style.overflow = 'hidden'; // Prevenir scroll
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
    document.getElementById('deleteBtn').addEventListener('click', function() {
        if (!selectedRow) return;
        showDeleteModal();
    });

    // Confirmar eliminación
    confirmDeleteBtn.addEventListener('click', function() {
        if (!selectedRow) return;
        
        const id = parseInt(selectedRow.getAttribute('data-id'));
        records = records.filter(r => r.id !== id);
        localStorage.setItem('records', JSON.stringify(records));
        displayRecords();
        showNotification('Registro eliminado correctamente', 'success');
        hideDeleteModal();
        contextMenu.style.display = 'none';
    });

    // Cancelar eliminación
    cancelDeleteBtn.addEventListener('click', hideDeleteModal);
    closeModalBtn.addEventListener('click', hideDeleteModal);

    // Cerrar modal al hacer clic fuera del contenido
    deleteModal.addEventListener('click', function(e) {
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
    addBtn.addEventListener('click', function() {
        document.getElementById('recordForm').reset();
        document.getElementById('recordId').value = '';
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
    window.addEventListener('click', function(e) {
        if (e.target === recordModal) {
            closeModal();
        }
    });

    // Cerrar modal con la tecla Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && recordModal.style.display === 'flex') {
            closeModal();
        }
    });

    // Manejar envío del formulario
    recordForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const id = document.getElementById('recordId').value;
        const selectedViolations = Array.from(document.getElementById('violations').selectedOptions)
            .map(option => option.value);
        
        const record = {
            id: id ? parseInt(id) : nextId++,
            license: document.getElementById('license').value.trim(),
            name: document.getElementById('name').value.trim(),
            lastname: document.getElementById('lastname').value.trim(),
            dni: document.getElementById('dni').value.trim(),
            phone: document.getElementById('phone').value.trim(),
            vehicle: document.getElementById('vehicle').value.trim(),
            violations: selectedViolations,
            status: document.getElementById('status').value
        };

        // Validar DNI (solo números)
        if (!/^\d+$/.test(record.dni)) {
            showNotification('El DNI debe contener solo números', 'error');
            return;
        }

        // Validar patente (formato básico)
        if (!/^[A-Z]{2,3}\s?\d{3,4}$/i.test(record.vehicle)) {
            showNotification('Ingrese una patente válida (ej: AB 123 CD o ABC 123)', 'error');
            return;
        }

        if (id) {
            // Actualizar registro existente
            const index = records.findIndex(r => r.id === parseInt(id));
            if (index !== -1) {
                records[index] = record;
                showNotification('Registro actualizado correctamente', 'success');
            }
        } else {
            // Agregar nuevo registro
            records.push(record);
            showNotification('Conductor agregado correctamente', 'success');
        }

        // Ordenar registros por apellido y nombre
        records.sort((a, b) => {
            const nameA = `${a.lastname} ${a.name}`.toUpperCase();
            const nameB = `${b.lastname} ${b.name}`.toUpperCase();
            return nameA.localeCompare(nameB);
        });
        
        // Guardar en localStorage
        localStorage.setItem('records', JSON.stringify(records));
        
        // Actualizar la tabla y cerrar el modal
        displayRecords();
        closeModal();
    });

    // Formatear patente para mostrar en mayúsculas
    document.getElementById('vehicle').addEventListener('input', function(e) {
        this.value = this.value.toUpperCase().replace(/[^A-Z0-9\s]/g, '');
    });
    
    // Formatear DNI para mostrar solo números
    document.getElementById('dni').addEventListener('input', function(e) {
        this.value = this.value.replace(/\D/g, '');
    });
    
    // Formatear teléfono
    document.getElementById('phone').addEventListener('input', function(e) {
        this.value = this.value.replace(/\D/g, '');
        if (this.value.length > 10) {
            this.value = this.value.slice(0, 10);
        }
    });

    // Inicializar la tabla al cargar la página
    displayRecords();
    
    // Manejar búsqueda
    const searchInput = document.getElementById('searchInput');
    let searchTimeout;
    
    searchInput.addEventListener('input', function(e) {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            displayRecords(e.target.value.trim());
        }, 300);
    });
    
    // Permitir limpiar la búsqueda con la tecla Escape
    searchInput.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            this.value = '';
            displayRecords('');
        }
    });
});
