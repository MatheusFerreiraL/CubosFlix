const movies = document.querySelector('.movies');
const nextBtn = document.querySelector('.btn-next');
const prevBtn = document.querySelector('.btn-prev');
const input = document.querySelector('.input');
const modal = document.querySelector('.modal');
const closeModal = document.querySelector('.modal__close');
const body = document.querySelector('body');
const themeBtn = document.querySelector('.btn-theme');
let initialTheme = localStorage.getItem('theme') ?? localStorage.setItem('theme', 'light');
currentTheme();


nextBtn.addEventListener('click', nextPage);
prevBtn.addEventListener('click', prevPage);
input.addEventListener('keyup', event => {
  search(event);
});
themeBtn.addEventListener('click', () => {
  changeTheme();
});

let allMoviesArray = [];
let moviesPerPage = [];
let currentPage = 0;

getMovies();
async function getMovies() {
  try{
    // this endpoint search for the 20 more commented movies on social medias in the last 24 hours (same endpoint was used at the highlight section)
    const { results } = await (await fetch("https://tmdb-proxy.cubos-academy.workers.dev/3/trending/movie/day?language=pt-BR&include_adult=true")).json();
  
    allMoviesArray = [];
    moviesPerPage = [];
    currentPage = 0;
    movies.innerHTML = '';

    results.forEach(element => {
      allMoviesArray.push({
        id: element.id,
        title: element.title,
        average: element.vote_average,
        image: element.poster_path
      }); 
    });
  } catch(error) {
    console.log(error.message);
  }
  displayPages()
}

function displayPages() {
  let currentPage = [];
  let pageIndex = 0;

  while(pageIndex < allMoviesArray.length) {
    currentPage.push(allMoviesArray[pageIndex++]);

    if(currentPage.length === 5) {
      moviesPerPage.push(currentPage);
      currentPage = [];
    }
  }
  createMovieCards();
}

const createMovieCards = () => {
  moviesPerPage[currentPage].forEach(element => {
    const divMovie = document.createElement('div');
    divMovie.classList.add('movie');
    divMovie.style.setProperty('background-image', `url(${element.image}`);
    divMovie.id = element.id;
    
    const divMovieInfo = document.createElement('div');
    divMovieInfo.classList.add('movie__info');
    
    const spanMovieTitle = document.createElement('span');
    spanMovieTitle.classList.add('movie__title');
    spanMovieTitle.textContent = element.title;
    
    const spanMovieRating = document.createElement('span');
    spanMovieRating.classList.add('movie__rating');
    spanMovieRating.textContent = element.average.toFixed(1);
    
    const ratingImg = document.createElement('img');
    ratingImg.src = './assets/estrela.svg';
    ratingImg.alt = 'Estrela';
    
    spanMovieRating.append(ratingImg);
    divMovieInfo.append(spanMovieTitle, spanMovieRating);
    divMovie.appendChild(divMovieInfo);
    movies.appendChild(divMovie);

    divMovie.addEventListener('click', (event) =>{
      modal.classList.remove('hidden');
      displayModal(event.target)
    });

  });
};

displayHighlightedMovie();
function displayHighlightedMovie() {
  const bgImage = document.querySelector('.highlight__video');

  const title = document.querySelector('.highlight__title');

  const average = document.querySelector('.highlight__rating');

  const genres = document.querySelector('.highlight__genres');

  const releaseDate = document.querySelector('.highlight__launch');

  const overview = document.querySelector('.highlight__description');

  const video = document.querySelector('.highlight__video-link');
  
  try {
    (async function() {
      const { results } = await (await fetch(`https://tmdb-proxy.cubos-academy.workers.dev/3/trending/movie/day?language=pt-BR&include_adult=false`)).json();

      const movieHighlighted = await (await (await fetch(`https://tmdb-proxy.cubos-academy.workers.dev/3/movie/${results[0].id}?language=pt-BR`)).json());

      const trailer = await (await fetch(`https://tmdb-proxy.cubos-academy.workers.dev/3/movie/${results[0].id}/videos?language=pt-BR`)).json();
  
      bgImage.style.setProperty('background-image', `url(${results[0].backdrop_path})`);
  
      title.textContent = results[0].title;
  
      average.textContent = results[0].vote_average.toFixed(1);
      
      overview.textContent = results[0].overview;
      
      releaseDate.textContent = (new Date(results[0].release_date)).toLocaleDateString('pt-BR', { year: 'numeric', month: 'long', day: 'numeric', timeZone:'UTC' });
      
      genres.textContent = movieHighlighted.genres.map(genre => genre.name).join(', ');

      video.href = `https://www.youtube.com/watch?v=${trailer.results[0].key}`;
    })();

  } catch(error) {
    console.log(error.message);
  }
}

function nextPage() {
  currentPage++;
  if (currentPage > moviesPerPage.length - 1) currentPage = 0;
  movies.innerHTML = '';
  createMovieCards();
}

function prevPage() {
  currentPage--;
  if (currentPage < 0) currentPage = moviesPerPage.length - 1;
  movies.innerHTML = '';
  createMovieCards();
}

async function search(event) {
  if(input.value === '') {
    return getMovies();
  }

  if(event.key === 'Enter' && input.value === '') {
    return getMovies();
  }

  try{
    const { results } = await (await fetch(`https://tmdb-proxy.cubos-academy.workers.dev/3/search/movie?language=pt-BR&include_adult=true**&query=${input.value.toLowerCase()}**`)).json();
  
    allMoviesArray = [];
    moviesPerPage = [];
    currentPage = 0;
    movies.innerHTML = '';
  
    results.forEach(item => {
      allMoviesArray.push({
        id: item.id,
        title: item.title,
        average: item.vote_average,
        image: item.poster_path
      });
    });
    displayPages()
  } catch(error) {
    console.log(error.message);
    console.log("Filme não de encontrado!");
  }
}

async function displayModal(movie) {
  const modalTitle = document.querySelector('.modal__title');
  const modalImg = document.querySelector('.modal__img');
  const modalDescription = document.querySelector('.modal__description');
  const modalGenre = document.querySelector('.modal__genres');
  const modalAverage = document.querySelector('.modal__average');
  body.style.overflow = "hidden";

  try {
    const data = await (await fetch(`https://tmdb-proxy.cubos-academy.workers.dev/3/movie/${movie.id}?language=pt-BR`)).json();

    modalTitle.textContent = data.title;
    modalDescription.textContent = data.overview;
    modalImg.src = data.backdrop_path;
    modalImg.alt = `Poster do filme ${data.title}`;
    modalAverage.textContent = data.vote_average.toFixed(1);

    while(modalGenre.firstChild) {
      modalGenre.removeChild(modalGenre.firstChild);
    }
    data.genres.forEach(genre => {
      const spanGenre = document.createElement('span');
      spanGenre.classList.add('modal__genre');

      spanGenre.textContent = genre.name;
      modalGenre.append(spanGenre);
    });
  } catch(error) {
    console.log(error.message);
  }

  closeModal.addEventListener('click', event => {
    event.stopPropagation();
    body.style.overflow = "visible";
    modal.classList.add('hidden');
  });
}

function currentTheme() {
  if(initialTheme === 'light') {
    lightMode();
  } else {
    darkMode();
  }
}

function changeTheme() {
  if (initialTheme === 'dark') {
    lightMode();
    initialTheme = 'light';
    localStorage.setItem('theme', 'light');
  } else {
    darkMode();
    initialTheme = 'dark';
    localStorage.setItem('theme', 'dark');
  }
}

function darkMode() {
  themeBtn.src = './assets/dark-mode.svg';
  prevBtn.src = './assets/seta-esquerda-branca.svg';
  nextBtn.src = './assets/seta-direita-branca.svg';

  body.style.setProperty('--background-color', '#242424');
  body.style.setProperty('--input-border-color', '#fff');
  body.style.setProperty('--color', '#fff');
  body.style.setProperty('--shadow-color', '0px, 4px, 8px, rgba(255, 255, 255, 0.15)');
  body.style.setProperty('--highlight-background', '#454545');
  body.style.setProperty('--highlight-color', 'rgba(255, 255, 255, 0.7)');
  body.style.setProperty('--highlight-description', 'rgba(255, 255, 255, 0.8)');
}

function lightMode() {
  themeBtn.src = './assets/light-mode.svg';
  prevBtn.src = './assets/seta-esquerda-preta.svg';
  nextBtn.src = './assets/seta-direita-preta.svg';

  body.style.setProperty('--background-color', '#fff');
  body.style.setProperty('--input-border-color', '#979797');
  body.style.setProperty('--color', '#000');
  body.style.setProperty('--shadow-color', '0px, 4px, 8px, rgba(0, 0, 0, 0.15)');
  body.style.setProperty('--highlight-background', '#fff');
  body.style.setProperty('--highlight-color', 'rgba(0, 0, 0, 0.7)');
  body.style.setProperty('--highlight-description', 'rgba(0, 0, 0, 0.8)');
}