function ejecutarEnPagina(item) {
    console.log("Datos recibidos en ejecutarEnPagina:", item);

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

            // Escuchar el mensaje del iframe
        window.addEventListener('message', function onMessage(event) {
            // Asegúrate de que el mensaje proviene del iframe de la extensión
            if (event.origin !== chrome.runtime.getURL('/').slice(0, -1)) {
                return;
            }

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
                    .then(() => establecerBusqueda(tecnico.selector, tecnico.funcion))
                    .then(() => seleccionarOpcion())
                    .then(() => hacerClickEnSelect2(tecnico.trabajador))
                    .then(() => establecerBusqueda(tecnico.trabajador, tecnico.nombre))
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
                    setTimeout(() => resolve(searchField), 300); // Añadir un retraso para asegurar que los resultados se carguen
                } else if (attempts < maxAttempts) {
                    console.log(`Esperando campo de búsqueda del Select2... intento ${attempts + 1}`);
                    attempts++;
                    hacerClickEnSelect2(selector)
                        .then(() => {
                            setTimeout(searchForField, 300); // Espera y reintenta
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
        mostrarPopup('js/popup/popup.html').then(({OD, OI}) => {
            const recomendaciones = document.getElementById('ordenexamen-0-recomendaciones');
            recomendaciones.value = 'SE REALIZA TOMOGRAFIA CON PRUEBAS PROVOCATIVAS DE CAPA DE FIBRAS NERVIOSAS RETINALES CON TOMOGRAFO SPECTRALIS (HEIDELBERG ENGINEERING)'; // Inicializa las recomendaciones

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
    } else if (item.id === 'eco') {
        mostrarPopup('js/eco/eco.html').then(({OD, OI}) => {
            const recomendaciones = document.getElementById('ordenexamen-0-recomendaciones');
            recomendaciones.value = 'SE REALIZA ESTUDIO CON EQUIPO EYE CUBED ELLEX DE ECOGRAFIA MODO B POR CONTACTO TRANSPALPEBRAL EN:\n    '; // Inicializa las recomendaciones

            // Recomendaciones para OD
            if (OD) {
                recomendaciones.value += `\nOD: ${OD}\n`;
            }

            // Recomendaciones para OI
            if (OI) {
                recomendaciones.value += `\nOI: ${OI}`;
            }

            ejecutarTecnicos(item)
                .then(() => hacerClickEnBotonTerminar())
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
        mostrarPopup('js/cv/cv.html').then(({OD, OI}) => {
            const recomendaciones = document.getElementById('ordenexamen-0-recomendaciones');
            recomendaciones.value = ''; // Inicializa las recomendaciones

            // Recomendaciones para OD
            if (OD) {
                recomendaciones.value += `${OD}\n\n`;
            }

            // Recomendaciones para OI
            if (OI) {
                recomendaciones.value += `${OI}`;
            }

            ejecutarTecnicos(item)
                .then(() => hacerClickEnBotonTerminar())
                .catch(error => console.log('Error en la ejecución de examen:', error));
        });
    }
}
