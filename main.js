const API = 'https://api.thedogapi.com/v1/';
const API_KEY = 'live_UGPYYiuHOWA8tItr65RvvvYEbga1aBiJYpHUDqB8q5dJGVw4G63CNK52fI4btMdV';

const contenedor = document.querySelector('#contenedor');
const contenedorFavoritos = document.querySelector('#contenedor-favoritos');
const formBuscador = document.querySelector('#form-buscador');
const buscador = document.querySelector('#buscador');
let favoritos = [];

//Pedido API
const fetchData = async (url) => {
    try {
        const response = await fetch(`${url}`, {
            method: 'GET',
            headers: {
                'x-api-key': API_KEY
            }
        });
        if (!response.ok) {
            throw new Error(`Error ${response.status} al consultar la API`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error(error);
        return null;
    }
}


//Mensaje de error
const mostrarMensaje = (mensaje, clase) => {
    contenedor.innerHTML = '';
    const texto = document.createElement('p');
    texto.classList.add('col-12', clase);
    texto.innerText = mensaje;
    contenedor.append(texto);
}

const obtenerRazas = async (url) => {
    const razasGuardadas = localStorage.getItem("razas");
    if (razasGuardadas) {
        return JSON.parse(razasGuardadas);
    } else {
        const data = await fetchData(`${url}breeds?limit=20`);
        if (Array.isArray(data)) {
            localStorage.setItem("razas", JSON.stringify(data));
        }
        return data;
    }
}


// Cards
const renderizarRazas = (razas) => {
    contenedor.innerHTML = '';

    razas.forEach(raza => {
        const contenedorCard = document.createElement('div');
        contenedorCard.classList.add('col-md-6', 'col-lg-3');

        const card = document.createElement('article');
        card.classList.add('card', 'h-100', 'overflow-hidden', 'rounded-4', 'border-0', 'shadow-sm', 'raza-card');

        const contenedorImg = document.createElement('div');
        contenedorImg.classList.add('position-relative', 'd-flex', 'justify-content-center', 'img-fondo');

        const imagen = document.createElement('img');
        imagen.classList.add('img-raza', 'object-fit-cover');
        imagen.src = raza.image.url;
        imagen.alt = raza.name;

        const boton = document.createElement('button');
        boton.classList.add('rounded-circle', 'position-absolute', 'top-0', 'end-0', 'm-3', 'border-0', 'text-center');
        boton.setAttribute('aria-label', 'Add to favourites');

        const iconofav = document.createElement('i');
        iconofav.classList.add('fs-5', 'bi', 'bi-suit-heart', 'text-secondary');

        favoritos.forEach(favorito => {
            if (favorito.id == raza.id) {
                boton.classList.add('agregado');
                iconofav.classList.remove('text-secondary', 'bi-suit-heart')
                iconofav.classList.add('bi-suit-heart-fill', 'text-danger')
            }
        })

        const cardTextos = document.createElement('div');
        cardTextos.classList.add('card-body', 'd-flex', 'flex-column', 'gap-3', 'justify-content-between');

        const filaSuperior = document.createElement('div');
        filaSuperior.classList.add('d-flex', 'align-items-center', 'justify-content-between');

        const razaNombre = document.createElement('h3');
        razaNombre.classList.add('fs-4', 'card-title', 'mt-1');
        razaNombre.innerText = raza.name;

        const razaOrigen = document.createElement('img');
        razaOrigen.classList.add('rounded-1', 'border', 'shadow');
        razaOrigen.src = `https://flags.restcountries.com/v5/w320/${raza.country_code.toLowerCase()}.png`;
        razaOrigen.alt = raza.origin;
        razaOrigen.style.width = '2rem';

        const botonDetalle = document.createElement('button');
        botonDetalle.classList.add('btn', 'btn-naranja', 'rounded-pill', 'fw-bold', 'border-2');
        botonDetalle.innerText = 'Learn more';
        botonDetalle.setAttribute('data-bs-toggle', 'modal');
        botonDetalle.setAttribute('data-bs-target', '#modal-raza');

        filaSuperior.append(razaNombre,razaOrigen)
        cardTextos.append(filaSuperior, botonDetalle);
        boton.append(iconofav);
        contenedorImg.append(imagen, boton);
        card.append(contenedorImg, cardTextos);
        contenedorCard.append(card);
        contenedor.append(contenedorCard);

        botonDetalle.addEventListener('click', () => {
            mostrarDetalle(raza, boton);
        })

        boton.addEventListener('click', () => {
            if (boton.classList.contains('agregado')) {
                boton.classList.remove('agregado')
                iconofav.classList.add('text-secondary', 'bi-suit-heart')
                iconofav.classList.remove('bi-suit-heart-fill', 'text-danger')
                favoritos = favoritos.filter(item => item.id !== raza.id);
                guardarFavoritos();
            } else {
                boton.classList.add('agregado');
                iconofav.classList.remove('text-secondary', 'bi-suit-heart');
                iconofav.classList.add('bi-suit-heart-fill', 'text-danger');
                agregarFavoritos(raza);
            }
        })
    })
}

const mostrarRazas = async (url) => {
    const razas = await obtenerRazas(url);
    if (razas) {
        renderizarRazas(razas);
    } else {
        mostrarMensaje('Unable to fetch the dog breeds. Please check your connection and try again.', 'error');
    }
}


// Buscador
const buscarRazas = async (texto) => {
    const resultado = await fetchData(`${API}breeds/search?q=${texto}`);
    if (resultado == null) {
        mostrarMensaje('Unable to search right now. Please check your connection and try again.', 'error');
    } else if (resultado.length == 0) {
        mostrarMensaje(`No breeds found for "${texto}". Try another name.`, 'sin-resultados');
    } else {
        renderizarRazas(resultado);
    }
}

if (formBuscador) {
    formBuscador.addEventListener('submit', (e) => {
        e.preventDefault();
        const texto = buscador.value.trim();
        if (texto == '') {
            mostrarRazas(API);
        } else {
            buscarRazas(texto);
        }
    });

    buscador.addEventListener('input', () => {
        if (buscador.value.trim() == '') {
            mostrarRazas(API);
        }
    });
}

//Modal
const mostrarDetalle = (raza, botonCard) => {
    const imagen = document.querySelector('#modal-imagen');
    imagen.src = raza.image.url;
    imagen.alt = raza.name;

    document.querySelector('#modal-nombre').innerText = raza.name;
    document.querySelector('#modal-peso').innerText = `Weight: ${raza.weight.metric} kg.`;
    document.querySelector('#modal-altura').innerText = `Height: ${raza.height.metric} cm.`;

    document.querySelector('#modal-descripcion').innerText = raza.description;
    document.querySelector('#modal-historia').innerText = raza.history;
    document.querySelector('#modal-temperamento').innerText = raza.temperament;

    const botonCta = document.querySelector('#modal-favorito');

    const actualizarTextoCta = () => {
        botonCta.innerText = botonCard.classList.contains('agregado') ? 'Remove from favorites' : 'Add to favorites';
    };

    actualizarTextoCta();

    botonCta.onclick = () => {
        botonCard.click();
        actualizarTextoCta();
    };
}

//Favoritos
const obtenerFavoritos = () => {
    const favoritosGuardados = localStorage.getItem('favoritos');
    return favoritosGuardados ? JSON.parse(favoritosGuardados) : [];
};

favoritos = obtenerFavoritos();

const guardarFavoritos = () => {
    localStorage.setItem('favoritos', JSON.stringify(favoritos));
};

const agregarFavoritos = (raza) => {
    const itemExistente = favoritos.find(favorito => favorito.id === raza.id);
    if (!itemExistente) {
        favoritos.push({
            id: raza.id,
            name: raza.name,
            image: raza.image.url,
            country_code: raza.country_code,
            origin: raza.origin
        });
        guardarFavoritos();
    }
};

const mostrarFavoritosVacio = () => {
    const favoritosVacio = document.createElement('p');
    favoritosVacio.classList.add('col-12', 'text-center', 'text-secondary', 'm-0');
    favoritosVacio.innerText = "You haven't added any breeds to your favourites yet.";
    contenedorFavoritos.append(favoritosVacio);
};

const crearItemFavorito = (favorito) => {
    const cardFavorito = document.createElement('div');
    cardFavorito.classList.add('col-12', 'col-md-6', 'col-lg-4');

    const divFavorito = document.createElement('article');
    divFavorito.classList.add("d-flex", "align-items-center", "h-100", "bg-white", "rounded-4", "shadow-sm", "p-3");

    const img = document.createElement('img');
    img.classList.add("rounded-2", "object-fit-cover", "me-2");
    img.src = favorito.image;
    img.alt = favorito.name;
    img.style.width = '4.7rem';
    img.style.height = '4.7rem';

    const detalle = document.createElement('div');
    detalle.classList.add("d-grid", "gap-1", "me-auto");

    const nombre = document.createElement('h3');
    nombre.classList.add("fs-6", "fw-bold", "m-0");
    nombre.innerText = favorito.name;

    const bandera = document.createElement('img');
    bandera.classList.add('rounded-1', 'border', 'shadow-sm');
    bandera.src = `https://flags.restcountries.com/v5/w320/${favorito.country_code.toLowerCase()}.png`;
    bandera.alt = favorito.origin;
    bandera.style.width = '1.5rem';

    const botonEliminar = document.createElement('button');
    botonEliminar.classList.add("bg-transparent", "border", "border-0", "fs-5");
    const iconoEliminar = document.createElement('i');
    iconoEliminar.className = "bi bi-trash3";
    botonEliminar.append(iconoEliminar);

    botonEliminar.addEventListener('click', () => {
        cardFavorito.remove();
        favoritos = favoritos.filter(item => item.id != favorito.id);
        guardarFavoritos();
        if (favoritos.length == 0) {
            mostrarFavoritosVacio();
        }
    });

    detalle.append(nombre, bandera);
    divFavorito.append(img, detalle, botonEliminar);
    cardFavorito.append(divFavorito);
    return cardFavorito;
};

const mostrarFavoritos = () => {
    contenedorFavoritos.innerHTML = '';
    if (favoritos.length == 0) {
        mostrarFavoritosVacio();
    } else {
        favoritos.forEach(favorito => {
            contenedorFavoritos.append(crearItemFavorito(favorito));
        });
    }
};

if (contenedorFavoritos) {
    mostrarFavoritos();
}

if (contenedor) {
    mostrarRazas(API);
}
