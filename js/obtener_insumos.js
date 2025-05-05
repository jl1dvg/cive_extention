window.detectarInsumosPaciente = () => {
    console.log("🔍 Módulo obtener_insumos.js cargado. Esperando clic en icono de corazón...");

    setTimeout(() => {
        document.querySelectorAll('td[data-col-seq="14"] a').forEach(heartIcon => {
            heartIcon.addEventListener("click", (event) => {
                event.preventDefault();

                const fila = heartIcon.closest("tr");
                const textoProcedimiento = fila?.querySelector('td[data-col-seq="8"]')?.textContent?.trim()?.toUpperCase();

                if (!textoProcedimiento || !textoProcedimiento.startsWith("CIRUGIAS")) {
                    console.log("⚠️ Procedimiento no quirúrgico. No se ejecutará la lógica de insumos.");
                    return;
                }

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

    fetch("https://asistentecive.consulmed.me/api/insumos/obtener.php", {
        method: "POST", headers: {
            "Content-Type": "application/json"
        }, body: JSON.stringify({
            hcNumber: hcNumber, form_id: idSolicitud
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
                    icon: "error", title: "Error en la consulta", text: data.message, confirmButtonText: "Cerrar"
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
    document.querySelectorAll('[id^="select2-hccirugiahospitalizacion-derechos-"][id$="-derecho-container"]').forEach(span => {
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

    const nombresAnestesiaTabla = [];
    document.querySelectorAll('[id^="select2-hccirugiahospitalizacion-insumos-"][id$="-insumo-container"]').forEach(span => {
        const texto = span.textContent.trim().toUpperCase();
        const nombre = texto.split(" - ")[0]; // Extraer parte útil si tiene formato "código - descripción"
        if (nombre) nombresAnestesiaTabla.push(nombre);
    });
    console.log("📋 Nombres de anestesia ya en la tabla:", nombresAnestesiaTabla);

    const nuevosEquipos = (insumos.equipos || []).filter(equipo => {
        if (!equipo.codigo) return false; // Solo contar si tiene código
        const codigoAPI = equipo.codigo.trim().toUpperCase();
        const yaExiste = nombresTabla.includes(codigoAPI);
        console.log(`🔍 Comparando: "${codigoAPI}" con [${nombresTabla.join(", ")}] → ${yaExiste ? "❌ Ya existe" : "✅ Nuevo"}`);
        return !yaExiste;
    });

    // 🔄 Combinar anestesia y quirúrgicos por código y sumar cantidades
    const mapInsumos = new Map();
    const insumosCombinados = [...(insumos.anestesia || []), ...(insumos.quirurgicos || [])];

    insumosCombinados.forEach(item => {
        if (!item.codigo) return; // Solo contar si tiene código
        const codigo = item.codigo.trim().toUpperCase();
        const cantidad = parseInt(item.cantidad) || 0;

        if (mapInsumos.has(codigo)) {
            mapInsumos.get(codigo).cantidad += cantidad;
        } else {
            mapInsumos.set(codigo, {
                ...item, codigo, cantidad
            });
        }
    });

    const insumosUnificados = Array.from(mapInsumos.values());

    // 📋 Obtener códigos existentes en la tabla de insumos
    const codigosTablaAnestesia = [];
    document.querySelectorAll('[id^="select2-hccirugiahospitalizacion-insumos-"][id$="-insumo-container"]').forEach(span => {
        const texto = span.textContent.trim().toUpperCase();
        const codigo = texto.split(" - ")[0]; // Asumimos que inicia con el código
        if (codigo) codigosTablaAnestesia.push(codigo);
    });

    // 🔍 Filtrar solo los nuevos insumos (no repetidos)
    const insumosNuevos = insumosUnificados.filter(item => !codigosTablaAnestesia.includes(item.codigo));
    console.log("📋 Códigos ya en la tabla de anestesia:", codigosTablaAnestesia);
    console.log("🆕 Insumos (anestesia + quirúrgicos) a insertar:", insumosNuevos.map(i => `${i.codigo} (${i.cantidad})`));

    console.log("🆕 Equipos nuevos a insertar:", nuevosEquipos.map(e => e.nombre));

    let mensaje = "";
    if (nuevosEquipos.length > 0) {
        mensaje += `<strong>Equipos nuevos:</strong> ${nuevosEquipos.length} elementos<br>`;
    }
    if (insumosNuevos.length > 0) {
        mensaje += `<strong>Anestesia/Quirúrgicos nuevos:</strong> ${insumosNuevos.length} elementos<br>`;
    }

    if (nuevosEquipos.length === 0 && insumosNuevos.length === 0) {
        Swal.fire({
            icon: "info",
            title: "Insumos ya existentes",
            text: "Todos los equipos y anestesias ya están presentes en la tabla.",
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
            agregarAnestesiaATabla(insumosNuevos.length, async () => {
                await completarDatosAnestesia(insumosNuevos);
                console.log("✅ Anestesia + quirúrgicos agregados correctamente.");
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
    const botonAgregar = document.querySelector("#seriales-input-insumos .js-input-plus");

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

        const nombre = equipos[index].codigo.trim().toUpperCase();
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
    const filasExistentes = document.querySelectorAll("#seriales-input-insumos .multiple-input-list__item").length;
    let filaDestino = filasExistentes - anestesiaArray.length;

    for (let index = 0; index < anestesiaArray.length; index++) {
        const item = anestesiaArray[index];

        if (!item || typeof item.nombre !== 'string' || item.nombre.trim() === '') {
            console.warn(`⚠️ El insumo de anestesia en la fila ${index + 1} no tiene nombre válido:`, item);
            continue;
        }

        const nombre = item.codigo.trim().toUpperCase();
        console.log(`🧾 Preparando búsqueda para anestesia "${nombre}" en fila ${index + 1}...`);

        const filaActual = filaDestino + index;
        const select2ContainerId = `#select2-hccirugiahospitalizacion-insumos-${filaActual}-insumo-container`;
        // 🏪 Establecer almacén antes de seleccionar insumo
        const almacenSelect = document.querySelector(`#hccirugiahospitalizacion-insumos-${filaActual}-almacen_id`);
        if (almacenSelect) {
            // Simula clic en el Select2 para asegurar que las opciones estén visibles
            const almacenSelectContainer = `#select2-hccirugiahospitalizacion-insumos-${filaActual}-almacen_id-container`;
            try {
                await hacerClickEnSelect2(almacenSelectContainer);
                await escribirEnCampoBusqueda("FACT ADMISION");
                await seleccionarOpcion();
            } catch (error) {
                console.warn(`⚠️ No se pudo abrir el select de almacén en fila ${filaActual}:`, error);
            }

            // Espera breve antes de acceder a las opciones del select
            await new Promise(r => setTimeout(r, 300));

            const option = Array.from(almacenSelect.options).find(opt => opt.textContent.trim().toUpperCase() === 'FACT ADMISION');
            if (option) {
                almacenSelect.value = option.value;
                const changeEvent = new Event("change", {bubbles: true});
                almacenSelect.dispatchEvent(changeEvent);
                console.log(`🏪 Almacén "FACT ADMISION" seleccionado para fila ${filaActual}`);
            } else {
                console.warn(`⚠️ No se encontró opción "FACT ADMISION" para la fila ${filaActual}`);
            }
        } else {
            console.warn(`⚠️ No se encontró el select de almacén para la fila ${filaActual}`);
        }

        try {
            await hacerClickEnSelect2(select2ContainerId);
            await escribirEnCampoBusqueda(nombre);
            await seleccionarOpcion();
            const inputCantidad = document.querySelector(`#hccirugiahospitalizacion-insumos-${filaActual}-cantidad-insumos`);
            if (inputCantidad) {
                inputCantidad.value = item.cantidad;
                const eventChange = new Event("change", {bubbles: true});
                inputCantidad.dispatchEvent(eventChange);
                console.log(`✏️ Cantidad "${item.cantidad}" establecida en fila ${index + 1}`);
            } else {
                console.warn(`⚠️ Campo de cantidad no encontrado para la fila ${index + 1}`);
            }
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