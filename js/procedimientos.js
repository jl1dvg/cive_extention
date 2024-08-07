import {cargarJSON} from './utils.js';
import {mostrarProcedimientosPorCategoria} from './popup.js';


export function cargarProtocolos() {
    cargarJSON('data/procedimientos.json')
        .then(data => {
            console.log('Datos de protocolos cargados:', data);
            const procedimientosData = data.procedimientos;
            crearBotonesCategorias(procedimientosData, 'contenedorProtocolos');
        })
        .catch(error => console.error('Error cargando JSON de protocolos:', error));
}

export function ejecutarProtocolos(id) {
    cargarJSON('data/procedimientos.json')
        .then(data => {
            const item = data.procedimientos.find(d => d.id === id);
            if (!item) throw new Error('ID no encontrado en el JSON');

            chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
                chrome.scripting.executeScript({
                    target: {tabId: tabs[0].id}, func: ejecutarEnPagina, args: [item]
                });
            });
        })
        .catch(error => console.error('Error en la ejecución de protocolo:', error));
}

function ejecutarEnPagina(item) {
    function llenarCampoTexto(selector, valor) {
        return new Promise((resolve, reject) => {
            const textArea = document.querySelector(selector);
            if (textArea) {
                console.log(`Llenando el campo de texto "${selector}" con "${valor}"`);
                textArea.value = valor;
                setTimeout(resolve, 100); // Añadir un retraso para asegurar que el valor se establezca
            } else {
                reject(`El campo de texto "${selector}" no se encontró.`);
            }
        });
    }

    function hacerClickEnBoton(selector, numeroDeClicks) {
        return new Promise((resolve, reject) => {
            const botonPlus = document.querySelector(selector);
            if (botonPlus) {
                console.log(`Haciendo clic en el botón "${selector}" ${numeroDeClicks} veces`);
                let clicks = 0;

                function clickBoton() {
                    if (clicks < numeroDeClicks) {
                        botonPlus.click();
                        clicks++;
                        setTimeout(clickBoton, 100); // 500ms delay between clicks
                    } else {
                        resolve();
                    }
                }

                clickBoton();
            } else {
                reject(`El botón "${selector}" no se encontró.`);
            }
        });
    }

    function hacerClickEnSelect2(selector) {
        return new Promise((resolve, reject) => {
            const tecnicoContainer = document.querySelector(selector);
            if (tecnicoContainer) {
                console.log(`Haciendo clic en el contenedor: ${selector}`);
                const event = new MouseEvent('mousedown', {
                    view: window, bubbles: true, cancelable: true
                });
                tecnicoContainer.dispatchEvent(event);
                setTimeout(resolve, 100); // Añadir un retraso para asegurar que el menú se despliegue
            } else {
                reject(`El contenedor "${selector}" no se encontró.`);
            }
        });
    }

    function establecerBusqueda(selector, valor) {
        return new Promise((resolve, reject) => {
            let attempts = 0;
            const maxAttempts = 20;

            const searchForField = () => {
                const searchField = document.querySelector('input.select2-search__field');
                if (searchField) {
                    console.log('Estableciendo búsqueda:', valor);
                    searchField.value = valor;
                    const inputEvent = new Event('input', {
                        bubbles: true, cancelable: true
                    });
                    searchField.dispatchEvent(inputEvent);
                    setTimeout(() => resolve(searchField), 500); // Añadir un retraso para asegurar que los resultados se carguen
                } else if (attempts < maxAttempts) {
                    console.log(`Esperando campo de búsqueda del Select2... intento ${attempts + 1}`);
                    attempts++;
                    hacerClickEnSelect2(selector)
                        .then(() => {
                            setTimeout(searchForField, 500); // Espera y reintenta
                        })
                        .catch(error => reject(error));
                } else {
                    reject('El campo de búsqueda del Select2 no se encontró.');
                }
            };

            searchForField();
        });
    }

    function seleccionarOpcion() {
        return new Promise((resolve, reject) => {
            const searchField = document.querySelector('input.select2-search__field');
            if (searchField) {
                console.log('Seleccionando opción');
                const enterEvent = new KeyboardEvent('keydown', {
                    key: 'Enter', keyCode: 13, bubbles: true, cancelable: true
                });
                searchField.dispatchEvent(enterEvent);
                setTimeout(resolve, 200); // Añadir un retraso para asegurar que la opción se seleccione
            } else {
                reject('El campo de búsqueda del Select2 no se encontró para seleccionar la opción.');
            }
        });
    }

    function seleccionarRadioNo() {
        return new Promise((resolve, reject) => {
            const radioNo = document.querySelector('input[name="ConsultaSubsecuente[examenHistopatologico]"][value="2"]');
            if (radioNo) {
                console.log('Seleccionando el radio botón "NO"');
                radioNo.checked = true;
                resolve();
            } else {
                reject('El radio botón "NO" no se encontró.');
            }
        });
    }

    function obtenerFechaActual() {
        const fecha = new Date();
        const dia = String(fecha.getDate()).padStart(2, '0');
        const mes = String(fecha.getMonth() + 1).padStart(2, '0'); // Los meses son de 0 a 11
        const year = fecha.getFullYear();
        return `${dia}/${mes}/${year}`;
    }

    function hacerClickEnPresuntivo(selector) {
        return new Promise((resolve, reject) => {
            const botonPresuntivo = document.querySelector(selector);

            if (botonPresuntivo) {
                console.log('Haciendo clic en el checkbox "PRESUNTIVO"');
                botonPresuntivo.click();
                resolve();
            } else {
                reject('El checkbox "PRESUNTIVO" no se encontró.');
            }
        });
    }

    function llenarCampoCantidad(selector, cantidad, tabCount = 0) {
        return new Promise((resolve, reject) => {
            const campoCantidad = document.querySelector(selector);
            if (campoCantidad) {
                console.log(`Llenando el campo cantidad con el valor: ${cantidad}`);
                campoCantidad.focus();
                campoCantidad.value = cantidad;
                campoCantidad.dispatchEvent(new Event('input', {bubbles: true}));
                campoCantidad.dispatchEvent(new Event('change', {bubbles: true}));

                // Simular la tecla TAB la cantidad de veces especificada
                let tabsPressed = 0;
                const pressTab = () => {
                    if (tabsPressed < tabCount) {
                        const tabEvent = new KeyboardEvent('keydown', {
                            key: 'Tab', keyCode: 9, code: 'Tab', which: 9, bubbles: true, cancelable: true
                        });
                        document.activeElement.dispatchEvent(tabEvent);

                        const tabEventPress = new KeyboardEvent('keypress', {
                            key: 'Tab', keyCode: 9, code: 'Tab', which: 9, bubbles: true, cancelable: true
                        });
                        document.activeElement.dispatchEvent(tabEventPress);

                        const tabEventUp = new KeyboardEvent('keyup', {
                            key: 'Tab', keyCode: 9, code: 'Tab', which: 9, bubbles: true, cancelable: true
                        });
                        document.activeElement.dispatchEvent(tabEventUp);

                        tabsPressed++;
                        setTimeout(pressTab, 100); // Asegurar que el evento se despacha correctamente
                    } else {
                        campoCantidad.blur();
                        resolve();
                    }
                };
                pressTab();
            } else {
                reject('El campo cantidad no se encontró.');
            }
        });
    }


    const ejecutarAcciones = (item) => {
        // Llenar campos de texto
        return Promise.all([llenarCampoTexto('#consultasubsecuente-membrete', item.membrete), llenarCampoTexto('#consultasubsecuente-dieresis', item.dieresis), llenarCampoTexto('#consultasubsecuente-exposicion', item.exposicion), llenarCampoTexto('#consultasubsecuente-hallazgo', item.hallazgo), llenarCampoTexto('#consultasubsecuente-operatorio', item.operatorio), llenarCampoTexto('#consultasubsecuente-complicacionesoperatorio', item.complicacionesoperatorio), llenarCampoTexto('#consultasubsecuente-perdidasanguineat', item.perdidasanguineat), hacerClickEnBoton('#trabajadorprotocolo-input-subsecuente .multiple-input-list__item .js-input-plus', item.staffCount), hacerClickEnBoton('#procedimientoprotocolo-input-subsecuente .multiple-input-list__item .js-input-plus', item.codigoCount), hacerClickEnBoton('#diagnosticossub11111 .list-cell__button .js-input-plus', item.diagnosticoCount)]);
    };

    function obtenerOjoATratar() {
        const notasDoctorElement = document.querySelector("div[style*='text-align:justify;'] div[style*='margin-right:30px;margin-left:30px;']");
        if (notasDoctorElement) {
            const texto = notasDoctorElement.textContent.trim().toUpperCase();
            if (texto.includes("OJO DERECHO")) {
                console.log("OJO DERECHO (OD)");
                return {sigla: "OD", descripcion: "OJO DERECHO"};
            } else if (texto.includes("OJO IZQUIERDO")) {
                console.log("OJO IZQUIERDO (OI)");
                return {sigla: "OI", descripcion: "OJO IZQUIERDO"};
            } else if (texto.includes("AMBOS OJOS")) {
                console.log("AMBOS OJOS (AO)");
                return {sigla: "AO", descripcion: "AMBOS OJOS"};
            } else {
                console.log("Ojo no especificado");
                return {sigla: "", descripcion: "Ojo no especificado"};
            }
        } else {
            console.error('No se encontró el elemento con las notas del doctor.');
            return {sigla: "", descripcion: "Ojo no especificado"};
        }
    }

// Ejemplo de uso
    const ojoATratar = obtenerOjoATratar();
    console.log(ojoATratar);

    function ejecutarCodigos(item, ojo) {
        console.log(ojoATratar);
        return item.codigos.reduce((promise, codigo) => {
            return promise.then(() => {
                return hacerClickEnSelect2(codigo.selector)
                    .then(() => establecerBusqueda(codigo.selector, codigo.nombre))
                    .then(() => seleccionarOpcion())
                    .then(() => hacerClickEnSelect2(codigo.lateralidad))
                    .then(() => establecerBusqueda(codigo.lateralidad, ojo))
                    .then(() => seleccionarOpcion())
                    .catch(error => console.error(`Error procesando código ${codigo.nombre}:`, error));
            });
        }, Promise.resolve()); // Inicializa con una promesa resuelta
    }

    function ejecutarDiagnosticos(item, ojo) {
        if (!Array.isArray(item.diagnosticos)) return Promise.resolve();

        return item.diagnosticos.reduce((promise, diagnostico) => {
            return promise.then(() => {
                return hacerClickEnSelect2(diagnostico.selector)
                    .then(() => establecerBusqueda(diagnostico.selector, diagnostico.nombre))
                    .then(() => seleccionarOpcion())
                    //.then(() => hacerClickEnPresuntivo(diagnostico.definitivo))
                    .then(() => hacerClickEnSelect2(diagnostico.lateralidad))
                    .then(() => establecerBusqueda(diagnostico.lateralidad, ojo))
                    .then(() => seleccionarOpcion())
                    .catch(error => console.error(`Error procesando código ${diagnostico.nombre}:`, error));
            });
        }, Promise.resolve()); // Inicializa con una promesa resuelta
    }

    function ejecutarRecetas(item) {
        if (!Array.isArray(item.recetas)) return Promise.resolve();

        return hacerClickEnBoton('#prescripcion', 1)
            .then(() => hacerClickEnBoton('#recetas-input .list-cell__button .js-input-plus', item.recetaCount))
            .then(() => esperarElemento(`#select2-recetas-recetasadd-0-producto_id-container`)) // Solo se ejecuta una vez
            .then(() => {
                // Iterar sobre cada receta
                return item.recetas.reduce((promise, receta) => {
                    return promise.then(() => {
                        // Manejar el producto
                        return hacerClickEnSelect2(`#select2-recetas-recetasadd-${receta.id}-producto_id-container`)
                            .then(() => establecerBusqueda(`#select2-recetas-recetasadd-${receta.id}-producto_id-container`, receta.nombre))
                            .then(() => seleccionarOpcion());
                    });
                }, Promise.resolve()); // Inicializa con una promesa resuelta
            })
            .then(() => {
                // Ahora manejar las vías
                return item.recetas.reduce((promise, receta) => {
                    return promise.then(() => {
                        return hacerClickEnSelect2(`#select2-recetas-recetasadd-${receta.id}-vias-container`)
                            .then(() => establecerBusqueda(`#select2-recetas-recetasadd-${receta.id}-vias-container`, receta.via))
                            .then(() => seleccionarOpcion());
                    });
                }, Promise.resolve()); // Inicializa con una promesa resuelta
            })
            .then(() => {
                // Ahora manejar las unidades
                return item.recetas.reduce((promise, receta) => {
                    return promise.then(() => {
                        return hacerClickEnSelect2(`#select2-recetas-recetasadd-${receta.id}-unidad_id-container`)
                            .then(() => establecerBusqueda(`#select2-recetas-recetasadd-${receta.id}-unidad_id-container`, receta.unidad))
                            .then(() => seleccionarOpcion());
                    });
                }, Promise.resolve()); // Inicializa con una promesa resuelta
            })
            .then(() => {
                // Ahora manejar las pautas
                return item.recetas.reduce((promise, receta) => {
                    return promise.then(() => {
                        return hacerClickEnSelect2(`#select2-recetas-recetasadd-${receta.id}-pauta-container`)
                            .then(() => establecerBusqueda(`#select2-recetas-recetasadd-${receta.id}-pauta-container`, receta.pauta))
                            .then(() => seleccionarOpcion());
                    });
                }, Promise.resolve()); // Inicializa con una promesa resuelta
            })
            .then(() => {
                // Ahora manejar las cantidades
                return item.recetas.reduce((promise, receta) => {
                    return promise.then(() => {
                        return llenarCampoCantidad(`#recetas-recetasadd-${receta.id}-cantidad`, receta.cantidad, 2)
                    });
                }, Promise.resolve()); // Inicializa con una promesa resuelta
            })
            .then(() => {
                // Ahora manejar las total_farmacia
                return item.recetas.reduce((promise, receta) => {
                    return promise.then(() => {
                        return llenarCampoTexto(`#recetas-recetasadd-${receta.id}-total_farmacia`, receta.totalFarmacia)
                    });
                }, Promise.resolve()); // Inicializa con una promesa resuelta
            })
            .then(() => {
                // Ahora manejar las observaciones
                return item.recetas.reduce((promise, receta) => {
                    return promise.then(() => {
                        return llenarCampoTexto(`#recetas-recetasadd-${receta.id}-observaciones`, receta.observaciones)
                    });
                }, Promise.resolve()); // Inicializa con una promesa resuelta
            });
    }


    function capturarNombreUsuario() {
        const nombreUsuarioElement = document.querySelector('.dropdown.user.user-menu .hidden-xs');
        if (nombreUsuarioElement) {
            return nombreUsuarioElement.textContent.trim();
        } else {
            console.error('No se encontró el nombre del usuario.');
            return 'Nombre no encontrado';
        }
    }

    function obtenerNombreMedicoSeleccionado(opcion = 'completo') {
        const nombreMedicoElement = document.getElementById('select2-consultasubsecuente-trabajadoragenda-container');
        if (nombreMedicoElement) {
            const nombreMedico = nombreMedicoElement.getAttribute('title');
            if (nombreMedico) {
                if (opcion === 'completo') {
                    return nombreMedico;
                } else if (opcion === 'apellidos') {
                    const palabras = nombreMedico.split(' ');
                    return palabras.slice(-2).join(' ');
                } else {
                    return 'Opción no válida';
                }
            } else {
                return 'Nombre no encontrado';
            }
        } else {
            console.error('No se encontró el nombre del médico.');
            return 'Nombre no encontrado';
        }
    }

// Ejemplo de uso:
    const nombreCompleto = obtenerNombreMedicoSeleccionado('completo');
    console.log('Nombre completo del médico:', nombreCompleto);

    const apellidosMedico = obtenerNombreMedicoSeleccionado('apellidos');
    console.log('Apellidos del médico:', apellidosMedico);

    function esperarElemento(selector) {
        return new Promise((resolve, reject) => {
            const elemento = document.querySelector(selector);
            if (elemento) {
                resolve(elemento);
                return;
            }

            const observer = new MutationObserver((mutations, observerInstance) => {
                mutations.forEach((mutation) => {
                    const nodes = Array.from(mutation.addedNodes);
                    for (const node of nodes) {
                        if (node.matches && node.matches(selector)) {
                            observerInstance.disconnect();
                            resolve(node);
                            return;
                        }
                    }
                });
            });

            observer.observe(document.body, {
                childList: true, subtree: true
            });

            setTimeout(() => {
                observer.disconnect();
                reject(`El elemento "${selector}" no se encontró dentro del tiempo esperado.`);
            }, 10000); // Timeout de 10 segundos, ajusta según sea necesario
        });
    }

    function sumarHoras(hora, horasASumar) {
        const [horas, minutos] = hora.split(':').map(Number);
        if (isNaN(horas) || isNaN(minutos)) {
            return null; // Manejo de error si alguno de los valores no es un número
        }
        const fecha = new Date();
        fecha.setHours(horas, minutos, 0); // Segundos se ponen a 0

        // Sumar las horas
        fecha.setHours(fecha.getHours() + horasASumar);

        // Formatear la nueva hora
        return [String(fecha.getHours()).padStart(2, '0'), String(fecha.getMinutes()).padStart(2, '0')].join(':');
    }

    function actualizarHoraFin() {
        const campoHoraInicio = document.querySelector('#consultasubsecuente-horainicio');
        const campoHoraFin = document.querySelector('#consultasubsecuente-horafin');

        if (campoHoraInicio && campoHoraFin) {
            const horaInicio = campoHoraInicio.value;

            // Asegúrate de que la hora de inicio esté en el formato correcto
            if (!/^\d{2}:\d{2}$/.test(horaInicio)) {
                console.error('La hora de inicio no está en el formato correcto (hh:mm).');
                return;
            }

            const nuevaHoraFin = sumarHoras(horaInicio, 2);

            if (nuevaHoraFin) {
                campoHoraFin.value = nuevaHoraFin; // Modificar directamente el value
                console.log(`La nueva hora de fin es: ${nuevaHoraFin}`);
            } else {
                console.error('Error al sumar horas a la hora de inicio.');
            }
        } else {
            console.error('No se encontraron los campos de hora de inicio o de fin.');
        }
    }

// Llamar a la función para actualizar la hora de fin
    actualizarHoraFin();

    const nombreUsuario = capturarNombreUsuario();
    const textoDictado = `DICTADO POR: ${nombreCompleto}\nFECHA DE DICTADO: ${obtenerFechaActual()}\nESCRITO POR: ${nombreUsuario}`;
    const observaciones = `Se realiza ${item.membrete} en ${ojoATratar.descripcion} sin complicaciones.
Se dan indicaciones médicas, cuidado de la herida y actividades permitidas y restringidas.
Se prescribe medicación por vía oral
Se indica al paciente que debe acudir a una consulta de control en las próximas 24 horas`

    function ejecutarTecnicos(item, nombreCirujano) {
        if (!Array.isArray(item.tecnicos)) return Promise.resolve();

        return item.tecnicos.reduce((promise, tecnico) => {
            return promise.then(() => {
                return hacerClickEnSelect2(tecnico.selector)
                    .then(() => establecerBusqueda(tecnico.selector, tecnico.funcion))
                    .then(() => seleccionarOpcion())
                    .then(() => hacerClickEnSelect2(tecnico.trabajador))
                    .then(() => {
                        if (tecnico.nombre === 'cirujano_principal') {
                            return establecerBusqueda(tecnico.trabajador, nombreCirujano);
                        } else {
                            return establecerBusqueda(tecnico.trabajador, tecnico.nombre);
                        }
                    })
                    .then(() => seleccionarOpcion())
                    .catch(error => console.error(`Error procesando técnico ${tecnico.nombre}:`, error));
            });
        }, Promise.resolve()); // Inicializa con una promesa resuelta
    }

    function destacarBotonSubida() {
        const botonSubida = document.querySelector('#consultasubsecuente-fotoupload');
        if (botonSubida) {
            botonSubida.style.backgroundColor = '#f88';  // Cambia el color de fondo para llamar la atención
            botonSubida.style.transition = 'background-color 0.5s';  // Transición suave del color
            console.log('Por favor, haga clic en el botón de subida de archivos para continuar y revisar el ojo y diagnósticos correctos.');
            alert('Por favor, haga clic en el botón de subida de archivos para continuar.');  // Mensaje para el usuario
        } else {
            console.error('El botón de subida de archivos no se encontró.');
        }
    }


    ejecutarAcciones(item)
        .then(() => ejecutarTecnicos(item, apellidosMedico))
        .then(() => ejecutarCodigos(item, ojoATratar.sigla))
        .then(() => llenarCampoTexto('#consultasubsecuente-datoscirugia', textoDictado))
        .then(() => seleccionarRadioNo())
        .then(() => actualizarHoraFin())
        .then(() => hacerClickEnSelect2('#select2-consultasubsecuente-anestesia_id-container'))
        .then(() => establecerBusqueda('#select2-consultasubsecuente-anestesia_id-container', "REGIONAL"))
        .then(() => seleccionarOpcion())
        .then(() => ejecutarDiagnosticos(item, ojoATratar.sigla))
        .then(() => ejecutarRecetas(item))
        .then(() => esperarElemento('#docsolicitudprocedimientos-observacion_consulta'))
        .then(() => llenarCampoTexto('#docsolicitudprocedimientos-observacion_consulta', observaciones))
        .then(() => hacerClickEnBoton('#consultaActual', 1))
        .then(() => destacarBotonSubida())  // Asegúrate de que el selector sea correcto
        .then(() => console.log('Clic simulado correctamente.'))
        .catch(error => console.error('Error en la ejecución de acciones:', error));
}

function crearBotonesCategorias(procedimientos, contenedorId) {
    const categorias = [...new Set(procedimientos.map(procedimiento => procedimiento.categoria))];
    const contenedorBotones = document.getElementById(contenedorId);
    contenedorBotones.innerHTML = ''; // Limpiar el contenedor
    categorias.forEach(categoria => {
        const col = document.createElement('div');
        col.className = 'col-sm-4';
        const boton = document.createElement('button');
        boton.className = 'btn btn-outline-primary btn-sm';
        boton.textContent = categoria;
        boton.addEventListener('click', () => {
            console.log(`Categoría clickeada: ${categoria}`);
            const procedimientosCategoria = procedimientos.filter(procedimiento => procedimiento.categoria === categoria);
            mostrarProcedimientosPorCategoria(procedimientosCategoria);
        });
        col.appendChild(boton);
        contenedorBotones.appendChild(col);
    });
}




