window.detectarInsumosPaciente = () => {
    console.log("🔍 Módulo obtener_insumos.js cargado. Esperando clic en icono de corazón...");

    setTimeout(() => {
        document.querySelectorAll('td[data-col-seq="14"] a').forEach(heartIcon => {
            heartIcon.addEventListener("click", (event) => {
                event.preventDefault();
                console.log("❤️ Icono de corazón clickeado. Esperando que se abra el modal...");

                // Esperar a que el modal esté visible
                let intentos = 0;
                const maxIntentos = 10;

                const esperarModal = setInterval(() => {
                    const modal = document.querySelector('.modal.show, .modal[style*="display: block"], .modal[aria-hidden="false"]');

                    if (modal) {
                        console.log("🟢 Modal detectado. Extrayendo datos...");
                        clearInterval(esperarModal);

                        // Extraer idSolicitud desde los enlaces con "imprimir-cotizacion"
                        let idSolicitud = null;
                        document.querySelectorAll('a[href*="imprimir-cotizacion"]').forEach(link => {
                            const urlParams = new URLSearchParams(new URL(link.href, window.location.origin).search);
                            if (urlParams.has("idSolicitud")) {
                                idSolicitud = urlParams.get("idSolicitud");
                            }
                        });

                        // Extraer el número de historia clínica
                        const hcInput = document.querySelector('input#numero-historia-clinica');
                        let hcNumber = hcInput ? hcInput.value : null;

                        if (idSolicitud && hcNumber) {
                            console.log(`✅ Datos detectados:
                            - idSolicitud: ${idSolicitud}
                            - hcNumber: ${hcNumber}`);

                            // Llamar a la función para enviar los datos al API
                            enviarDatosAPI(idSolicitud, hcNumber);
                        } else {
                            console.warn("⚠️ No se encontraron todos los datos necesarios.");
                        }
                    } else {
                        console.log(`⏳ Intentando detectar modal... (${intentos + 1}/${maxIntentos})`);
                        intentos++;
                        if (intentos >= maxIntentos) {
                            console.warn("⚠️ No se detectó el modal después de varios intentos.");
                            clearInterval(esperarModal);
                        }
                    }
                }, 500);
            });
        });
    }, 1000);
};

// Función para enviar los datos al API y mostrar alerta con los insumos
function enviarDatosAPI(idSolicitud, hcNumber) {
    console.log("📡 Enviando datos al API...");

    fetch("https://cive.consulmed.me/interface/obtener_insumos.php", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            hcNumber: hcNumber,
            form_id: idSolicitud
        })
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                console.log("✅ Respuesta del API:", data);

                if (data.insumos && (data.insumos.equipos?.length > 0 || data.insumos.anestesia?.length > 0 || data.insumos.quirurgicos?.length > 0)) {
                    mostrarAlertaInsumos(data.insumos);
                } else {
                    Swal.fire({
                        icon: "info",
                        title: "Sin insumos",
                        text: "No se encontraron insumos disponibles para este paciente.",
                        confirmButtonText: "Aceptar"
                    });
                }
            } else {
                console.warn("⚠️ Error en la respuesta del API:", data.message);
                Swal.fire({
                    icon: "error",
                    title: "Error en la consulta",
                    text: data.message,
                    confirmButtonText: "Cerrar"
                });
            }
        })
        .catch(error => {
            console.error("❌ Error en la solicitud:", error);
            Swal.fire({
                icon: "error",
                title: "Error en la conexión",
                text: "No se pudo conectar con el servidor.",
                confirmButtonText: "Cerrar"
            });
        });
}

// 🔍 Obtener nombres de la tabla actual (columna "Nombre")
function obtenerNombresTabla() {
    const nombres = [];
    document.querySelectorAll('.list-cell__derecho .select2-selection__rendered').forEach(span => {
        const texto = span.textContent.trim().toUpperCase();
        const nombre = texto.split(" - ")[0]; // Tomar solo el código/nombre
        if (nombre) nombres.push(nombre);
    });
    return nombres;
}

// 📢 Mostrar alerta con insumos no repetidos
function mostrarAlertaInsumos(insumos) {
    const nombresTabla = obtenerNombresTabla();
    console.log("📋 Nombres existentes en la tabla:", nombresTabla);

    const nuevosEquipos = (insumos.equipos || []).filter(equipo => {
        const nombreAPI = equipo.nombre.trim().toUpperCase();
        const yaExiste = nombresTabla.some(nombreTabla => nombreAPI.startsWith(nombreTabla));
        console.log(`🔍 Comparando: "${nombreAPI}" con [${nombresTabla.join(", ")}] → ${yaExiste ? "❌ Ya existe" : "✅ Nuevo"}`);
        return !yaExiste;
    });

    console.log("🆕 Equipos nuevos a insertar:", nuevosEquipos.map(e => e.nombre));

    let mensaje = "";
    if (nuevosEquipos.length > 0) {
        mensaje += `<strong>Equipos nuevos:</strong> ${nuevosEquipos.length} elementos<br>`;
    }
    if (insumos.anestesia?.length > 0) {
        mensaje += `<strong>Anestesia:</strong> ${insumos.anestesia.length} elementos<br>`;
    }
    if (insumos.quirurgicos?.length > 0) {
        mensaje += `<strong>Quirúrgicos:</strong> ${insumos.quirurgicos.length} elementos<br>`;
    }

    if (nuevosEquipos.length === 0) {
        Swal.fire({
            icon: "info",
            title: "Insumos ya existentes",
            text: "Todos los equipos ya están presentes en la tabla.",
            confirmButtonText: "Aceptar"
        });
        return;
    }

    Swal.fire({
        icon: "success",
        title: "Insumos nuevos detectados",
        html: `${mensaje}<br>¿Deseas agregarlos?`,
        showCancelButton: true,
        confirmButtonText: "Sí, agregar",
        cancelButtonText: "No, cancelar"
    }).then((result) => {
        if (result.isConfirmed) {
            console.log("✅ El usuario aceptó agregar los nuevos insumos.");

            // Agregar Equipos
            agregarInsumosATabla(nuevosEquipos.length, async () => {
                await completarDatosEquipos(nuevosEquipos);
                console.log("✅ Equipos agregados correctamente.");
            });

            // Agregar Anestesia
            agregarAnestesiaATabla(insumos.anestesia.length, async () => {
                await completarDatosAnestesia(insumos.anestesia);
                console.log("✅ Anestesia agregada correctamente.");
            });
        } else {
            console.log("❌ El usuario canceló la acción.");
        }
    });
}

// Función para agregar los insumos en la tabla haciendo clic en el botón "+"
function agregarInsumosATabla(cantidad, callback) {
    const botonAgregar = document.querySelector("#seriales-input-derecho .js-input-plus");

    if (!botonAgregar) {
        console.warn("⚠️ No se encontró el botón '+' para agregar insumos.");
        return;
    }

    console.log(`➕ Haciendo clic en el botón "+" ${cantidad} veces...`);

    let clicksRealizados = 0;

    const interval = setInterval(() => {
        if (clicksRealizados < cantidad) {
            botonAgregar.click();
            clicksRealizados++;
        } else {
            clearInterval(interval);
            console.log("🎯 Todos los insumos han sido agregados.");

            if (callback && typeof callback === "function") {
                setTimeout(callback, 500); // esperar un poco para que se rendericen las filas
            }
        }
    }, 400); // tiempo ajustable
}

function agregarAnestesiaATabla(cantidad, callback) {
    const botonAgregar = document.querySelector("#seriales-input-anestesia .js-input-plus");

    if (!botonAgregar) {
        console.warn("⚠️ No se encontró el botón '+' para agregar anestesia.");
        return;
    }

    console.log(`➕ Haciendo clic en el botón '+' de anestesia ${cantidad} veces...`);

    let clicksRealizados = 0;
    const interval = setInterval(() => {
        if (clicksRealizados < cantidad) {
            botonAgregar.click();
            clicksRealizados++;
        } else {
            clearInterval(interval);
            console.log("🎯 Todos los insumos de anestesia han sido agregados.");

            if (callback && typeof callback === "function") {
                setTimeout(callback, 500); // Espera a que se rendericen las filas
            }
        }
    }, 400);
}

async function completarDatosEquipos(equipos) {
    console.log("🧠 Completando datos de equipos en la tabla...");

    const filasExistentes = document.querySelectorAll("#seriales-input-derecho .multiple-input-list__item").length;
    let filaDestino = filasExistentes - equipos.length;

    for (let index = 0; index < equipos.length; index++) {
        const filaActual = filaDestino + index;

        // Validación defensiva
        if (!equipos[index] || typeof equipos[index].nombre !== 'string' || equipos[index].nombre.trim() === '') {
            console.warn(`⚠️ El equipo en la fila ${index + 1} no tiene nombre válido:`, equipos[index]);
            continue;
        }

        const nombre = equipos[index].nombre.trim().toUpperCase();
        console.log(`🧾 Preparando búsqueda para "${nombre}"`);

        const select2ContainerId = `#select2-hccirugiahospitalizacion-derechos-${filaActual}-derecho-container`;

        try {
            console.log(`🔍 Buscando y seleccionando "${nombre}" en fila ${index + 1}...`);
            await hacerClickEnSelect2(select2ContainerId);
            await escribirEnCampoBusqueda(nombre);  // <-- renombrado para claridad
            await seleccionarOpcion();
            console.log(`✅ "${nombre}" seleccionado correctamente`);
        } catch (error) {
            console.error(`❌ Error al seleccionar "${nombre}" en la fila ${index + 1}:`, error);
        }
    }
}

async function completarDatosAnestesia(anestesiaArray) {
    console.log("🧠 Completando datos de anestesia en la tabla...");

    for (let index = 0; index < anestesiaArray.length; index++) {
        const item = anestesiaArray[index];

        if (!item || typeof item.nombre !== 'string' || item.nombre.trim() === '') {
            console.warn(`⚠️ El insumo de anestesia en la fila ${index + 1} no tiene nombre válido:`, item);
            continue;
        }

        const nombre = item.nombre.trim().toUpperCase();
        console.log(`🧾 Preparando búsqueda para anestesia "${nombre}" en fila ${index + 1}...`);

        const select2ContainerId = `#select2-hccirugiahospitalizacion-anestesia-${index}-anestesia-container`;

        try {
            await hacerClickEnSelect2(select2ContainerId);
            await escribirEnCampoBusqueda(nombre);
            await seleccionarOpcion();
            console.log(`✅ "${nombre}" seleccionado correctamente en anestesia`);
        } catch (error) {
            console.error(`❌ Error al seleccionar anestesia "${nombre}" en la fila ${index + 1}:`, error);
        }
    }
}

function escribirEnCampoBusqueda(textoBusqueda) {
    console.log("🧪 Valor recibido en escribirEnCampoBusqueda:", textoBusqueda);
    return new Promise((resolve, reject) => {
        const maxIntentos = 10;
        let intentos = 0;

        const intentarBuscar = () => {
            const campo = document.querySelector("input.select2-search__field");
            if (campo) {
                campo.value = textoBusqueda;
                const eventoInput = new Event("input", {bubbles: true, cancelable: true});
                campo.dispatchEvent(eventoInput);
                setTimeout(resolve, 300);
            } else if (intentos < maxIntentos) {
                intentos++;
                setTimeout(intentarBuscar, 300);
            } else {
                reject("No se encontró el campo de búsqueda de Select2.");
            }
        };

        intentarBuscar();
    });
}

// 🔘 Clic en el Select2 (abre el desplegable)
function hacerClickEnSelect2(selector) {
    return new Promise((resolve, reject) => {
        const container = document.querySelector(selector);
        if (container) {
            const event = new MouseEvent('mousedown', {
                view: window, bubbles: true, cancelable: true
            });
            container.dispatchEvent(event);
            setTimeout(resolve, 200);
        } else {
            console.error(`❌ Contenedor "${selector}" no encontrado.`);
            reject(`Contenedor "${selector}" no encontrado.`);
        }
    });
}

// ⌨️ Escribir en el input de búsqueda de Select2
function establecerBusqueda(valor) {
    console.log("🧪 Valor recibido en establecerBusqueda:", valor);
    return new Promise((resolve, reject) => {
        const maxIntentos = 10;
        let intentos = 0;

        const buscarCampo = () => {
            const campo = document.querySelector("input.select2-search__field");
            if (campo) {
                campo.value = valor;
                const inputEvent = new Event("input", {bubbles: true, cancelable: true});
                campo.dispatchEvent(inputEvent);
                setTimeout(() => resolve(), 300);
            } else if (intentos < maxIntentos) {
                intentos++;
                setTimeout(buscarCampo, 300);
            } else {
                reject("No se encontró el campo de búsqueda de Select2.");
            }
        };

        buscarCampo();
    });
}

// ⌨️ Simular Enter para seleccionar la opción
function seleccionarOpcion() {
    return new Promise((resolve, reject) => {
        const campo = document.querySelector("input.select2-search__field");
        if (campo) {
            const enterEvent = new KeyboardEvent("keydown", {
                key: "Enter", keyCode: 13, bubbles: true, cancelable: true
            });
            campo.dispatchEvent(enterEvent);
            setTimeout(resolve, 300);
        } else {
            reject("No se encontró el campo de búsqueda para hacer Enter.");
        }
    });
}