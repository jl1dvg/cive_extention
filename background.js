// js/background.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "consultaAnterior") {
        // Obtener la pestaña activa
        chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
            if (tabs.length === 0) {
                console.error('No se encontró la pestaña activa.');
                return;
            }

            // Inyectar el script de consulta.js y luego ejecutar la función consultaAnterior
            chrome.scripting.executeScript({
                target: {tabId: tabs[0].id}, files: ['js/consulta.js'] // Inyecta el archivo consulta.js
            }, () => {
                chrome.scripting.executeScript({
                    target: {tabId: tabs[0].id}, function: () => {
                        // Asegúrate de que la función consultaAnterior esté disponible
                        if (typeof consultaAnterior === 'function') {
                            consultaAnterior();
                        } else {
                            console.error('consultaAnterior no está definida.');
                        }
                    }
                });
            });
        });
    }
    if (request.action === "ejecutarPopEnPagina") {
        // Obtener la pestaña activa
        chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
            if (tabs.length === 0) {
                console.error('No se encontró la pestaña activa.');
                return;
            }

            // Inyectar el script de consulta.js y luego ejecutar la función consultaAnterior
            chrome.scripting.executeScript({
                target: {tabId: tabs[0].id}, files: ['js/consulta.js'] // Inyecta el archivo consulta.js
            }, () => {
                chrome.scripting.executeScript({
                    target: {tabId: tabs[0].id}, function: () => {
                        // Asegúrate de que la función consultaAnterior esté disponible
                        if (typeof ejecutarPopEnPagina() === 'function') {
                            ejecutarPopEnPagina();
                        } else {
                            console.error('ejecutarPopEnPagina no está definida.');
                        }
                    }
                });
            });
        });
    }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "ejecutarProtocolo") {
        const item = message.item;

        chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
            if (chrome.runtime.lastError || !tabs || tabs.length === 0) {
                console.error('Error al obtener la pestaña activa:', chrome.runtime.lastError || 'No se encontraron pestañas activas.');
                return;
            }

            const tabId = tabs[0].id;
            if (!tabId) {
                console.error('No se pudo obtener el ID de la pestaña.');
                return;
            }

            console.log('Ejecutando script en la pestaña:', tabId);

            chrome.scripting.executeScript({
                target: {tabId: tabs[0].id}, files: ['js/procedimientos.js'] // Inyecta el archivo consulta.js
            }, () => {
                chrome.scripting.executeScript({
                    target: {tabId: tabId},
                    func: (item) => {
                        // Definir la función dentro del contexto de ejecución
                        console.log('Item recibido en ejecutarProtocoloEnPagina:', item);
                        // Verificación de la estructura del item y más lógica...

                        ejecutarProtocoloEnPagina(item); // Llamada a la función dentro del contexto
                    },
                    args: [item],
                }, (results) => {
                    if (chrome.runtime.lastError) {
                        console.error('Error al ejecutar el script en la pestaña:', chrome.runtime.lastError);
                    } else {
                        console.log('Script ejecutado con éxito:', results);
                    }
                });
            });
        });
    }
});






