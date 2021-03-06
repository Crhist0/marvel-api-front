const api = axios.create({
    // baseURL: "https://localhost:8081",
    baseURL: "https://api-backend-marvel-crhist0.herokuapp.com",
});

const params = new URLSearchParams(window.location.search);

let page = params.has("page") ? params.get("page") : "1";

function listaPersonagens(name) {
    name ? name : document.getElementById("searchByName").value;
    api.get("/", {
        params: { page, name },
    })
        .then((result) => {
            // console.log(result.data);

            const lista = result.data.data; // test page
            const searchResults = result.data.searchResults;
            const detailsPageResults = result.data.detailsPageResults;
            const copy = result.data.copy; // mensagem do final da pagina

            atualizaTabela(lista, copy, searchResults, detailsPageResults);
        })
        .catch((err) => {
            console.log("erro?");
            console.log(err);
            console.log(err.request);
            console.log(err.result);
        });
}

function atualizaTabela(lista, copy, searchResults, detailsPageResults) {
    let list = document.querySelector("#listaPersonagens");
    list.style.display = "block";
    const tbodyLista = document.querySelector("#listaPersonagens > tbody");
    // console.log(detailsPageResults);
    tbodyLista.innerHTML = "";

    for (const personagem of lista) {
        let thumb = personagem.thumbnail;
        // link para página de detalhes, em geral é a mesma que a comiclink page
        let details = personagem.details == -1 || personagem.details == "" ? "" : `<p><a href="${personagem.details}">details</a></p>`;
        // link para página wiki quando possui
        let wiki = personagem.wiki == -1 || personagem.wiki == "" ? "" : `<p><a href="${personagem.wiki}">wiki</a></p>`;
        // link para página de "comiclink", em geral é a mesma da de details
        let comiclink = personagem.comiclink == -1 || personagem.comiclink == "" ? "" : `<p><a href="${personagem.comiclink}">comiclink</a></p>`;

        if (
            personagem.thumbnail == "http://i.annihil.us/u/prod/marvel/i/mg/b/40/image_not_available.jpg" ||
            personagem.thumbnail == `http://i.annihil.us/u/prod/marvel/i/mg/f/60/4c002e0305708.gif` ||
            personagem.thumbnail == "insira aqui outra imagem para exceção"
        ) {
            // se for as imagens de "not found", mostra a logo marvel abaixo
            thumb = `https://i.ibb.co/vLhYShQ/Screenshot-1.png`;
        }
        tbodyLista.innerHTML += `
        <tr>
        <td>${personagem.id}</td>
        <td>${personagem.name}</td>
        <td>${personagem.description}</td>
        <td>${personagem.lastModified}</td>
        <td> 
        ${details} 
        ${wiki}
        ${comiclink}
        </td>
        <td><img height="120" src="${thumb}"></td>
        </tr>

        `;
    }
    // console.log(searchResults);

    document.getElementById("footer").innerHTML = copy;
}

function searchCharacterById() {
    let id = document.getElementById("searchByName").value;

    api.get("/" + id, {
        params: { page },
    })
        .then((res) => {
            // console.log(res.data);
            const character = res.data.data[0];
            const copy = res.data.copy;
            const desc = character.description ? character.description : `No description available.`;
            const url1 = character.urls[0].url;
            const url2 = character.urls[1].url; // isso vai dar problema

            document.getElementById("replaceNameSeparator").innerText = character.name;
            document.getElementById("replaceThumbnailResults").src = character.thumbnail.path + "." + character.thumbnail.extension;
            document.getElementById("replaceThumbnailResults").style.display = "block";
            document.getElementById("replaceNameResults").innerText = `Name: ${character.name}`;
            document.getElementById("replaceDescriptionResults").innerHTML = `Description: ${desc} <a href="${url1}" target="blank" class="text-center">More info <u>here</u></a>.`;
            document.getElementById("replaceComicsQuantities").innerHTML = `
            Between ${character.series.available} series, this character has featured in <span id="comicsQuantity">${character.comics.available}</span> comics. Check out <a href="${url2}" target="blank" class="text-center">more of them <u>here</u></a>.`;
            searchCharacterComicsById(id);
        })
        .catch((err) => {
            console.log("erro :(");
            console.log(err);
            console.log(err.req);
            console.log(err.res);
        });
}

function changePageAfterBefore(x) {
    let page = Number(document.getElementById("pageCounter").innerText);
    page = page + x;
    let pageQuantity = parseInt(Number(document.getElementById("comicsQuantity").innerText) / 10);
    // console.log(pageQuantity);
    if (page <= 1) {
        document.getElementById("liBefore").style.display = "none";
    } else if (page > 1) {
        document.getElementById("liBefore").style.display = "block";
    }
    if (pageQuantity <= 1) {
        document.getElementById("liAfter").style.display = "none";
        document.getElementById("page-item1").style.display = "none";
    } else if (pageQuantity > 1) {
        document.getElementById("liAfter").style.display = "block";
        document.getElementById("page-item1").style.display = "block";
    }
    // console.log(page);
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const id = urlParams.get("id");
    searchCharacterComicsById(id, page);
    document.getElementById("pageCounter").innerText = page;
}

function searchCharacterComicsById(id, page) {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);

    api.get("/comics/" + id, {
        params: { page: page },
    })
        .then((res) => {
            // console.log("log da res.data:");
            // console.log(res.data);
            const comicsList = res.data.data;
            const copy = res.data.copy;

            let x = 1;

            document.getElementById("comicsList").innerHTML = ``; // reset
            for (const comic of comicsList) {
                let thumb = `${comic.thumbnail.path}.${comic.thumbnail.extension}`;
                if (
                    thumb == "http://i.annihil.us/u/prod/marvel/i/mg/b/40/image_not_available.jpg" ||
                    thumb == `http://i.annihil.us/u/prod/marvel/i/mg/f/60/4c002e0305708.gif` ||
                    thumb == "insira aqui outra imagem para exceção"
                ) {
                    // se for as imagens de "not found", mostra a logo marvel abaixo
                    thumb = `https://i.ibb.co/JQM4M31/Wallpaperkiss-2389005-1666.jpg`; // logo da marvel
                }

                // console.log("log da comic:");
                // console.log(comic);

                document.getElementById("comicsList").innerHTML += `
                
                <li class="mt-3 mb-4 ms-4 me-4" style="max-width: 250px;">
                
                <div class="card" style="width: 250px; height: 700px">
                <a href="${comic.urls[0].url}" target="blank">
                    <img id="comicsResultImage${x}"  src="${thumb}" class="card-img-top" alt="${comic.title}"></a>
                    <div class="card-body scrollable-element" style="overflow: auto;">
                        <p class="card-text">
                            <strong>Title:</strong> ${comic.title}<br>
                            <strong>Series:</strong> ${comic.series.name}<br>
                            <strong>Description:</strong> 
                            ${comic.description == null ? "Description not found." : comic.description}
                        </p>
                    </div>
                </div>
                

                

                </li>
    
                `;
                x++;
            }
            let page = Number(document.getElementById("pageCounter").innerText);
            // console.log(`Page: ${page}`);
            let pageQuantity = Math.ceil(Number(document.getElementById("comicsQuantity").innerText) / 10);
            // console.log(`Page quantity${pageQuantity}`);
            if (page <= 1) {
                document.getElementById("liBefore").style.display = "none";
            } else if (page > 1) {
                document.getElementById("liBefore").style.display = "block";
            }
            if (pageQuantity <= 1) {
                document.getElementById("liAfter").style.display = "none";
                document.getElementById("page-item1").style.display = "none";
            } else if (pageQuantity > 1) {
                document.getElementById("liAfter").style.display = "block";
                document.getElementById("page-item1").style.display = "block";
            }
            if (page >= pageQuantity) {
                document.getElementById("liAfter").style.display = "none";
            }
            document.getElementById("copy").innerHTML = copy;
        })
        .catch((err) => {
            console.log("erro :(");
            console.log(err);
            console.log(err.req);
            console.log(err.res);
        });
}
function printHero() {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const id = urlParams.get("id");
    // const comicsPage = urlParams.get("page") ? urlParams.get("page") : 1; // aqui ta certo
    api.get("/" + id, {
        params: { page },
    })
        .then((res) => {
            // console.log(res.data);
            const character = res.data.data[0];
            const copy = res.data.copy;
            const desc = character.description ? character.description : `No description available.`;
            // const url1 = character.urls[0].url;
            // const url2 = character.urls[1].url; // isso vai dar problema
            // character.urls é um array, precisa verificar se existe antes e tratar o retorno

            let thumb = character.thumbnail.path + "." + character.thumbnail.extension;
            if (
                thumb == "http://i.annihil.us/u/prod/marvel/i/mg/b/40/image_not_available.jpg" ||
                thumb == `http://i.annihil.us/u/prod/marvel/i/mg/f/60/4c002e0305708.gif` ||
                thumb == "insira aqui outra imagem para exceção"
            ) {
                // se for as imagens de "not found", mostra a logo marvel abaixo
                thumb = `https://i.ibb.co/vLhYShQ/Screenshot-1.png`;
            }
            let url1 = false;
            let url2 = false;
            for (const url of character.urls) {
                if (url.type == "wiki") {
                    url1 = `<a href="${url.url}" target="blank" class="text-center">More info <u>here</u></a>.`;
                }
                if (url.type == "detail") {
                    url2 = `<a href="${url.url}" target="blank" class="text-center">See all of them on the <u>oficial site</u></a>.`;
                }
            }

            // console.log(character.thumbnail.path + character.thumbnail.extension);
            document.getElementById("replaceNameSeparator").innerText = character.name;
            document.getElementById("replaceThumbnailResults").src = thumb;
            document.getElementById("replaceThumbnailResults").style.display = "block";
            document.getElementById("replaceNameResults").innerText = `Name: ${character.name}`;
            document.getElementById("replaceDescriptionResults").innerHTML = `Description: ${desc} ${url1 ? url1 : ""}`;
            document.getElementById("replaceComicsQuantities").innerHTML = `
            Between ${character.series.available} series, this character has featured in <span id="comicsQuantity">${character.comics.available}</span> comics. ${url2 ? url2 : ""}</a>`;
            searchCharacterComicsById(id);
        })
        .catch((err) => {
            console.log("erro :(");
            console.log(err);
            console.log(err.req);
            console.log(err.res);
        });
}
function changePage(id) {
    window.location.assign(`https://api-frontend-marvel-crhist0.herokuapp.com/results.html?id=${id}`); // trocar para o link do heroku - feito!
}
function changePageAndSearch() {
    let name = document.getElementById("searchByName").value;
    window.location.assign(`https://api-frontend-marvel-crhist0.herokuapp.com/searchResults.html?name=${name}`); // trocar para o link do heroku - feito!
}

function searchCharacterByIdMain() {
    let id = document.getElementById("searchByName").value;
    changePage(id);
}

var input = document.getElementById("searchByName");
input.addEventListener("keyup", function (event) {
    if (event.keyCode === 13) {
        event.preventDefault();
        document.getElementById("basic-addon2").click();
    }
});
