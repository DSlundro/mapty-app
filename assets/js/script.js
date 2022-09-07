'use strict';

const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');


let map, mapEvent;

if(navigator.geolocation){
    // Current position
    navigator.geolocation.getCurrentPosition(
    function(position) {
        const {latitude, longitude} = position.coords;
        const coords = [latitude, longitude]

        // Map view
        map = L.map('map').setView(coords, 13);

        // Map layer
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png')
        .addTo(map);

        // Handling click on map
        map.on('click', (mapE) => {
            mapEvent = mapE
            form.classList.remove('hidden');
            inputDistance.focus();
        })
        },

    function() {
        alert('Could not get your position')
    })
};

form.addEventListener('submit', (e) =>{
    e.preventDefault();

    // Clear input fields
    inputDistance.value = inputDuration.value = inputCadence.value = inputElevation.value = ''
    

    const { lat, lng } = mapEvent.latlng
    // Position on map
    L.marker([lat, lng])
    .addTo(map)
    .bindPopup(
        L.popup({
        pane: 'popupPane',          
        offset: [0, -2],            
        maxWidth: 250,              
        minWidth: 100,              
        autoClose: false,            
        closeOnClick: false,        
        className: 'running-popup',
    }))
    .setPopupContent('Workout')
    .openPopup();
});

inputType.addEventListener('change', () => {
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
})

