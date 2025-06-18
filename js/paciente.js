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
                            body: new URLSearchParams({form_id: id})
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

    (function () {
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

                if (paciente.pacienteNoAdmitido) {
                    setTimeout(() => {
                        if (typeof Swal !== 'undefined') {
                            Swal.fire({
                                icon: 'warning',
                                title: 'Paciente no admitido. No deberías escribir en la historia clínica.',
                                text: '⚠️ Este paciente aún no ha llegado.',
                                confirmButtonText: 'Entendido',
                            });
                        } else {
                            console.warn("⚠️ SweetAlert no está disponible. Verifica que se haya cargado correctamente.");
                        }
                    }, 500);
                } else if (
                    !paciente.pacienteNoAdmitido &&
                    paciente.procedimiento_proyectado === 'SERVICIOS OFTALMOLOGICOS GENERALES - SER-OFT-001 - OPTOMETRIA - AMBOS OJOS'
                ) {
                    setTimeout(() => {
                        if (typeof Swal !== 'undefined') {
                            Swal.fire({
                                icon: 'question',
                                title: '¿Desea comenzar con la atención?',
                                confirmButtonText: 'Sí',
                                showCancelButton: true,
                                cancelButtonText: 'No'
                            }).then((result) => {
                                if (result.isConfirmed) {
                                    console.log(`🟡 Confirmando llegada para ID: ${paciente.form_id}`);
                                    fetch('https://asistentecive.consulmed.me/api/proyecciones/optometria.php', {
                                        method: 'POST',
                                        headers: {'Content-Type': 'application/json'},
                                        body: JSON.stringify({
                                            form_id: paciente.form_id,
                                            estado: 'iniciar_atencion'
                                        })
                                    })
                                        .then(response => response.json())
                                        .then(data => {
                                            if (data.success) {
                                                console.log('✅ Estado actualizado a "en proceso" correctamente.');
                                            } else {
                                                console.error('❌ Error al actualizar el estado:', data.message);
                                            }
                                        })
                                        .catch(error => {
                                            console.error('❌ Error al enviar la solicitud:', error.message);
                                        });
                                }
                            });
                        } else {
                            console.warn("⚠️ SweetAlert no está disponible. Verifica que se haya cargado correctamente.");
                        }
                    }, 500);

                    document.getElementById('botonGuardar')?.addEventListener('click', function (event) {
                        event.preventDefault(); // Evita el envío inmediato del formulario

                        Swal.fire({
                            title: 'Atención finalizada en Optometría',
                            text: 'Selecciona una opción:',
                            icon: 'question',
                            showCancelButton: true,
                            showDenyButton: true,
                            confirmButtonText: 'Terminé y dilatar',
                            denyButtonText: 'Terminé',
                            cancelButtonText: 'No he terminado',
                            reverseButtons: true,
                        }).then((result) => {
                            let estadoOptometria;

                            if (result.isConfirmed) {
                                estadoOptometria = 'terminado_dilatar';
                            } else if (result.isDenied) {
                                estadoOptometria = 'terminado_sin_dilatar';
                            } else {
                                Swal.fire('Continuar atención', 'Puedes seguir trabajando en la consulta.', 'info');
                                return; // No continuar si elige seguir trabajando
                            }

                            fetch('https://asistentecive.consulmed.me/api/proyecciones/optometria.php', {
                                method: 'POST',
                                headers: {'Content-Type': 'application/json'},
                                body: JSON.stringify({
                                    form_id: paciente.form_id,
                                    estado: estadoOptometria
                                })
                            })
                                .then(response => response.json())
                                .then(data => {
                                    if (data.success) {
                                        Swal.fire('Éxito', 'La información fue actualizada correctamente.', 'success').then(() => {
                                            event.target.closest('form').submit();
                                        });
                                    } else {
                                        Swal.fire('Error', 'No se pudo enviar la información correctamente.', 'error');
                                    }
                                })
                                .catch(error => {
                                    Swal.fire('Error', 'Error de red o servidor.', 'error');
                                    console.error('Error:', error);
                                });
                        });
                    });
                }
            }
        }
    })();
})();