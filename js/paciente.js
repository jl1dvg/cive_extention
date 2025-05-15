(function () {
    function inicializarTablaPacientes() {
        // Verificar si la URL contiene la ruta específica
        const rutaValida = window.location.pathname.includes('/documentacion/doc-solicitud-procedimientos/index-doctor');

        // Verificar si el título del panel es "PACIENTES POR ATENDER"
        const panelTitle = document.querySelector('h3.panel-title');
        const tituloValido = panelTitle && panelTitle.textContent.trim().includes('PACIENTES POR ATENDER');

        // Si ninguna de las condiciones es verdadera, no ejecutar la función
        if (!rutaValida && !tituloValido) {
            console.log("La función 'inicializarTablaPacientes' no se ejecutará porque no cumple con las condiciones.");
            return;
        }

        console.log("Condiciones cumplidas. Inicializando tabla de pacientes...");

        // Seleccionar la tabla
        const tabla = document.querySelector('table.kv-grid-table'); // Selector de la tabla

        if (!tabla) {
            console.log("No se encontró la tabla de pacientes.");
            return;
        }

        console.log("Tabla de pacientes encontrada. Añadiendo listeners a las filas...");

        // Agregar listeners a las filas ya presentes en la tabla
        const filas = tabla.querySelectorAll('tr[data-key]');
        filas.forEach((fila) => {
            console.log("Añadiendo listener a la fila:", fila);
            agregarListenerAFila(fila);
        });
    }


    function descomponerNombreCompleto(patientName) {
        const partes = patientName.split(' ');

        return {
            lname: partes[0] || '',  // Primer apellido
            lname2: partes[1] || '', // Segundo apellido
            fname: partes[2] || '',  // Primer nombre
            mname: partes[3] || ''   // Segundo nombre
        };
    }

    function agregarListenerAFila(fila) {
        fila.addEventListener('click', function () {
            // Extraer los valores de Identificación y Fecha de Caducidad de la fila clickeada
            const doctor = fila.querySelector('td[data-col-seq="6"]')?.textContent.trim() || null;
            const patientName = fila.querySelector('td[data-col-seq="8"]')?.textContent.trim() || null;
            const identificacion = fila.querySelector('td[data-col-seq="9"]')?.textContent.trim() || null;
            const afiliacion = fila.querySelector('td[data-col-seq="11"]')?.textContent.trim() || null;
            const procedimiento_proyectado = fila.querySelector('td[data-col-seq="13"]')?.textContent.trim() || null;

            // Extraer el form_id del enlace
            const enlace = fila.querySelector('td[data-col-seq="13"]');
            const form_id = enlace?.getAttribute('onclick')?.match(/id=(\d+)/)?.[1] || null;

            const estadoSpan = fila.querySelector('td[data-col-seq="17"] span.badge');
            const backgroundColor = estadoSpan ? window.getComputedStyle(estadoSpan).backgroundColor : '';
            let estadoPaciente = 'desconocido';
            if (backgroundColor === 'rgb(0, 128, 0)' || backgroundColor.includes('green')) {
                estadoPaciente = 'no_admitido';
            } else {
                estadoPaciente = 'admitido';
            }

            let fechaCaducidad = fila.querySelector('td[data-col-seq="16"]')?.textContent.trim();
            if (!fechaCaducidad || fechaCaducidad === '(no definido)') {
                fechaCaducidad = null;
            }

            const {lname, lname2, fname, mname} = descomponerNombreCompleto(patientName);

            if (identificacion && lname && fname && form_id) {
                enviarDatosAHC(identificacion, lname, lname2, fname, mname, afiliacion, doctor, procedimiento_proyectado, fechaCaducidad, form_id, estadoPaciente);
            }
        });
    }

    function enviarDatosAHC(hcNumber, lname, lname2, fname, mname, afiliacion, doctor, procedimiento_proyectado, fechaCaducidad, form_id, estadoPaciente) {
        const url = 'https://asistentecive.consulmed.me/api/proyecciones/guardar.php';

        const data = {
            hcNumber, lname, lname2, fname, mname, afiliacion, doctor, procedimiento_proyectado, fechaCaducidad, form_id
        };

        console.log('📤 Envío a API vía Beacon');
        console.log('✅ Datos enviados:', data);

        localStorage.setItem('logAHC', JSON.stringify({
            estadoPaciente,
            timestamp: new Date().toISOString()
        }));

        try {
            const blob = new Blob([JSON.stringify(data)], {type: 'application/json'});
            const enviado = navigator.sendBeacon(url, blob);

            if (!enviado) {
                console.warn('⚠️ No se pudo enviar con beacon. Ejecutando fallback con fetch...');
                fetch(url, {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify(data)
                })
                    .then(response => response.text())
                    .then(raw => {
                        console.log('📥 Fallback fetch - respuesta RAW:', raw);
                        try {
                            const json = JSON.parse(raw);
                            console.log('📥 Fallback fetch - respuesta JSON:', json);
                            localStorage.setItem('logAHC', JSON.stringify({
                                success: json.success,
                                message: json.message,
                                estadoPaciente,
                                timestamp: new Date().toISOString()
                            }));
                            if (json.success) {
                                console.log('✅ Datos guardados correctamente.');
                            } else {
                                console.warn('⚠️ Respuesta sin éxito:', json.message || json);
                            }
                        } catch (e) {
                            console.error('❌ Error al parsear JSON del fallback:', e);
                            console.log('❌ Respuesta inválida para JSON:', raw);
                        }
                    })
                    .catch(error => {
                        console.error('❌ Error en el fallback fetch:', error);
                    });
            }
        } catch (e) {
            console.error('❌ Error al usar sendBeacon:', e);
        }
    }

    // Asignar las funciones al objeto `window` para que sean accesibles globalmente
    window.inicializarTablaPacientes = inicializarTablaPacientes;

})();