let queryDeezer = async (query) => {
    if(query === "") return null;
    return await fetch("./search.json");
    return await fetch(`https://api.deezer.com/search?q=${encodeURIComponent(query)}`);
}

let filterByKeyValue = (array, key, value) => {
    return array.filter(el => el[key] == value);
}

let getResultDivTemplate = (data) => {
    return `
        <img class="cover" src="${data.album.cover_small}" alt="Cover of the album ${data.album.title}">
        <div class="info">
            <p class="title">${data.title}</p>
            <p class="artist">${data.artist.name}</p>
        </div>
    `
}

let updateCurrentlyPlaying = (track, topBarSpan) => {
    topBarSpan.textContent = track.title;
}