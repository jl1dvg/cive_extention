// js/content_script.js
(function () {
    // Crear el botón flotante
    const button = document.createElement('button');
    button.id = 'floatingButton';
    button.className = 'actionable-icon';

    // Añadir la imagen del botón
    const img = document.createElement('img');
    img.src = chrome.runtime.getURL('icon.png'); // Asegúrate de que la ruta de la imagen es correcta
    img.alt = 'Icono Flotante';
    button.appendChild(img);

    // Crear el elemento de manejo para arrastrar (tres puntos)
    const dragHandle = document.createElement('div');
    dragHandle.className = 'drag-handle';
    button.appendChild(dragHandle);

    // Añadir el botón al body
    document.body.appendChild(button);

    // Variables para el manejo del arrastre
    let isDragging = false;
    let initialY;
    let currentY = button.getBoundingClientRect().top; // Posición inicial del botón
    let offsetY = 0; // Desplazamiento acumulado

    // Función para iniciar el arrastre
    dragHandle.addEventListener('mousedown', function (e) {
        isDragging = true;
        initialY = e.clientY; // Guardar la posición del cursor
        button.style.transition = 'none';
    });

    // Función para mover el botón
    document.addEventListener('mousemove', function (e) {
        if (isDragging) {
            offsetY = e.clientY - initialY;
            let newTranslateY = currentY + offsetY; // Nueva posición basada en la original más el desplazamiento

            const maxY = window.innerHeight - button.offsetHeight;
            const minY = 0;

            // Asegurarse de que el botón se mantenga dentro de los límites de la pantalla
            newTranslateY = Math.max(minY, Math.min(maxY, newTranslateY));

            button.style.transform = `translateY(${newTranslateY - currentY}px)`;
        }
    });

    // Función para terminar el arrastre
    document.addEventListener('mouseup', function () {
        if (isDragging) {
            isDragging = false;
            currentY += offsetY; // Actualizar la posición actual del botón
            offsetY = 0; // Reiniciar el desplazamiento
            button.style.transition = 'background 100ms ease-out, box-shadow 100ms ease-out'; // Reactiva la transición
        }
    });

    // Crear el contenedor del popup flotante
    const popup = document.createElement('div');
    popup.id = 'floatingPopup';
    popup.innerHTML = `
        <div class="popup-content">
            <div class="popup-header">
                <span>Opciones</span>
                <button class="popup-close-btn" id="popupCloseBtn">&times;</button>
            </div>
            <div id="notificaciones" class="section active">
            <div id="contenedorNotificaciones"></div>
        </div>
            <div id="inicio" class="section active">
    <div class="grid-container">
        <div id="btnExamenes" class="grid-item">
            <i class="fas fa-notes-medical"></i>
            Exámenes
        </div>
        <div id="btnProtocolos" class="grid-item">
            <i class="fas fa-file-alt"></i>
            Protocolos
        </div>
        <div id="btnConsulta" class="grid-item">
            <i class="fas fa-user-md"></i>
            Consulta
        </div>
        <div id="btnRecetas" class="grid-item">
            <i class="fas fa-user-md"></i>
            Recetas
        </div>
        <!-- Añade más botones si es necesario -->
    </div>
</div>
            <div id="examenes" class="section">
                <div class="card">
                    <div class="card-header bg-primary text-white">Exámenes</div>
                    <div class="card-body">
                        <div class="grid-container" id="contenedorExamenes"></div>
                    </div>
                    <div class="card-footer bg-secondary text-white">
                        <button id="btnBackExamenes" class="btn btn-danger">
                            <i class="fas fa-arrow-alt-circle-left"></i> Atrás
                        </button>
                    </div>
                </div>
            </div>
<div id="protocolos" class="section">
    <div class="card">
        <div class="card-header bg-primary text-white d-flex justify-content-between align-items-center">
            <span>Protocolos</span>
        </div>
        <div class="card-body">
            <div class="grid-container" id="contenedorProtocolos"></div>
        </div>
        <div class="card-footer bg-secondary text-white">
            <button id="btnBackProtocolos" class="btn btn-danger">
                <i class="fas fa-arrow-alt-circle-left"></i> Atrás
            </button>
        </div>
    </div>
</div>
<div id="procedimientos" class="section">
    <div class="card">
        <div class="card-header bg-primary text-white">Procedimientos</div>
        <div class="card-body">
            <div class="grid-container" id="contenedorProcedimientos"></div>
        </div>
        <div class="card-footer bg-secondary text-white">
            <button id="btnBackProcedimientos" class="btn btn-danger">
                <i class="fas fa-arrow-alt-circle-left"></i> Atrás
            </button>
            <button id="btnGeneratePDF" class="btn btn-success btn-sm">
                <i class="fas fa-file-pdf"></i> Descargar PDF
            </button>
        </div>
    </div>
</div>
<div id="recetas" class="section">
    <div class="card">
        <div class="card-header bg-primary text-white">Recetas</div>
        <div class="card-body">
            <div class="grid-container" id="contenedorRecetas"></div>
        </div>
        <div class="card-footer bg-secondary text-white">
            <button id="btnBackRecetas" class="btn btn-danger">
                <i class="fas fa-arrow-alt-circle-left"></i> Atrás
            </button>
        </div>
    </div>
</div>
<div id="consulta" class="section">
    <div class="card">
        <div class="card-header bg-primary text-white">Consulta</div>
        <div class="card-body">
            <div class="grid-container">
                <div id="btnConsultaAnterior" class="grid-item">
                    <i class="fas fa-user-md"></i>
                    Consulta Anterior
                </div>
                <div id="btnPOP" class="grid-item">
                    <i class="fas fa-file-alt"></i>
                    Control POP
                </div>
            </div>
        </div>
        <div class="card-footer bg-secondary text-white">
            <button id="btnBackConsulta" class="btn btn-danger">
                <i class="fas fa-arrow-alt-circle-left"></i> Atrás
            </button>
        </div>
    </div>
</div>
        </div>
    `;
    document.body.appendChild(popup);

    // Añadir la funcionalidad draggable al botón
    button.addEventListener('mousedown', function (e) {
        let shiftY = e.clientY - button.getBoundingClientRect().top;

        function moveAt(pageY) {
            button.style.top = pageY - shiftY + 'px';
            button.style.bottom = 'auto'; // Para que no interfiera con el posicionamiento
        }

        function onMouseMove(event) {
            moveAt(event.pageY);
        }

        // Añadir el evento mousemove al document
        document.addEventListener('mousemove', onMouseMove);

        // Eliminar los eventos mousemove y mouseup al soltar el botón
        document.addEventListener('mouseup', function () {
            document.removeEventListener('mousemove', onMouseMove);
        }, {once: true});
    });

    button.ondragstart = function () {
        return false;
    };

    // Función para mostrar y ocultar el popup
    function togglePopup() {
        popup.classList.toggle('active');
        console.log('Toggle popup, estado:', popup.classList.contains('active'));
    }

    // Añadir el evento click al botón flotante para mostrar/ocultar el popup
    button.addEventListener('click', togglePopup);

    // Añadir el evento click al botón de cierre para ocultar el popup
    document.getElementById('popupCloseBtn').addEventListener('click', togglePopup);

    // Añadir la hoja de estilos al documento
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = chrome.runtime.getURL('css/floating_button.css');
    document.head.appendChild(link);

    // Añadir la hoja de estilos del popup al documento
    const popupLink = document.createElement('link');
    popupLink.rel = 'stylesheet';
    popupLink.href = chrome.runtime.getURL('css/floating_popup.css');
    document.head.appendChild(popupLink);

    // Añadir la hoja de estilos de Font Awesome al documento
    const fontAwesomeLink = document.createElement('link');
    fontAwesomeLink.rel = 'stylesheet';
    fontAwesomeLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css';
    document.head.appendChild(fontAwesomeLink);

    // Función para observar la tabla de pacientes y añadir listeners a las filas cuando se carga la página
    function inicializarTablaPacientes() {
        const tabla = document.querySelector('table.kv-grid-table'); // Selector de la tabla

        if (!tabla) {
            return;
        }

        console.log("Tabla de pacientes encontrada. Añadiendo listeners a las filas...");

        // Agregar listeners a las filas ya presentes en la tabla
        const filas = tabla.querySelectorAll('tr[data-key]');
        filas.forEach((fila) => {
            console.log("Añadiendo listener a la fila:", fila); // Depuración: Ver la fila a la que se le añade el listener
            agregarListenerAFila(fila);
        });
    }

    function descomponerNombreCompleto(patientName) {
        const partes = patientName.split(' ');

        // Aseguramos que al menos haya dos apellidos y dos nombres
        const lname = partes[0] || ''; // Primer apellido
        const lname2 = partes[1] || ''; // Segundo apellido
        const fname = partes[2] || ''; // Primer nombre
        const mname = partes[3] || ''; // Segundo nombre

        return {lname, lname2, fname, mname};
    }

    function agregarListenerAFila(fila) {
        fila.addEventListener('click', function () {
            // Extraer los valores de Identificación y Fecha de Caducidad de la fila clickeada
            const patientName = fila.querySelector('td[data-col-seq="8"]')?.textContent.trim();
            const identificacion = fila.querySelector('td[data-col-seq="9"]')?.textContent.trim();
            const afiliacion = fila.querySelector('td[data-col-seq="11"]')?.textContent.trim();
            const procedimiento_proyectado = fila.querySelector('td[data-col-seq="13"]')?.textContent.trim();

            // Extraer el form_id del enlace
            const enlace = fila.querySelector('td[data-col-seq="13"]');
            const form_id = enlace?.getAttribute('onclick')?.match(/id=(\d+)/)?.[1] || null;

            let fechaCaducidad = fila.querySelector('td[data-col-seq="16"]')?.textContent.trim();
            if (!fechaCaducidad || fechaCaducidad === '(no definido)') {
                fechaCaducidad = null;
            }

            const {lname, lname2, fname, mname} = descomponerNombreCompleto(patientName);

            if (identificacion) {
                enviarDatosAHC(identificacion, lname, lname2, fname, mname, afiliacion, procedimiento_proyectado, fechaCaducidad, form_id);
            } else {
                console.warn('Faltan datos necesarios para enviar.');
            }
        });
    }

    function enviarDatosAHC(hcNumber, lname, lname2, fname, mname, afiliacion, procedimiento_proyectado, fechaCaducidad, form_id) {
        const url = 'http://cive.consulmed.me/interface/guardar_datos.php';

        const data = {
            hcNumber, lname, lname2, fname, mname, afiliacion, procedimiento_proyectado, fechaCaducidad, form_id
        };

        fetch(url, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(data),
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    console.log('Datos guardados correctamente.');
                }
            })
            .catch(error => {
                console.error('Error al enviar los datos:', error);
            });
    }

// Llamar a la función para inicializar la tabla cuando el DOM esté completamente cargado
    window.addEventListener('load', inicializarTablaPacientes);

// Función para extraer datos del div y enviar al servidor
    function extraerDatosYEnviar() {
        const div = document.querySelector('.media-body.responsive');

        if (!div) {
            console.warn('No se encontró el div con los datos del paciente.');
            return;
        }

        // Extraer datos básicos del paciente
        const hcNumber = div.querySelector('p:nth-of-type(2)')?.textContent.replace('HC #:', '').trim() || '';
        const fechaNacimiento = div.querySelector('p:nth-of-type(4)')?.textContent.replace('Fecha de Nacimiento:', '').trim() || '';
        const sexo = div.querySelector('p:nth-of-type(6)')?.textContent.trim() || '';
        const celular = div.querySelector('p:nth-of-type(7)')?.textContent.replace('Celular:', '').trim() || '';
        const ciudad = div.querySelector('p:nth-of-type(8)')?.textContent.trim() || '';

        // Validación básica
        if (!hcNumber) {
            console.error('El número de HC es obligatorio.');
            return;
        }

        // Extraer el `idSolicitud` del URL actual
        const urlParams = new URLSearchParams(window.location.search);
        const form_id = urlParams.get('idSolicitud') || 'N/A';
        const fechaActual = new Date().toISOString().slice(0, 10);

        // Extraer valores de los textareas
        const membrete = document.querySelector('#consultasubsecuente-membrete')?.value.trim() || '';
        const dieresis = document.querySelector('#consultasubsecuente-dieresis')?.value.trim() || '';
        const exposicion = document.querySelector('#consultasubsecuente-exposicion')?.value.trim() || '';
        const hallazgo = document.querySelector('#consultasubsecuente-hallazgo')?.value.trim() || '';
        const operatorio = document.querySelector('#consultasubsecuente-operatorio')?.value.trim() || '';
        const complicaciones_operatorio = document.querySelector('#consultasubsecuente-complicacionesoperatorio')?.value.trim() || '';
        const datos_cirugia = document.querySelector('#consultasubsecuente-datoscirugia')?.value.trim() || '';

        // Extraer lateralidad
        const lateralidad = document.querySelector('.list-cell__lateralidadProcedimiento select')?.selectedOptions[0]?.textContent.trim() || '';

        // Extraer fechas y horas
        const fechaInicio = document.querySelector('#consultasubsecuente-fecha_inicio')?.value || '';
        const horaInicio = document.querySelector('#consultasubsecuente-horainicio')?.value || '';
        const fechaFin = document.querySelector('#consultasubsecuente-fecha_fin')?.value || '';
        const horaFin = document.querySelector('#consultasubsecuente-horafin')?.value || '';

        // Extraer tipo de anestesia
        const tipoAnestesia = document.querySelector('#consultasubsecuente-anestesia_id')?.selectedOptions[0]?.textContent || '';

        // Recopilar datos del protocolo
        const protocoloData = {};
        document.querySelectorAll('.multiple-input-list__item').forEach((item) => {
            const funcion = item.querySelector('.list-cell__funcion select')?.selectedOptions[0]?.textContent.trim() || '';
            const doctor = item.querySelector('.list-cell__doctor select')?.selectedOptions[0]?.textContent.trim() || '';

            if (funcion && doctor) {
                protocoloData[funcion.replace(/\s+/g, '_').toLowerCase()] = doctor;
            }
        });

        // Extraer procedimientos
        const procedimientos = [];

        document.querySelectorAll('.multiple-input-list__item').forEach((item) => {
            const procInterno = item.querySelector('.list-cell__procInterno select')?.selectedOptions[0]?.textContent.trim() || '';
            if (procInterno) procedimientos.push({procInterno});
        });

        // Extraer diagnósticos
        const diagnosticos = [];
        document.querySelectorAll('.multiple-input-list__item').forEach((item) => {
            const idDiagnostico = item.querySelector('.list-cell__idDiagnostico select')?.selectedOptions[0]?.textContent.trim() || '';
            const evidencia = item.querySelector('.list-cell__evidencia .cbx-icon')?.textContent.trim() || '';
            const ojo = item.querySelector('.list-cell__ojo_id select')?.selectedOptions[0]?.textContent.trim() || '';
            const observaciones = item.querySelector('.list-cell__observaciones textarea')?.value.trim() || '';

            if (idDiagnostico) {
                diagnosticos.push({idDiagnostico, evidencia, ojo, observaciones});
            }
        });

        // Preparar los datos a enviar
        const data = {
            hcNumber,
            fechaNacimiento,
            sexo,
            celular,
            ciudad,
            form_id,
            fechaActual,
            membrete,
            dieresis,
            exposicion,
            hallazgo,
            operatorio,
            complicaciones_operatorio,
            datos_cirugia,
            lateralidad,
            procedimientos,
            fechaInicio,
            horaInicio,
            fechaFin,
            horaFin,
            tipoAnestesia,
            diagnosticos,
            ...protocoloData,
        };

        console.log('Datos a enviar:', data);

        // Enviar los datos al backend
        fetch('http://cive.consulmed.me/interface/protocolos_datos.php', {
            method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(data),
        })
            .then((response) => response.json())
            .then((result) => {
                if (result.success) {
                    console.log('Datos guardados correctamente.');
                } else {
                    console.error('Error:', result.message);
                }
            })
            .catch((error) => {
                console.error('Error al enviar los datos:', error);
            });
    }

    // Comprobar si el botón "Guardar Toda la Consulta" existe antes de añadir el listener
    const botonGuardar = document.querySelector('#botonGuardar');
    if (botonGuardar) {
        botonGuardar.addEventListener('click', function (e) {
            e.preventDefault(); // Evita el envío tradicional del formulario
            extraerDatosYEnviar(); // Llama a la función para enviar los datos
        });
    }


    // Añadir el evento click al botón Exámenes después de cargar el popup
    document.getElementById('btnExamenes').addEventListener('click', () => {
        console.log('Botón Exámenes clickeado');
        mostrarSeccion('examenes');
        cargarExamenes();
    });

    document.getElementById('btnProtocolos').addEventListener('click', () => {
        console.log('Botón Protocolos clickeado');
        mostrarSeccion('protocolos');
        cargarProtocolos();
    });

    document.getElementById('btnRecetas').addEventListener('click', () => {
        console.log('Botón Recetas clickeado');
        mostrarSeccion('recetas');
        cargarRecetas();
    });

    document.getElementById('btnConsulta').addEventListener('click', () => {
        console.log('Botón Consulta clickeado');
        mostrarSeccion('consulta');
    });

    document.getElementById('btnConsultaAnterior').addEventListener('click', () => {
        console.log('Botón Consulta Anterior clickeado');
        chrome.runtime.sendMessage({action: "consultaAnterior"});
    });

    document.getElementById('btnPOP').addEventListener('click', () => {
        console.log('Botón POP clickeado');
        chrome.runtime.sendMessage({action: "ejecutarPopEnPagina"});
    });

    document.getElementById('btnBackExamenes').addEventListener('click', () => {
        console.log('Botón Back Exámenes clickeado');
        mostrarSeccion('inicio');
    });

    document.getElementById('btnBackProtocolos').addEventListener('click', () => {
        console.log('Botón Back Protocolos clickeado');
        mostrarSeccion('inicio');
    });

    document.getElementById('btnBackRecetas').addEventListener('click', () => {
        console.log('Botón Back Recetas clickeado');
        mostrarSeccion('inicio');
    });

    document.getElementById('btnBackProcedimientos').addEventListener('click', () => {
        console.log('Botón Back Procedimientos clickeado');
        mostrarSeccion('protocolos');
    });

    document.getElementById('btnBackConsulta').addEventListener('click', () => {
        console.log('Botón Back Consulta clickeado');
        mostrarSeccion('inicio');
    });

    document.getElementById('btnGeneratePDF').addEventListener('click', () => {
        // Enviar un mensaje al background.js para verificar la suscripción
        chrome.runtime.sendMessage({action: 'checkSubscription'}, (response) => {
            if (response.success) {
                // Si la verificación es exitosa, continúa con la generación del PDF
                generatePDF();
            } else {
                // Redirigir al usuario a la página de inicio de sesión en una nueva pestaña si no tiene acceso
                window.open('http://cive.consulmed.me/login.html', '_blank');
            }
        });
    });
})();
