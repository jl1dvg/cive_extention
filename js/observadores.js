(function () {
    function actualizarColorFilasPorTiempoYAfiliacion() {
        const tabla = document.querySelector('table.kv-grid-table');
        if (!tabla) return;

        const excluirAfiliaciones = ['CONTRIBUYENTE VOLUNTARIO', 'CONYUGE', 'CONYUGE PENSIONISTA', 'ISSFA', 'ISSPOL', 'MSP', 'SEGURO CAMPESINO', 'SEGURO CAMPESINO JUBILADO', 'SEGURO GENERAL', 'SEGURO GENERAL JUBILADO', 'SEGURO GENERAL POR MONTEPIO', 'SEGURO GENERAL TIEMPO PARCIAL'];

        const filas = tabla.querySelectorAll('tbody tr');
        filas.forEach((fila) => {
            const afiliacionTd = fila.querySelector('td[data-col-seq="11"]');
            const tiempoTd = fila.querySelector('td[data-col-seq="17"]');

            if (afiliacionTd && tiempoTd) {
                const afiliacionTexto = afiliacionTd.textContent.trim();
                const tiempoTexto = tiempoTd.querySelector('span[name="intervalos"]')?.textContent.trim();

                if (!excluirAfiliaciones.includes(afiliacionTexto) && tiempoTexto) {
                    const [horas, minutos] = tiempoTexto.split(':').map(Number);
                    const tiempoTotalMinutos = horas * 60 + minutos;

                    // Aplicar clases en función del tiempo de espera
                    if (tiempoTotalMinutos >= 30) {
                        fila.classList.add('espera-prolongada-particular');
                        fila.classList.remove('llegado-particular');
                    } else if (tiempoTotalMinutos > 0) {
                        fila.classList.add('llegado-particular');
                        fila.classList.remove('espera-prolongada-particular');
                    }
                } else {
                    // Remover cualquier clase previa si no cumple la condición
                    fila.classList.remove('llegado-particular', 'espera-prolongada-particular');
                }
            }
        });
    }

    function mostrarNotificacionPrioridadOptometria() {
        const columnMap = obtenerColumnMap();
        const tabla = document.querySelector('table.kv-grid-table');
        if (!tabla) return;

        const filas = Array.from(tabla.querySelectorAll('tbody tr'));
        const pacientes = [];

        filas.forEach(fila => {
            const celdas = fila.querySelectorAll('td');
            const servicioTd = celdas[columnMap["procedimiento"]];
            const horaCitaTd = celdas[columnMap["hora cita"]];
            const afiliacionTd = celdas[columnMap["afiliacion"]];
            const tiempoTd = celdas[columnMap["estado solicitud"]];

            if (!tiempoTd) return;

            const badgeSpan = tiempoTd?.querySelector('span.badge');
            const backgroundColor = badgeSpan && badgeSpan.style ? badgeSpan.style.backgroundColor : '';

            const intervaloSpan = tiempoTd?.querySelector('span');
            const tiempoTexto = intervaloSpan?.textContent.trim();

            if (servicioTd?.textContent.trim() === 'OPT OPTOMETRIA' && horaCitaTd && afiliacionTd && tiempoTd && intervaloSpan && tiempoTexto && backgroundColor === 'red') {
                const excluirAfiliaciones = ['CONTRIBUYENTE VOLUNTARIO', 'CONYUGE', 'CONYUGE PENSIONISTA', 'ISSFA', 'ISSPOL', 'MSP', 'SEGURO CAMPESINO', 'SEGURO CAMPESINO JUBILADO', 'SEGURO GENERAL', 'SEGURO GENERAL JUBILADO', 'SEGURO GENERAL POR MONTEPIO', 'SEGURO GENERAL TIEMPO PARCIAL'];
                const afiliacion = afiliacionTd.textContent.trim();
                const prioridad = excluirAfiliaciones.includes(afiliacion) ? 2 : 1;
                const [h, m, s] = tiempoTexto.split(':').map(Number);
                const tiempoEsperaSeg = h * 3600 + m * 60 + s;

                pacientes.push({
                    fila,
                    prioridad,
                    tiempoEsperaSeg,
                    horaCita: horaCitaTd.textContent.trim(),
                    nombre: celdas[columnMap["nombre completo"]]?.textContent.trim() || 'Desconocido',
                    estado: 'EN ESPERA'
                });
            }
        });

        pacientes.sort((a, b) => {
            if (a.prioridad !== b.prioridad) return a.prioridad - b.prioridad;
            return a.horaCita.localeCompare(b.horaCita) || b.tiempoEsperaSeg - a.tiempoEsperaSeg;
        });

        const top3 = pacientes.slice(0, 3).map((p, i) => {
            let iconoEstado = '❔';
            if (p.estado === 'ATENDIDO') iconoEstado = '✅'; else if (p.estado === 'AGENDADO') iconoEstado = '⚠️'; else if (['EN CONSULTA', 'LLAMADO'].includes(p.estado)) iconoEstado = '🕐';

            return `${i + 1}. ${p.nombre} (Prioridad ${p.prioridad}, Espera: ${Math.floor(p.tiempoEsperaSeg / 60)} min, Estado: ${iconoEstado} ${p.estado})`;
        });

        if (top3.length > 0) {
            const notificacionExistente = document.getElementById('notificacion-prioridad-optometria');
            if (notificacionExistente) notificacionExistente.remove();

            const notificacion = document.createElement('div');
            notificacion.id = 'notificacion-prioridad-optometria';
            notificacion.style.position = 'fixed';
            notificacion.style.top = '20px';
            notificacion.style.right = '20px';
            notificacion.style.backgroundColor = '#ffffff';
            notificacion.style.color = '#2c3e50';
            notificacion.style.padding = '15px 20px';
            notificacion.style.borderLeft = '5px solid #e74c3c';
            notificacion.style.borderRadius = '8px';
            notificacion.style.zIndex = 9999;
            notificacion.style.boxShadow = '0 4px 10px rgba(0,0,0,0.2)';
            notificacion.style.maxWidth = '300px';
            notificacion.style.fontFamily = 'sans-serif';
            notificacion.style.transition = 'opacity 0.5s ease-in-out';

            let contenido = `<strong>🩺 ${top3.length} pacientes en espera</strong><br><br>`;
            pacientes.slice(0, 3).forEach(p => {
                contenido += `
                    <div style="margin-bottom: 10px;">
                        <strong>${p.nombre}</strong><br>
                        ⏱️ Espera: ${Math.floor(p.tiempoEsperaSeg / 60)} min<br>
                        🕒 Cita: ${p.horaCita}<br>
                        🏷️ ${p.prioridad === 1 ? 'Particular' : 'Otro'}
                    </div>
                `;
            });

            // Botón de cierre manual
            const botonCerrar = document.createElement('button');
            botonCerrar.textContent = '×';
            botonCerrar.style.position = 'absolute';
            botonCerrar.style.top = '5px';
            botonCerrar.style.right = '10px';
            botonCerrar.style.background = 'transparent';
            botonCerrar.style.border = 'none';
            botonCerrar.style.fontSize = '18px';
            botonCerrar.style.cursor = 'pointer';
            botonCerrar.onclick = () => {
                window._notificacionCerradaManualmente = true;
                notificacion.remove();
            };

            notificacion.innerHTML = contenido;

            if (window._notificacionCerradaManualmente) return;

            notificacion.appendChild(botonCerrar);
            document.body.appendChild(notificacion);

            setTimeout(() => {
                notificacion.remove();
                window._notificacionCerradaManualmente = false;
            }, 15000);
        }
    }

    function observarCambiosEnTablaYPaginacion() {
        const contenedorTabla = document.querySelector('.kv-grid-container');
        if (!contenedorTabla) return;

        const observer = new MutationObserver(() => {
            actualizarColorFilasPorTiempoYAfiliacion();
            mostrarNotificacionPrioridadOptometria();
        });

        observer.observe(contenedorTabla, {childList: true, subtree: true});
    }

    function iniciarObservadores() {
        const intervalo = setInterval(() => {
            const contenedorTabla = document.querySelector('.kv-grid-container');
            if (contenedorTabla) {
                clearInterval(intervalo);
                observarCambiosEnTablaYPaginacion();
                actualizarColorFilasPorTiempoYAfiliacion();
                mostrarNotificacionPrioridadOptometria();
            }
        }, 250);
    }

    function obtenerColumnMap() {
        const map = {};
        const ths = document.querySelectorAll('#crud-datatable-por-atender thead tr th');

        ths.forEach((th, index) => {
            const texto = th.textContent.trim().toLowerCase().replace(/[\n\r]+/g, ' ').replace(/\s+/g, ' ');
            if (texto && !map[texto]) {
                map[texto] = index;
            }
        });

        console.log("🔍 Mapeo de columnas detectado:", map);
        return map;
    }

    function observarPacientesPorAtender() {
        const selectorTabla = '#crud-datatable-por-atender table.kv-grid-table';
        const tabla = document.querySelector(selectorTabla);
        if (!tabla) return;

        const columnMap = obtenerColumnMap();

        const filas = tabla.querySelectorAll('tbody tr[data-key]');
        const pacientes = [];
        const fechaBusqueda = new URLSearchParams(window.location.search).get('DocSolicitudProcedimientosDoctorSearch[fechaBusqueda]') || '';

        filas.forEach(fila => {
            const celdas = fila.querySelectorAll('td');
            // Ajusta los nombres de clave según los textos reales en el thead (minúsculas y espacios normalizados)
            const paciente = {
                id: celdas[columnMap["id"]]?.textContent.trim() || '',
                doctor: celdas[columnMap["doctor"]]?.textContent.trim() || '',
                hora: celdas[columnMap["hora"]]?.textContent.trim() || '',
                nombre: celdas[columnMap["paciente"]]?.textContent.trim() || '',
                identificacion: celdas[columnMap["identificación"]]?.textContent.trim() || '',
                afiliacion: celdas[columnMap["afiliación"]]?.textContent.trim() || '',
                procedimiento: celdas[columnMap["procedimiento"]]?.textContent.trim() || '',
                estado: celdas[columnMap["estado"]]?.textContent.trim() || '',
                fechaCaducidad: celdas[columnMap["fecha caducidad"]]?.textContent.trim() || ''
            };

            console.log("🧪 Datos extraídos:", paciente);

            if (!paciente.id || !paciente.identificacion || !paciente.procedimiento) {
                console.warn("⛔ Faltan datos clave, omitiendo fila:", paciente);
                return;
            }

            const partesNombre = paciente.nombre.split(/\s+/);
            const datosNombre = {
                lname: partesNombre[0] || '',
                lname2: partesNombre[1] || '',
                fname: partesNombre[2] || '',
                mname2: partesNombre.slice(3).join(' ') || ''
            };

            pacientes.push({
                hcNumber: paciente.identificacion,
                form_id: paciente.id,
                procedimiento_proyectado: paciente.procedimiento,
                fname: datosNombre.fname,
                mname: datosNombre.mname,
                lname: datosNombre.lname,
                lname2: datosNombre.lname2,
                doctor: paciente.doctor,
                hora: paciente.hora,
                afiliacion: paciente.afiliacion,
                estado: paciente.estado,
                fecha: fechaBusqueda,
                fechaCaducidad: paciente.fechaCaducidad,
                nombre_completo: paciente.nombre
            });
        });

        if (pacientes.length > 0) {
            fetch('https://asistentecive.consulmed.me/api/proyecciones/guardar.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(pacientes)
            })
                .then(res => res.json())
                .then(data => {
                    console.log('✅ Sincronización exitosa:', data);
                })
                .catch(err => {
                    console.error('❌ Error en la sincronización', err);
                });
        }
    }

    // Inicializar variable global para evitar bucles infinitos al seleccionar "ver todo"
    window._ultimaClaveProcesada = null;

    function observarTablaPorAtenderSiCambio() {
        const urlParams = new URLSearchParams(window.location.search);
        const paginaActual = urlParams.get('por-atender-page') || '1'; // tratar sin parámetro como página 1
        const claveMostrarTodos = Array.from(urlParams).find(([k, v]) => k.includes('_tog') && v === 'all');
        const claveActual = claveMostrarTodos ? claveMostrarTodos[0] : null;

        const claveCombinada = `p${paginaActual}_all${claveActual ? '_yes' : '_no'}`;

        if (claveCombinada !== window._ultimaClaveProcesada) {
            window._ultimaClaveProcesada = claveCombinada;
            setTimeout(() => {
                // Esperar a que la tabla esté actualizada antes de sincronizar
                requestAnimationFrame(() => {
                    observarPacientesPorAtender();
                });
            }, 500);
        }
    }

    // Observador principal para detectar cambios en la tabla de por atender
    const observadorPorAtender = new MutationObserver((mutations) => {
        const tabla = document.querySelector('#crud-datatable-por-atender table.kv-grid-table');
        if (tabla) observarTablaPorAtenderSiCambio();
    });

    const estilo = document.createElement('style');
    estilo.innerHTML = `
    .llegado-particular {
        background-color: #FFD700 !important; /* Color para menos de 30 min */
    }

    .espera-prolongada-particular {
        background-color: #FF6347 !important; /* Color para más de 30 min */
    }
`;
    document.head.appendChild(estilo);

    // Asignar funciones a `window` para que sean accesibles globalmente
    window.actualizarColorFilasPorTiempoYAfiliacion = actualizarColorFilasPorTiempoYAfiliacion;
    window.observarCambiosEnTablaYPaginacion = observarCambiosEnTablaYPaginacion;
    window.iniciarObservadores = iniciarObservadores;

    const contenedorGeneral = document.body;
    if (contenedorGeneral) {
        // Inicialización de la variable global justo antes de iniciar la observación
        window._ultimaClaveProcesada = null;
        observadorPorAtender.observe(contenedorGeneral, {
            childList: true, subtree: true
        });
    }
})();