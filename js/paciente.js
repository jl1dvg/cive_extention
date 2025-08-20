(function () {
    function detectarConfirmacionAsistencia() {
        document.querySelectorAll('button[id^="button-confirmar-"], .swal2-container button[id^="button-confirmar-"]').forEach(boton => {
            boton.addEventListener('click', (e) => {
                const idTexto = boton.id.replace('button-confirmar-', '');
                const id = parseInt(idTexto, 10);
                if (!isNaN(id)) {
                    const icono = boton.querySelector('.glyphicon');
                    if (icono && icono.classList.contains('glyphicon-thumbs-down')) {
                        console.log(`🟡 Confirmando llegada para ID: ${id}`);
                        fetch('https://asistentecive.consulmed.me/api/proyecciones/optometria.php', {
                            method: 'POST',
                            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                            body: new URLSearchParams({form_id: id, estado: 'iniciar_atencion'})
                        })
                            .then(response => response.json())
                            .then(data => {
                                if (data.success) {
                                    console.log('✅ Confirmación de llegada enviada correctamente.');
                                } else {
                                    console.log('❌ Error al confirmar llegada:', data.message);
                                }
                            })
                            .catch(error => {
                                console.log('❌ Error al enviar la solicitud de llegada:', error.message);
                            });
                    } else {
                        console.log(`🔵 Botón clickeado pero el icono no indica llegada (no es thumbs-up). ID: ${id}`);
                    }
                }
            });
        });
    }

    /**
     * Bloquea o desbloquea los campos del formulario, excepto los botones.
     * Solo los elementos input, textarea y select serán afectados.
     * Los botones permanecerán siempre habilitados.
     */
    function establecerBloqueoFormulario(bloqueado = true) {
        document.querySelectorAll('input, textarea, select').forEach(element => {
            element.disabled = bloqueado;
        });
        // Los botones NO se desactivan: no modificar su estado.
    }

    // (function () {
    const filas = document.querySelectorAll('tr[data-key]');
    filas.forEach(fila => {
        fila.addEventListener('click', function () {
            const doctor = fila.querySelector('td[data-col-seq="6"]')?.textContent.trim() || null;
            const patientName = fila.querySelector('td[data-col-seq="8"]')?.textContent.trim() || null;
            const identificacion = fila.querySelector('td[data-col-seq="9"]')?.textContent.trim() || null;
            const afiliacion = fila.querySelector('td[data-col-seq="11"]')?.textContent.trim() || null;
            const procedimiento_proyectado = fila.querySelector('td[data-col-seq="13"]')?.textContent.trim() || null;

            const enlace = fila.querySelector('td[data-col-seq="13"]');
            const form_id = enlace?.getAttribute('onclick')?.match(/id=(\d+)/)?.[1] || null;

            let fechaCaducidad = fila.querySelector('td[data-col-seq="16"]')?.textContent.trim();
            if (!fechaCaducidad || fechaCaducidad === '(no definido)') {
                fechaCaducidad = null;
            }

            const badge = fila.querySelector('td[data-col-seq="17"] span.badge');
            const colorFondo = badge ? badge.style.backgroundColor.trim() : null;

            const pacienteNoAdmitido = colorFondo === 'green';

            if (identificacion && patientName && form_id) {
                const datosPaciente = {
                    identificacion,
                    nombreCompleto: patientName,
                    afiliacion,
                    doctor,
                    procedimiento_proyectado,
                    fechaCaducidad,
                    form_id,
                    pacienteNoAdmitido
                };
                localStorage.setItem('datosPacienteSeleccionado', JSON.stringify(datosPaciente));
                const destino = fila.querySelector('td[onclick*="location.href"]')?.getAttribute('onclick')?.match(/'(.+?)'/)?.[1];
                if (destino) {
                    localStorage.setItem('datosPacienteSeleccionado', JSON.stringify(datosPaciente));
                    window.location.href = destino;
                }
            }
        });
    });

    if (window.location.href.includes('/doc-solicitud-procedimientos/historia-automatica')) {
        const datos = localStorage.getItem('datosPacienteSeleccionado');
        if (datos) {
            const paciente = JSON.parse(datos);
            console.log("🧾 Datos del paciente cargados en la vista destino:", paciente);

            // ✅ Claves de control: prompt por pestaña (session) y estado persistente (local)
            const KEY_PROMPT = `prompt_iniciar_${paciente.form_id}`;         // sessionStorage (anti-duplicado modal)
            const KEY_ESTADO = `estado_atencion_${paciente.form_id}`;        // localStorage (persistente entre cierres)

            // 1) Arranque rápido desde localStorage (UX inmediata)
            const estadoLocal = localStorage.getItem(KEY_ESTADO);
            if (estadoLocal === 'en_proceso') {
                establecerBloqueoFormulario(false);
            }

            // 2) Reconciliar con el backend (usa mismo endpoint con action=estado)
            const endpointBase = paciente.procedimiento_proyectado === 'SERVICIOS OFTALMOLOGICOS GENERALES - SER-OFT-001 - OPTOMETRIA - AMBOS OJOS'
                ? 'https://asistentecive.consulmed.me/api/proyecciones/optometria.php'
                : 'https://asistentecive.consulmed.me/api/proyecciones/consulta.php';

            try {
                fetch(`${endpointBase}?form_id=${encodeURIComponent(paciente.form_id)}&action=estado`)
                    .then(r => {
                        // Algunos servidores devuelven 200 con texto; intentamos parsear JSON de todas formas
                        return r.json().catch(() => ({}));
                    })
                    .then(data => {
                        if (!data || data.success === false) return;
                        const estado = data.estado;
                        if (estado === 'en_proceso') {
                            establecerBloqueoFormulario(false);
                            localStorage.setItem(KEY_ESTADO, 'en_proceso');
                        } else if (estado === 'terminado_dilatar' || estado === 'terminado_sin_dilatar') {
                            // No bloquear campos en estados terminados según nueva regla.
                            localStorage.setItem(KEY_ESTADO, estado);
                        } else if (estado === 'pendiente' || !estado) {
                            // pendiente / desconocido → mantener bloqueo inicial
                            localStorage.setItem(KEY_ESTADO, 'pendiente');
                        }
                    })
                    .catch(() => {/* silencioso: no bloqueamos la UI si falla */
                    });
            } catch (e) {
                // No interrumpir flujo si el fetch falla
            }

            // Definir constante para saber si es optometría
            const esOptometria = paciente.procedimiento_proyectado === 'SERVICIOS OFTALMOLOGICOS GENERALES - SER-OFT-001 - OPTOMETRIA - AMBOS OJOS';

            if (paciente.pacienteNoAdmitido) {
                establecerBloqueoFormulario(true); // 🔒 Bloquea campos
                setTimeout(() => {
                    if (typeof Swal !== 'undefined') {
                        Swal.fire({
                            icon: 'warning',
                            title: '⚠️ Paciente no admitido',
                            confirmButtonText: 'OK',
                            allowOutsideClick: false,
                            allowEscapeKey: false
                        });
                    } else {
                        console.warn("⚠️ SweetAlert no está disponible. Verifica que se haya cargado correctamente.");
                    }
                }, 500);
            } else if (!paciente.pacienteNoAdmitido && esOptometria) {
                if (
                    !sessionStorage.getItem(KEY_PROMPT) &&
                    !['en_proceso', 'terminado_dilatar', 'terminado_sin_dilatar', 'finalizado'].includes(localStorage.getItem(KEY_ESTADO))
                ) {
                    sessionStorage.setItem(KEY_PROMPT, '1');
                    setTimeout(() => {
                        if (typeof Swal !== 'undefined') {
                            if (Swal.isVisible && Swal.isVisible()) return;
                            Swal.fire({
                                title: '¿Iniciar atención?',
                                icon: 'question',
                                confirmButtonText: 'Sí',
                                cancelButtonText: 'No',
                                showCancelButton: true,
                                reverseButtons: true
                            }).then((result) => {
                                if (result.isConfirmed) {
                                    establecerBloqueoFormulario(false);
                                    console.log(`🟡 Confirmando llegada para ID: ${paciente.form_id}`);
                                    fetch('https://asistentecive.consulmed.me/api/proyecciones/optometria.php', {
                                        method: 'POST',
                                        headers: {'Content-Type': 'application/json'},
                                        body: JSON.stringify({form_id: paciente.form_id, estado: 'iniciar_atencion'})
                                    })
                                        .then(response => response.json())
                                        .then(data => {
                                            if (data.success) {
                                                console.log('✅ Estado actualizado a "en proceso" correctamente.');
                                                localStorage.setItem(KEY_ESTADO, 'en_proceso');
                                            } else {
                                                console.error('❌ Error al actualizar el estado:', data.message);
                                            }
                                        })
                                        .catch(error => {
                                            console.error('❌ Error al enviar la solicitud:', error.message);
                                        });
                                } else {
                                    // permitir volver a preguntar más adelante en esta pestaña
                                    sessionStorage.removeItem(KEY_PROMPT);
                                    establecerBloqueoFormulario(true);
                                }
                            });
                        } else {
                            console.warn("⚠️ SweetAlert no está disponible. Verifica que se haya cargado correctamente.");
                        }
                    }, 500);
                }
                // Usar función refactorizada para el botón guardar en optometría
                manejarFinalizacionConsulta(
                    paciente,
                    'https://asistentecive.consulmed.me/api/proyecciones/optometria.php',
                    true
                );
            } else if (!paciente.pacienteNoAdmitido && !esOptometria) {
                if (
                    !sessionStorage.getItem(KEY_PROMPT) &&
                    !['en_proceso', 'terminado_dilatar', 'terminado_sin_dilatar', 'finalizado'].includes(localStorage.getItem(KEY_ESTADO))
                ) {
                    sessionStorage.setItem(KEY_PROMPT, '1');
                    setTimeout(() => {
                        if (typeof Swal !== 'undefined') {
                            if (Swal.isVisible && Swal.isVisible()) return;
                            Swal.fire({
                                title: '¿Iniciar atención?',
                                icon: 'question',
                                confirmButtonText: 'Sí',
                                cancelButtonText: 'No',
                                showCancelButton: true,
                                reverseButtons: true
                            }).then((result) => {
                                if (result.isConfirmed) {
                                    establecerBloqueoFormulario(false);
                                    console.log(`🟡 Confirmando llegada para ID: ${paciente.form_id}`);
                                    fetch('https://asistentecive.consulmed.me/api/proyecciones/consulta.php', {
                                        method: 'POST',
                                        headers: {'Content-Type': 'application/json'},
                                        body: JSON.stringify({form_id: paciente.form_id, estado: 'iniciar_atencion'})
                                    })
                                        .then(response => response.json())
                                        .then(data => {
                                            if (data.success) {
                                                console.log('✅ Estado actualizado a "en proceso" correctamente.');
                                                localStorage.setItem(KEY_ESTADO, 'en_proceso');
                                            } else {
                                                console.error('❌ Error al actualizar el estado:', data.message);
                                            }
                                        })
                                        .catch(error => {
                                            console.error('❌ Error al enviar la solicitud:', error.message);
                                        });
                                } else {
                                    sessionStorage.removeItem(KEY_PROMPT);
                                    establecerBloqueoFormulario(true);
                                }
                            });
                        } else {
                            console.warn("⚠️ SweetAlert no está disponible. Verifica que se haya cargado correctamente.");
                        }
                    }, 500);
                }
                // Usar función refactorizada para el botón guardar en consulta general
                manejarFinalizacionConsulta(
                    paciente,
                    'https://asistentecive.consulmed.me/api/proyecciones/consulta.php',
                    false
                );
            }
        }
    }

    const ESTADOS = {
        TERMINADO_DILATAR: 'terminado_dilatar',
        TERMINADO_SIN_DILATAR: 'terminado_sin_dilatar',
        EN_PROCESO: 'iniciar_atencion'
    };

    // Helper: POST robusto con timeout, reintento y fallback a x-www-form-urlencoded
    async function postEstadoRobusto(endpoint, payload, {timeoutMs = 8000, retries = 1} = {}) {
        const sleep = (ms) => new Promise(r => setTimeout(r, ms));
        const doPostJson = (signal) => fetch(endpoint, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(payload),
            signal
        });
        const doPostForm = (signal) => fetch(endpoint, {
            method: 'POST',
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            body: new URLSearchParams(payload),
            signal
        });

        for (let attempt = 0; attempt <= retries; attempt++) {
            try {
                // 1) Intento JSON
                let controller = new AbortController();
                let timer = setTimeout(() => controller.abort(), timeoutMs);
                let res = await doPostJson(controller.signal);
                clearTimeout(timer);
                if (res.ok) {
                    return await res.json().catch(() => ({success: false, message: 'Respuesta no es JSON'}));
                }
                // 2) Fallback form-encoded
                controller = new AbortController();
                timer = setTimeout(() => controller.abort(), timeoutMs);
                res = await doPostForm(controller.signal);
                clearTimeout(timer);
                if (res.ok) {
                    return await res.json().catch(() => ({success: false, message: 'Respuesta no es JSON'}));
                }
                throw new Error(`HTTP ${res.status}`);
            } catch (err) {
                if (attempt === retries) throw err;
                await sleep(600); // breve espera antes de reintentar
            }
        }
    }

    function manejarFinalizacionConsulta(paciente, endpoint, esOptometria) {
        const botonGuardar = document.getElementById('botonGuardar');
        if (!botonGuardar) return;
        if (botonGuardar.dataset.listenerInicializado === 'true') return;
        botonGuardar.dataset.listenerInicializado = 'true';
        // Evitar submit implícito del botón
        if (botonGuardar && botonGuardar.getAttribute('type') !== 'button') {
            botonGuardar.setAttribute('type', 'button');
        }
        botonGuardar.addEventListener('click', function (event) {
            // Interceptar totalmente el clic para que ningún otro listener dispare guardado antes de tiempo
            event.preventDefault();
            if (typeof event.stopPropagation === 'function') event.stopPropagation();
            if (typeof event.stopImmediatePropagation === 'function') event.stopImmediatePropagation();

            // Debounce para evitar flujos paralelos por doble clic rápido
            if (botonGuardar.dataset.guardando === 'true') return;
            botonGuardar.dataset.guardando = 'true';

            const form = event.target.closest('form');

            // Bloquear cualquier submit del formulario mientras haya modal activo o estemos en guardado
            const preventSubmitWhileModal = (ev) => {
                const modalVisible = (typeof Swal !== 'undefined' && Swal.isVisible && Swal.isVisible());
                if (modalVisible || botonGuardar.dataset.guardando === 'true') {
                    ev.preventDefault();
                    if (typeof ev.stopPropagation === 'function') ev.stopPropagation();
                }
            };
            document.addEventListener('submit', preventSubmitWhileModal, true);

            Swal.fire({
                title: '¿Dilataste al paciente?',
                icon: 'question',
                showDenyButton: true,
                confirmButtonText: '✅ Sí',
                denyButtonText: '🆗 No',
                reverseButtons: true,
                allowOutsideClick: false,
                allowEscapeKey: false
            }).then((result) => {
                if (!result.isConfirmed && !result.isDenied) {
                    // Usuario cerró sin elegir: limpiar estado y salir
                    botonGuardar.dataset.guardando = 'false';
                    document.removeEventListener('submit', preventSubmitWhileModal, true);
                    return;
                }

                const estado = result.isConfirmed
                    ? ESTADOS.TERMINADO_DILATAR
                    : ESTADOS.TERMINADO_SIN_DILATAR;

                Swal.fire({
                    title: '¿Finalizar atención?',
                    text: 'Se registrará como terminada.',
                    icon: 'question',
                    showCancelButton: true,
                    confirmButtonText: '✅ Finalizar',
                    cancelButtonText: '🔙 Cancelar',
                    allowOutsideClick: false,
                    allowEscapeKey: false
                }).then((finalResult) => {
                    if (!finalResult.isConfirmed) {
                        Swal.fire('Atención en curso', 'Puedes seguir trabajando.', 'info');
                        botonGuardar.dataset.guardando = 'false';
                        document.removeEventListener('submit', preventSubmitWhileModal, true);
                        return;
                    }

                    Swal.fire({
                        title: 'Enviando...',
                        text: 'Actualizando estado del paciente.',
                        allowOutsideClick: false,
                        allowEscapeKey: false,
                        didOpen: () => {
                            Swal.showLoading();
                        }
                    });

                    postEstadoRobusto(endpoint, {form_id: paciente.form_id, estado: estado}, {
                        timeoutMs: 15000,
                        retries: 1
                    })
                        .then((data) => {
                            // Cerrar spinner si sigue abierto
                            if (typeof Swal !== 'undefined' && Swal.isVisible && Swal.isVisible()) {
                                try {
                                    Swal.close();
                                } catch (_) {
                                }
                            }
                            if (data && data.success) {
                                const mensajeFinal = estado === ESTADOS.TERMINADO_DILATAR
                                    ? 'Consulta finalizada y se procederá a dilatar al paciente.'
                                    : 'Consulta finalizada sin dilatación.';
                                Swal.fire('Éxito', mensajeFinal, 'success').then(() => {
                                    localStorage.setItem(`estado_atencion_${paciente.form_id}`, 'finalizado');
                                    sessionStorage.removeItem(`prompt_iniciar_${paciente.form_id}`);
                                    botonGuardar.dataset.guardando = 'false';
                                    document.removeEventListener('submit', preventSubmitWhileModal, true);
                                    if (form) form.submit();
                                });
                            } else {
                                botonGuardar.dataset.guardando = 'false';
                                document.removeEventListener('submit', preventSubmitWhileModal, true);
                                const msg = (data && (data.message || data.error)) ? (data.message || data.error) : 'No se pudo enviar la información correctamente.';
                                Swal.fire('Error', msg, 'error');
                            }
                        })
                        .catch((error) => {
                            // Cerrar spinner si sigue abierto
                            if (typeof Swal !== 'undefined' && Swal.isVisible && Swal.isVisible()) {
                                try {
                                    Swal.close();
                                } catch (_) {
                                }
                            }
                            botonGuardar.dataset.guardando = 'false';
                            document.removeEventListener('submit', preventSubmitWhileModal, true);
                            let msg = 'Fallo de red';
                            if (error && error.name === 'AbortError') {
                                msg = '⏱️ El servidor tardó demasiado en responder.';
                            } else if (error && /Failed to fetch/i.test(error.message || '')) {
                                msg = '🌐 Error de red: no se pudo contactar al servidor.';
                            } else if (error && /HTTP\s+\d+/.test(error.message || '')) {
                                msg = `💥 Error del servidor: ${error.message}`;
                            } else if (error && error.message) {
                                msg = error.message;
                            }
                            Swal.fire('Error', msg, 'error');
                            console.error('Error:', error);
                        });
                });
            });
        }, true);
    }
})();