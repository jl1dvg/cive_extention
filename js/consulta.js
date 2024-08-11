// Función que se ejecutará en la página actual
function consultaAnterior() {
    // Función para obtener el contenido después del elemento <b> con el texto específico
    function getContentAfterBold(parent, text) {
        const boldElement = Array.from(parent.querySelectorAll('b')).find(b => b.textContent.includes(text));
        return boldElement ? boldElement.nextSibling.textContent.trim() : null;
    }

    // Encuentra el primer <li> que contiene "SERVICIOS OFTALMOLOGICOS GENERALES"
    const liElement = Array.from(document.querySelectorAll('li')).find(li => li.textContent.includes("SERVICIOS OFTALMOLOGICOS GENERALES"));

    if (liElement) {
        const motivoConsulta = getContentAfterBold(liElement, "MOTIVO CONSULTA:");
        const enfermedadActual = getContentAfterBold(liElement, "ENFERMEDAD ACTUAL:");
        const observacion = getContentAfterBold(liElement, "OBSERVACIÓN:");
        const medicacion = getContentAfterBold(liElement, "MEDICACIÓN:");
        const enfermedadPresuntivo = getContentAfterBold(liElement, "ENFERMEDAD PRESUNTIVO:");
        const enfermedadDefinitivo = getContentAfterBold(liElement, "ENFERMEDAD DEFINITIVO:");

        console.log('MOTIVO CONSULTA:', motivoConsulta);
        console.log('ENFERMEDAD ACTUAL:', enfermedadActual);
        console.log('OBSERVACIÓN:', observacion);
        console.log('MEDICACIÓN:', medicacion);
        console.log('ENFERMEDAD PRESUNTIVO:', enfermedadPresuntivo);
        console.log('ENFERMEDAD DEFINITIVO:', enfermedadDefinitivo);

        // Asigna el valor de motivoConsulta al textarea correspondiente
        const motivoConsultaTextarea = document.getElementById('consultas-motivoconsulta');
        if (motivoConsultaTextarea) {
            motivoConsultaTextarea.value = motivoConsulta;
        } else {
            console.log('Textarea para motivoConsulta no encontrado.');
        }

        // Asigna el valor de observacion al textarea correspondiente
        const observacionTextarea = document.getElementById('consultas-fisico-0-observacion');
        if (observacionTextarea) {
            observacionTextarea.value = observacion;
        } else {
            console.log('Textarea para observacion no encontrado.');
        }

        // Puedes agregar más asignaciones de valores a otros textareas aquí
        // Asigna el valor de enfermedadActual al textarea correspondiente
        const enfermedadActualTextarea = document.getElementById('consultas-enfermedadactual');
        if (enfermedadActualTextarea) {
            enfermedadActualTextarea.value = enfermedadActual;
        } else {
            console.log('Textarea para enfermedadActual no encontrado.');
        }

        // Asigna el valor de medicacion al textarea correspondiente
        const medicacionTextarea = document.getElementById('consultas-medicacion');
        if (medicacionTextarea) {
            medicacionTextarea.value = medicacion;
        } else {
            console.log('Textarea para medicacion no encontrado.');
        }

        // Asigna el valor de enfermedadDefinitivo al textarea correspondiente
        const enfermedadDefinitivoTextarea = document.getElementById('consultas-enfermedad-definitivo');
        if (enfermedadDefinitivoTextarea) {
            enfermedadDefinitivoTextarea.value = enfermedadDefinitivo;
        } else {
            console.log('Textarea para enfermedadDefinitivo no encontrado.');
        }
    } else {
        console.log('No se encontró un <li> con "SERVICIOS OFTALMOLOGICOS GENERALES".');
    }
}

// Función que se ejecutará en la página actual para protocolos de cirugía
function ejecutarPopEnPagina() {
    // Función para obtener el contenido después del elemento <th> con el texto específico
    function getContentAfterTh(parent, thText) {
        const thElement = Array.from(parent.querySelectorAll('th')).find(th => th.textContent.includes(thText));
        console.log(`Buscando <th> con el texto: ${thText}`); // Depuración
        console.log(`Elemento <th> encontrado:`, thElement); // Depuración
        return thElement ? thElement.parentElement.nextElementSibling.textContent.trim() : null;
    }

    // Encuentra el primer <li> que contiene "PROTOCOLO CIRUGIA"
    const liElement = Array.from(document.querySelectorAll('li')).find(li => li.textContent.includes("PROTOCOLO CIRUGIA"));

    console.log("Encontrado el elemento li:", liElement); // Añadido para depurar

    if (liElement) {
        // Extrae los diagnósticos postoperatorios
        const diagnosticosPost = [];
        const postOperatorioHeader = Array.from(liElement.querySelectorAll('th')).find(th => th.textContent.includes('Post Operatorio'));
        console.log("Encontrado el encabezado Post Operatorio:", postOperatorioHeader); // Añadido para depurar

        if (postOperatorioHeader) {
            let row = postOperatorioHeader.parentElement.nextElementSibling;
            while (row && row.querySelector('th') && !row.querySelector('th').textContent.includes('C. PROCEDIMIENTO')) {
                console.log("Procesando fila:", row); // Añadido para depurar
                const diagnosticoCell = row.querySelector('th.descripcion:nth-child(2)');
                if (diagnosticoCell) {
                    const diagnostico = diagnosticoCell.textContent.trim();
                    diagnosticosPost.push(diagnostico);
                    console.log("Encontrado diagnóstico:", diagnostico); // Añadido para depurar
                }
                row = row.nextElementSibling;
            }
        }

        // Extrae el primer código de procedimiento realizado y el ojo afectado
        const procedimientoHeader = Array.from(liElement.querySelectorAll('th')).find(th => th.textContent.includes('Realizado:'));
        console.log("Encontrado el encabezado Realizado:", procedimientoHeader); // Añadido para depurar
        let procedimiento = '';
        let ojoRealizado = '';
        if (procedimientoHeader) {
            const procedimientoElement = procedimientoHeader.nextElementSibling;
            console.log("Elemento siguiente del encabezado Realizado:", procedimientoElement); // Añadido para depurar
            if (procedimientoElement) {
                let procedimientoText = procedimientoElement.textContent.trim();
                const primeraLinea = procedimientoText.split('\n')[0]; // Obtener solo la primera línea
                procedimiento = primeraLinea.trim();

                // Elimina el código de 5 dígitos seguido de un guion al inicio
                procedimiento = procedimiento.replace(/^\d{5}-\s*/, '');

                // Reemplaza (OD) y (OI) con ojo derecho y ojo izquierdo respectivamente
                procedimiento = procedimiento.replace(/\(OD\)/g, 'ojo derecho').replace(/\(OI\)/g, 'ojo izquierdo');
                const ojoMatch = primeraLinea.match(/\((OD|OI)\)/); // Buscar el texto (OD) o (OI)
                if (ojoMatch) {
                    if (ojoMatch[1] === 'OD') {
                        ojoRealizado = 'ojo derecho';
                    } else if (ojoMatch[1] === 'OI') {
                        ojoRealizado = 'ojo izquierdo';
                    }
                }
            }
        }
        console.log("Procedimiento Realizado:", procedimiento); // Añadido para depurar
        console.log("Ojo Realizado:", ojoRealizado); // Añadido para depurar

        // Extrae la fecha de realización
        const fechaInicioOperacionHeader = Array.from(liElement.querySelectorAll('th')).find(th => th.textContent.includes('FECHA DE INICIO DE OPERACIÓN'));
        let fechaInicioOperacion = '';
        if (fechaInicioOperacionHeader) {
            const fechaRow = fechaInicioOperacionHeader.parentElement.nextElementSibling;
            if (fechaRow) {
                const dia = fechaRow.children[0] ? fechaRow.children[0].textContent.trim() : '';
                const mes = fechaRow.children[1] ? fechaRow.children[1].textContent.trim() : '';
                const año = fechaRow.children[2] ? fechaRow.children[2].textContent.trim() : '';
                const hora = fechaRow.children[3] ? fechaRow.children[3].textContent.trim() : '';
                fechaInicioOperacion = `${año}-${mes}-${dia}T${hora}`; // Formato para Date
            }
        }
        console.log('Fecha de Inicio de Operación:', fechaInicioOperacion); // Añadido para depurar

        // Calcula el tiempo transcurrido desde la fecha de realización hasta hoy
        const fechaOperacion = new Date(fechaInicioOperacion);
        const fechaActual = new Date();
        const diffTime = Math.abs(fechaActual - fechaOperacion);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // Diferencia en días

        // Construye la nota de evolución médica
        const notaEvolucion = `Paciente acude a control post quirúrgico de ${diffDays} días tras haber sido sometido a ${procedimiento}. Sin complicaciones.`;
        const examenFisico = `Biomicroscopia\n${ojoRealizado}: CORNEA CLARA, CAMARA FORMADA CON PRESENCIA DE BURBUJA DE AIRE, PUPILA MIOTICA REACTIVA, PSEUDOFAQUIA CORRECTA.`;

        // Asigna la nota de evolución médica al textarea con id "consultas-motivoconsulta"
        const consultaTextarea = document.getElementById('consultas-motivoconsulta');
        const observacionTextarea = document.getElementById('consultas-fisico-0-observacion');

        if (consultaTextarea) {
            consultaTextarea.value = notaEvolucion;
            if (observacionTextarea) {
                observacionTextarea.value = examenFisico;
            } else {
                console.log('Textarea con id "consultas-fisico-0-observacion" no encontrado.');
            }
        } else {
            console.log('Textarea con id "consultas-motivoconsulta" no encontrado.');
        }
    } else {
        console.log('No se encontró un <li> con "PROTOCOLO CIRUGIA".');
    }
}

