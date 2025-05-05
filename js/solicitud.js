// Función principal para añadir el evento de clic a los botones de guardar
function agregarEventoGuardar() {
    console.log("agregarEventoGuardar ejecutado");
    const botones = [
        document.getElementById('interconsulta-btn-guardar'),
        document.getElementById('botonGuardar')
    ];

    botones.forEach((btnGuardar) => {
        if (btnGuardar && !btnGuardar.classList.contains('evento-agregado')) {
            console.log(`Asignando evento a: ${btnGuardar.id}`);
            btnGuardar.classList.add('evento-agregado');
            btnGuardar.addEventListener('click', function (e) {
                e.preventDefault(); // Prevenir envío automático
                console.log(`Botón "${btnGuardar.id}" clicado, iniciando extracción de datos...`);
                extraerDatosSolicitudYEnviar(btnGuardar);
            });
        } else {
            console.log(`Botón no encontrado o ya tiene evento: ${btnGuardar?.id}`);
        }
    });
}

// Observador para detectar cambios en el DOM (por si el botón se carga dinámicamente)
const observador = new MutationObserver(agregarEventoGuardar);
observador.observe(document.body, {childList: true, subtree: true});

// Ejecutar la función al cargar la página por primera vez
document.addEventListener('DOMContentLoaded', agregarEventoGuardar);

// Función de extracción y envío de datos
function extraerDatosSolicitudYEnviar(btnGuardar) {
    const url = 'https://asistentecive.consulmed.me/api/solicitudes/guardar.php';
    const data = {};

    const div = document.querySelector('.media-body.responsive');
    if (!div) {
        console.warn('Div de datos del paciente no encontrado.');
        return;
    }

    // Datos básicos del paciente
    data.hcNumber = div.querySelector('p:nth-of-type(2)')?.textContent.replace('HC #:', '').trim() || '';
    data.form_id = new URLSearchParams(window.location.search).get('idSolicitud') || 'N/A';

    if (!data.hcNumber || !data.form_id) {
        console.error('Número de HC o form_id faltante.');
        return;
    }

    // Extracción de datos de solicitudes
    data.solicitudes = [];
    document.querySelectorAll('#interconsultas .multiple-input-list__item').forEach((item, index) => {
        const tipo = item.querySelector('.list-cell__tipo .cbx-icon')?.textContent.trim() || '';
        const afiliacion = item.querySelector('.list-cell__afiliacion_id select')?.selectedOptions[0]?.textContent.trim() || '';
        const procedimiento = item.querySelector('.list-cell__procedimiento_id select')?.selectedOptions[0]?.textContent.trim() || '';
        const doctor = item.querySelector('.list-cell__doctor select')?.selectedOptions[0]?.textContent.trim() || '';
        const fecha = item.querySelector('.list-cell__fecha input')?.value.trim() || '';
        const duracion = item.querySelector('.list-cell__duracion input')?.value.trim() || '';
        const ojo = Array.from(item.querySelectorAll('.list-cell__ojo_id input[type="checkbox"]')).filter(checkbox => checkbox.checked).map(checkbox => checkbox.nextSibling.textContent.trim()).join(', ') || '';
        const prioridad = item.querySelector('.list-cell__prioridad .cbx-icon')?.textContent.trim() || 'NO';
        const producto = item.querySelector('.list-cell__producto_id select')?.selectedOptions[0]?.textContent.trim() || '';
        const observacion = item.querySelector('.list-cell__observacionInterconsulta textarea')?.value.trim() || '';

        data.solicitudes.push({
            secuencia: index + 1,
            tipo,
            afiliacion,
            procedimiento,
            doctor,
            fecha,
            duracion,
            ojo,
            prioridad,
            producto,
            observacion
        });
    });

    if (!data.solicitudes.length) {
        console.error('No se encontraron solicitudes.');
        return;
    }

    // Desactivar el botón mientras se envían los datos
    if (btnGuardar) btnGuardar.disabled = true;

    fetch(url, {
        method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(data),
    })
        .then(async (response) => {
            const result = await response.json();

            console.group('%c📤 Envío a API (Solicitud)', 'color: green; font-weight: bold;');
            console.log('✅ Datos enviados:', data);
            console.log('📥 Respuesta recibida:', result);
            console.groupEnd();

            return result;
        })
        .then((result) => {
            if (result.success) {
                console.log('Datos guardados correctamente.');
            } else {
                console.error('Error:', result.message);
            }
        })
        .catch((error) => {
            console.error('Error al enviar los datos:', error);
        })
        .finally(() => {
            if (btnGuardar) btnGuardar.disabled = false; // Reactivar el botón después del envío
        });
}

// Exponer la función para uso externo (por ejemplo, desde content_script)
window.extraerDatosSolicitudYEnviar = extraerDatosSolicitudYEnviar;