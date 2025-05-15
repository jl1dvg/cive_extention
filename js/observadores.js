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
        const tabla = document.querySelector('table.kv-grid-table');
        if (!tabla) return;

        const filas = Array.from(tabla.querySelectorAll('tbody tr'));
        const pacientes = [];

        filas.forEach(fila => {
            const servicioTd = fila.querySelector('td[data-col-seq="6"]');
            const horaCitaTd = fila.querySelector('td[data-col-seq="7"]');
            const afiliacionTd = fila.querySelector('td[data-col-seq="11"]');
            const tiempoTd = fila.querySelector('td[data-col-seq="17"]');

            if (!tiempoTd) return;

            const badgeSpan = tiempoTd?.querySelector('span.badge');
            const backgroundColor = badgeSpan && badgeSpan.style ? badgeSpan.style.backgroundColor : '';

            const intervaloSpan = tiempoTd?.querySelector('span');
            const tiempoTexto = intervaloSpan?.textContent.trim();

            if (
                servicioTd?.textContent.trim() === 'OPT OPTOMETRIA' &&
                horaCitaTd && afiliacionTd && tiempoTd &&
                intervaloSpan && tiempoTexto &&
                backgroundColor === 'red'
            ) {
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
                    nombre: fila.querySelector('td[data-col-seq="8"]')?.textContent.trim() || 'Desconocido',
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
            if (p.estado === 'ATENDIDO') iconoEstado = '✅';
            else if (p.estado === 'AGENDADO') iconoEstado = '⚠️';
            else if (['EN CONSULTA', 'LLAMADO'].includes(p.estado)) iconoEstado = '🕐';

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

})();