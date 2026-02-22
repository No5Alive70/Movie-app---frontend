const BASE_URL =
    (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
        ? "http://localhost:8000"
        : "https://review-app-ch3i.onrender.com";
const IMG_PATH = 'https://image.tmdb.org/t/p/w1280';
const APILINK = `${BASE_URL}/api/v1/movies`;
const SEARCHAPI = `${BASE_URL}/api/v1/movies/search?q=`;

const main = document.getElementById("section");
const form = document.getElementById("form");
const search = document.getElementById("query");
const leftGroup = document.querySelector('.left-group');


loading();

returnMovies(APILINK);

function returnMovies(url) {
    fetch(url).then(res => res.json())
        .then(function (data) {
            console.log(data.results)

            const loadingWrapper = document.getElementById('loading-wrapper');
            if (loadingWrapper) {
                loadingWrapper.classList.add('hidden');
            }
            data.results.forEach(element => {
                const div_card = document.createElement('div');
                div_card.setAttribute('class', 'card')

                const div_row = document.createElement('div');
                div_row.setAttribute('class', 'row')

                const div_column = document.createElement('div');
                div_column.setAttribute('class', 'column')

                const image = document.createElement('img');
                image.setAttribute('class', 'thumbnail')
                div_card.setAttribute('id', 'image')

                const title = document.createElement('h3');
                title.setAttribute('id', 'title')
                title.innerHTML = `${element.title}`;

                const titleLink = document.createElement('a');
                titleLink.setAttribute('href', `movie.html?id=${element.id}&title=${element.title}`);
                titleLink.setAttribute('id', 'title-link');
                titleLink.textContent = 'Reviews';

                const div_center = document.createElement('div');
                div_center.setAttribute('class', 'center')

                image.src = IMG_PATH + element.poster_path;

                div_center.appendChild(image);
                div_card.appendChild(div_center);
                div_card.appendChild(title);
                div_card.appendChild(titleLink)
                div_column.appendChild(div_card);
                div_row.appendChild(div_column);

                main.appendChild(div_row);
            });
        });
}

function loading() {
    const loadingDiv = document.createElement('div');
    loadingDiv.setAttribute('class', 'loading');
    loadingDiv.setAttribute('id', 'loading-wrapper');

    const loadingTitle = document.createElement('h3');
    loadingTitle.setAttribute('id', 'loading-title');
    loadingTitle.textContent = 'Loading...';
    loadingDiv.appendChild(loadingTitle);
    leftGroup.appendChild(loadingDiv);

}

form.addEventListener("submit", (e) => {
    e.preventDefault();
    main.innerHTML = '';

    const loadingWrapper = document.getElementById('loading-wrapper');
    if (loadingWrapper) {
        loadingWrapper.classList.remove('hidden');
    }

    const searchItem = search.value;

    if (searchItem) {
        returnMovies(SEARCHAPI + searchItem);
        search.value = "";
    }
});


