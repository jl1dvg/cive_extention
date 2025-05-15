// Función para extraer datos del div y enviar al servidor

function extraerDatosYEnviar() {
    const btnGuardar = document.getElementById('interconsulta-btn-guardar');
    if (btnGuardar) btnGuardar.disabled = true;

    // Inicializar el objeto data
    const data = {};

    // Determinar el URL según el tipo de formato
    const isProtocoloQuirurgico = document.querySelector('#consultasubsecuente-membrete') !== null;
    const url = isProtocoloQuirurgico ? 'https://asistentecive.consulmed.me/api/protocolos/guardar.php' : 'https://asistentecive.consulmed.me/api/consultas/guardar.php';

    if (isProtocoloQuirurgico) {
        // Extraer datos para protocolo quirúrgico
        console.log('Protocolo Quirúrgico detectado. Extrayendo datos...');

        const div = document.querySelector('.media-body.responsive');

        if (!div) {
            console.warn('No se encontró el div con los datos del paciente.');
            return;
        }

        // Datos básicos del paciente
        data.hcNumber = div.querySelector('p:nth-of-type(2)')?.textContent.replace('HC #:', '').trim() || '';
        data.fechaNacimiento = div.querySelector('p:nth-of-type(4)')?.textContent.replace('Fecha de Nacimiento:', '').trim() || '';
        data.sexo = div.querySelector('p:nth-of-type(6)')?.textContent.trim() || '';
        data.celular = div.querySelector('p:nth-of-type(7)')?.textContent.replace('Celular:', '').trim() || '';
        data.ciudad = div.querySelector('p:nth-of-type(8)')?.textContent.trim() || '';

        // Validación básica
        if (!data.hcNumber) {
            console.error('El número de HC es obligatorio.');
            return;
        }

        // Extraer el `idSolicitud` del URL actual
        const urlParams = new URLSearchParams(window.location.search);
        data.form_id = urlParams.get('idSolicitud') || 'N/A';
        data.fechaActual = new Date().toISOString().slice(0, 10);

        // Extraer valores de los textareas
        data.membrete = document.querySelector('#consultasubsecuente-membrete')?.value.trim() || '';
        data.procedimiento_id = document.querySelector('#consultasubsecuente-piepagina')?.value.trim() || '';
        data.dieresis = document.querySelector('#consultasubsecuente-dieresis')?.value.trim() || '';
        data.exposicion = document.querySelector('#consultasubsecuente-exposicion')?.value.trim() || '';
        data.hallazgo = document.querySelector('#consultasubsecuente-hallazgo')?.value.trim() || '';
        data.operatorio = document.querySelector('#consultasubsecuente-operatorio')?.value.trim() || '';
        data.complicaciones_operatorio = document.querySelector('#consultasubsecuente-complicacionesoperatorio')?.value.trim() || '';
        data.datos_cirugia = document.querySelector('#consultasubsecuente-datoscirugia')?.value.trim() || '';

        // Extraer lateralidad
        data.lateralidad = document.querySelector('.list-cell__lateralidadProcedimiento select')?.selectedOptions[0]?.textContent.trim() || '';

        // Extraer fechas y horas
        data.fechaInicio = document.querySelector('#consultasubsecuente-fecha_inicio')?.value || '';
        data.horaInicio = document.querySelector('#consultasubsecuente-horainicio')?.value || '';
        data.fechaFin = document.querySelector('#consultasubsecuente-fecha_fin')?.value || '';
        data.horaFin = document.querySelector('#consultasubsecuente-horafin')?.value || '';

        // Extraer tipo de anestesia
        data.tipoAnestesia = document.querySelector('#consultasubsecuente-anestesia_id')?.selectedOptions[0]?.textContent || '';

        // Recopilar datos del protocolo
        document.querySelectorAll('.multiple-input-list__item').forEach((item) => {
            const funcion = item.querySelector('.list-cell__funcion select')?.selectedOptions[0]?.textContent.trim() || '';
            const doctor = item.querySelector('.list-cell__doctor select')?.selectedOptions[0]?.textContent.trim() || '';

            // Asignar los valores con los nombres correctos según lo esperado en el backend
            if (funcion && doctor) {
                switch (funcion.toLowerCase()) {
                    case 'cirujano 1':
                        data.cirujano_1 = doctor;
                        break;
                    case 'cirujano 2':
                        data.cirujano_2 = doctor;
                        break;
                    case 'instrumentista':
                        data.instrumentista = doctor;
                        break;
                    case 'circulante':
                        data.circulante = doctor;
                        break;
                    case 'anestesiologo':
                        data.anestesiologo = doctor;
                        break;
                    case 'ayudante anestesiologo':
                        data.ayudante_anestesiologo = doctor;
                        break;
                    case 'primer ayudante':
                        data.primer_ayudante = doctor;
                        break;
                    case 'segundo ayudante':
                        data.segundo_ayudante = doctor;
                        break;
                    case 'tercer ayudante':
                        data.tercer_ayudante = doctor;
                        break;
                    default:
                        data.otros = doctor;
                }
            }
        });

        // Extraer procedimientos
        data.procedimientos = [];
        document.querySelectorAll('.multiple-input-list__item').forEach((item) => {
            const procInterno = item.querySelector('.list-cell__procInterno select')?.selectedOptions[0]?.textContent.trim() || '';
            if (procInterno) data.procedimientos.push({procInterno});
        });

        // Extraer diagnósticos
        data.diagnosticos = [];
        document.querySelectorAll('.multiple-input-list__item').forEach((item) => {
            const idDiagnostico = item.querySelector('.list-cell__idDiagnostico select')?.selectedOptions[0]?.textContent.trim() || '';
            const evidencia = item.querySelector('.list-cell__evidencia .cbx-icon')?.textContent.trim() || '';
            const ojo = item.querySelector('.list-cell__ojo_id select')?.selectedOptions[0]?.textContent.trim() || '';
            const observaciones = item.querySelector('.list-cell__observaciones textarea')?.value.trim() || '';

            if (idDiagnostico) {
                data.diagnosticos.push({idDiagnostico, evidencia, ojo, observaciones});
            }
        });

    } else {
        console.log('Formato de consulta u optometría detectado');

        // Extraer datos para una consulta normal
        const div = document.querySelector('.media-body.responsive');

        if (!div) {
            console.warn('No se encontró el div con los datos del paciente.');
            return;
        }

        // Datos básicos del paciente
        data.hcNumber = div.querySelector('p:nth-of-type(2)')?.textContent.replace('HC #:', '').trim() || '';
        data.fechaNacimiento = div.querySelector('p:nth-of-type(4)')?.textContent.replace('Fecha de Nacimiento:', '').trim() || '';
        data.sexo = div.querySelector('p:nth-of-type(6)')?.textContent.trim() || '';
        data.celular = div.querySelector('p:nth-of-type(7)')?.textContent.replace('Celular:', '').trim() || '';
        data.ciudad = div.querySelector('p:nth-of-type(8)')?.textContent.trim() || '';

        // Validación básica
        if (!data.hcNumber) {
            console.error('El número de HC es obligatorio.');
            return;
        }

        // Extraer el `idSolicitud` del URL actual
        const urlParams = new URLSearchParams(window.location.search);
        data.form_id = urlParams.get('idSolicitud') || 'N/A';
        data.fechaActual = new Date().toISOString().slice(0, 10);

        data.motivoConsulta = document.querySelector('#consultas-motivoconsulta')?.value.trim() || '';
        data.enfermedadActual = document.querySelector('#consultas-enfermedadactual')?.value.trim() || '';
        data.examenFisico = document.querySelector('#consultas-fisico-0-observacion')?.value.trim() || '';
        data.plan = document.querySelector('#docsolicitudprocedimientos-observacion_consulta')?.value.trim() || '';

        // Extraer diagnósticos de consulta normal
        data.diagnosticos = [];
        document.querySelectorAll('#diagnosticosconsultaexterna .multiple-input-list__item').forEach((item) => {
            const idDiagnostico = item.querySelector('.list-cell__idEnfermedades select')?.selectedOptions[0]?.textContent.trim() || '';
            const ojo = item.querySelector('.list-cell__ojo_id select')?.selectedOptions[0]?.textContent.trim() || '';
            const evidencia = item.querySelector('.list-cell__evidencia input[type="checkbox"]')?.checked ? '1' : '0';

            if (idDiagnostico) {
                data.diagnosticos.push({idDiagnostico, ojo, evidencia});
            }
        });

        // Extraer los exámenes seleccionados
        data.examenes = [];
        document.querySelectorAll('.examendiv').forEach(examenDiv => {
            const examenCheckbox = examenDiv.querySelector('input[type="text"]');
            if (examenCheckbox && examenCheckbox.value === '1') { // Verificar si el examen está seleccionado
                const examenNombreCompleto = examenDiv.querySelector('.cbx-label').textContent.trim();

                // Descomponer el nombre de forma flexible
                const examenPartes = examenNombreCompleto.split('-');
                if (examenPartes.length >= 2) {
                    const examenCodigo = examenPartes[0].trim(); // Código del examen (número)
                    let examenNombre = examenPartes.slice(1).join('-').trim(); // Nombre del examen
                    let examenLateralidad = '';

                    // Verificar si el nombre contiene la lateralidad (OD, OI, AO)
                    if (examenNombre.includes('(OD)')) {
                        examenLateralidad = 'OD';
                        examenNombre = examenNombre.replace('(OD)', '').trim();
                    } else if (examenNombre.includes('(OI)')) {
                        examenLateralidad = 'OI';
                        examenNombre = examenNombre.replace('(OI)', '').trim();
                    } else if (examenNombre.includes('(AO)')) {
                        examenLateralidad = 'AO';
                        examenNombre = examenNombre.replace('(AO)', '').trim();
                    }

                    // Almacenar el examen con código, nombre y lateralidad
                    data.examenes.push({
                        codigo: examenCodigo, nombre: examenNombre, lateralidad: examenLateralidad
                    });
                } else {
                    console.error(`No se pudo descomponer el nombre del examen: ${examenNombreCompleto}`);
                }
            }
        });

        console.log('Exámenes recopilados:', data.examenes);

        console.log('Exámenes recopilados:', data.examenes);

        // Validación básica
        if (!data.hcNumber || !data.motivoConsulta) {
            console.error('El número de historia clínica o el motivo de consulta son obligatorios.');
            return;
        }

        data.fechaActual = new Date().toISOString().slice(0, 10);

        // Puedes agregar otros campos relevantes de la consulta normal aquí
    }

    // Enviar los datos al backend
    console.log('Datos a enviar:', data);
    fetch(url, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data),
    })
        .then(async (response) => {
            const raw = await response.text();
            console.group('%c📤 Envío a API', 'color: green; font-weight: bold;');
            console.log('✅ Datos enviados:', data);
            console.log('📥 Respuesta RAW:', raw);
            console.groupEnd();

            try {
                const json = JSON.parse(raw);
                console.log('📥 Respuesta JSON parseada:', json);
                return json;
            } catch (e) {
                console.error('❌ Error al parsear JSON:', e, raw);
                throw e;
            }
        })
        .then((result) => {
            if (result.success) {
                console.log('✅ Datos guardados correctamente.');
            } else {
                console.error('❌ Error en respuesta:', result.message);
            }
        })
        .catch((error) => {
            console.error('❌ Error al enviar los datos:', error);
        });
}

