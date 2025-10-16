// js/main.js

const translations = {
    "Episodes": "Episoden", "Season": "Staffel", "Characters in this episode:": "Charaktere in dieser Episode:",
    "Aired on:": "Ausgestrahlt am:", "Episode:": "Episode:",
    "Choose an episode to see details!": "Wähle eine Episode aus, um Details zu sehen!",
    "Wubba Lubba Dub Dub!": "Wubba Lubba Dub Dub!", "Error loading details. Get Schwifty!": "Fehler beim Laden der Details. Zeit, schwifty zu werden!",
    "Status": "Status", "Alive": "Lebendig", "Dead": "Verstorben", "unknown": "unbekannt",
    "Species": "Spezies", "Human": "Mensch", "Alien": "Alien", "Humanoid": "Humanoid",
    "Mythological Creature": "Mythologisches Wesen", "Poopybutthole": "Poopybutthole", "Cronenberg": "Cronenberg",
    // NEUE ÜBERSETZUNGEN FÜR DAS MODAL
    "Origin:": "Herkunft:", "Last known location:": "Letzter bekannter Ort:"
};

function t(key) {
    return translations[key] || key;
}

document.addEventListener('DOMContentLoaded', () => {

    const episodeListContainer = document.getElementById('episode-list');
    const episodeDetailsContainer = document.getElementById('episode-details');
    const episodeListTitle = document.getElementById('episode-list-title');
    const welcomeMessageContainer = document.getElementById('welcome-message');
    const loader = document.getElementById('loader');
    
    // NEU: Elemente für das Modal auswählen
    const modal = document.getElementById('character-modal');
    const modalCloseButton = document.getElementById('modal-close-button');
    const modalCharacterDetails = document.getElementById('modal-character-details');

    const API_BASE_URL = 'https://rickandmortyapi.com/api';
    
    // NEU: Ein temporärer Speicher für die Charakterdaten der aktuell angezeigten Episode
    let currentEpisodeCharacters = [];

    const showLoader = () => loader.style.display = 'flex';
    const hideLoader = () => loader.style.display = 'none';

    async function fetchAllEpisodes() { /* ... unverändert ... */ }
    
    // ... Die Funktion fetchAllEpisodes bleibt exakt gleich ...
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

    function renderEpisodeList(episodes) { /* ... unverändert ... */ }
    
    // ... Die Funktion renderEpisodeList bleibt exakt gleich ...
    function renderEpisodeList(episodes) {
        const episodesBySeason = episodes.reduce((acc, episode) => {
            const season = parseInt(episode.episode.substring(1, 3));
            if (!acc[season]) acc[season] = [];
            acc[season].push(episode);
            return acc;
        }, {});
        episodeListContainer.innerHTML = '';
        for (const season in episodesBySeason) {
            const seasonGroup = document.createElement('div');
            seasonGroup.classList.add('season-group');
            seasonGroup.innerHTML = `<h3>${t('Season')} ${season}</h3>`;
            episodesBySeason[season].forEach(episode => {
                const episodeElement = document.createElement('div');
                episodeElement.classList.add('episode-item');
                episodeElement.textContent = `${episode.episode}: ${episode.name}`;
                episodeElement.dataset.episodeId = episode.id;
                episodeElement.addEventListener('click', () => {
                    document.querySelectorAll('.episode-item').forEach(el => el.classList.remove('active'));
                    episodeElement.classList.add('active');
                    displayEpisodeDetails(episode.id);
                });
                seasonGroup.appendChild(episodeElement);
            });
            episodeListContainer.appendChild(seasonGroup);
        }
    }


    async function displayEpisodeDetails(episodeId) {
        showLoader();
        try {
            const episodeResponse = await fetch(`${API_BASE_URL}/episode/${episodeId}`);
            const episode = await episodeResponse.json();
            
            const characterPromises = episode.characters.map(url => fetch(url).then(res => res.json()));
            
            // GEÄNDERT: Speichere die geladenen Charakterdaten
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
            console.error(error);
        } finally {
            hideLoader();
        }
    }
    
    // NEU: Funktion zum Anzeigen des Modals mit Charakterdetails
    function showCharacterModal(character) {
        modalCharacterDetails.innerHTML = `
            <div class="modal-character-layout">
                <img src="${character.image}" alt="${character.name}">
                <div class="modal-character-info">
                    <h2>${character.name}</h2>
                    <p><strong>${t('Status')}:</strong> ${t(character.status)}</p>
                    <p><strong>${t('Species')}:</strong> ${t(character.species)}</p>
                    <p><strong>${t('Origin:')}</strong> ${character.origin.name}</p>
                    <p><strong>${t('Last known location:')}</strong> ${character.location.name}</p>
                </div>
            </div>
        `;
        modal.classList.add('visible');
    }

    // NEU: Funktion zum Schließen des Modals
    function closeCharacterModal() {
        modal.classList.remove('visible');
    }
    
    // NEU: Event Listener für Klicks auf die Charakterkarten (Event Delegation)
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

    // NEU: Event Listeners zum Schließen des Modals
    modalCloseButton.addEventListener('click', closeCharacterModal);
    modal.addEventListener('click', (event) => {
        // Schließe das Modal nur, wenn direkt auf den dunklen Hintergrund geklickt wird
        if (event.target === modal) {
            closeCharacterModal();
        }
    });

    async function init() {
        episodeListTitle.textContent = t('Episodes');
        welcomeMessageContainer.innerHTML = `<h2>${t('Choose an episode to see details!')}</h2><p>${t('Wubba Lubba Dub Dub!')}</p>`;
        const allEpisodes = await fetchAllEpisodes();
        renderEpisodeList(allEpisodes);
    }

    init();
});
 
