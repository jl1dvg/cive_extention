document.addEventListener('DOMContentLoaded', function () {
    // Acción para el botón btn-no
    document.getElementById('btn-no').addEventListener('click', function () {
        chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
            chrome.scripting.executeScript({
                target: {tabId: tabs[0].id},
                func: finalizarNO
            });
        });
    });

    // Acción para el botón btn-mac
    document.getElementById('btn-mac').addEventListener('click', function () {
        chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
            chrome.scripting.executeScript({
                target: {tabId: tabs[0].id},
                func: ejecutarMAC
            });
        });
    });
});

function finalizarNO() {
    function hacerClickEnTecnicoContainer() {
        return new Promise((resolve, reject) => {
            const tecnicoContainer = document.querySelector('#select2-ordenexamen-0-tecnico_id-container');
            if (tecnicoContainer) {
                console.log('Haciendo clic en el contenedor del técnico');
                const event = new MouseEvent('mousedown', {
                    view: window,
                    bubbles: true,
                    cancelable: true
                });
                tecnicoContainer.dispatchEvent(event);
                setTimeout(resolve, 1000);
            } else {
                reject('El contenedor "select2-ordenexamen-0-tecnico_id-container" no se encontró.');
            }
        });
    }

    function establecerBusquedaTecnico(valor) {
        return new Promise((resolve, reject) => {
            const searchField = document.querySelector('input.select2-search__field');
            if (searchField) {
                console.log('Estableciendo búsqueda del técnico:', valor);
                searchField.value = valor;
                const inputEvent = new Event('input', {
                    bubbles: true,
                    cancelable: true
                });
                searchField.dispatchEvent(inputEvent);
                setTimeout(resolve, 1000);
            } else {
                reject('El campo de búsqueda del Select2 no se encontró.');
            }
        });
    }

    function seleccionarOpcionTecnico() {
        return new Promise((resolve) => {
            const searchField = document.querySelector('input.select2-search__field');
            console.log('Seleccionando opción del técnico');
            const enterEvent = new KeyboardEvent('keydown', {
                key: 'Enter',
                keyCode: 13,
                bubbles: true,
                cancelable: true
            });
            searchField.dispatchEvent(enterEvent);
            setTimeout(resolve, 1000);
        });
    }

    function hacerClickEnRadiologoContainer() {
        return new Promise((resolve, reject) => {
            const radiologoContainer = document.querySelector('#select2-ordenexamen-0-radiologo_id-container');
            if (radiologoContainer) {
                console.log('Haciendo clic en el contenedor del radiólogo');
                const event = new MouseEvent('mousedown', {
                    view: window,
                    bubbles: true,
                    cancelable: true
                });
                radiologoContainer.dispatchEvent(event);
                setTimeout(resolve, 1000);
            } else {
                reject('El contenedor "select2-ordenexamen-0-radiologo_id-container" no se encontró.');
            }
        });
    }

    function establecerBusquedaRadiologo(valor) {
        return new Promise((resolve, reject) => {
            const searchField = document.querySelector('input.select2-search__field');
            if (searchField) {
                console.log('Estableciendo búsqueda del radiólogo:', valor);
                searchField.value = valor;
                const inputEvent = new Event('input', {
                    bubbles: true,
                    cancelable: true
                });
                searchField.dispatchEvent(inputEvent);
                setTimeout(resolve, 1000);
            } else {
                reject('El campo de búsqueda del segundo Select2 no se encontró.');
            }
        });
    }

    function seleccionarOpcionRadiologo() {
        return new Promise((resolve) => {
            const searchField = document.querySelector('input.select2-search__field');
            console.log('Seleccionando opción del radiólogo');
            const enterEvent = new KeyboardEvent('keydown', {
                key: 'Enter',
                keyCode: 13,
                bubbles: true,
                cancelable: true
            });
            searchField.dispatchEvent(enterEvent);
            setTimeout(resolve, 1000);
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

    hacerClickEnTecnicoContainer()
        .then(() => establecerBusquedaTecnico("DE VERA G"))
        .then(() => seleccionarOpcionTecnico())
        .then(() => hacerClickEnRadiologoContainer())
        .then(() => establecerBusquedaRadiologo("DAVID FER"))
        .then(() => seleccionarOpcionRadiologo())
        .then(() => hacerClickEnBotonTerminar())
        .catch(error => console.error('Error en la ejecución de acciones:', error));
}

function ejecutarMAC() {
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
                    view: window,
                    bubbles: true,
                    cancelable: true
                });
                tecnicoContainer.dispatchEvent(event);
                setTimeout(resolve, 200); // Añadir un retraso para asegurar que el menú se despliegue
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
                    bubbles: true,
                    cancelable: true
                });
                searchField.dispatchEvent(inputEvent);
                setTimeout(resolve, 200); // Añadir un retraso para asegurar que los resultados se carguen
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
                key: 'Enter',
                keyCode: 13,
                bubbles: true,
                cancelable: true
            });
            searchField.dispatchEvent(enterEvent);
            setTimeout(resolve, 200); // Añadir un retraso para asegurar que la opción se seleccione
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
                setTimeout(resolve, 500); // Espera medio segundo para asegurarse de que el clic se procese
            } else {
                reject('El botón de consulta no se encontró.');
            }
        });
    }


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
                childList: true,
                subtree: true
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
        return [
            String(fecha.getHours()).padStart(2, '0'),
            String(fecha.getMinutes()).padStart(2, '0')
        ].join(':');
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
                console.error('Error al sumar horas: la hora de inicio no es válida.');
            }
        } else {
            console.error('No se encontraron los campos de hora de inicio o fin.');
        }
    }

// Llamar a la función para actualizar la hora de fin
    actualizarHoraFin();

    const nombreUsuario = capturarNombreUsuario();
    const textoDictado = `DICTADO POR: MARIO POLIT\nFECHA DE DICTADO: ${obtenerFechaActual()}\nESCRITO POR: ${nombreUsuario}`;
    const procedimiento = `MEDIANTE ANESTESIA REGIONAL, PREVIA ASEPSIA Y ANTISEPSIA
COLOCACION DE CAMPOS DE EXPOSICION, CAMPO DE OJO ESTERIL
SE COLOCA TEGADERM 10X12 PARA FIJAR LAS PESTAÑAS Y REDUCCION DE RIESGO DE INFECCION
EXPOSICION DEL AREA QUIRURGICA CON BLEFAROSTATO
ANTISEPSIA CONJUNTIVAL CON YODOPOVIDONA AL 0,5% DE PERMANENCIA  DURANTE 1 MINUTO
SE IRRIGA  CON SOLUCION SALINA FISIOLOGICA AL 0,9% (50ML) IRRIGACION CONTINUA CON JERINGUILLA DE 1OML
BAJO SISTEMA DE VISUALIZACION CON MICROSCOPIO QUIRURGICO DE OFTALMOLOGIA,  ENFOCAMOS EL  GLOBO OCULAR
SE REALIZA INCISION  CORNEAL CON CUCHILLETE DE 2.75MM
SE INYECTA AIRE EN CAMARA ANTERIOR CON JERINGUILLA DE INSULINA CON MICRO-CANULA
SE INYECTA AZUL DE TRIPANO 0,50ML  EN CAMARA ANTERIOR CON JERINGUILLA DE INSULINA CON MICRO-CANULA
SE INYECTA  SUSTANCIA VISCOELASTICA HIALURONATO DE SODIO (1.5CC)  EN CAMARA ANTERIOR
PARACENTESIS EN CAMARA ANTERIOR  CON CUCHILLETE DE 15° COMO PUERTO DE INGRESO ACCESORIO PARA INTRODUCIR EL CHOPPER
CON PINZA DE CAPSULORREXIS ANGULADA  SE REALIZA CAPSULORREXIS CIRCULAR CONTINUA
SE REALIZA INYECCION DE SOLUCION SALINA 0,9%  PARA HIDRODISECCION
FACOEMULSIFICACION CON TIP 0.9 DE PHACO DE CRISTALINO CON EQUIPO VITRECTOR CONSTELLATION VISION SYSTEM
USO DE BOMBA DE IRRIGACION CON SOLUCION SALINA BALANCEADA (BSS) 300ML Y ASPIRACION DE CORTEZA CON CANULA TRANSFORME ALCON
SE INYECTA  SUSTANCIA VISCOELASTICA METILCELULOSA (1.5CC) EN CAMARA ANTERIOR Y EN SACO CAPSULAR
INTRODUCCION DE LENTE INTRAOCULAR PLEGABLE MONOFOCAL CON INYECTOR DE LENTE INTRAOCULAR PLEGABLE MONOFOCAL
ROTACION DE LENTE INTRAOCULAR CON USO DE SINKEYS POR PUERTO ACCESORIO
USO DE BOMBA DE IRRIGACION CON SOLUCION SALINA BALANCEADA (BSS) 300ML Y ASPIRACION DE  SUSTANCIA VISCOELASTICA CON CANULA TRANSFORME ALCON
SE REALIZA LA HIDROSUTURA DE INCISIONES CORNEALES CON  INYECCION DE SOLUCION SALINA AL 0,9% Y MICRO-CANULA
SE INYECTA CON JERINGUILLA DE INSULINA CON MICRO-CANULA CARGADA DE AIRE EN CAMARA ANTERIOR
INYECCION SUBCONJUNTIVAL DE GENTAMICINA 80MG Y DEXAMETASONA 4MG
COLOCACION DE GOTAS DE DEXAMETASONA + TOBRAMICINA - LIQUIDO OFTALMICO 0,1%+0,3%
APOSITO DE GASAS ESTERILES Y TRANSPORE`;
    const observaciones = `Se realiza facoemulsificación con implante de lente intraocular sin complicaciones.
Se dan indicaciones médicas, cuidado de la herida y actividades permitidas y restringidas.
Se prescribe medicación por vía oral
Se indica al paciente que debe acudir a una consulta de control en las próximas 24 horas`


    llenarCampoTexto('#consultasubsecuente-membrete', 'Facoemulsificacion mas implante de lente intraocular')
        .then(() => hacerClickEnBoton('#trabajadorprotocolo-input-subsecuente .multiple-input-list__item .js-input-plus', 5))
        .then(() => hacerClickEnBoton('#procedimientoprotocolo-input-subsecuente .multiple-input-list__item .js-input-plus', 2))
        .then(() => hacerClickEnSelect2('#select2-consultasubsecuente-trabajadorprotocolo-0-funcion-container'))
        .then(() => establecerBusqueda("CIRUJANO PRINCIPAL"))
        .then(() => seleccionarOpcion())
        .then(() => hacerClickEnSelect2('#select2-consultasubsecuente-trabajadorprotocolo-0-doctor-container'))
        .then(() => establecerBusqueda("MARIO SNS"))
        .then(() => seleccionarOpcion())
        .then(() => hacerClickEnSelect2('#select2-consultasubsecuente-trabajadorprotocolo-1-funcion-container'))
        .then(() => establecerBusqueda("AYUDANTE"))
        .then(() => seleccionarOpcion())
        .then(() => hacerClickEnSelect2('#select2-consultasubsecuente-trabajadorprotocolo-1-doctor-container'))
        .then(() => establecerBusqueda("JAIRO"))
        .then(() => seleccionarOpcion())
        .then(() => hacerClickEnSelect2('#select2-consultasubsecuente-trabajadorprotocolo-2-funcion-container'))
        .then(() => establecerBusqueda("ANESTESIOLOGO"))
        .then(() => seleccionarOpcion())
        .then(() => hacerClickEnSelect2('#select2-consultasubsecuente-trabajadorprotocolo-2-doctor-container'))
        .then(() => establecerBusqueda("RORAYMA"))
        .then(() => seleccionarOpcion())
        .then(() => hacerClickEnSelect2('#select2-consultasubsecuente-trabajadorprotocolo-3-funcion-container'))
        .then(() => establecerBusqueda("INSTRUMENTISTA"))
        .then(() => seleccionarOpcion())
        .then(() => hacerClickEnSelect2('#select2-consultasubsecuente-trabajadorprotocolo-3-doctor-container'))
        .then(() => establecerBusqueda("FATIMA"))
        .then(() => seleccionarOpcion())
        .then(() => hacerClickEnSelect2('#select2-consultasubsecuente-trabajadorprotocolo-4-funcion-container'))
        .then(() => establecerBusqueda("CIRCULANTE"))
        .then(() => seleccionarOpcion())
        .then(() => hacerClickEnSelect2('#select2-consultasubsecuente-trabajadorprotocolo-4-doctor-container'))
        .then(() => establecerBusqueda("JAIME FER"))
        .then(() => seleccionarOpcion())
        .then(() => hacerClickEnSelect2('#select2-consultasubsecuente-trabajadorprotocolo-5-funcion-container'))
        .then(() => establecerBusqueda("AYUDANTE"))
        .then(() => seleccionarOpcion())
        .then(() => hacerClickEnSelect2('#select2-consultasubsecuente-trabajadorprotocolo-5-doctor-container'))
        .then(() => establecerBusqueda("KENYA"))
        .then(() => seleccionarOpcion())
        .then(() => hacerClickEnSelect2('#select2-consultasubsecuente-procedimientoprotocolo-1-procinterno-container'))
        .then(() => establecerBusqueda("66020"))
        .then(() => seleccionarOpcion())
        .then(() => hacerClickEnSelect2('#select2-consultasubsecuente-procedimientoprotocolo-2-procinterno-container'))
        .then(() => establecerBusqueda("68200"))
        .then(() => seleccionarOpcion())
        .then(() => llenarCampoTexto('#consultasubsecuente-dieresis', 'INCISION CORNEAL'))
        .then(() => llenarCampoTexto('#consultasubsecuente-exposicion', 'CAMARA ANTERIOR'))
        .then(() => llenarCampoTexto('#consultasubsecuente-hallazgo', 'CRISTALINO CATARATOSO'))
        .then(() => llenarCampoTexto('#consultasubsecuente-operatorio', procedimiento))
        .then(() => llenarCampoTexto('#consultasubsecuente-complicacionesoperatorio', 'NO'))
        .then(() => llenarCampoTexto('#consultasubsecuente-perdidasanguineat', 'NO'))
        .then(() => llenarCampoTexto('#consultasubsecuente-datoscirugia', textoDictado))
        .then(() => seleccionarRadioNo())
        .then(() => actualizarHoraFin())
        .then(() => hacerClickEnSelect2('#select2-consultasubsecuente-anestesia_id-container'))
        .then(() => establecerBusqueda("REGIONAL"))
        .then(() => seleccionarOpcion())
        .then(() => hacerClickEnBoton('#diagnosticossub11111 .list-cell__button .js-input-plus', 2))
        .then(() => hacerClickEnSelect2('#select2-consultasubsecuente-presuntivosenfermedades-0-iddiagnostico-container'))
        .then(() => establecerBusqueda("Z988"))
        .then(() => seleccionarOpcion())
        .then(() => hacerClickEnSelect2('#select2-consultasubsecuente-presuntivosenfermedades-1-iddiagnostico-container'))
        .then(() => establecerBusqueda("Z961"))
        .then(() => seleccionarOpcion())
        .then(() => hacerClickEnPresuntivo('.form-group.field-consultasubsecuente-presuntivosenfermedades-0-evidencia .cbx-container .cbx'))
        .then(() => hacerClickEnPresuntivo('.form-group.field-consultasubsecuente-presuntivosenfermedades-1-evidencia .cbx-container .cbx'))
        .then(() => hacerClickEnBoton('#botonGuardar', 1))
        .then(() => esperarElemento('#docsolicitudprocedimientos-observacion_consulta'))
        .then(() => llenarCampoTexto('#docsolicitudprocedimientos-observacion_consulta', observaciones))
        .then(() => hacerClickEnBotonConsulta())
        .then(() => hacerClickEnBoton('#consultasubsecuente-fotoupload', 1))
        .catch(error => console.error('Error en la ejecución de acciones:', error));
}
