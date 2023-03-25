let queryDeezer = async (query) => {
    if(query === "") return null;
    return await fetch("./search.json");
    // return await fetch(`https://api.deezer.com/search?q=${encodeURIComponent(query)}`);
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

let updateCurrentlyPlaying = (track, topBarSpan, currentlyPlaying) => {
    topBarSpan.textContent = track.title;
    currentlyPlaying.classList.add('active')
}

let WorldToScreenCoordinates = (object, camera) => {
    var widthHalf = innerWidth / 2, heightHalf = innerHeight / 2;
    var pos = object.getWorldPosition().clone();
    pos.project(camera);
    pos.x = ( pos.x * widthHalf ) + widthHalf;
    pos.y = - ( pos.y * heightHalf ) + heightHalf;
    return pos;
}

let setContentDiv = (corners, camera) => {
    if(corners == {}) return;

    if(corners.topLeft && corners.bottomLeft && corners.bottomRight){
        const topLeft = WorldToScreenCoordinates(corners.topLeft, camera);
        const bottomLeft = WorldToScreenCoordinates(corners.bottomLeft, camera);
        const bottomRight = WorldToScreenCoordinates(corners.bottomRight, camera);
        const contentDiv = document.querySelector('#content');
        contentDiv.style.left = `${topLeft.x}px`;
        contentDiv.style.top = `${topLeft.y}px`;
        contentDiv.style.width = `${bottomRight.x - topLeft.x}px`;
        contentDiv.style.height = `${bottomLeft.y - topLeft.y}px`;
      }
    document.body.classList.add('ready')
}
  
let openMenu = () => {
    document.getElementById("menu").classList.add('active');
}