import {cargarJSON} from './utils.js';

export function cargarExamenes() {
    cargarJSON('data/examenes.json')
        .then(data => {
            console.log('Datos de exámenes cargados:', data);
            const procedimientosData = data.examenes;
            crearBotonesProcedimientos(procedimientosData, 'contenedorExamenes', ejecutarExamenes);
        })
        .catch(error => console.error('Error cargando JSON de examenes:', error));
}

function ejecutarExamenes(id) {
    cargarJSON('data/examenes.json')
        .then(data => {
            const item = data.examenes.find(d => d.id === id);
            if (!item) throw new Error('ID no encontrado en el JSON');

            chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
                chrome.scripting.executeScript({
                    target: {tabId: tabs[0].id}, func: ejecutarEnPagina, args: [item]
                });
            });
        })
        .catch(error => console.error('Error en la ejecución de examen:', error));
}

function ejecutarEnPagina(item) {
    // Función para mostrar el popup OD_OI
    function mostrarPopupOD_OI() {
        return new Promise((resolve) => {
            const popup = document.createElement('div');
            popup.style.position = 'fixed';
            popup.style.top = '0';
            popup.style.left = '0';
            popup.style.width = '100%';
            popup.style.height = '100%';
            popup.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
            popup.style.display = 'flex';
            popup.style.justifyContent = 'center';
            popup.style.alignItems = 'center';
            popup.style.zIndex = '9999';

            const popupURL = chrome.runtime.getURL('js/popup/popup.html');

            popup.innerHTML = `
            <button id="btnClose" style="position: absolute; top: 10px; right: 10px; font-size: 24px; border: none; background: transparent; cursor: pointer;">&times;</button>
            <iframe class="content-panel-frame placeholder-frame" id="placeholder-dialog" src="${popupURL}" style="height: 300px; width: 300px; border: none; border-radius: 5px;"></iframe>
        `;
            document.body.appendChild(popup);

            // Escuchar el mensaje del iframe
            window.addEventListener('message', function onMessage(event) {
                if (event.data.OD !== undefined && event.data.OI !== undefined && event.data.mensajeOD !== undefined && event.data.mensajeOI !== undefined) {
                    document.body.removeChild(popup);
                    window.removeEventListener('message', onMessage); // Remover el listener después de recibir el mensaje
                    resolve(event.data);
                }
                if (event.data.close) { // Manejar el cierre
                    document.body.removeChild(popup);
                    window.removeEventListener('message', onMessage);
                }
            });
        });
    }

    // Función para mostrar el popup de Campo Visual (cv)
    function mostrarPopupCV() {
        return new Promise((resolve) => {
            const popup = document.createElement('div');
            popup.style.position = 'fixed';
            popup.style.top = '0';
            popup.style.left = '0';
            popup.style.width = '100%';
            popup.style.height = '100%';
            popup.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
            popup.style.display = 'flex';
            popup.style.justifyContent = 'center';
            popup.style.alignItems = 'center';
            popup.style.zIndex = '9999';

            const popupURL = chrome.runtime.getURL('js/cv/cv.html');

            popup.innerHTML = `
            <button id="btnClose" style="position: absolute; top: 10px; right: 10px; font-size: 24px; border: none; background: transparent; cursor: pointer;">&times;</button>
            <iframe class="content-panel-frame placeholder-frame" id="placeholder-dialog" src="${popupURL}" style="height: 600px; width: 600px; border: none; border-radius: 5px;"></iframe>
        `;
            document.body.appendChild(popup);

            // Escuchar el mensaje del iframe
            window.addEventListener('message', function onMessage(event) {
                if (event.data.OD !== undefined && event.data.OI !== undefined && event.data.DLN_OD !== undefined && event.data.DLN_OI !== undefined) {
                    document.body.removeChild(popup);
                    window.removeEventListener('message', onMessage); // Remover el listener después de recibir el mensaje
                    resolve(event.data);
                }
                if (event.data.close) { // Manejar el cierre
                    document.body.removeChild(popup);
                    window.removeEventListener('message', onMessage);
                }
            });
        });
    }

    function mostrarPopup(url) {
        return new Promise((resolve) => {
            const popup = document.createElement('div');
            popup.style.position = 'fixed';
            popup.style.top = '0';
            popup.style.left = '0';
            popup.style.width = '100%';
            popup.style.height = '100%';
            popup.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
            popup.style.display = 'flex';
            popup.style.justifyContent = 'center';
            popup.style.alignItems = 'center';
            popup.style.zIndex = '9999';

            const popupURL = chrome.runtime.getURL(url);

            popup.innerHTML = `
                <div style="position: relative;">
                <button id="btnClose" style="position: absolute; top: 10px; right: 10px; font-size: 24px; border: none; background: transparent; cursor: pointer;">&times;</button>
                    <iframe class="content-panel-frame placeholder-frame" id="placeholder-dialog" src="${popupURL}" style="height: 600px; width: 600px; border: none; border-radius: 10px; overflow: auto;"></iframe>
                </div>
            `;
            document.body.appendChild(popup);

            const iframe = document.getElementById('placeholder-dialog');

            iframe.onload = function () {
                setTimeout(() => {
                    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                    const inputOD = iframeDoc.getElementById('inputOD');
                    if (inputOD) {
                        inputOD.focus();
                    }
                }, 100); // Ajusta el tiempo de espera si es necesario
            };

            // Escuchar el mensaje del iframe
            window.addEventListener('message', function onMessage(event) {
                if (event.data.OD !== undefined && event.data.OI !== undefined) {
                    document.body.removeChild(popup);
                    window.removeEventListener('message', onMessage); // Remover el listener después de recibir el mensaje
                    resolve(event.data);
                }
                if (event.data.close) { // Manejar el cierre
                    document.body.removeChild(popup);
                    window.removeEventListener('message', onMessage);
                }
            });

            // Añadir evento al botón de cierre
            popup.querySelector('#btnClose').addEventListener('click', () => {
                document.body.removeChild(popup);
            });
        });
    }

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

    function hacerClicsEnTD(trSelector, tdIndex, numClicks) {
        return new Promise((resolve, reject) => {
            const trElement = document.querySelector(trSelector);
            if (trElement) {
                const tdElement = trElement.querySelectorAll('td')[tdIndex];
                if (tdElement) {
                    console.log(`Haciendo ${numClicks} clics en el td: ${tdIndex} del tr: ${trSelector}`);

                    const clickEvent = new MouseEvent('click', {
                        view: window, bubbles: true, cancelable: true
                    });

                    for (let i = 0; i < numClicks; i++) {
                        tdElement.dispatchEvent(clickEvent);
                    }

                    setTimeout(resolve, 200); // Espera un momento antes de resolver
                } else {
                    reject(`El td en la posición "${tdIndex}" no se encontró.`);
                }
            } else {
                reject(`El tr "${trSelector}" no se encontró.`);
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

    if (item.id === 'octno') {
        mostrarPopup('js/popup/popup.html').then(({OD, OI, mensajeOD, mensajeOI}) => {
            const recomendaciones = document.getElementById('ordenexamen-0-recomendaciones');

            let clasificacionOD = 'FUERA DE LIMITES NORMALES';
            if (mensajeOD === '') {
                clasificacionOD = (OD < 85) ? 'AL BORDE DE LIMITES NORMALES' : 'DENTRO DE LIMITES NORMALES';
            }

            let clasificacionOI = 'FUERA DE LIMITES NORMALES';
            if (mensajeOI === '') {
                clasificacionOI = (OI < 85) ? 'AL BORDE DE LIMITES NORMALES' : 'DENTRO DE LIMITES NORMALES';
            }

            recomendaciones.value = `SE REALIZA TOMOGRAFIA CON PRUEBAS PROVOCATIVAS DE CAPA DE FIBRAS NERVIOSAS RETINALES CON TOMOGRAFO SPECTRALIS (HEIDELBERG ENGINEERING)

OJO DERECHO
CONFIABILIDAD: BUENA
SE APRECIA DISMINUCIÓN DEL ESPESOR DE CAPA DE FIBRAS NERVIOSAS RETINALES EN CUADRANTES ${mensajeOD || 'N/A'}.
PROMEDIO ESPESOR CFNR OD: ${OD}UM
CLASIFICACIÓN: ${clasificacionOD}

OJO IZQUIERDO
CONFIABILIDAD: BUENA
SE APRECIA DISMINUCIÓN DEL ESPESOR DE CAPA DE FIBRAS NERVIOSAS RETINALES EN CUADRANTES ${mensajeOI || 'N/A'}.
PROMEDIO ESPESOR CFNR OI: ${OI}UM
CLASIFICACIÓN: ${clasificacionOI}

SE SUGIERE CORRELACIONAR CON CUADRO CLINICO`;

            ejecutarTecnicos(item)
                .then(() => hacerClickEnBotonTerminar())
                .catch(error => console.log('Error en la ejecución de examen:', error));
        });
    } else if (item.id === 'eco') {
        mostrarPopup('js/eco/eco.html').then(({OD, OI}) => {
            const recomendaciones = document.getElementById('ordenexamen-0-recomendaciones');
            recomendaciones.value = ''; // Inicializa las recomendaciones

            // Recomendaciones para OD
            if (OD) {
                recomendaciones.value += `SE REALIZA ESTUDIO CON EQUIPO EYE CUBED ELLEX DE ECOGRAFIA MODO B POR CONTACTO TRANSPALPEBRAL EN:

OD: ${OD}`;
            }

            // Recomendaciones para OI
            if (OI) {
                recomendaciones.value += `

SE REALIZA ESTUDIO CON EQUIPO EYE CUBED ELLEX DE ECOGRAFIA MODO B POR CONTACTO TRANSPALPEBRAL EN:

OI: ${OI}`;
            }

            ejecutarTecnicos(item)
                //.then(() => hacerClickEnBotonTerminar())
                .catch(error => console.log('Error en la ejecución de examen:', error));
        });
    } else if (item.id === 'angulo') {
        mostrarPopup('js/angulo/angulo.html').then(({OD, OI}) => {
            const recomendaciones = document.getElementById('ordenexamen-0-recomendaciones');
            recomendaciones.value = 'SE REALIZA ESTUDIO DE TOMOGRAFIA CON PRUEBAS PROVOCATIVAS DE ANGULO IRIDOCORNEAL CON EQUIPO HEIDELBERG ENGINEERING MODELO SPECTRALIS CON SOFTWARE 6.7, VISUALIZANDO LA ESTRUCTURA ANGULAR.\n' + '\n' + 'APERTURA EN GRADOS DEL ANGULO IRIDOCORNEAL:'; // Inicializa las recomendaciones

            // Recomendaciones para OD
            if (OD) {
                recomendaciones.value += `\n${OD}\n`;
            }

            // Recomendaciones para OI
            if (OI) {
                recomendaciones.value += `\n${OI}`;
            }

            ejecutarTecnicos(item)
                .then(() => hacerClickEnBotonTerminar())
                .catch(error => console.log('Error en la ejecución de examen:', error));
        });
    } else if (item.id === 'octm') {
        mostrarPopup('js/octm/octm.html').then(({OD, OI}) => {
            const recomendaciones = document.getElementById('ordenexamen-0-recomendaciones');
            recomendaciones.value = 'SE REALIZA ESTUDIO DE TOMOGRAFIA CON PRUEBAS PROVOCATIVAS MACULAR CON EQUIPO HEIDELBERG ENGINEERING MODELO SPECTRALIS CON SOFTWARE 6.7, VISUALIZANDO LAS DIFERENTES CAPAS DE LA RETINA NEUROSENSORIAL, EPITELIO PIGMENTADO DE LA RETINA, MEMBRANA DE BRUCH Y COROIDES ANTERIOR DE ÁREA MACULAR. \n'; // Inicializa las recomendaciones

            // Recomendaciones para OD
            if (OD) {
                recomendaciones.value += `\n${OD}\n`;
            }

            // Recomendaciones para OI
            if (OI) {
                recomendaciones.value += `\n${OI}`;
            }

            ejecutarTecnicos(item)
                .then(() => hacerClickEnBotonTerminar())
                .catch(error => console.log('Error en la ejecución de examen:', error));
        });
    } else if (item.id === 'retino') {
        mostrarPopup('js/retino/retino.html').then(({OD, OI}) => {
            const recomendaciones = document.getElementById('ordenexamen-0-recomendaciones');
            recomendaciones.value = ''; // Inicializa las recomendaciones

            // Recomendaciones para OD
            if (OD) {
                recomendaciones.value += `EL ESTUDIO DE LAS FOTOGRAFIAS SE REALIZA CON EQUIPO OPTOS DAYTONA, OBTENIENDO IMAGENES SUGESTIVAS DE LOS SIGUIENTES PROBABLES DIAGNOSTICOS:

OD: ${OD}`;
            }

            // Recomendaciones para OI
            if (OI) {
                recomendaciones.value += `

EL ESTUDIO DE LAS FOTOGRAFIAS SE REALIZA CON EQUIPO OPTOS DAYTONA, OBTENIENDO IMAGENES SUGESTIVAS DE LOS SIGUIENTES PROBABLES DIAGNOSTICOS:

OI: ${OI}`;
            }

            ejecutarTecnicos(item)
                .then(() => hacerClickEnBotonTerminar())
                .catch(error => console.log('Error en la ejecución de examen:', error));
        });
    } else if (item.id === 'auto') {
        mostrarPopup('js/auto/auto.html').then(({OD, OI}) => {
            const recomendaciones = document.getElementById('ordenexamen-0-recomendaciones');
            recomendaciones.value = 'SE REALIZA ESTUDIO DE AUTOFLOURESCENCIA CON EQUIPO HEIDELBERG ENGINEERING MODELO SPECTRALIS CON SOFTWARE 6.7, VISUALIZANDO: \n'; // Inicializa las recomendaciones

            // Recomendaciones para OD
            if (OD) {
                recomendaciones.value += `\nOD: ${OD}\n`;
            }

            // Recomendaciones para OI
            if (OI) {
                recomendaciones.value += `\nOI: ${OI}`;
            }

            ejecutarTecnicos(item)
                //.then(() => hacerClickEnBotonTerminar())
                .catch(error => console.log('Error en la ejecución de examen:', error));
        });
    } else if (item.id === 'angio') {
        mostrarPopup('js/angio/angio.html').then(({OD, OI}) => {
            const recomendaciones = document.getElementById('ordenexamen-0-recomendaciones');
            recomendaciones.value = 'SE REALIZA ESTUDIO DE ANGIOGRAFIA RETINAL CON FLUORESCEINA SÓDICA CON EQUIPO HEIDELBERG ENGINEERING MODELO SPECTRALIS CON SOFTWARE 6.7, PREVIO A INYECCION DE 5ML DE FLUORESCEINA SODICA AL 10% EN LA VENA DEL CODO VISUALIZANDO LAS DIFERENTES FASES DE LA CIRCULACION COROIDO RETINAL.  SE DOCUMENTA LAS FASES COROIDEA, ARTERIAL TEMPRANA, ARTERIOVENOSA, FASE VENOSA Y DE RECIRCULACION. \n'; // Inicializa las recomendaciones

            // Recomendaciones para OD
            if (OD) {
                recomendaciones.value += `\nOD: ${OD}\n`;
            }

            // Recomendaciones para OI
            if (OI) {
                recomendaciones.value += `\nOI: ${OI}`;
            }

            ejecutarTecnicos(item)
                //.then(() => hacerClickEnBotonTerminar())
                .catch(error => console.log('Error en la ejecución de examen:', error));
        });
    } else if (item.id === 'cv') {
        mostrarPopupCV().then(({OD, OI, DLN_OD, DLN_OI}) => {
            const recomendaciones = document.getElementById('ordenexamen-0-recomendaciones');
            recomendaciones.value = ''; // Inicializa las recomendaciones

            // Recomendaciones para OD
            if (DLN_OD && !OD) {
                recomendaciones.value += `OJO: DERECHO
SE REALIZA CAMPO VISUAL OCTOPUS 600 IMPRESIÓN HFA.
ESTRATEGIA: 24.2 DINÁMICO
CONFIABILIDAD: BUENA
SENSIBILIDAD FOVEAL: ACTIVA
CONCLUSIONES: CAMPO VISUAL DENTRO DE LIMITES NORMALES

SE RECOMIENDA CORRELACIONAR CON CLÍNICA.`;
            } else if (OD) {
                recomendaciones.value += `OJO: DERECHO
SE REALIZA CAMPO VISUAL OCTOPUS 600 IMPRESIÓN HFA.
ESTRATEGIA: 24.2 DINÁMICO
CONFIABILIDAD: BUENA
SENSIBILIDAD FOVEAL: ACTIVA
LECTURA: ${OD}
CONCLUSIONES: CAMPO VISUAL FUERA DE LIMITES NORMALES`;
            }

            // Recomendaciones para OI
            if (DLN_OI && !OI) {
                recomendaciones.value += `

OJO: IZQUIERDO
SE REALIZA CAMPO VISUAL OCTOPUS 600 IMPRESIÓN HFA.
ESTRATEGIA: 24.2 DINÁMICO
CONFIABILIDAD: BUENA
SENSIBILIDAD FOVEAL: ACTIVA
CONCLUSIONES: CAMPO VISUAL DENTRO DE LIMITES NORMALES

SE RECOMIENDA CORRELACIONAR CON CLÍNICA.`;
            } else if (OI) {
                recomendaciones.value += `

OJO: IZQUIERDO
SE REALIZA CAMPO VISUAL OCTOPUS 600 IMPRESIÓN HFA.
ESTRATEGIA: 24.2 DINÁMICO
CONFIABILIDAD: BUENA
SENSIBILIDAD FOVEAL: ACTIVA
LECTURA: ${OI}
CONCLUSIONES: CAMPO VISUAL FUERA DE LIMITES NORMALES`;
            }

            ejecutarTecnicos(item)
                .then(() => hacerClickEnBotonTerminar())
                .catch(error => console.log('Error en la ejecución de examen:', error));
        });
    }
}

function crearBotonesProcedimientos(procedimientos, contenedorId, clickHandler) {
    const contenedorBotones = document.getElementById(contenedorId);
    contenedorBotones.innerHTML = ''; // Limpiar el contenedor
    procedimientos.forEach(procedimiento => {
        const col = document.createElement('div');
        col.className = 'col-sm-4'; // Cada botón ocupará un tercio del ancho de la fila
        const boton = document.createElement('button');
        boton.id = `${procedimiento.id}`;
        boton.className = 'btn btn-outline-primary btn-sm'; // Estilo de botón y ancho completo
        boton.textContent = `${procedimiento.cirugia}`;
        boton.addEventListener('click', () => {
            console.log(`Botón clickeado: ${procedimiento.cirugia}`);
            clickHandler(procedimiento.id);
        });
        contenedorBotones.appendChild(boton);
    });
}
