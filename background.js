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


