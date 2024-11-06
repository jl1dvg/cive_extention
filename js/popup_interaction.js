// Función para mostrar la sección correspondiente
function mostrarSeccion(seccionId) {
    console.log(`Mostrando sección: ${seccionId}`);
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(seccionId).classList.add('active');
}

// Función para cargar JSON desde una URL
function cargarJSON(url) {
    console.log(`Cargando JSON desde: ${url}`);
    return fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        });
}

// Función para cargar los exámenes desde el JSON
function cargarExamenes() {
    console.log('Intentando cargar exámenes...');
    cargarJSON(chrome.runtime.getURL('data/examenes.json'))
        .then(data => {
            console.log('Datos de exámenes cargados:', data);
            const procedimientosData = data.examenes;
            crearBotonesProcedimientos(procedimientosData, 'contenedorExamenes', ejecutarExamenes);
        })
        .catch(error => console.error('Error cargando JSON de examenes:', error));
}

// Función para crear botones para cada procedimiento
function crearBotonesProcedimientos(procedimientos, contenedorId, clickHandler) {
    const contenedorBotones = document.getElementById(contenedorId);
    contenedorBotones.innerHTML = ''; // Limpiar el contenedor

    // Ordenar procedimientos alfabéticamente por la propiedad 'cirugia'
    procedimientos.sort((a, b) => a.cirugia.localeCompare(b.cirugia));

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
        col.appendChild(boton);
        contenedorBotones.appendChild(col);
    });
}

// Función para ejecutar el examen seleccionado
function ejecutarExamenes(id) {
    console.log(`Ejecutando examen con ID: ${id}`);
    cargarJSON(chrome.runtime.getURL('data/examenes.json'))
        .then(data => {
            const item = data.examenes.find(d => d.id === id);
            if (!item) throw new Error('ID no encontrado en el JSON');

            console.log("Datos del examen seleccionado:", item);
            // Ejecutar directamente en la página actual
            ejecutarEnPagina(item);
        })
        .catch(error => console.error('Error en la ejecución de examen:', error));
}

function cargarRecetas() {
    console.log('Intentando cargar recetas...');
    const jsonUrl = 'https://raw.githubusercontent.com/jl1dvg/cive_extention/main/data/recetas.json';

    cargarJSON(jsonUrl)
        .then(data => {
            console.log('Datos de recetas cargados:', data);
            const recetasData = data.receta;
            crearRecetasCategorias(recetasData, 'contenedorRecetas', ejecutarReceta);
        })
        .catch(error => console.error('Error cargando JSON de recetas:', error));
}

// Función para cargar los protocolos desde la API
function cargarProtocolos() {
    console.log('Intentando cargar procedimientos...');
    const apiUrl = 'https://cive.consulmed.me/api/obtener_procedimientos.php'; // Cambia esto a la URL de tu API

    fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('Error al obtener los datos desde la API');
            }
            return response.json();
        })
        .then(data => {
            console.log('Datos de procedimientos cargados:', data);
            const procedimientosData = data.procedimientos;
            crearBotonesCategorias(procedimientosData, 'contenedorProtocolos', ejecutarProtocolos);
        })
        .catch(error => console.error('Error cargando procedimientos desde MySQL:', error));
}

// Función para mostrar los procedimientos según la categoría seleccionada
function mostrarProcedimientosPorCategoria(procedimientos) {
    const contenedorProcedimientos = document.getElementById('contenedorProcedimientos');
    contenedorProcedimientos.innerHTML = ''; // Limpiar el contenedor
    procedimientos.forEach(procedimiento => {
        const col = document.createElement('div');
        col.className = 'col-sm-4'; // Cada botón ocupará un tercio del ancho de la fila
        const boton = document.createElement('button');
        boton.id = `${procedimiento.id}`;
        boton.className = 'btn btn-outline-success btn-sm'; // Estilo del botón
        boton.textContent = `${procedimiento.cirugia}`;
        boton.addEventListener('click', () => {
            console.log(`Botón clickeado: ${procedimiento.cirugia}`);
            ejecutarProtocolos(procedimiento.id);
        });
        col.appendChild(boton);
        contenedorProcedimientos.appendChild(col);
    });

    mostrarSeccion('procedimientos'); // Mostrar la sección correspondiente
}

// Función para ejecutar los protocolos según el ID del procedimiento
function ejecutarProtocolos(id) {
    const apiUrl = 'https://cive.consulmed.me/api/obtener_procedimientos.php'; // URL de la API

    fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('Error al obtener los datos desde la API');
            }
            return response.json();
        })
        .then(data => {
            const item = data.procedimientos.find(d => d.id === id);
            if (!item) throw new Error('ID no encontrado en la base de datos');

            console.log("Item cargado:", item);

            if (chrome && chrome.runtime && chrome.runtime.sendMessage) {
                chrome.runtime.sendMessage({action: "ejecutarProtocolo", item: item});
            } else {
                console.error("El contexto de la extensión no es válido. Intentando nuevamente en 1 segundo...");
                setTimeout(() => ejecutarProtocolos(id), 1000);
            }
        })
        .catch(error => console.error('Error en la ejecución de protocolo:', error));
}

function mostrarRecetasPorCategoria(recetas) {
    const contenedorRecetas = document.getElementById('contenedorRecetas');
    contenedorRecetas.innerHTML = ''; // Limpiar el contenedor
    recetas.forEach(receta => {
        const col = document.createElement('div');
        col.className = 'col-sm-4'; // Cada botón ocupará un tercio del ancho de la fila
        const boton = document.createElement('button');
        boton.id = `${receta.id}`;
        boton.className = 'btn btn-outline-success btn-sm'; // Estilo de botón y ancho completo
        boton.textContent = `${receta.cirugia}`;
        boton.addEventListener('click', () => {
            console.log(`Botón clickeado: ${receta.cirugia}`);
            ejecutarReceta(receta.id); // Ensure this function is called correctly
        });
        col.appendChild(boton);
        contenedorRecetas.appendChild(col);
    });
    mostrarSeccion('recetas');
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

function crearRecetasCategorias(recetas, contenedorId) {
    const categorias = [...new Set(recetas.map(receta => receta.categoria))];
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
            const recetasCategoria = recetas.filter(receta => receta.categoria === categoria);
            mostrarRecetasPorCategoria(recetasCategoria);
        });
        col.appendChild(boton);
        contenedorBotones.appendChild(col);
    });
}

function ejecutarReceta(id) {
    const jsonUrl = 'https://raw.githubusercontent.com/jl1dvg/cive_extention/main/data/recetas.json';

    cargarJSON(jsonUrl)
        .then(data => {
            const item = data.receta.find(d => d.id === id);
            if (!item) throw new Error('ID no encontrado en el JSON');

            console.log("Item cargado:", item);

            // Verificar que el item tenga todas las propiedades necesarias
            if (!item || typeof item !== 'object') {
                throw new Error('El item cargado no tiene la estructura esperada.');
            }

            if (chrome && chrome.runtime && chrome.runtime.sendMessage) {
                chrome.runtime.sendMessage({action: "ejecutarReceta", item: item});
            } else {
                console.error("El contexto de la extensión no es válido. Intentando nuevamente en 1 segundo...");
                setTimeout(() => ejecutarReceta(id), 1000);
            }
        })
        .catch(error => console.error('Error en la ejecución de receta:', error));
}