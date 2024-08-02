// Función que se ejecutará en la página actual
function ejecutarEnPagina() {
    // Función para obtener el contenido después del elemento <b> con el texto específico
    function getContentAfterBold(parent, text) {
        const boldElement = Array.from(parent.querySelectorAll('b')).find(b => b.textContent.includes(text));
        return boldElement ? boldElement.nextSibling.textContent.trim() : null;
    }

    // Encuentra el primer <li> que contiene "SERVICIOS OFTALMOLOGICOS GENERALES"
    const liElement = Array.from(document.querySelectorAll('li')).find(li =>
        li.textContent.includes("SERVICIOS OFTALMOLOGICOS GENERALES")
    );

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
        const enfermedadActualTextarea = document.getElementById('consultas-enfermedad-actual');
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

// Exporta la función para que pueda ser usada por popup.js
export {ejecutarEnPagina};
