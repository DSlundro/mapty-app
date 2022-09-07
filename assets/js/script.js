'use strict';

class Workout {
    date = new Date();
    id = (Date.now() + '').slice(-10);

    constructor(coords, distance, duration){
        this.coords = coords;       // [lat, lng]
        this.distance = distance;   // in km
        this.duration = duration;   // in min
    }

    _setDescription() {
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        this.description = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${months[this.date.getMonth()]} ${this.date.getDate()}`;
    }
}

class Running extends Workout {
    type = 'running';

    constructor(coords, distance, duration, cadence) {
        super(coords, distance, duration);
        this.cadence = cadence;
        this.calcPace();
        this._setDescription();
    }
    
    calcPace() {
        // min/km
        this.pace = +((this.duration / this.distance).toFixed(2));
        return this.pace;
    }
}

class Cycling extends Workout {
    type = 'cycling';

    constructor(coords, distance, duration, elevationGain) {
        super(coords, distance, duration);
        this.elevationGain = elevationGain;
        this.calcSpeed();
        this._setDescription();
    }

    calcSpeed() {
        // km/h
        this.speed = +((this.distance / (this.duration / 60)).toFixed(2));
        return this.speed;
    }
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// APPLICATION ARCHITECTURE
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
    #workouts = [];

    constructor() {
        // Get user's position
        this._getPosition();

        // Get data from local storage
        this._getLocalStorage();

        // Attach event handlers
        form.addEventListener('submit', this._newWorkout.bind(this));
        inputType.addEventListener('change', this._toggleElevationField.bind(this));
        containerWorkouts.addEventListener('click', this._moveToPopup.bind(this));
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
        this.#map.on('click', this._showForm.bind(this));
        this.#workouts.forEach( work => this._renderWorkoutMaker(work));
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
        const validInputs = (...inputs) => inputs.every( inp => Number.isFinite(inp));
        const allPositive = (...inputs) => inputs.every( inp => inp > 0);

        e.preventDefault();

        // Get data from the form
        const type = inputType.value;
        const distance = +inputDistance.value;
        const duration = +inputDuration.value;
        const { lat, lng } = this.#mapEvent.latlng;
        let workout;
        
        // If workout activity running, create running object
        if(type === 'running'){
            const cadence = +inputCadence.value;
            // Check if data is valid
            if(
                !validInputs(distance, duration, cadence) || 
                !allPositive(distance, duration, cadence)
            ) return alert('Inputs have to be positive numbers!');
            workout = new Running([lat, lng], distance, duration, cadence);
        }

        // If workout activity cycling, create cycling object
        if(type === 'cycling'){
            const elevation = +inputElevation.value;
            // Check if data is valid
            if(
                !validInputs(distance, duration, elevation) || 
                !allPositive(distance, duration, elevation)
            ) return alert('Inputs have to be positive numbers!');
            workout = new Cycling([lat, lng], distance, duration, elevation);
        }

        // Add object to workout array
        this.#workouts.push(workout);

        // Render workout on map as maker
        this._renderWorkoutMaker(workout);

        // Render workout   on list
        this._renderWorkout(workout);

        // Hide workout on list and clear input fields
        this._hideForm();
        // Set local storage to all workouts
        this._setLocaleStorage();
    }

    _renderWorkoutMaker(workout) {
        L.marker(workout.coords)
        .addTo(this.#map)
        .bindPopup(
            L.popup({
            pane: 'popupPane',          
            offset: [0, -2],            
            maxWidth: 250,              
            minWidth: 100,              
            autoClose: false,            
            closeOnClick: false,        
            className: `${workout.type}-popup`,
        }))
        .setPopupContent(`${workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'} ${workout.description}`)
        .openPopup();
    }

    _renderWorkout(workout) {
        const workTypeRunning = workout.type === 'running'
        let html = `
            <li class="workout workout--${workout.type}" data-id="${workout.id}">
                <h2 class="workout__title">${workout.description}</h2>
                <div class="workout__details">
                    <span class="workout__icon">${workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'}</span>
                    <span class="workout__value">${workout.distance}</span>
                    <span class="workout__unit">km</span>
                </div>
                <div class="workout__details">
                    <span class="workout__icon">⏱</span>
                    <span class="workout__value">${workout.duration}</span>
                    <span class="workout__unit">min</span>
                </div>
                <div class="workout__details">
                    <span class="workout__icon">⚡️</span>
                    <span class="workout__value">${workTypeRunning ? workout.pace : workout.speed}</span>
                    <span class="workout__unit">${workTypeRunning ? `min/km` : `km/h`}</span>
                </div>
                <div class="workout__details">
                    <span class="workout__icon">${workTypeRunning ? `🦶🏼` : `⛰`}</span>
                    <span class="workout__value">${workTypeRunning ? workout.cadence : workout.elevationGain}</span>
                    <span class="workout__unit">${workTypeRunning ? `spm` : `m`}</span>
                </div>
            </li>
            `;
            form.insertAdjacentHTML('afterend', html)
    }

    _hideForm() {
        // Clean input's values
        inputDistance.value = inputDuration.value = inputCadence.value = inputElevation.value = '';
        form.style.display = 'none'
        form.classList.add('hidden');
        setTimeout( () => form.style.display = 'grid', 1000)
    }

    _moveToPopup(e) {
        const workoutEl = e.target.closest('.workout');
        
        if(!workoutEl) return;

        // Find the same workout on map by id
        const workout = this.#workouts.find(work => work.id === workoutEl.dataset.id);
        // Change the visual
        this.#map.setView(workout.coords, 13);
    }

    _setLocaleStorage() {
        localStorage.setItem('workouts', JSON.stringify(this.#workouts));
    }

    _getLocalStorage() {
        const data = JSON.parse(localStorage.getItem('workouts'));

        if(!data) return;

        // Take alla data from local storage
        this.#workouts = data;
        this.#workouts.forEach( work => this._renderWorkout(work));
    }

    reset() {
        localStorage.removeItem('workouts');
        location.reload();
    }
}

const app = new App();

