let procedimientosData = []; // Variable global para almacenar los datos

document.addEventListener("DOMContentLoaded", () => {
    const inicioSection = document.getElementById('inicio');
    const examenesSection = document.getElementById('examenes');
    const protocolosSection = document.getElementById('protocolos');

    document.getElementById('btnExamenes').addEventListener('click', () => {
        cargarJSON('examenes.json')
            .then(data => {
                if (data && Array.isArray(data.examenes)) {
                    procedimientosData = data.examenes;
                    crearBotonesProcedimientos(procedimientosData, 'contenedorExamenes', ejecutarExamenes);
                    mostrarSeccion('examenes');
                } else {
                    console.error('El JSON de examenes no tiene la estructura esperada:', data);
                }
            })
            .catch(error => console.error('Error cargando JSON de examenes:', error));
    });

    document.getElementById('btnProtocolos').addEventListener('click', () => {
        cargarJSON('procedimientos.json')
            .then(data => {
                if (data && Array.isArray(data.procedimientos)) {
                    procedimientosData = data.procedimientos;
                    crearBotonesProcedimientos(procedimientosData, 'contenedorProtocolos', ejecutarMAC);
                    mostrarSeccion('protocolos');
                } else {
                    console.error('El JSON de procedimientos no tiene la estructura esperada:', data);
                }
            })
            .catch(error => console.error('Error cargando JSON de protocolos:', error));
    });

    document.getElementById('btnBackExamenes').addEventListener('click', () => {
        mostrarSeccion('inicio');
    });

    document.getElementById('btnBackProtocolos').addEventListener('click', () => {
        mostrarSeccion('inicio');
    });
});

function mostrarSeccion(seccionId) {
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(seccionId).classList.add('active');
}

function cargarJSON(url) {
    return fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        });
}

function crearBotonesProcedimientos(procedimientos, contenedorId, clickHandler) {
    const contenedorBotones = document.getElementById(contenedorId);
    contenedorBotones.innerHTML = ''; // Limpiar el contenedor
    procedimientos.forEach(procedimiento => {
        const boton = document.createElement('button');
        boton.id = `${procedimiento.id}`;
        boton.textContent = `${procedimiento.cirugia}`;
        boton.addEventListener('click', () => {
            clickHandler(procedimiento.id);
        });
        contenedorBotones.appendChild(boton);
    });
}

function ejecutarExamenes(id) {
    cargarJSON('examenes.json')
        .then(data => {
            const item = data.examenes.find(d => d.id === id);
            if (!item) throw new Error('ID no encontrado en el JSON');

            chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
                chrome.scripting.executeScript({
                    target: {tabId: tabs[0].id}, function: (item) => {
                        // Definir todas las funciones necesarias en este contexto
                        function ejecutarTecnicos(item) {
                            if (!Array.isArray(item.tecnicos)) return Promise.resolve();

                            return item.tecnicos.reduce((promise, tecnico) => {
                                return promise.then(() => {
                                    return hacerClickEnSelect2(tecnico.selector)
                                        .then(() => establecerBusqueda(tecnico.funcion))
                                        .then(() => seleccionarOpcion())
                                        .then(() => hacerClickEnSelect2(tecnico.trabajador))
                                        .then(() => establecerBusqueda(tecnico.nombre))
                                        .then(() => seleccionarOpcion())
                                        .catch(error => console.error(`Error procesando técnico ${tecnico.nombre}:`, error));
                                });
                            }, Promise.resolve());
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
                                    setTimeout(resolve, 200);
                                } else {
                                    reject(`El contenedor "${selector}" no se encontró.`);
                                }
                            });
                        }

                        function establecerBusqueda(valor) {
                            return new Promise((resolve, reject) => {
                                const searchField = document.querySelector('input.select2-search__field');
                                if (searchField) {
                                    console.log('Estableciendo búsqueda:', valor);
                                    searchField.value = valor;
                                    const inputEvent = new Event('input', {
                                        bubbles: true, cancelable: true
                                    });
                                    searchField.dispatchEvent(inputEvent);
                                    setTimeout(resolve, 200);
                                } else {
                                    reject('El campo de búsqueda del Select2 no se encontró.');
                                }
                            });
                        }

                        function seleccionarOpcion() {
                            return new Promise((resolve) => {
                                const searchField = document.querySelector('input.select2-search__field');
                                console.log('Seleccionando opción');
                                const enterEvent = new KeyboardEvent('keydown', {
                                    key: 'Enter', keyCode: 13, bubbles: true, cancelable: true
                                });
                                searchField.dispatchEvent(enterEvent);
                                setTimeout(resolve, 200);
                            });
                        }

                        function hacerClickEnBotonTerminar() {
                            return new Promise((resolve, reject) => {
                                const botonTerminar = document.querySelector('button.btn.btn-success[onclick="guardarTerminar()"]');
                                if (botonTerminar) {
                                    console.log('Haciendo clic en el botón "Terminar"');
                                    botonTerminar.click();
                                    resolve();
                                } else {
                                    reject('El botón "Terminar" no se encontró.');
                                }
                            });
                        }


                        ejecutarTecnicos(item)
                            .then(() => hacerClickEnBotonTerminar())
                            .catch(error => console.error('Error en la ejecución de examen:', error));
                    }, args: [item]
                });
            });
        })
        .catch(error => console.error('Error en la ejecución de examen:', error));
}

function ejecutarMAC(id) {
    cargarJSON('procedimientos.json')
        .then(data => {
            const item = data.procedimientos.find(d => d.id === id);
            if (!item) throw new Error('ID no encontrado en el JSON');

            // Inyectar el código en la pestaña activa
            chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
                chrome.scripting.executeScript({
                    target: {tabId: tabs[0].id}, function: (item) => {
                        function llenarCampoTexto(selector, valor) {
                            return new Promise((resolve, reject) => {
                                const textArea = document.querySelector(selector);
                                if (textArea) {
                                    console.log(`Llenando el campo de texto "${selector}" con "${valor}"`);
                                    textArea.value = valor;
                                    setTimeout(resolve, 100);
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
                                            setTimeout(clickBoton, 100);
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
                                    setTimeout(resolve, 200);
                                } else {
                                    reject(`El contenedor "${selector}" no se encontró.`);
                                }
                            });
                        }

                        function establecerBusqueda(valor) {
                            return new Promise((resolve, reject) => {
                                const searchField = document.querySelector('input.select2-search__field');
                                if (searchField) {
                                    console.log('Estableciendo búsqueda:', valor);
                                    searchField.value = valor;
                                    const inputEvent = new Event('input', {
                                        bubbles: true, cancelable: true
                                    });
                                    searchField.dispatchEvent(inputEvent);
                                    setTimeout(resolve, 200);
                                } else {
                                    reject('El campo de búsqueda del Select2 no se encontró.');
                                }
                            });
                        }

                        function seleccionarOpcion() {
                            return new Promise((resolve) => {
                                const searchField = document.querySelector('input.select2-search__field');
                                console.log('Seleccionando opción');
                                const enterEvent = new KeyboardEvent('keydown', {
                                    key: 'Enter', keyCode: 13, bubbles: true, cancelable: true
                                });
                                searchField.dispatchEvent(enterEvent);
                                setTimeout(resolve, 200);
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
                            const mes = String(fecha.getMonth() + 1).padStart(2, '0');
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

                        function capturarNombreUsuario() {
                            const nombreUsuarioElement = document.querySelector('.dropdown.user.user-menu .hidden-xs');
                            if (nombreUsuarioElement) {
                                return nombreUsuarioElement.textContent.trim();
                            } else {
                                console.error('No se encontró el nombre del usuario.');
                                return 'Nombre no encontrado';
                            }
                        }

                        function hacerClickEnBotonConsulta() {
                            return new Promise((resolve, reject) => {
                                const botonConsulta = document.querySelector('#consultaActual');
                                if (botonConsulta) {
                                    console.log('Haciendo clic en el botón de consulta');
                                    botonConsulta.click();
                                    setTimeout(resolve, 500);
                                } else {
                                    reject('El botón de consulta no se encontró.');
                                }
                            });
                        }

                        function esperarElemento(selector) {
                            return new Promise((resolve, reject) => {
                                const element = document.querySelector(selector);
                                if (element) {
                                    resolve(element);
                                    return;
                                }

                                const observer = new MutationObserver((mutations, me) => {
                                    const element = document.querySelector(selector);
                                    if (element) {
                                        me.disconnect();
                                        resolve(element);
                                    }
                                });

                                observer.observe(document, {
                                    childList: true, subtree: true
                                });

                                setTimeout(() => {
                                    observer.disconnect();
                                    reject(`El elemento "${selector}" no se encontró dentro del tiempo esperado.`);
                                }, 10000);
                            });
                        }

                        function sumarHoras(hora, horasASumar) {
                            const [horas, minutos] = hora.split(':').map(Number);
                            if (isNaN(horas) || isNaN(minutos)) {
                                return null;
                            }
                            const fecha = new Date();
                            fecha.setHours(horas, minutos, 0);

                            fecha.setHours(fecha.getHours() + horasASumar);

                            return [String(fecha.getHours()).padStart(2, '0'), String(fecha.getMinutes()).padStart(2, '0')].join(':');
                        }

                        function actualizarHoraFin() {
                            const campoHoraInicio = document.querySelector('#consultasubsecuente-horainicio');
                            const campoHoraFin = document.querySelector('#consultasubsecuente-horafin');

                            if (campoHoraInicio && campoHoraFin) {
                                const horaInicio = campoHoraInicio.value;

                                if (!/^\d{2}:\d{2}$/.test(horaInicio)) {
                                    console.error('La hora de inicio no está en el formato correcto (hh:mm).');
                                    return;
                                }

                                const nuevaHoraFin = sumarHoras(horaInicio, 2);

                                if (nuevaHoraFin) {
                                    campoHoraFin.value = nuevaHoraFin;
                                    console.log(`La nueva hora de fin es: ${nuevaHoraFin}`);
                                } else {
                                    console.error('Error al sumar horas: la hora de inicio no es válida.');
                                }
                            } else {
                                console.error('No se encontraron los campos de hora de inicio o fin.');
                            }
                        }

                        esperarElemento('#consultasubsecuente-horainicio')
                            .then(() => esperarElemento('#consultasubsecuente-horafin'))
                            .then(() => actualizarHoraFin())
                            .catch(error => console.error(error));

                        const ejecutarAcciones = () => {
                            // Llenar campos de texto
                            return Promise.all([llenarCampoTexto('#consultasubsecuente-membrete', item.membrete), llenarCampoTexto('#consultasubsecuente-dieresis', item.dieresis), llenarCampoTexto('#consultasubsecuente-exposicion', item.exposicion), llenarCampoTexto('#consultasubsecuente-hallazgo', item.hallazgo), llenarCampoTexto('#consultasubsecuente-operatorio', item.operatorio), llenarCampoTexto('#consultasubsecuente-complicacionesoperatorio', item.complicacionesoperatorio), llenarCampoTexto('#consultasubsecuente-perdidasanguineat', item.perdidasanguineat), hacerClickEnBoton('#trabajadorprotocolo-input-subsecuente .multiple-input-list__item .js-input-plus', item.staffCount), hacerClickEnBoton('#procedimientoprotocolo-input-subsecuente .multiple-input-list__item .js-input-plus', item.codigoCount), hacerClickEnBoton('#diagnosticossub11111 .list-cell__button .js-input-plus', item.diagnosticoCount)]);
                        };

                        function ejecutarTecnicos() {
                            if (!Array.isArray(item.tecnicos)) return Promise.resolve();

                            return item.tecnicos.reduce((promise, tecnico) => {
                                return promise.then(() => {
                                    return hacerClickEnSelect2(tecnico.selector)
                                        .then(() => establecerBusqueda(tecnico.funcion))
                                        .then(() => seleccionarOpcion())
                                        .then(() => hacerClickEnSelect2(tecnico.trabajador))
                                        .then(() => establecerBusqueda(tecnico.nombre))
                                        .then(() => seleccionarOpcion())
                                        .catch(error => console.error(`Error procesando técnico ${tecnico.nombre}:`, error));
                                });
                            }, Promise.resolve()); // Inicializa con una promesa resuelta
                        }

                        function ejecutarCodigos() {
                            if (!Array.isArray(item.codigos)) return Promise.resolve();

                            return item.codigos.reduce((promise, codigo) => {
                                return promise.then(() => {
                                    return hacerClickEnSelect2(codigo.selector)
                                        .then(() => establecerBusqueda(codigo.nombre))
                                        .then(() => seleccionarOpcion())
                                        .catch(error => console.error(`Error procesando código ${codigo.nombre}:`, error));
                                });
                            }, Promise.resolve()); // Inicializa con una promesa resuelta
                        }

                        function ejecutarDiagnosticos() {
                            if (!Array.isArray(item.diagnosticos)) return Promise.resolve();

                            return item.diagnosticos.reduce((promise, diagnostico) => {
                                return promise.then(() => {
                                    return hacerClickEnSelect2(diagnostico.selector)
                                        .then(() => establecerBusqueda(diagnostico.nombre))
                                        .then(() => seleccionarOpcion())
                                        .then(() => hacerClickEnPresuntivo(diagnostico.definitivo))
                                        .catch(error => console.error(`Error procesando código ${diagnostico.nombre}:`, error));
                                });
                            }, Promise.resolve()); // Inicializa con una promesa resuelta
                        }


                        // Llamar a las funciones en secuencia
                        ejecutarAcciones()
                            .then(ejecutarTecnicos)
                            .then(ejecutarCodigos)
                            .then(seleccionarRadioNo)
                            .then(() => hacerClickEnSelect2('#select2-consultasubsecuente-anestesia_id-container'))
                            .then(() => establecerBusqueda("REGIONAL"))
                            .then(() => seleccionarOpcion())
                            .then(ejecutarDiagnosticos)
                            .catch(error => console.error('Error en la ejecución de acciones:', error));
                    }, args: [item] // Pasar el item como argumento
                });
            });
        })
        .catch(error => console.error('Error en la ejecución de acciones:', error));
}

