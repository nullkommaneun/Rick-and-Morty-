document.addEventListener('DOMContentLoaded', () => {

    const episodeListContainer = document.getElementById('episode-list');
    const episodeDetailsContainer = document.getElementById('episode-details');
    const loader = document.getElementById('loader');

    const API_BASE_URL = 'https://rickandmortyapi.com/api';

    // Zeigt den Lade-Indikator
    const showLoader = () => loader.style.display = 'flex';
    // Versteckt den Lade-Indikator
    const hideLoader = () => loader.style.display = 'none';

    // Holt ALLE Episoden von der API (geht durch alle Seiten)
    async function fetchAllEpisodes() {
        showLoader();
        let allEpisodes = [];
        let nextUrl = `${API_BASE_URL}/episode`;

        while (nextUrl) {
            const response = await fetch(nextUrl);
            const data = await response.json();
            allEpisodes = [...allEpisodes, ...data.results];
            nextUrl = data.info.next;
        }
        hideLoader();
        return allEpisodes;
    }

    // Rendert die Episodenliste, gruppiert nach Staffeln
    function renderEpisodeList(episodes) {
        const episodesBySeason = episodes.reduce((acc, episode) => {
            const season = parseInt(episode.episode.substring(1, 3));
            if (!acc[season]) {
                acc[season] = [];
            }
            acc[season].push(episode);
            return acc;
        }, {});

        episodeListContainer.innerHTML = ''; // Leeren für den Fall eines Rerenders

        for (const season in episodesBySeason) {
            const seasonGroup = document.createElement('div');
            seasonGroup.classList.add('season-group');
            seasonGroup.innerHTML = `<h3>Staffel ${season}</h3>`;
            
            episodesBySeason[season].forEach(episode => {
                const episodeElement = document.createElement('div');
                episodeElement.classList.add('episode-item');
                episodeElement.textContent = `${episode.episode}: ${episode.name}`;
                episodeElement.dataset.episodeId = episode.id;

                episodeElement.addEventListener('click', () => {
                    // Visuelles Feedback für aktives Element
                    document.querySelectorAll('.episode-item').forEach(el => el.classList.remove('active'));
                    episodeElement.classList.add('active');

                    displayEpisodeDetails(episode.id);
                });

                seasonGroup.appendChild(episodeElement);
            });
            episodeListContainer.appendChild(seasonGroup);
        }
    }

    // Zeigt die Details einer ausgewählten Episode an
    async function displayEpisodeDetails(episodeId) {
        showLoader();
        try {
            // 1. Hole Episodendetails
            const episodeResponse = await fetch(`${API_BASE_URL}/episode/${episodeId}`);
            const episode = await episodeResponse.json();
            
            // 2. Hole alle Charakterdaten parallel
            const characterPromises = episode.characters.map(url => fetch(url).then(res => res.json()));
            const characters = await Promise.all(characterPromises);

            // 3. Baue das HTML zusammen
            episodeDetailsContainer.innerHTML = `
                <div class="episode-info">
                    <h2>${episode.name}</h2>
                    <p><strong>Ausgestrahlt am:</strong> ${episode.air_date}</p>
                    <p><strong>Episode:</strong> ${episode.episode}</p>
                </div>
                <h3>Charaktere in dieser Episode:</h3>
                <div class="character-grid">
                    ${characters.map(char => `
                        <div class="character-card">
                            <img src="${char.image}" alt="${char.name}">
                            <h4>${char.name}</h4>
                        </div>
                    `).join('')}
                </div>
            `;
        } catch (error) {
            episodeDetailsContainer.innerHTML = `<p>Fehler beim Laden der Details. Schwifty!</p>`;
            console.error(error);
        } finally {
            hideLoader();
        }
    }

    // Initialisierung
    async function init() {
        const allEpisodes = await fetchAllEpisodes();
        renderEpisodeList(allEpisodes);
    }

    init();
});
