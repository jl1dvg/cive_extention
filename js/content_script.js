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

// Crear el elemento de manejo para arrastrar (tres puntos)
        const dragHandle = document.createElement('div');
        dragHandle.className = 'drag-handle';

// Añadir la imagen y el ícono de manejo al botón
        button.appendChild(img);
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
                    // Mostrar un mensaje al usuario si no tiene acceso o si hubo un error
                    alert(response.error || 'No tiene una suscripción activa o no está aprobado para usar esta función.');
                }
            });
        });

        function generatePDF() {
            {
                // Extraer los datos del paciente
                const patientName = document.querySelector('.media-body p:nth-of-type(1)').innerText.trim(); // Nombre del paciente
                const historyNumber = document.querySelector('.media-body p:nth-of-type(2)').innerText.replace('HC #:', '').trim(); // Número de historia clínica
                const birthDate = document.querySelector('.media-body p:nth-of-type(4)').innerText.replace('Fecha de Nacimiento:', '').trim(); // Fecha de nacimiento
                const gender = document.querySelector('.media-body p:nth-of-type(6)').innerText.trim(); // Género
                const insurance = document.querySelector('.media-body p:nth-of-type(11) b').innerText.trim(); // Seguro

                // Extraer solo los diagnósticos de la tabla y generar parámetros GET para cada uno
                let diagnosticsParams = '';
                const rows = document.querySelectorAll('#diagnosticossub11111 tbody tr');

                rows.forEach((row, index) => {
                    const diagnostic = row.querySelector('.list-cell__idDiagnostico .select2-selection__rendered').title.trim();
                    diagnosticsParams += `&diagnostic${index + 1}=${encodeURIComponent(diagnostic)}`;
                });

                // Extraer todos los diagnósticos de "ENFERMEDAD DEFINITIVO"
                let definitiveDiseasesParams = '';

                function getContentAfterBold(parent, text) {
                    const boldElement = Array.from(parent.querySelectorAll('b')).find(b => b.textContent.includes(text));
                    return boldElement ? boldElement.nextSibling.textContent.trim() : null;
                }

                // Encuentra todos los <div> con clase "timeline-item"
                const timelineItems = document.querySelectorAll('.timeline-item');

                let definitiveIndex = 1; // Contador para los diagnósticos de "ENFERMEDAD DEFINITIVO"
                timelineItems.forEach((item) => {
                    const enfermedadDefinitivo = getContentAfterBold(item, "ENFERMEDAD DEFINITIVO:");
                    if (enfermedadDefinitivo) {
                        definitiveDiseasesParams += `&definitiveDisease${definitiveIndex}=${encodeURIComponent(enfermedadDefinitivo)}`;
                        definitiveIndex++;
                    }
                });

                // Extraer los procedimientos proyectados y realizados
                let procedimientosParams = '';
                let procedimientosProyectado = '';
                let diagnosticosPost = [];
                const postOperatorioHeader = Array.from(document.querySelectorAll('th')).find(th => th.textContent.includes('Postoperatorio'));

                if (postOperatorioHeader) {
                    let row = postOperatorioHeader.parentElement.nextElementSibling;
                    while (row && row.querySelector('th') && !row.querySelector('th').textContent.includes('C. PROCEDIMIENTO')) {
                        const diagnosticoCell = row.querySelector('th.descripcion:nth-child(2)');
                        if (diagnosticoCell) {
                            const diagnostico = diagnosticoCell.textContent.trim();
                            diagnosticosPost.push(diagnostico);
                        }
                        row = row.nextElementSibling;
                    }
                }

                diagnosticosPost.forEach((diagnostico, index) => {
                    procedimientosParams += `&proyectedProcedure${index + 1}=${encodeURIComponent(diagnostico)}`;
                });

                // Extrae el primer código de procedimiento proyectado
                const liElement = Array.from(document.querySelectorAll('li')).find(li => li.textContent.includes("PROTOCOLO CIRUGIA"));
                if (liElement) {
                    const procedimientoHeader = Array.from(liElement.querySelectorAll('th')).find(th => th.textContent.includes('Proyectada:'));
                    let procedimiento = '';
                    if (procedimientoHeader) {
                        const procedimientoElement = procedimientoHeader.nextElementSibling;
                        if (procedimientoElement) {
                            procedimiento = procedimientoElement.textContent.trim();
                        }
                    }
                    if (procedimiento) {
                        procedimientosProyectado += `&projectProcedure=${encodeURIComponent(procedimiento)}`;
                    }
                }

                // Extrae el primer código de procedimiento realizado
                if (liElement) {
                    const procedimientoHeader = Array.from(liElement.querySelectorAll('th')).find(th => th.textContent.includes('Realizado:'));
                    let procedimiento = '';
                    if (procedimientoHeader) {
                        const procedimientoElement = procedimientoHeader.nextElementSibling;
                        if (procedimientoElement) {
                            procedimiento = procedimientoElement.textContent.trim();
                        }
                    }
                    if (procedimiento) {
                        procedimientosParams += `&realizedProcedure=${encodeURIComponent(procedimiento)}`;
                    }
                }

                // Extraer los integrantes del equipo quirúrgico
                let equipoQuirurgicoParams = '';
                const equipoRows = document.querySelectorAll('#trabajadorprotocolo-input-subsecuente .multiple-input-list__item');
                const funcionCounter = {}; // Objeto para contar las funciones

                equipoRows.forEach((row) => {
                    let funcion = row.querySelector('.list-cell__funcion .select2-selection__rendered').title.trim().replace(/\s+/g, '_').toLowerCase();
                    const doctor = row.querySelector('.list-cell__doctor .select2-selection__rendered').title.trim();

                    if (funcionCounter[funcion]) {
                        funcionCounter[funcion]++;
                        funcion += funcionCounter[funcion]; // Añadir el número si ya existe
                    } else {
                        funcionCounter[funcion] = 1;
                    }

                    equipoQuirurgicoParams += `&${encodeURIComponent(funcion)}=${encodeURIComponent(doctor)}`;
                });

                // Extraer los datos adicionales solicitados
                const code = document.querySelector('#consultasubsecuente-piepagina').value.trim();
                const dieresis = document.querySelector('#consultasubsecuente-dieresis').value.trim();
                const exposicion = document.querySelector('#consultasubsecuente-exposicion').value.trim();
                const hallazgo = document.querySelector('#consultasubsecuente-hallazgo').value.trim();
                const operatorio = document.querySelector('#consultasubsecuente-operatorio').value.trim().replace(/\n/g, '%0A');
                const fechaInicio = document.querySelector('#consultasubsecuente-fecha_inicio').value.trim();
                const horaInicio = document.querySelector('#consultasubsecuente-horainicio').value.trim();
                const fechaFin = document.querySelector('#consultasubsecuente-fecha_fin').value.trim();
                const horaFin = document.querySelector('#consultasubsecuente-horafin').value.trim();
                const tipoAnestesia = document.querySelector('#select2-consultasubsecuente-anestesia_id-container').title.trim();
                const nombreAnestesia = document.querySelector('#consultasubsecuente-nombreanestesia') ? document.querySelector('#consultasubsecuente-nombreanestesia').value.trim() : '';

                // Crear la URL con los parámetros GET
                const url = `http://cive.consulmed.me/generate_pdf.php?patientName=${encodeURIComponent(patientName)}&historyNumber=${encodeURIComponent(historyNumber)}&birthDate=${encodeURIComponent(birthDate)}&gender=${encodeURIComponent(gender)}&insurance=${encodeURIComponent(insurance)}${diagnosticsParams}${definitiveDiseasesParams}${procedimientosProyectado}${procedimientosParams}${equipoQuirurgicoParams}&code=${encodeURIComponent(code)}&dieresis=${encodeURIComponent(dieresis)}&exposicion=${encodeURIComponent(exposicion)}&hallazgo=${encodeURIComponent(hallazgo)}&operatorio=${encodeURIComponent(operatorio)}&fechaInicio=${encodeURIComponent(fechaInicio)}&horaInicio=${encodeURIComponent(horaInicio)}&fechaFin=${encodeURIComponent(fechaFin)}&horaFin=${encodeURIComponent(horaFin)}&tipoAnestesia=${encodeURIComponent(tipoAnestesia)}${nombreAnestesia ? `&nombreAnestesia=${encodeURIComponent(nombreAnestesia)}` : ''}`;

                // Abrir la URL en una nueva pestaña
                window.open(url, '_blank');
            }
        }

// Función para mostrar la sección correspondiente
        function mostrarSeccion(seccionId) {
            console.log(`Mostrando sección: ${seccionId}`);
            document.querySelectorAll('.section').forEach(section => {
                section.classList.remove('active');
            });
            document.getElementById(seccionId).classList.add('active');
        }

// Función para cargar JSON desde una URL
        function cargarJSON(url) {
            console.log(`Cargando JSON desde: ${url}`);
            return fetch(url)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    return response.json();
                });
        }

// Función para cargar los exámenes desde el JSON
        function cargarExamenes() {
            console.log('Intentando cargar exámenes...');
            cargarJSON(chrome.runtime.getURL('data/examenes.json'))
                .then(data => {
                    console.log('Datos de exámenes cargados:', data);
                    const procedimientosData = data.examenes;
                    crearBotonesProcedimientos(procedimientosData, 'contenedorExamenes', ejecutarExamenes);
                })
                .catch(error => console.error('Error cargando JSON de examenes:', error));
        }

// Función para crear botones para cada procedimiento
        function crearBotonesProcedimientos(procedimientos, contenedorId, clickHandler) {
            const contenedorBotones = document.getElementById(contenedorId);
            contenedorBotones.innerHTML = ''; // Limpiar el contenedor

            // Ordenar procedimientos alfabéticamente por la propiedad 'cirugia'
            procedimientos.sort((a, b) => a.cirugia.localeCompare(b.cirugia));

            procedimientos.forEach(procedimiento => {
                const col = document.createElement('div');
                col.className = 'col-sm-4'; // Cada botón ocupará un tercio del ancho de la fila
                const boton = document.createElement('button');
                boton.id = `${procedimiento.id}`;
                boton.className = 'btn btn-outline-primary btn-sm'; // Estilo de botón y ancho completo
                boton.textContent = `${procedimiento.cirugia}`;
                boton.addEventListener('click', () => {
                    console.log(`Botón clickeado: ${procedimiento.cirugia}`);
                    clickHandler(procedimiento.id);
                });
                col.appendChild(boton);
                contenedorBotones.appendChild(col);
            });
        }

// Función para ejecutar el examen seleccionado
        function ejecutarExamenes(id) {
            console.log(`Ejecutando examen con ID: ${id}`);
            cargarJSON(chrome.runtime.getURL('data/examenes.json'))
                .then(data => {
                    const item = data.examenes.find(d => d.id === id);
                    if (!item) throw new Error('ID no encontrado en el JSON');

                    console.log("Datos del examen seleccionado:", item);
                    // Ejecutar directamente en la página actual
                    ejecutarEnPagina(item);
                })
                .catch(error => console.error('Error en la ejecución de examen:', error));
        }

        function cargarRecetas() {
            console.log('Intentando cargar recetas...');
            const jsonUrl = 'https://raw.githubusercontent.com/jl1dvg/cive_extention/main/data/recetas.json';

            cargarJSON(jsonUrl)
                .then(data => {
                    console.log('Datos de recetas cargados:', data);
                    const recetasData = data.receta;
                    crearRecetasCategorias(recetasData, 'contenedorRecetas', ejecutarReceta);
                })
                .catch(error => console.error('Error cargando JSON de recetas:', error));
        }

        function cargarProtocolos() {
            console.log('Intentando cargar procedimientos...');
            const jsonUrl = 'https://raw.githubusercontent.com/jl1dvg/cive_extention/main/data/procedimientos.json';

            cargarJSON(jsonUrl)
                .then(data => {
                    console.log('Datos de procedimientos cargados:', data);
                    const procedimientosData = data.procedimientos;
                    crearBotonesCategorias(procedimientosData, 'contenedorProtocolos', ejecutarProtocolos);
                })
                .catch(error => console.error('Error cargando JSON de procedimientos:', error));
        }

        function mostrarProcedimientosPorCategoria(procedimientos) {
            const contenedorProcedimientos = document.getElementById('contenedorProcedimientos');
            contenedorProcedimientos.innerHTML = ''; // Limpiar el contenedor
            procedimientos.forEach(procedimiento => {
                const col = document.createElement('div');
                col.className = 'col-sm-4'; // Cada botón ocupará un tercio del ancho de la fila
                const boton = document.createElement('button');
                boton.id = `${procedimiento.id}`;
                boton.className = 'btn btn-outline-success btn-sm'; // Estilo de botón y ancho completo
                boton.textContent = `${procedimiento.cirugia}`;
                boton.addEventListener('click', () => {
                    console.log(`Botón clickeado: ${procedimiento.cirugia}`);
                    ejecutarProtocolos(procedimiento.id); // Ensure this function is called correctly
                });
                col.appendChild(boton);
                contenedorProcedimientos.appendChild(col);
            });
            mostrarSeccion('procedimientos');
        }

        function mostrarRecetasPorCategoria(recetas) {
            const contenedorRecetas = document.getElementById('contenedorRecetas');
            contenedorRecetas.innerHTML = ''; // Limpiar el contenedor
            recetas.forEach(receta => {
                const col = document.createElement('div');
                col.className = 'col-sm-4'; // Cada botón ocupará un tercio del ancho de la fila
                const boton = document.createElement('button');
                boton.id = `${receta.id}`;
                boton.className = 'btn btn-outline-success btn-sm'; // Estilo de botón y ancho completo
                boton.textContent = `${receta.cirugia}`;
                boton.addEventListener('click', () => {
                    console.log(`Botón clickeado: ${receta.cirugia}`);
                    ejecutarReceta(receta.id); // Ensure this function is called correctly
                });
                col.appendChild(boton);
                contenedorRecetas.appendChild(col);
            });
            mostrarSeccion('recetas');
        }

        function crearBotonesCategorias(procedimientos, contenedorId) {
            const categorias = [...new Set(procedimientos.map(procedimiento => procedimiento.categoria))];
            const contenedorBotones = document.getElementById(contenedorId);
            contenedorBotones.innerHTML = ''; // Limpiar el contenedor
            categorias.forEach(categoria => {
                const col = document.createElement('div');
                col.className = 'col-sm-4';
                const boton = document.createElement('button');
                boton.className = 'btn btn-outline-primary btn-sm';
                boton.textContent = categoria;
                boton.addEventListener('click', () => {
                    console.log(`Categoría clickeada: ${categoria}`);
                    const procedimientosCategoria = procedimientos.filter(procedimiento => procedimiento.categoria === categoria);
                    mostrarProcedimientosPorCategoria(procedimientosCategoria);
                });
                col.appendChild(boton);
                contenedorBotones.appendChild(col);
            });
        }

        function crearRecetasCategorias(recetas, contenedorId) {
            const categorias = [...new Set(recetas.map(receta => receta.categoria))];
            const contenedorBotones = document.getElementById(contenedorId);
            contenedorBotones.innerHTML = ''; // Limpiar el contenedor
            categorias.forEach(categoria => {
                const col = document.createElement('div');
                col.className = 'col-sm-4';
                const boton = document.createElement('button');
                boton.className = 'btn btn-outline-primary btn-sm';
                boton.textContent = categoria;
                boton.addEventListener('click', () => {
                    console.log(`Categoría clickeada: ${categoria}`);
                    const recetasCategoria = recetas.filter(receta => receta.categoria === categoria);
                    mostrarRecetasPorCategoria(recetasCategoria);
                });
                col.appendChild(boton);
                contenedorBotones.appendChild(col);
            });
        }

        function ejecutarProtocolos(id) {
            const jsonUrl = 'https://raw.githubusercontent.com/jl1dvg/cive_extention/main/data/procedimientos.json';

            cargarJSON(jsonUrl)
                .then(data => {
                    const item = data.procedimientos.find(d => d.id === id);
                    if (!item) throw new Error('ID no encontrado en el JSON');

                    console.log("Item cargado:", item);

                    // Verificar que el item tenga todas las propiedades necesarias
                    if (!item || typeof item !== 'object') {
                        throw new Error('El item cargado no tiene la estructura esperada.');
                    }

                    if (chrome && chrome.runtime && chrome.runtime.sendMessage) {
                        chrome.runtime.sendMessage({action: "ejecutarProtocolo", item: item});
                    } else {
                        console.error("El contexto de la extensión no es válido. Intentando nuevamente en 1 segundo...");
                        setTimeout(() => ejecutarProtocolos(id), 1000);
                    }
                })
                .catch(error => console.error('Error en la ejecución de protocolo:', error));
        }

        function ejecutarReceta(id) {
            const jsonUrl = 'https://raw.githubusercontent.com/jl1dvg/cive_extention/main/data/recetas.json';

            cargarJSON(jsonUrl)
                .then(data => {
                    const item = data.receta.find(d => d.id === id);
                    if (!item) throw new Error('ID no encontrado en el JSON');

                    console.log("Item cargado:", item);

                    // Verificar que el item tenga todas las propiedades necesarias
                    if (!item || typeof item !== 'object') {
                        throw new Error('El item cargado no tiene la estructura esperada.');
                    }

                    if (chrome && chrome.runtime && chrome.runtime.sendMessage) {
                        chrome.runtime.sendMessage({action: "ejecutarReceta", item: item});
                    } else {
                        console.error("El contexto de la extensión no es válido. Intentando nuevamente en 1 segundo...");
                        setTimeout(() => ejecutarReceta(id), 1000);
                    }
                })
                .catch(error => console.error('Error en la ejecución de receta:', error));
        }


    }

)
();
