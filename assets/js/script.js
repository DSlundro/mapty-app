'use strict';

const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

class App {
    #map;
    #mapEvent;

    constructor() {
        this._getPosition();

        form.addEventListener('submit', this._newWorkout.bind(this));
        inputType.addEventListener('change', this._toggleElevationField.bind(this));
    }

    _getPosition() {
        if(navigator.geolocation){
            navigator.geolocation.getCurrentPosition(this._loadMap.bind(this), function () {
                alert('Could not get your position')
            })
        };
    }

    _loadMap(position) {
        const {latitude, longitude} = position.coords;
        const coords = [latitude, longitude]
        // Map view
        this.#map = L.map('map').setView(coords, 13);
        // Map layer
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png')
        .addTo(this.#map);
        // Handling click on map
        this.#map.on('click', this._showForm.bind(this))
    }

    _showForm(mapE) {
        this.#mapEvent = mapE
        form.classList.remove('hidden');
        inputDistance.focus();
    }

    _toggleElevationField() {
        inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
        inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
    }

    _newWorkout(e) {
        e.preventDefault();
        // Clear input fields
        inputDistance.value = inputDuration.value = inputCadence.value = inputElevation.value = ''
        const { lat, lng } = this.#mapEvent.latlng
        // Position on map
        L.marker([lat, lng])
        .addTo(this.#map)
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
    }
}

const app = new App();

