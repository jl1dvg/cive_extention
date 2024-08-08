// js/content_script.js
(function () {
    // Crear el botón flotante
    const button = document.createElement('button');
    button.id = 'floatingButton';
    button.className = 'actionable-icon';
    button.style.position = 'fixed';
    button.style.bottom = '20px';
    button.style.right = '20px';
    button.style.zIndex = '1000';
    button.style.cursor = 'pointer';

    // Añadir la imagen del botón
    const img = document.createElement('img');
    img.src = chrome.runtime.getURL('icon.png'); // Asegúrate de que la ruta de la imagen es correcta
    img.alt = 'Icono Flotante';
    img.onload = function () {
        button.appendChild(img);
    };
    img.onerror = function () {
        console.error('No se pudo cargar la imagen: ' + img.src);
        button.textContent = 'F'; // Texto alternativo en caso de error
    };

    // Añadir el botón al body
    document.body.appendChild(button);

    // Crear el contenedor del popup flotante
    const popup = document.createElement('div');
    popup.id = 'floatingPopup';
    popup.innerHTML = `
        <div class="popup-content">
          <div class="grid-container">
            <div id="inicio" class="section active">
                <div class="popup-item" id="btnExamenes">
                    <i class="fas fa-notes-medical"></i> Exámenes
                </div>
                <div class="popup-item" id="btnProtocolos">
                    <i class="fas fa-file-alt"></i> Protocolos
                </div>
                <div class="popup-item" id="btnConsulta">
                    <i class="fas fa-user-md"></i> Consulta
                </div>
                <!-- Añade más opciones si es necesario -->
            </div>
          </div>
        </div>
    `;
    document.body.appendChild(popup);

    // Añadir la funcionalidad draggable al botón
    button.addEventListener('mousedown', function (e) {
        let shiftY = e.clientY - button.getBoundingClientRect().top;

        function moveAt(pageY) {
            button.style.top = pageY - shiftY + 'px';
            button.style.bottom = 'auto'; // Para que no interfiera con el posicionamiento
        }

        function onMouseMove(event) {
            moveAt(event.pageY);
        }

        // Añadir el evento mousemove al document
        document.addEventListener('mousemove', onMouseMove);

        // Eliminar los eventos mousemove y mouseup al soltar el botón
        document.addEventListener('mouseup', function () {
            document.removeEventListener('mousemove', onMouseMove);
        }, {once: true});
    });

    button.ondragstart = function () {
        return false;
    };

    // Función para mostrar y ocultar el popup
    function togglePopup() {
        popup.classList.toggle('active');
    }

    // Añadir el evento click al botón flotante para mostrar/ocultar el popup
    button.addEventListener('click', togglePopup);

    // Añadir la hoja de estilos al documento
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = chrome.runtime.getURL('css/floating_button.css');
    document.head.appendChild(link);

    // Añadir la hoja de estilos del popup al documento
    const popupLink = document.createElement('link');
    popupLink.rel = 'stylesheet';
    popupLink.href = chrome.runtime.getURL('css/floating_popup.css');
    document.head.appendChild(popupLink);

    // Añadir la hoja de estilos de Font Awesome al documento
    const fontAwesomeLink = document.createElement('link');
    fontAwesomeLink.rel = 'stylesheet';
    fontAwesomeLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css';
    document.head.appendChild(fontAwesomeLink);
})();
