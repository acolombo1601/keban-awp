if('serviceWorker' in navigator){
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js')
            .then((registration) => {
                console.log('se registró el SW, con alcance:', registration.scope)
            }).catch((error) => {
                console.log('El registro del SW, falló:', error)
            })
    });
}