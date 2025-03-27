// Inicializamos modalData con los campos del formulario principal y del modal
let modalData = {
    sede: '',
    area: '',
    afiliacion: '',
    parentesco: '',
    hcNumber: '',
    tipoAfiliacion: '',
    numeroAprobacion: '',
    tipoPlan: '',
    fechaRegistro: '',
    fechaVigencia: '',
    codDerivacion: '',
    numSecuencialDerivacion: '',
    numHistoria: '',
    examenFisico: '',
    observacion: '',
    procedimientos: [],
    diagnosticos: [],
    apellidos: '',
    nombres: '',
    lname: '',
    lname2: '',
    fname: '',
    mname: '',
    sexo: '',
    fechaNacimiento: '',
    estadoCivil: '',
    telefonoMovil: '',
    email: '',
    direccion: '',
    ocupacion: '',
    lugarTrabajo: '',
    ciudad: '',
    parroquia: '',
    nacionalidad: '',
    idProcedencia: '',
    idReferido: ''
};

let isSubmitting = false; // Evita envíos múltiples

// Función para registrar cambios en los campos
function registrarCambiosEnCampos() {
    const fields = [
        {id: '#docsolicitudpaciente-sede_id', key: 'sede', type: 'select'},
        {id: '#docsolicitudpaciente-externa_hospitalizacion', key: 'area', type: 'select'},
        {id: '#docsolicitudpaciente-afiliacionid', key: 'afiliacion', type: 'select'},
        {id: '#docsolicitudpaciente-parentescoid', key: 'parentesco', type: 'select'},
        {id: '#numero-historia-clinica', key: 'hcNumber', type: 'input'},
        {id: '#docsolicitudpaciente-tipoafiliacion', key: 'tipoAfiliacion', type: 'select'},
        {id: '#docsolicitudpaciente-numeroaprobacion', key: 'numeroAprobacion', type: 'input'},
        {id: '#docsolicitudpaciente-tipoplan', key: 'tipoPlan', type: 'select'},
        {id: '#docsolicitudpaciente-fecha_registro', key: 'fechaRegistro', type: 'input'},
        {id: '#docsolicitudpaciente-fecha_vigencia', key: 'fechaVigencia', type: 'input'},
        {id: '#docsolicitudpaciente-cod_derivacion', key: 'codDerivacion', type: 'input'},
        {id: '#docsolicitudpaciente-num_secuencial_derivacion', key: 'numSecuencialDerivacion', type: 'input'},
        {id: '#docsolicitudpaciente-num_historia', key: 'numHistoria', type: 'input'},
        {id: '#docsolicitudpaciente-examenfisico', key: 'examenFisico', type: 'input'},
        {id: '#docsolicitudpaciente-observacion', key: 'observacion', type: 'input'},
        {id: '#paciente-apellidos', key: 'apellidos', type: 'input'},
        {id: '#paciente-nombres', key: 'nombres', type: 'input'},
        {id: '#numero-historia-clinica', key: 'hcNumber', type: 'input'},
        {id: '#paciente-sexo', key: 'sexo', type: 'select'},
        {id: '#paciente-fecha_nac', key: 'fechaNacimiento', type: 'input'},
        {id: '#paciente-estado_civil_id', key: 'estadoCivil', type: 'select'},
        {id: '#paciente-celular', key: 'telefonoMovil', type: 'input'},
        {id: '#paciente-email', key: 'email', type: 'input'},
        {id: '#paciente-direccion', key: 'direccion', type: 'input'},
        {id: '#paciente-ocupacion', key: 'ocupacion', type: 'input'},
        {id: '#paciente-lugar_trabajo', key: 'lugarTrabajo', type: 'input'},
        {id: '#paciente-ciudad_id', key: 'ciudad', type: 'select'},
        {id: '#paciente-parroquia_id', key: 'parroquia', type: 'select'},
        {id: '#paciente-pais_id', key: 'nacionalidad', type: 'select'},
        {id: '#select2-paciente-id_procedencia-container', key: 'idProcedencia', type: 'selectText'},
        {id: '#select2-paciente-referido_id-container', key: 'idReferido', type: 'selectText'}
    ];

    fields.forEach(({id, key, type}) => {
        const field = document.querySelector(id);
        if (field) {
            if (type === 'select') {
                modalData[key] = field.selectedOptions[0]?.textContent?.trim() || '';
                field.addEventListener('change', () => {
                    modalData[key] = field.selectedOptions[0]?.textContent?.trim() || '';
                    //console.log(`Campo ${key} actualizado:`, modalData[key]);
                });
            } else if (type === 'input') {
                modalData[key] = field.value.trim() || '';
                field.addEventListener('input', () => {
                    modalData[key] = field.value.trim() || '';
                    //console.log(`Campo ${key} actualizado:`, modalData[key]);
                });
            }
        } else {
            //console.info(`Campo ${key} no encontrado o no es obligatorio.`);
        }
    });
    // Procesar apellidos y nombres en campos separados
    modalData.lname = modalData.apellidos.split(' ')[0] || '';
    modalData.lname2 = modalData.apellidos.split(' ')[1] || '';
    modalData.fname = modalData.nombres.split(' ')[0] || '';
    modalData.mname = modalData.nombres.split(' ')[1] || '';

    //console.log('Listeners para cambios en campos relevantes configurados.');
}

// Extraer datos de la tabla de procedimientos
function extractTableRowData() {
    const rows = document.querySelectorAll('.multiple-input-list tbody tr'); // Selecciona todas las filas de la tabla
    const rowData = []; // Almacena los datos extraídos

    rows.forEach((row, index) => {
        const procedimiento = row.querySelector('.list-cell__Procedimiento .select2-selection__rendered')?.textContent.trim() || '';
        const procedimientoAfiliacion = row.querySelector('.list-cell__ProcedimientoAfiliacion .select2-selection__rendered')?.textContent.trim() || '';
        const ojoId = row.querySelector('.list-cell__ojo_id .select2-selection__rendered')?.textContent.trim() || '';
        const equipment = row.querySelector('.list-cell__equipment_id .select2-selection__rendered')?.textContent.trim() || '';
        const precio = row.querySelector('.list-cell__precio input')?.value.trim() || '';

        // Agrega la fila solo si contiene datos válidos
        if (procedimiento || procedimientoAfiliacion || equipment || precio) {
            rowData.push({
                procedimiento,
                procedimientoAfiliacion,
                ojoId,
                equipment,
                precio,
            });
        }
    });

    if (rowData.length > 0) {
        modalData.procedimientos = rowData; // Solo actualiza si hay datos válidos
    } else {
        //console.warn('No se encontraron datos válidos en la tabla.');
    }
    //console.log('Datos extraídos de la tabla:', rowData);
}

// Extraer datos de diagnósticos
function extractDiagnosticosData() {
    //console.group('Extracción de datos de diagnósticos');
    const rows = document.querySelectorAll('#diagnosticosconsultaexterna .multiple-input-list tbody tr');
    const diagnosticosData = [];

    rows.forEach((row, index) => {
        const diagnostico = row.querySelector('.list-cell__idEnfermedades .select2-selection__rendered')?.textContent.trim() || '';
        const ojoId = row.querySelector('.list-cell__ojo_id .select2-selection__rendered')?.textContent.trim() || '';
        const evidenciaCheckbox = row.querySelector('.list-cell__evidencia input[type="checkbox"]');
        const evidencia = evidenciaCheckbox ? evidenciaCheckbox.checked : false;

        // Agregar solo si hay información válida
        if ((diagnostico || ojoId || evidencia) && diagnostico !== 'SELECCIONE') {
            //console.log(`Fila ${index}:`, {diagnostico, ojoId, evidencia});

            diagnosticosData.push({
                diagnostico,
                ojoId,
                evidencia,
            });
        }
    });

    if (diagnosticosData.length > 0) {
        modalData.diagnosticos = diagnosticosData; // Solo actualiza si hay datos válidos
    } else {
        //console.warn('No se encontraron datos válidos en la tabla.');
    }
    //console.log('Datos extraídos de la tabla:', diagnosticosData);
}

function attachSaveButtonListener() {
    const modal = document.getElementById('ajaxCrudModal');
    if (modal) {
        const form = modal.querySelector('form');
        if (form && form.id === 'formprodoc1') {
            const botonGuardar = modal.querySelector('.modal-footer .btn-success[type="submit"]');
            if (botonGuardar) {
                // Elimina cualquier listener previo antes de asignar uno nuevo
                botonGuardar.removeEventListener('click', handleSaveButtonClick);
                botonGuardar.addEventListener('click', handleSaveButtonClick);
                //console.log('Evento asignado al botón guardar.');
            }
        } else {
            //console.log('Formulario no relevante, no se asignará evento al botón guardar.');
        }
    } else {
        //console.error('El modal especificado no contiene el botón guardar.');
    }
}

function handleSaveButtonClick(event) {
    event.preventDefault(); // Evita el envío predeterminado del formulario
    extractTableRowData();
    extractDiagnosticosData();
    extraerDatosYEnviarDesdeModal();
}

// Extraer y enviar datos desde el modal
function extraerDatosYEnviarDesdeModal() {
    if (isSubmitting) return; // Prevent multiple submissions
    isSubmitting = true;
    // Extraer datos de la tabla antes de enviar
    extractTableRowData();
    extractDiagnosticosData();

    // Verificar y mostrar en consola el estado de los campos
    Object.entries(modalData).forEach(([key, value]) => {
        if (value) {
            //console.log(`${key} detectado:`, value);
        } else {
            //console.info(`${key} está vacío pero puede ser opcional.`);
        }
    });

    // Mostrar los datos en la consola para verificación
    //console.log('Datos extraídos del modal:', modalData);

    // URL de la API para enviar los datos
    const url = 'https://cive.consulmed.me/interface/formulario_datos_modal.php';

    // Enviar los datos al backend usando fetch
    fetch(url, {
        method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(modalData),
    })
        .then((response) => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then((result) => {
            if (result.success) {
                //console.log('Datos enviados correctamente desde el modal.');
            } else {
                //console.error('Error en la API:', result.message);
            }
        })
        .catch((error) => {
            //console.error('Error al enviar los datos desde el modal:', error);
        })
        .finally(() => {
            isSubmitting = false; // Reset flag after operation completes
        });
}

// Configurar el MutationObserver para capturar campos dinámicos en el modal
const modal = document.getElementById('ajaxCrudModal');
if (modal) {
    const observer = new MutationObserver((mutationsList) => {
        for (const mutation of mutationsList) {
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                attachSaveButtonListener(); // Attach save button listener when modal is updated
                registrarCambiosEnCampos(); // Track changes in fields
                extractTableRowData();
                extractDiagnosticosData();
                break; // Avoid processing further mutations in this cycle
            }
        }
    });

    observer.observe(modal, {
        childList: true, subtree: true
    });

    //console.log('Observando el modal para cambios y eventos de guardado...');
} else {
    //console.log('Modal no encontrado.');
}

// Hacer disponible la función en `window`
window.registrarCambiosEnCampos = registrarCambiosEnCampos;
window.extraerDatosYEnviarDesdeModal = extraerDatosYEnviarDesdeModal;