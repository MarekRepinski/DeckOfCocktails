const baseUrl = 'https://www.thecocktaildb.com/api/json/v1/1/';

let main = document.getElementById('grid');
let searchContainer = document.getElementById('search-container');
let menuContainer = document.getElementById('menu-dd');
let leftArrow = document.getElementById('leftButton');
let rightArrow = document.getElementById('rightButton');
let frontCard = document.getElementById('front-card');
let frontCardBack = document.getElementById('backside-front-card');
let topCard = document.getElementById('top-card');
let bottomCard = document.getElementById('bottom-card');
let middleCard = document.getElementById('middle-card');
let frontDetailCard = document.getElementById('front-detail-card');
let frontDetailCardBack = document.getElementById('detail-back');
let frontPrevCard = document.getElementById('front-prev-card');
let prevCard = document.getElementById('prev-card');
let mGlass = document.getElementById('open-search');
let tresEricsones = document.getElementById('open-menu');
let menuDD = document.getElementById('menu-dd');
let searchInput = document.getElementById('search-input');
let searchDrink = document.getElementById('search');
let drinkStr = 'margarita';
let index = 0;
let indexLenght = 0;
let workingJson;
let langArr = ['ES', 'FR', 'IT', 'DE'];
let loadingDone = false;
let xDown = null;
let yDown = null;

/*------------------------------------------------------------*/
/*                      EventListeners                        */
/*------------------------------------------------------------*/

// Listen for touch
topCard.addEventListener('touchstart', (evt) => {
    const firstTouch = getTouches(evt)[0];
    xDown = firstTouch.clientX;
    yDown = firstTouch.clientY;
});

// Check touch move to determin swipe
topCard.addEventListener('touchmove', (evt) => {
    if (!xDown || !yDown) {
        return;
    }

    var xUp = evt.touches[0].clientX;
    var yUp = evt.touches[0].clientY;

    var xDiff = xDown - xUp;
    var yDiff = yDown - yUp;

    if (Math.abs(xDiff) > Math.abs(yDiff)) {/*most significant*/
        if (xDiff > 5) {
            swipeLeft();
        } else if (xDiff < -5) {
            swipeRight();
        }
    }

    /* reset values */
    xDown = null;
    yDown = null;
});

// Trigger swipe when arrow-button is clicked
rightArrow.addEventListener('click', () => {
    swipeRight();
});

// Trigger swipe when arrow-button is clicked
leftArrow.addEventListener('click', () => {
    swipeLeft();
});

// Show Detail card (with animation) when front card is clicked
frontCard.addEventListener('click', () => {
    if (!leftArrow.disabled && indexLenght > 0) {
        topCard.style = 'transition: 0.5s ease-in; transform: translate(-30%, -18%) scale(1.40) rotate(360deg); opacity: 0;';
        setTimeout(function () {
            frontDetailCard.classList.toggle('show');
        }, 400);
    }
});

// Hide Detailcard (with animation) when back-button is clicked
frontDetailCardBack.addEventListener('click', () => {
    frontDetailCard.classList.toggle('show');
    topCard.style = 'transition: 0.5s ease-out; transform: translate(0%, 0%); opacity: 1;';
});

// Show search-window when magnyfingglas is clicked
mGlass.addEventListener('click', () => {
    searchInput.value = '';
    searchContainer.classList.add('show');
    searchInput.focus();
});

// Hide search-window when the input-tag and the search-button looses focus
searchInput.addEventListener('blur', () => {
    setTimeout(function () {
        if (document.activeElement.id != searchDrink.id) {
            searchContainer.classList.remove('show');
        }
    }, 200);
});

// Start an API search when search-button is clicked
searchDrink.addEventListener('click', () => {
    if (document.activeElement.id == searchDrink.id) {
        searchContainer.classList.remove('show');
    }
    drinkStr = searchInput.value;
    searchInput.value = '';
    loadData('search.php?s=', drinkStr);
});

// Show drop-down menu when list-icon is clicked
tresEricsones.addEventListener('click', () => {
    menuContainer.classList.add('show');
    menuDD.focus();
});

// Hide drop-down-menu when it looses focus
menuDD.addEventListener('blur', () => {
    menuContainer.classList.remove('show');
});

// When 'Random Drink' in drop-down-menu is clicked
document.getElementById('random').addEventListener('click', () => {
    loadData('random.php', '');
    menuContainer.classList.remove('show');
});

// When 'Ordinary Drink' in drop-down-menu is clicked
document.getElementById('ordinary-drink').addEventListener('click', () => {
    loadData('filter.php?c=', 'Ordinary_Drink');
    menuContainer.classList.remove('show');
});

// When 'Cocktail' in drop-down-menu is clicked
document.getElementById('cocktail').addEventListener('click', () => {
    loadData('filter.php?c=', 'Cocktail');
    menuContainer.classList.remove('show');
});

// When 'Shot' in drop-down-menu is clicked
document.getElementById('shot').addEventListener('click', () => {
    loadData('filter.php?c=', 'Shot');
    menuContainer.classList.remove('show');
});

// When 'Beer' in drop-down-menu is clicked
document.getElementById('beer').addEventListener('click', () => {
    loadData('filter.php?c=', 'Beer');
    menuContainer.classList.remove('show');
});

// When 'Non Alcoholic' in drop-down-menu is clicked
document.getElementById('non-alcoholic').addEventListener('click', () => {
    loadData('filter.php?a=', 'Non_Alcoholic');
    menuContainer.classList.remove('show');
});

/*------------------------------------------------------------*/
/*                                                            */
/*------------------------------------------------------------*/

// First start of script
loadData('search.php?s=', drinkStr);

// Fix for touches
function getTouches(evt) {
    return evt.touches || evt.original.touches;
}

/*------------------------------------------------------------*/
/*                         Update UI                          */
/*------------------------------------------------------------*/

// Main update UI function
function updateUI() {
    if (indexLenght < 3) {
        middleCard.style = 'display: none;';
    }
    if (indexLenght < 2) {
        bottomCard.style = 'display: none;';
        if (indexLenght == 0) { index = -1 }
    } else {
        let prevIndex = index - 1;
        if (prevIndex < 0) { prevIndex = indexLenght - 1 }
        frontPrevCard.innerHTML = cardInnerHtml(prevIndex);
    }
    frontCard.innerHTML = cardInnerHtml(index);
    if (index > -1) { detailUI(index); }
}

// Fill top card with data
function cardInnerHtml(index) {
    let returnStr = '<span class="noOf">No. ' + (index + 1) + ' of ' + indexLenght + '</span>';
    if (index == -1) {
        returnStr += '<img class="thumb" src="babywithbeer.jpg" alt="You are drunk!">';
        returnStr += '<span class="drinkName">There is no drink by the name of<br>"' + drinkStr + '"!</span>';
        returnStr += '<span class="infoText"><br>Maybe it\'s time for a coffee</span>';
    } else {
        returnStr += '<img class="thumb" src="' + workingJson.drinks[index].strDrinkThumb + '/preview" alt="' + workingJson.drinks[index].strDrink + '">';
        returnStr += '<span class="drinkName">' + workingJson.drinks[index].strDrink + '</span>';
        returnStr += '<span class="infoText">Category:<br>' + workingJson.drinks[index].strCategory + '</span>';
        returnStr += '<span class="infoText">' + workingJson.drinks[index].strAlcoholic + '</span>';
    }

    return returnStr;
}

// Fill detailcard with data
function detailUI(index) {
    try {
        let doc = document.getElementById('detail-header');
        doc.innerHTML = '<span class="header-detail">' + workingJson.drinks[index].strDrink + '</span>';
    
        let tempStr = '<div class="ingredientsHeader">Ingredients:</div>';
        let ing = '';
        let measure = '';
        for (let i = 1; i <= 12; i++) {
            ing = eval('workingJson.drinks[index].strIngredient' + i);
            if (ing != null) {
                measure = eval('workingJson.drinks[index].strMeasure' + i);
                if (measure == null) { measure = ''; }
                tempStr += '<div class="ingredients">' + measure + ing + '</div>';
            }
        }
        doc = document.getElementById('detail-ingredients');
        doc.innerHTML = tempStr;
    
        doc = document.getElementById('detail-img');
        doc.innerHTML = '<img class="thumb" src="' + workingJson.drinks[index].strDrinkThumb + '/preview" alt="' + workingJson.drinks[index].strDrink + '">';
        detailUIInstructions('', index);
        }
    catch (error) {
        console.log(error);
    }
}

// Fill Detailcard instruction with language option
function detailUIInstructions(lang, index) {
    let noOfFlags = 0;
    let doc = document.getElementById('detail-intructions');
    let tempStr = '<div class="instructionsHeader">Instructions</div>';
    let flagFile = '';
    let flagId = '';
    let foundFlags = [];
    let first = true;
    if (lang == 'US') { lang = ''; }

    for (let i = 0; i < langArr.length; i++) {
        if (eval('workingJson.drinks[index].strInstructions' + langArr[i]) != null) { noOfFlags++ }
    }

    if (noOfFlags > 0) {
        tempStr += '<div class="flags">';
        if (lang != '') {
            tempStr += '<img id="US" class="flag" src="us.png">';
            foundFlags.push('US');
            first = false;
        }
        for (let i = 0; i < langArr.length; i++) {
            if (langArr[i] != lang) {
                if (eval('workingJson.drinks[index].strInstructions' + langArr[i]) != null) {
                    if (first) {
                        first = false;
                    } else {
                        tempStr += '&nbsp;';
                    }
                    flagId = langArr[i];
                    foundFlags.push(flagId);
                    flagFile = langArr[i].toLocaleLowerCase() + '.png';
                    tempStr += '<img id="' + flagId + '" class="flag" src="' + flagFile + '">';
                }
            }
        }
        tempStr += '</div>';
    }
    tempStr += '<div class="instructions">';
    tempStr += eval('workingJson.drinks[index].strInstructions' + lang) + '<br>';
    if (workingJson.drinks[index].strGlass != null) {
        tempStr += 'Use a ' + workingJson.drinks[index].strGlass + '.';
    }
    tempStr += '</div>';
    if (workingJson.drinks[index].strVideo != null) {
        tempStr += '<div class="instructions"><a href="' + workingJson.drinks[index].strVideo + '">Watch the video</a></div>';
    }

    doc.innerHTML = tempStr;
    for (let i = 0; i < foundFlags.length; i++) {
        doc = document.getElementById(foundFlags[i]);
        doc.addEventListener('click', () => {
            detailUIInstructions(foundFlags[i], index)
        });
    }
}

/*------------------------------------------------------------*/
/*                      API Comunication                      */
/*------------------------------------------------------------*/

// Function to call from script
async function loadData(method, searchString) {
    loadingDone = false;
    index = 0;
    workingJson = [];
    setTimeout(function () {
        flipCard(frontCard, frontCardBack);
        setTimeout(function () {
            loadAnim();
        }, 300);
    }, 300);
    if (method.search(/filter/i) != -1) {
        workingJson = await loadViaCat(method, searchString);
    } else {
        workingJson = await getDrinks(method, searchString);
    }
    loadingDone = true;
    resetDeck();
    updateUI();
    setTimeout(function () {
        if (indexLenght > 1) { resetDeck(); }
        flipCard(frontCardBack, frontCard);
    }, 1000);
}

// Multiple searches (mostly on Category)
async function loadViaCat(method, searchString) {
    let tempJson = await getDrinks(method, searchString);
    let tempJson2;
    let returnData = [];
    let saveIndexLenght = indexLenght;
    if (saveIndexLenght > 0) {
        returnData = await getDrinks('lookup.php?i=', tempJson.drinks[0].idDrink);
        for (let i = 1; i < saveIndexLenght; i++) {
            tempJson2 = await getDrinks('lookup.php?i=', tempJson.drinks[i].idDrink);
            returnData.drinks.push(tempJson2.drinks[0]);
        }
    }

    indexLenght = saveIndexLenght;
    return returnData;
}

// Main API comunication function
async function getDrinks(method, searchString) {
    indexLenght = 0;

    let url = `${baseUrl}${method}${searchString}`;

    try {
        let resp = await fetch(url);
        let data = await resp.json();

        if (data.drinks != null) {
            data.drinks.forEach(() => { indexLenght++ });
        }

        return data;
    }
    catch (error) {
        console.log(error);
    }
}

/*------------------------------------------------------------*/
/*                        Animations                          */
/*------------------------------------------------------------*/

// Reset after animation
function resetDeck() {
    frontCard.style = '';
    frontCardBack.style = '';
    topCard.style = '';
    bottomCard.style = '';
    middleCard.style = '';
    prevCard.style = '';
    frontPrevCard.style = '';
}

// Flip the card
function flipCard(b, c) {
    b.style = 'transition: 0.3s ease-in-out; transform: rotateY(90deg); opacity: 0;'
    c.style = 'transition: 0.3s ease-in-out; transform: rotateY(0deg); opacity: 1;'
}

// Put top card in bottom and open next card
function swipeRight() {
    leftArrow.disabled = true;
    rightArrow.disabled = true;
    if (indexLenght > 1) {
        topCard.style.gridColumn = '4 / 6';
        setTimeout(function () {
            flipCard(frontCard, frontCardBack);
            setTimeout(function () {
                topCard.style.zIndex = 1;
                setTimeout(function () {
                    topCard.style.gridColumn = '3 / 5';
                    setTimeout(function () {
                        resetDeck();
                        index++;
                        if (index == indexLenght) { index = 0 }
                        updateUI();
                        setTimeout(function () {
                            flipCard(frontCardBack, frontCard);
                            leftArrow.disabled = false;
                            rightArrow.disabled = false;
                        }, 300);
                    }, 300);
                }, 300);
            }, 300);
        }, 300);
    } else {
        flipCard(frontCard, frontCardBack);
        setTimeout(function () {
            flipCard(frontCardBack, frontCard);
            leftArrow.disabled = false;
            rightArrow.disabled = false;
        }, 1000);
    }
}

// Get the bottom card and put it on top
function swipeLeft() {
    leftArrow.disabled = true;
    rightArrow.disabled = true;
    flipCard(frontCard, frontCardBack);
    if (indexLenght > 1) {
        setTimeout(function () {
            bottomCard.style.gridColumn = '2 / 4';
            setTimeout(function () {
                flipCard(bottomCard, frontPrevCard);
                setTimeout(function () {
                    prevCard.style.gridColumn = '3 / 5';
                    setTimeout(function () {
                        resetDeck();
                        index--;
                        if (index < 0) { index = indexLenght - 1 }
                        updateUI();
                        frontCard.style = 'transform: rotateY(0deg); opacity: 1;';
                        frontCardBack.style = 'opacity: 0;';
                        leftArrow.disabled = false;
                        rightArrow.disabled = false;
                    }, 300);
                }, 300);
            }, 300);
        }, 500);
    } else {
        setTimeout(function () {
            flipCard(frontCardBack, frontCard);
            leftArrow.disabled = false;
            rightArrow.disabled = false;
        }, 1000);
    }
}

// Animation while waiting for data - start
function loadAnim() {
    leftArrow.disabled = true;
    rightArrow.disabled = true;
    loadAnimRun();
    leftArrow.disabled = false;
    rightArrow.disabled = false;
}

// Animation while waiting for data - recursive
function loadAnimRun() {
    if (!loadingDone) {
        topCard.style.gridColumn = '4 / 6';
        setTimeout(function () {
            topCard.style.zIndex = 1;
            if (!loadingDone) {
                setTimeout(function () {
                    topCard.style.gridColumn = '3 / 5';
                    if (!loadingDone) {
                        setTimeout(function () {
                            resetDeck();
                            loadAnimRun();
                        }, 300);
                    }
                }, 300);
            }
        }, 300);
    }
}

