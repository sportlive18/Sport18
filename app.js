const DATA_URL = 'https://allrounderid2.pages.dev/id.json';
const grid = document.getElementById('grid');
const searchInput = document.getElementById('search');

let channels = [];

// Helper to update the view based on URL
async function handleRouting() {
    const path = window.location.pathname.substring(1); // Get path without leading slash
    
    if (path && path !== 'index.html' && path !== 'player.html') {
        // Try to find channel by ID
        if (channels.length === 0) {
            await fetchChannels();
        }
        
        const channel = channels.find(c => c.id === path);
        if (channel) {
            // Redirect to the new player page
            window.location.replace(`player.html?id=${channel.id}`);
        }
    }
}

async function fetchChannels() {
    try {
        const response = await fetch(DATA_URL);
        const rawContent = await response.text();
        
        const start = rawContent.indexOf('{');
        const end = rawContent.lastIndexOf('}') + 1;
        
        if (start === -1 || end === 0) throw new Error('Invalid JSON');
        
        const data = JSON.parse(rawContent.substring(start, end));
        channels = data.iframes || data || [];
        
        renderChannels(channels);
    } catch (error) {
        console.error('Error:', error);
        grid.innerHTML = `<div class="error-msg">Unable to load channels</div>`;
    }
}

function renderChannels(data) {
    grid.innerHTML = '';
    
    data.forEach(channel => {
        const card = document.createElement('div');
        card.className = 'card';
        card.style.cursor = 'pointer';
        
        const displayName = channel.name || channel.id || 'Channel';
        const logoUrl = channel.logo || `https://via.placeholder.com/150/1e293b/0ea5e9?text=${encodeURIComponent(displayName)}`;
        
        let tagsHtml = channel.teams 
            ? channel.teams.map(team => `<span class="tag">${team}</span>`).join('')
            : `<span class="tag">${channel.id}</span>`;
        
        card.innerHTML = `
            <div class="logo-container">
                <img src="${logoUrl}" alt="${displayName}" class="logo" loading="lazy" onerror="this.src='https://via.placeholder.com/150/1e293b/0ea5e9?text=${encodeURIComponent(displayName)}'">
            </div>
            <div class="name">${displayName}</div>
            <div class="tags-container">${tagsHtml}</div>
        `;
        
        card.onclick = () => openPlayer(channel);
        grid.appendChild(card);
    });
}

function openPlayer(channel) {
    // Navigate to the standalone player page
    window.location.href = `player.html?id=${channel.id}`;
}

// Event Listeners
searchInput.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    const filtered = channels.filter(channel => 
        (channel.name && channel.name.toLowerCase().includes(term)) || 
        (channel.id && channel.id.toLowerCase().includes(term))
    );
    renderChannels(filtered);
});

window.addEventListener('popstate', () => {
    handleRouting();
});

// Initialization
handleRouting();
fetchChannels();
