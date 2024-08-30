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

            // Inyectar el script de consulta.js y luego ejecutar la función ejecutarPopEnPagina
            chrome.scripting.executeScript({
                target: {tabId: tabs[0].id}, files: ['js/consulta.js'] // Inyecta el archivo consulta.js
            }, () => {
                chrome.scripting.executeScript({
                    target: {tabId: tabs[0].id}, function: () => {
                        // Asegúrate de que la función ejecutarPopEnPagina esté disponible
                        if (typeof ejecutarPopEnPagina === 'function') {
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
                target: {tabId: tabs[0].id}, files: ['js/procedimientos.js'] // Inyecta el archivo procedimientos.js
            }, () => {
                chrome.scripting.executeScript({
                    target: {tabId: tabId}, func: (item) => {
                        // Definir la función dentro del contexto de ejecución
                        console.log('Item recibido en ejecutarProtocoloEnPagina:', item);
                        // Verificación de la estructura del item y más lógica...

                        ejecutarProtocoloEnPagina(item); // Llamada a la función dentro del contexto
                    }, args: [item],
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
    if (message.action === "ejecutarReceta") {
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
                target: {tabId: tabs[0].id}, files: ['js/recetas.js'] // Inyecta el archivo recetas.js
            }, () => {
                chrome.scripting.executeScript({
                    target: {tabId: tabId}, func: (item) => {
                        // Definir la función dentro del contexto de ejecución
                        console.log('Item recibido en ejecutarRecetaEnPagina:', item);
                        // Verificación de la estructura del item y más lógica...

                        ejecutarRecetaEnPagina(item); // Llamada a la función dentro del contexto
                    }, args: [item],
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
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "generatePDF") {
        // Envía el mensaje al content script para generar el PDF
        chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
            chrome.tabs.sendMessage(tabs[0].id, {
                action: "generatePDF",
                content: request.content
            }, (response) => {
                sendResponse(response);
            });
        });

        return true; // Indica que la respuesta será enviada de forma asíncrona
    }
});
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'checkSubscription') {
        console.log('Received request for subscription check');

        // Simula una respuesta positiva
        const simulatedResponse = { isSubscribed: true, isApproved: true };

        if (simulatedResponse.isSubscribed && simulatedResponse.isApproved) {
            sendResponse({success: true});
        } else {
            sendResponse({success: false});
        }

        // O realiza el fetch real
        // fetch('http://cive.consulmed.me/check_subscription.php', { method: 'POST', credentials: 'include' })
        //     .then(response => response.json())
        //     .then(data => {
        //         console.log('Response Data:', data);
        //         if (data.isSubscribed && data.isApproved) {
        //             sendResponse({success: true});
        //         } else {
        //             sendResponse({success: false});
        //         }
        //     })
        //     .catch(error => {
        //         console.error('Error al verificar la suscripción:', error);
        //         sendResponse({ success: false, error: 'Ocurrió un error al verificar la suscripción. Inténtelo de nuevo más tarde.' });
        //     });

        return true; // Esto indica que la respuesta será asíncrona
    }
});

