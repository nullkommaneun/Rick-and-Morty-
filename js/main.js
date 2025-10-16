// js/main.js

// -- Unser Übersetzungs-Wörterbuch --
const translations = {
    // UI-Elemente
    "Episodes": "Episoden", // Hinzugefügt für den Titel der Liste
    "Season": "Staffel", // Hinzugefügt für die Gruppenüberschrift
    "Characters in this episode:": "Charaktere in dieser Episode:",
    "Aired on:": "Ausgestrahlt am:",
    "Episode:": "Episode:",
    "Choose an episode to see details!": "Wähle eine Episode aus, um Details zu sehen!",
    "Wubba Lubba Dub Dub!": "Wubba Lubba Dub Dub!", // Kann man so lassen :)
    "Error loading details. Get Schwifty!": "Fehler beim Laden der Details. Zeit, schwifty zu werden!",

    // API-Werte (Status)
    "Status": "Status",
    "Alive": "Lebendig",
    "Dead": "Verstorben",
    "unknown": "unbekannt",

    // API-Werte (Spezies)
    "Species": "Spezies",
    "Human": "Mensch",
    "Alien": "Alien",
    "Humanoid": "Humanoid",
    "Mythological Creature": "Mythologisches Wesen",
    "Poopybutthole": "Poopybutthole",
    "Cronenberg": "Cronenberg"
};

// -- Eine kleine Helfer-Funktion für die Übersetzung --
function t(key) {
    return translations[key] || key;
}

document.addEventListener('DOMContentLoaded', () => {

    const episodeListContainer = document.getElementById('episode-list');
    const episodeDetailsContainer = document.getElementById('episode-details');
    const episodeListTitle = document.getElementById('episode-list-title'); // GEÄNDERT
    const welcomeMessageContainer = document.getElementById('welcome-message'); // GEÄNDERT
    const loader = document.getElementById('loader');

    const API_BASE_URL = 'https://rickandmortyapi.com/api';

    const showLoader = () => loader.style.display = 'flex';
    const hideLoader = () => loader.style.display = 'none';

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
            // GEÄNDERT: Übersetzung für "Staffel"
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
            const characters = await Promise.all(characterPromises);

            episodeDetailsContainer.innerHTML = `
                <div class="episode-info">
                    <h2>${episode.name}</h2>
                    <p><strong>${t('Aired on:')}</strong> ${episode.air_date}</p> 
                    <p><strong>${t('Episode:')}</strong> ${episode.episode}</p>
                </div>
                <h3>${t('Characters in this episode:')}</h3>
                <div class="character-grid">
                    ${characters.map(char => `
                        <div class="character-card">
                            <img src="${char.image}" alt="${char.name}">
                            <div class="character-info-overlay">
                                <h4>${char.name}</h4>
                                <p>${t('Status')}: ${t(char.status)}</p>
                                <p>${t('Species')}: ${t(char.species)}</p>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
            // Die obige Struktur ist ein Vorschlag, um mehr Infos auf der Karte anzuzeigen.
            // Du müsstest dafür das CSS für .character-info-overlay noch anpassen.
            // Die einfachere Variante, wie du sie hattest:
            /*
             episodeDetailsContainer.innerHTML = `
                ...
                <div class="character-grid">
                    ${characters.map(char => `
                        <div class="character-card">
                            <img src="${char.image}" alt="${char.name}">
                            <h4>${char.name}</h4>
                        </div>
                    `).join('')}
                </div>
            `;
            */

        } catch (error) {
            episodeDetailsContainer.innerHTML = `<p>${t('Error loading details. Get Schwifty!')}</p>`; // GEÄNDERT
            console.error(error);
        } finally {
            hideLoader();
        }
    }
    
    // Initialisierung der App
    async function init() {
        // GEÄNDERT: Statische UI-Texte setzen
        episodeListTitle.textContent = t('Episodes');
        welcomeMessageContainer.innerHTML = `
            <h2>${t('Choose an episode to see details!')}</h2>
            <p>${t('Wubba Lubba Dub Dub!')}</p>
        `;

        const allEpisodes = await fetchAllEpisodes();
        renderEpisodeList(allEpisodes);
    }

    init();
});
 
