// js/main.js

const translations = {
    "Episodes": "Episoden", "Season": "Staffel", "Characters in this episode:": "Charaktere in dieser Episode:",
    "Aired on:": "Ausgestrahlt am:", "Episode:": "Episode:",
    "Choose an episode to see details!": "Wähle eine Episode aus, um Details zu sehen!",
    "Wubba Lubba Dub Dub!": "Wubba Lubba Dub Dub!", "Error loading details. Get Schwifty!": "Fehler beim Laden der Details. Zeit, schwifty zu werden!",
    "Status": "Status", "Alive": "Lebendig", "Dead": "Verstorben", "unknown": "unbekannt",
    "Species": "Spezies", "Human": "Mensch", "Alien": "Alien", "Humanoid": "Humanoid",
    "Mythological Creature": "Mythologisches Wesen", "Poopybutthole": "Poopybutthole", "Cronenberg": "Cronenberg",
    "Origin:": "Herkunft:", "Last known location:": "Letzter bekannter Ort:",
    "Read more on the Wiki": "Mehr im Rick and Morty Wiki lesen"
};

function t(key) { return translations[key] || key; }

document.addEventListener('DOMContentLoaded', () => {
    // DOM Elemente
    const episodeListContainer = document.getElementById('episode-list');
    const episodeDetailsContainer = document.getElementById('episode-details');
    const welcomeMessageContainer = document.getElementById('welcome-message');
    const loader = document.getElementById('loader');
    const modal = document.getElementById('character-modal');
    const modalCloseButton = document.getElementById('modal-close-button');
    const modalCharacterDetails = document.getElementById('modal-character-details');
    const seasonSelect = document.getElementById('season-select'); // NEU

    // Globale Variablen
    const API_BASE_URL = 'https://rickandmortyapi.com/api';
    let episodesBySeason = {}; // NEU: Speichert alle Episoden, nach Staffeln sortiert
    let currentEpisodeCharacters = [];

    const showLoader = () => loader.style.display = 'flex';
    const hideLoader = () => loader.style.display = 'none';

    async function fetchAllEpisodes() {
        showLoader();
        let allEpisodes = [];
        let nextUrl = `${API_BASE_URL}/episode`;
        while (nextUrl) {
            const response = await fetch(nextUrl);
            const data = await response.json();
            allEpisodes.push(...data.results);
            nextUrl = data.info.next;
        }
        hideLoader();
        return allEpisodes;
    }
    
    // NEU: Befüllt das Staffel-Dropdown-Menü
    function populateSeasonSelector() {
        const seasons = Object.keys(episodesBySeason).sort((a, b) => a - b);
        seasonSelect.innerHTML = seasons.map(season => `<option value="${season}">${t('Season')} ${season}</option>`).join('');
    }

    // NEU: Rendert die Episodenliste für eine ausgewählte Staffel
    function renderEpisodesForSeason(seasonNumber) {
        const episodes = episodesBySeason[seasonNumber];
        episodeListContainer.innerHTML = episodes.map(episode => `
            <div class="episode-item" data-episode-id="${episode.id}">
                ${episode.episode}: ${episode.name}
            </div>
        `).join('');
        
        // Füge Klick-Listener zu den neuen Episoden-Items hinzu
        document.querySelectorAll('.episode-item').forEach(item => {
            item.addEventListener('click', () => {
                document.querySelectorAll('.episode-item').forEach(el => el.classList.remove('active'));
                item.classList.add('active');
                displayEpisodeDetails(item.dataset.episodeId);
            });
        });
    }

    async function displayEpisodeDetails(episodeId) {
        showLoader();
        try {
            const episodeResponse = await fetch(`${API_BASE_URL}/episode/${episodeId}`);
            const episode = await episodeResponse.json();
            const characterPromises = episode.characters.map(url => fetch(url).then(res => res.json()));
            currentEpisodeCharacters = await Promise.all(characterPromises);

            episodeDetailsContainer.innerHTML = `
                <div class="episode-info">
                    <h2>${episode.name}</h2>
                    <p><strong>${t('Aired on:')}</strong> ${episode.air_date}</p> 
                    <p><strong>${t('Episode:')}</strong> ${episode.episode}</p>
                </div>
                <h3>${t('Characters in this episode:')}</h3>
                <div class="character-grid">
                    ${currentEpisodeCharacters.map(char => `
                        <div class="character-card" data-character-id="${char.id}">
                            <img src="${char.image}" alt="${char.name}">
                            <h4>${char.name}</h4>
                        </div>
                    `).join('')}
                </div>
            `;
        } catch (error) {
            episodeDetailsContainer.innerHTML = `<p>${t('Error loading details. Get Schwifty!')}</p>`;
        } finally {
            hideLoader();
        }
    }

    function showCharacterModal(character) {
        const wikiName = character.name.replace(/ /g, '_');
        const wikiUrl = `https://rickandmorty.fandom.com/wiki/${wikiName}`;
        modalCharacterDetails.innerHTML = `
            <div class="modal-character-layout">
                <img src="${character.image}" alt="${character.name}">
                <div class="modal-character-info">
                    <h2>${character.name}</h2>
                    <p><strong>${t('Status')}:</strong> ${t(character.status)}</p>
                    <p><strong>${t('Species')}:</strong> ${t(character.species)}</p>
                    <p><strong>${t('Origin:')}</strong> ${character.origin.name}</p>
                    <p><strong>${t('Last known location:')}</strong> ${character.location.name}</p>
                    <a href="${wikiUrl}" target="_blank" class="wiki-link">${t('Read more on the Wiki')}</a>
                </div>
            </div>`;
        modal.classList.add('visible');
    }

    function closeCharacterModal() {
        modal.classList.remove('visible');
    }

    // =============================================
    // KORRIGIERT: Der robuste Klick-Listener für Charaktere (Event Delegation)
    // =============================================
    episodeDetailsContainer.addEventListener('click', (event) => {
        const card = event.target.closest('.character-card');
        if (card) {
            const characterId = parseInt(card.dataset.characterId);
            const character = currentEpisodeCharacters.find(c => c.id === characterId);
            if (character) {
                showCharacterModal(character);
            }
        }
    });

    modalCloseButton.addEventListener('click', closeCharacterModal);
    modal.addEventListener('click', (event) => {
        if (event.target === modal) closeCharacterModal();
    });

    async function init() {
        welcomeMessageContainer.innerHTML = `<h2>${t('Choose an episode to see details!')}</h2><p>${t('Wubba Lubba Dub Dub!')}</p>`;
        const allEpisodes = await fetchAllEpisodes();
        
        // Gruppiere Episoden nach Staffeln
        episodesBySeason = allEpisodes.reduce((acc, episode) => {
            const season = parseInt(episode.episode.substring(1, 3));
            if (!acc[season]) acc[season] = [];
            acc[season].push(episode);
            return acc;
        }, {});

        populateSeasonSelector();
        
        // Zeige Episoden der ersten Staffel standardmäßig an
        const firstSeason = Object.keys(episodesBySeason)[0];
        renderEpisodesForSeason(firstSeason);
        
        // NEU: Event Listener für das Staffel-Dropdown
        seasonSelect.addEventListener('change', (event) => {
            renderEpisodesForSeason(event.target.value);
            // Optional: Leere die Detailansicht bei Staffelwechsel
            episodeDetailsContainer.innerHTML = '';
            welcomeMessageContainer.style.display = 'block';
        });
    }

    init();
});
