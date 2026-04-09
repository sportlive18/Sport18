const DATA_URL = 'https://allrounder-live4.pages.dev/id.json';
const grid = document.getElementById('grid');
const searchInput = document.getElementById('search');

let channels = [];

async function fetchChannels() {
    try {
        const response = await fetch(DATA_URL);
        const rawContent = await response.text();
        
        // Parse JSON - handle possible wrapper content
        const start = rawContent.indexOf('{');
        const end = rawContent.lastIndexOf('}') + 1;
        
        if (start === -1 || end === 0) {
            throw new Error('Valid JSON not found in the source.');
        }
        
        const jsonContent = rawContent.substring(start, end);
        const data = JSON.parse(jsonContent);
        
        // The API returns { iframes: [...] }
        channels = data.iframes || data || [];
        
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
        card.href = channel.iframeSrc || channel.link || '#';
        card.target = '_blank';
        card.className = 'card';
        
        // Use channel name for a generated logo placeholder
        const displayName = channel.name || channel.id || 'Channel';
        const logoUrl = channel.logo || `https://via.placeholder.com/150/1e293b/0ea5e9?text=${encodeURIComponent(displayName)}`;
        
        // Group teams as tags (if available), otherwise show channel id as tag
        let tagsHtml = '';
        if (channel.teams) {
            tagsHtml = channel.teams.map(team => `<span class="tag">${team}</span>`).join('');
        } else if (channel.id) {
            tagsHtml = `<span class="tag">${channel.id}</span>`;
        }
        
        card.innerHTML = `
            <div class="logo-container">
                <img src="${logoUrl}" alt="${displayName}" class="logo" loading="lazy" onerror="this.src='https://via.placeholder.com/150/1e293b/0ea5e9?text=${encodeURIComponent(displayName)}'">
            </div>
            <div class="name">${displayName}</div>
            <div class="tags-container">${tagsHtml}</div>
        `;
        
        grid.appendChild(card);
    });
}

searchInput.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    const filtered = channels.filter(channel => 
        (channel.name && channel.name.toLowerCase().includes(term)) || 
        (channel.id && channel.id.toLowerCase().includes(term)) ||
        (channel.teams && channel.teams.some(team => team.toLowerCase().includes(term)))
    );
    renderChannels(filtered);
});

// Initial fetch
fetchChannels();
