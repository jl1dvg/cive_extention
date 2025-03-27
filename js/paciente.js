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

            let fechaCaducidad = fila.querySelector('td[data-col-seq="16"]')?.textContent.trim();
            if (!fechaCaducidad || fechaCaducidad === '(no definido)') {
                fechaCaducidad = null;
            }

            const {lname, lname2, fname, mname} = descomponerNombreCompleto(patientName);

            if (identificacion && lname && fname && form_id) {
                enviarDatosAHC(identificacion, lname, lname2, fname, mname, afiliacion, doctor, procedimiento_proyectado, fechaCaducidad, form_id);
            }
        });
    }

    function enviarDatosAHC(hcNumber, lname, lname2, fname, mname, afiliacion, doctor, procedimiento_proyectado, fechaCaducidad, form_id) {
        const url = 'https://cive.consulmed.me/interface/guardar_datos.php';

        const data = {
            hcNumber, lname, lname2, fname, mname, afiliacion, doctor, procedimiento_proyectado, fechaCaducidad, form_id
        };

        fetch(url, {
            method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(data),
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    console.log('Datos guardados correctamente.');
                }
            })
            .catch(error => {
                console.error('Error al enviar los datos:', error);
                if (error instanceof TypeError) {
                    console.error("Tipo de error detectado. ¿Problema de conexión?");
                }
            });
    }

    // Asignar las funciones al objeto `window` para que sean accesibles globalmente
    window.inicializarTablaPacientes = inicializarTablaPacientes;

})();