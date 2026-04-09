const DATA_URL = 'https://raw.githubusercontent.com/allrounder-live4.pages.dev/id.json';
const grid = document.getElementById('grid');
const searchInput = document.getElementById('search');

let channels = [];

async function fetchChannels() {
    try {
        const response = await fetch(DATA_URL);
        const rawContent = await response.text();
        
        // Sometimes GitHub raw files might have non-JSON wrappers if processed by certain tools
        // We try to find the start and end of the JSON array
        const start = rawContent.indexOf('[');
        const end = rawContent.lastIndexOf(']') + 1;
        
        if (start === -1 || end === 0) {
            throw new Error('Valid JSON array not found in the source.');
        }
        
        const jsonContent = rawContent.substring(start, end);
        channels = JSON.parse(jsonContent);
        
        renderChannels(channels);
    } catch (error) {
        console.error('Error fetching channels:', error);
        grid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 2rem;">
            <i class="fa-solid fa-circle-exclamation" style="font-size: 3rem; color: #ef4444; margin-bottom: 1rem;"></i>
            <h3>Unable to load channels</h3>
            <p style="color: var(--text-secondary);">Please try again later or check your connection.</p>
        </div>`;
    }
}

function renderChannels(data) {
    grid.innerHTML = '';
    
    if (data.length === 0) {
        grid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 2rem;">
            <p style="color: var(--text-secondary);">No channels found matching your search.</p>
        </div>`;
        return;
    }

    data.forEach(channel => {
        const card = document.createElement('a');
        card.href = channel.link;
        card.target = '_blank';
        card.className = 'card';
        
        // Group teams as tags
        const tagsHtml = channel.teams ? channel.teams.map(team => `<span class="tag">${team}</span>`).join('') : '';
        
        card.innerHTML = `
            <div class="logo-container">
                <img src="${channel.logo}" alt="${channel.name}" class="logo" loading="lazy" onerror="this.src='https://via.placeholder.com/150/1e293b/0ea5e9?text=${channel.name}'">
            </div>
            <div class="name">${channel.name}</div>
            <div class="tags-container">${tagsHtml}</div>
        `;
        
        grid.appendChild(card);
    });
}

searchInput.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    const filtered = channels.filter(channel => 
        channel.name.toLowerCase().includes(term) || 
        (channel.teams && channel.teams.some(team => team.toLowerCase().includes(term)))
    );
    renderChannels(filtered);
});

// Initial fetch
fetchChannels();
