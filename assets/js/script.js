'use strict';

const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');


if(navigator.geolocation){
    // Current position
    navigator.geolocation.getCurrentPosition(
    function(position) {
        const {latitude, longitude} = position.coords;
        const coords = [latitude, longitude]

        // Icon
        const icon = L.icon({
            iconUrl: `https://img.icons8.com/color/344/region-code.png`,

            iconSize:     [40, 40], // size of the icon
            shadowSize:   [50, 64], // size of the shadow
            iconAnchor:   [22, 94], // point of the icon which will correspond to marker's location
            shadowAnchor: [4, 62],  // the same for the shadow
            popupAnchor:  [0, -96]  // point from which the popup should open relative to the iconAnchor
        })

        // Map view
        const map = L.map('map').setView(coords, 13);

        // Map layer
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png')
        .addTo(map);

        // Position on map
        L.marker(coords)
        .addTo(map)
        .bindPopup(`Your coords are ${coords}`)
        .openPopup();
        },

    function() {
        alert('Could not get your position')
    })
}





