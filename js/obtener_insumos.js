window.erroresInsumosNoIngresados = [];
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
                // Guardar duración en variable global si está disponible
                window.duracionOxigenoGlobal = data.duracion;

                // Nuevo: Verificar status distinto de 1 antes de mostrar insumos
                if (data.status !== 1) {
                    Swal.fire({
                        icon: "warning",
                        title: "Protocolo no revisado",
                        text: "Este protocolo aún no ha sido revisado. No se puede iniciar el autollenado.",
                        confirmButtonText: "Aceptar"
                    });
                    return;
                }

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
    document.querySelectorAll('#seriales-input-insumos td.list-cell__insumo').forEach(td => {
        const texto = td.textContent.trim().toUpperCase();
        const nombre = texto.split(" - ")[0];
        if (nombre) nombres.push(nombre);
    });
    return nombres;
}

// 📢 Mostrar alerta con insumos no repetidos
function mostrarAlertaInsumos(insumos) {
    const nombresTabla = obtenerNombresTabla();
    console.log("📋 Nombres existentes en la tabla:", nombresTabla);

    // Detectar también los nombres de los derechos (uso de equipos)
    const nombresDerechosTabla = [];
    document.querySelectorAll('[id^="select2-hccirugiahospitalizacion-derechos-"][id$="-derecho-container"]').forEach(span => {
        const texto = span.textContent.trim().toUpperCase();
        const nombre = texto.split(" - ")[0]; // Extraer código o nombre base
        if (nombre) nombresDerechosTabla.push(nombre);
    });
    console.log("📋 Nombres de derechos ya en la tabla:", nombresDerechosTabla);

    const nombresAnestesiaTabla = [];
    document.querySelectorAll('[id^="select2-hccirugiahospitalizacion-insumos-"][id$="-insumo-container"]').forEach(span => {
        const texto = span.textContent.trim().toUpperCase();
        const nombre = texto.split(" - ")[0]; // Extraer parte útil si tiene formato "código - descripción"
        if (nombre) nombresAnestesiaTabla.push(nombre);
    });
    console.log("📋 Nombres de anestesia ya en la tabla:", nombresAnestesiaTabla);

    // 🧪 Verificar si el oxígeno 911111 ya está presente y con los valores correctos usando setTimeout
    setTimeout(() => {
        // --- Oxígeno ---
        const filaOxigeno = document.querySelector(`#select2-hccirugiahospitalizacion-oxigeno-0-oxigeno_id-container`);
        window.oxigenoPresente = false;
        window.oxigenoDuracionCorrecta = false;
        window.oxigenoLitrosCorrecto = false;

        if (filaOxigeno && filaOxigeno.textContent.toUpperCase().includes("911111")) {
            window.oxigenoPresente = true;

            const inputTiempo = document.querySelector(`#hccirugiahospitalizacion-oxigeno-0-tiempo`);
            if (inputTiempo && inputTiempo.value !== "") {
                const duracionApi = window.duracionOxigenoGlobal || "01:00";
                const [h, m] = duracionApi.split(":").map(Number);
                const tiempoEsperado = h + (m / 60);
                window.oxigenoDuracionCorrecta = parseFloat(inputTiempo.value).toFixed(2) === tiempoEsperado.toFixed(2);
            }

            const inputLitros = document.querySelector(`#hccirugiahospitalizacion-oxigeno-0-litros`);
            if (inputLitros && inputLitros.value !== "") {
                window.oxigenoLitrosCorrecto = parseFloat(inputLitros.value) === 3;
            }
        }

        if (!window.oxigenoPresente || !window.oxigenoDuracionCorrecta || !window.oxigenoLitrosCorrecto) {
            window.erroresInsumosNoIngresados.push({
                tipo: "oxigeno",
                nombre: "911111",
                fila: 1,
                error: `${!window.oxigenoPresente ? 'No presente' : ''}${!window.oxigenoPresente ? ', ' : ''}${!window.oxigenoDuracionCorrecta ? 'Duración incorrecta' : ''}${!window.oxigenoDuracionCorrecta && !window.oxigenoLitrosCorrecto ? ', ' : ''}${!window.oxigenoLitrosCorrecto ? 'Litros distinto de 3' : ''}`
            });

            const duracion = window.duracionOxigenoGlobal || "01:00";
            const [h, m] = duracion.split(":").map(Number);
            const tiempoEsperado = h + (m / 60);

            const inputTiempo = document.querySelector(`#hccirugiahospitalizacion-oxigeno-0-tiempo`);
            if (inputTiempo) {
                inputTiempo.value = tiempoEsperado;
                inputTiempo.dispatchEvent(new Event("change", {bubbles: true}));
                console.log(`🔄 Duración de oxígeno corregida a ${tiempoEsperado} horas`);
            }

            const inputLitros = document.querySelector(`#hccirugiahospitalizacion-oxigeno-0-litros`);
            if (inputLitros) {
                inputLitros.value = 3;
                inputLitros.dispatchEvent(new Event("change", {bubbles: true}));
                console.log("🔄 Litros de oxígeno corregidos a 3");
            }
        }

        // --- Tiempo de Anestesia ---
        // Verificar si el tiempo de anestesia ya está presente con el código correcto y cuartos correctos
        const filaAnestesia = document.querySelector(`#select2-hccirugiahospitalizacion-anestesia-0-anestesia-container`);
        window.tiempoAnestesiaPresente = false;
        window.tiempoAnestesiaCuartosCorrecto = false;

        if (filaAnestesia && filaAnestesia.textContent.toUpperCase().includes("999999")) {
            window.tiempoAnestesiaPresente = true;

            const inputTiempoAnestesia = document.querySelector(`#hccirugiahospitalizacion-anestesia-0-tiempo`);
            if (inputTiempoAnestesia && inputTiempoAnestesia.value !== "") {
                const duracion = window.duracionOxigenoGlobal || "01:00";
                const [h, m] = duracion.split(":").map(Number);
                const tiempoEsperado = Math.round((h * 60 + m) / 15);
                window.tiempoAnestesiaCuartosCorrecto = parseInt(inputTiempoAnestesia.value) === tiempoEsperado;
            }
        }

        if (!window.tiempoAnestesiaPresente || !window.tiempoAnestesiaCuartosCorrecto) {
            window.erroresInsumosNoIngresados.push({
                tipo: "tiempo_anestesia",
                nombre: "999999",
                fila: 1,
                error: `${!window.tiempoAnestesiaPresente ? 'No presente' : ''}${!window.tiempoAnestesiaPresente ? ', ' : ''}${!window.tiempoAnestesiaCuartosCorrecto ? 'Duración incorrecta' : ''}`
            });

            const duracion = window.duracionOxigenoGlobal || "01:00";
            const [h, m] = duracion.split(":").map(Number);
            const tiempoEsperado = Math.round((h * 60 + m) / 15);

            const inputTiempoAnestesia = document.querySelector(`#hccirugiahospitalizacion-anestesia-0-tiempo`);
            if (inputTiempoAnestesia) {
                inputTiempoAnestesia.value = tiempoEsperado;
                inputTiempoAnestesia.dispatchEvent(new Event("change", {bubbles: true}));
                console.log(`🔄 Duración de anestesia corregida a ${tiempoEsperado} bloques de 15 minutos`);
            }
        }
    }, 500);

    const nuevosEquipos = (insumos.equipos || []).filter(equipo => {
        if (!equipo.codigo) return false; // Solo contar si tiene código
        const codigoAPI = equipo.codigo.trim().toUpperCase();
        const yaExiste = nombresTabla.includes(codigoAPI) || nombresDerechosTabla.includes(codigoAPI);
        console.log(`🔍 Comparando: "${codigoAPI}" con [${nombresTabla.join(", ")}] y derechos [${nombresDerechosTabla.join(", ")}] → ${yaExiste ? "❌ Ya existe" : "✅ Nuevo"}`);
        return !yaExiste;
    });

    // 🔄 Combinar anestesia y quirúrgicos por código y sumar cantidades
    const mapInsumos = new Map();
    const insumosCombinados = [...(insumos.anestesia || []), ...(insumos.quirurgicos || [])];

    insumosCombinados.forEach(item => {
        if (!item.codigo) {
            //console.warn("⚠️ Insumo sin código omitido:", item.nombre || item);
            return;
        }

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

    console.log("🔎 Total insumos combinados:", mapInsumos.size);
    const insumosUnificados = Array.from(mapInsumos.values()).filter(i => i.codigo && i.codigo.trim() !== "");

    // Detectar insumos presentes pero con cantidad incorrecta
    const insumosCantidadIncorrecta = insumosUnificados.filter(item => {
        const codigo = item.codigo;
        const cantidadEsperada = parseInt(item.cantidad);
        const fila = [...document.querySelectorAll('[id^="select2-hccirugiahospitalizacion-insumos-"][id$="-insumo-container"]')]
            .findIndex(span => span.textContent.trim().toUpperCase().startsWith(codigo));

        if (fila === -1) return false;

        const inputCantidad = document.querySelector(`#hccirugiahospitalizacion-insumos-${fila}-cantidad-insumos`);
        if (!inputCantidad) return false;

        const cantidadActual = parseInt(inputCantidad.value || "0");
        return cantidadActual !== cantidadEsperada;
    });

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
    if (insumosCantidadIncorrecta.length > 0) {
        mensaje += `<strong>Cantidades incorrectas:</strong> ${insumosCantidadIncorrecta.length} insumos serán corregidos<br>`;
    }
    if (!window.oxigenoPresente || !window.oxigenoDuracionCorrecta || !window.oxigenoLitrosCorrecto) {
        mensaje += `<strong>Oxígeno:</strong> Se corregirá el valor<br>`;
    }
    if (!window.tiempoAnestesiaPresente || !window.tiempoAnestesiaCuartosCorrecto) {
        mensaje += `<strong>Tiempo de anestesia:</strong> Se corregirá el valor<br>`;
    }

    if (nuevosEquipos.length === 0 && insumosNuevos.length === 0 && insumosCantidadIncorrecta.length === 0) {
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
    }).then(async (result) => {
        if (result.isConfirmed) {
            console.log("✅ El usuario aceptó agregar los nuevos insumos.");

            // Corregir cantidades incorrectas antes de completar datos
            insumosCantidadIncorrecta.forEach(item => {
                const codigo = item.codigo;
                const cantidadEsperada = parseInt(item.cantidad);
                const fila = [...document.querySelectorAll('[id^="select2-hccirugiahospitalizacion-insumos-"][id$="-insumo-container"]')]
                    .findIndex(span => span.textContent.trim().toUpperCase().startsWith(codigo));

                if (fila !== -1) {
                    const inputCantidad = document.querySelector(`#hccirugiahospitalizacion-insumos-${fila}-cantidad-insumos`);
                    if (inputCantidad) {
                        inputCantidad.value = cantidadEsperada;
                        const eventChange = new Event("change", {bubbles: true});
                        inputCantidad.dispatchEvent(eventChange);
                        console.log(`🔁 Cantidad de "${codigo}" corregida a ${cantidadEsperada} en fila ${fila}`);
                    }
                }
            });

            await new Promise(resolve => agregarFilas("#seriales-input-derecho .js-input-plus", nuevosEquipos.length, resolve, "equipos"));
            await new Promise(resolve => agregarFilas("#seriales-input-insumos .js-input-plus", insumosNuevos.length, resolve, "anestesia"));
            await new Promise(resolve => agregarFilas("#seriales-input-oxigeno .js-input-plus", 1, resolve, "oxigeno"));
            await new Promise(resolve => agregarFilas("#seriales-input-anestesia .js-input-plus", 1, resolve, "tiempoAnestesia"));

            await completarDatosEquipos(nuevosEquipos);
            console.log("✅ Equipos agregados correctamente.");

            await completarDatosAnestesia(insumosNuevos);
            console.log("✅ Anestesia + quirúrgicos agregados correctamente.");

            await completarDatosOxigeno("911111", 0);
            console.log("✅ Oxígeno agregado correctamente.");

            await completarDatosTiempoAnestesia("999999", 0);
            console.log("✅ Tiempo de anestesia agregado correctamente.");

            // Filtrar errores que realmente persisten después de correcciones
            window.erroresInsumosNoIngresados = window.erroresInsumosNoIngresados.filter(err => {
                if (err.tipo === "oxigeno") {
                    return !window.oxigenoPresente || !window.oxigenoDuracionCorrecta || !window.oxigenoLitrosCorrecto;
                }
                if (err.tipo === "tiempo_anestesia") {
                    return !window.tiempoAnestesiaPresente || !window.tiempoAnestesiaCuartosCorrecto;
                }
                return true;
            });

            if (window.erroresInsumosNoIngresados.length > 0) {
                console.warn("❗Errores detectados durante el llenado:");
                console.table(window.erroresInsumosNoIngresados);

                const detalles = window.erroresInsumosNoIngresados
                    .map(err => `• ${err.tipo.toUpperCase()} "${err.nombre}" (fila ${err.fila}) - ${err.error}`)
                    .join('\n');

                Swal.fire({
                    icon: "warning",
                    title: "Insumos no ingresados",
                    html: `<pre style="text-align:left;font-size:13px">${detalles}</pre>`,
                    confirmButtonText: "Cerrar"
                });
            } else {
                console.log("✅ Todos los insumos fueron ingresados exitosamente.");
            }
        } else {
            console.log("❌ El usuario canceló la acción.");
        }
    });
}

// Función utilitaria para agregar filas genéricamente
/**
 * Agrega filas a una tabla haciendo clic en el botón "+" una cantidad de veces.
 * @param {string} tablaSelector - Selector CSS del botón "+" correspondiente a la tabla.
 * @param {number} cantidad - Número de veces a hacer clic.
 * @param {function} callback - Función a llamar al finalizar.
 * @param {string} tipoLog - (opcional) Tipo de insumo para log.
 */
function agregarFilas(tablaSelector, cantidad, callback, tipoLog = "") {
    const botonAgregar = document.querySelector(tablaSelector);
    if (!botonAgregar) {
        console.warn(`⚠️ No se encontró el botón '+' para agregar (${tipoLog || tablaSelector})`);
        if (callback && typeof callback === "function") setTimeout(callback, 100);
        return;
    }
    if (cantidad <= 0) {
        if (callback && typeof callback === "function") setTimeout(callback, 100);
        return;
    }
    if (tipoLog) {
        console.log(`➕ Haciendo clic en el botón "+" de ${tipoLog} ${cantidad} veces...`);
    } else {
        console.log(`➕ Haciendo clic en el botón "+" (${tablaSelector}) ${cantidad} veces...`);
    }
    let clicksRealizados = 0;
    const interval = setInterval(() => {
        if (clicksRealizados < cantidad) {
            botonAgregar.click();
            clicksRealizados++;
        } else {
            clearInterval(interval);
            if (tipoLog) {
                console.log(`🎯 Todos los elementos de ${tipoLog} han sido agregados.`);
            }
            if (callback && typeof callback === "function") {
                setTimeout(callback, 500); // esperar a que se rendericen las filas
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
            await Select2Utils.hacerClick(select2ContainerId);
            await Select2Utils.buscar(nombre);
            await Select2Utils.seleccionar();
            console.log(`✅ "${nombre}" seleccionado correctamente`);
        } catch (error) {
            console.error(`❌ Error al seleccionar "${nombre}" en la fila ${index + 1}:`, error);
            window.erroresInsumosNoIngresados.push({
                tipo: "equipo", nombre: nombre, fila: index + 1, error: error.toString()
            });
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
                await Select2Utils.hacerClick(almacenSelectContainer);
                await Select2Utils.buscar("FACT ADMISION");
                await Select2Utils.seleccionar();
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
            await Select2Utils.hacerClick(select2ContainerId);
            await Select2Utils.buscar(nombre);
            await Select2Utils.seleccionar();
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
            window.erroresInsumosNoIngresados.push({
                tipo: "anestesia", nombre: nombre, fila: index + 1, error: error.toString()
            });
        }
    }
}

async function completarDatosOxigeno(codigoOxigeno = "911111", fila = 0) {
    console.log("🧠 Completando datos de oxígeno en la fila...");

    const select2ContainerId = `#select2-hccirugiahospitalizacion-oxigeno-${fila}-oxigeno_id-container`;

    try {
        console.log(`🔍 Buscando y seleccionando código de oxígeno "${codigoOxigeno}" en fila ${fila}...`);
        await Select2Utils.hacerClick(select2ContainerId);
        await Select2Utils.buscar(codigoOxigeno);
        await Select2Utils.seleccionar();

        // Establecer duración después de seleccionar el código
        setTimeout(() => {
            try {
                const duracion = window.duracionOxigenoGlobal || "01:00";
                const [horas, minutos] = duracion.split(":").map(Number);
                const tiempoEnHoras = horas + (minutos / 60);

                const inputTiempo = document.querySelector(`#hccirugiahospitalizacion-oxigeno-${fila}-tiempo`);
                if (inputTiempo) {
                    inputTiempo.value = tiempoEnHoras;
                    const eventChange = new Event("change", {bubbles: true});
                    inputTiempo.dispatchEvent(eventChange);
                    console.log(`⏱️ Tiempo de oxígeno establecido: ${tiempoEnHoras} horas`);
                } else {
                    console.warn(`⚠️ Campo de duración de oxígeno no encontrado para la fila ${fila}`);
                }

                // Añadido: establecer siempre el valor 3 en el campo de litros
                const inputLitros = document.querySelector(`#hccirugiahospitalizacion-oxigeno-${fila}-litros`);
                if (inputLitros) {
                    inputLitros.value = 3;
                    const eventChange = new Event("change", {bubbles: true});
                    inputLitros.dispatchEvent(eventChange);
                    console.log("💧 Litros de oxígeno establecidos en: 3");
                } else {
                    console.warn(`⚠️ Campo de litros de oxígeno no encontrado para la fila ${fila}`);
                }
            } catch (err) {
                console.error("❌ Error al establecer duración de oxígeno:", err);
            }
        }, 500);

        console.log("✅ Oxígeno por defecto agregado y configurado");
    } catch (error) {
        console.error(`❌ Error al completar datos de oxígeno:`, error);
        window.erroresInsumosNoIngresados.push({
            tipo: "oxigeno", nombre: codigoOxigeno, fila: fila, error: error.toString()
        });
    }
}

async function completarDatosTiempoAnestesia(codigoTiempoAnestesia = "999999", fila = 0) {
    console.log("🧠 Completando datos de Tiempo de Anestesia en la fila...");

    const select2ContainerId = `#select2-hccirugiahospitalizacion-anestesia-${fila}-anestesia-container`;

    try {
        console.log(`🔍 Buscando y seleccionando código de Tiempo de Anestesia "${codigoTiempoAnestesia}" en fila ${fila}...`);
        await Select2Utils.hacerClick(select2ContainerId);
        await Select2Utils.buscar(codigoTiempoAnestesia);
        await Select2Utils.seleccionar();

        // Establecer duración después de seleccionar el código
        setTimeout(() => {
            try {
                const duracion = window.duracionOxigenoGlobal || "01:00";
                const [horas, minutos] = duracion.split(":").map(Number);
                // Calcular el número entero de cuartos de hora (15 minutos)
                const tiempoEnHoras = Math.round((horas * 60 + minutos) / 15);

                const inputTiempo = document.querySelector(`#hccirugiahospitalizacion-anestesia-${fila}-tiempo`);
                if (inputTiempo) {
                    inputTiempo.value = tiempoEnHoras;
                    const eventChange = new Event("change", {bubbles: true});
                    inputTiempo.dispatchEvent(eventChange);
                    console.log(`⏱️ Tiempo de Anestesia establecido: ${tiempoEnHoras} bloques de 15 minutos`);
                } else {
                    console.warn(`⚠️ Campo de duración de anestesia no encontrado para la fila ${fila}`);
                }
            } catch (err) {
                console.error("❌ Error al establecer duración de anestesia:", err);
            }
        }, 500);
    } catch (error) {
        console.error(`❌ Error al completar datos de anestesia:`, error);
        window.erroresInsumosNoIngresados.push({
            tipo: "tiempo_anestesia", nombre: codigoTiempoAnestesia, fila: fila, error: error.toString()
        });
    }
}


// Utils agrupados para Select2
const Select2Utils = {
    hacerClick: function (selector) {
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
    },

    buscar: function (textoBusqueda) {
        console.log("🧪 Valor recibido en buscarEnSelect2:", textoBusqueda);
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
    },

    seleccionar: function () {
        return new Promise((resolve, reject) => {
            const esperarOpciones = () => {
                const opcion = document.querySelector(".select2-results__option");
                if (opcion) {
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
                } else {
                    setTimeout(esperarOpciones, 200);
                }
            };
            esperarOpciones();
        });
    }
};