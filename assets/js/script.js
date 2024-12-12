// Éléments HTML
const oCanvasHTML = document.querySelector("#monCanvas");
const oContexte = oCanvasHTML.getContext("2d");
const oIntroductionHTML = document.querySelector("#introduction");
const oBoutonIntroHTML = document.querySelector("#bouton-demarrer-i");
const oMenuHTML = document.querySelector("#menu");
const oBoutonMenuHTML = document.querySelector("#bouton-demarrer-m");
const oJeuHTML = document.querySelector("#jeu");
const oTempsHTML = document.querySelector("#temps-texte");
const oScoreHTML = document.querySelector("#score-texte");
const oFinHTML = document.querySelector("#fin");
const oScoreFinHTML = document.querySelector("#score-texte-fin");
const oMessageHTML = document.querySelector("#message-fin");

// Taille canvas
oCanvasHTML.width = 700;
oCanvasHTML.height = 350;

// Variables globales
let iScore = 0;
let iInterval;
let iInterval2;
let iInterval3;
let iInterval4;
let iTic = 0;
let iTic2 = 0;
let iTemps = 30;
let sEtat = "standby_droite";
let aMonstres = [];
let aCopines = [];

// On met tous les touches en false pour dire qu'ils ne sont pas activés
let oKeys = {
  d: {
    on: false,
  },
  a: {
    on: false,
  },
  ArrowRight: {
    on: false,
  },
  ArrowLeft: {
    on: false,
  },
};

// -------------------------- Ressources des variables en forme objet --------------------------

// Ressources Images

// Ressources de l'image arrière-plan
let oImageArrierePlan = {
  image: new Image(),
  src: "assets/images/stage1.png",
  xPos: 0,
  yPos: 0,
  largeur: oCanvasHTML.width,
  hauteur: oCanvasHTML.height,
};

// Ressources de l'image du personnage
let oImagePerso = {
  image: new Image(),
  animStandby_Droite: {
    sEtat: "standby_droite",
    src: "assets/images/standby_droite.png",
    animMax: 2,
    largeur: 32,
    hauteur: 30,
  },

  animStandby_Gauche: {
    sEtat: "standby_gauche",
    src: "assets/images/standby_gauche.png",
    animMax: 2,
    largeur: 32,
    hauteur: 30,
  },

  animCourir_Droite: {
    sEtat: "courir_droite",
    src: "assets/images/courir_droite.png",
    animMax: 8,
    largeur: 32,
    hauteur: 30,
  },

  animCourir_Gauche: {
    sEtat: "courir_gauche",
    src: "assets/images/courir_gauche.png",
    animMax: 8,
    largeur: 32,
    hauteur: 30,
  },

  xPos: 350,
  yPos: 320,
  vitesseX: 7,
  animIndex: 0,
};

// Ressources Musiques / Audios

let oMusique = {
  bgaudio1: {
    audio: new Audio("assets/audio/08-8bit08.mp3"),
    loop: true,
  },
  popaudio2: {
    audio: new Audio("assets/audio/pop-2.mp3"),
  },
  popaudio3: {
    audio: new Audio("assets/audio/pop-4.mp3"),
  },
};

//// -------------------------- Fonctions --------------------------

// La fonction initialisation
function initialisation() {
  oMenuHTML.classList.add("invisible"); // rend invisible le menu
  oJeuHTML.classList.add("invisible"); // rend invisible le jeu
  oFinHTML.classList.add("invisible"); // rend invisible la fin
  oBoutonIntroHTML.addEventListener("click", afficherMenu); // ajoute un click à la fonction afficherMenu
}

// La fonction afficherMenu
function afficherMenu() {
  oIntroductionHTML.classList.add("invisible"); //rend invisible l'introduction
  oMenuHTML.classList.remove("invisible"); //affiche le menu
  oBoutonMenuHTML.addEventListener("click", afficherJeu); // ajoute un click à la fonction afficherJeu
}

// La fonction afficherJeu
function afficherJeu() {
  oMenuHTML.classList.add("invisible"); // rend invisible le menu
  oJeuHTML.classList.remove("invisible"); // affiche le jeu
  creerCopine(); // crée une copie de copine
  creerMonstre(); // crée une copie de monstre
  iInterval = setInterval(boucleJeu, 1000 / 60); // commence une interval pour les FPS
  iInterval2 = setInterval(diminuerTemps, 1000); // commence une interval pour calculer le temps qui diminue à chaque 1 seconde
  iInterval3 = setInterval(creerCopine, 5000); // commence une interval de création de copine après chaque 5 secondes
  iInterval4 = setInterval(creerMonstre, 5000); // commence une interval de création de monstre après chaque 5 secondes
  window.addEventListener("keydown", onToucheClavier); // ajouter un addEventListener pour déduire quand on pèse le clavier
  window.addEventListener("keyup", offToucheClavier); // ajouter un addEventListener pour déduire quand on relâche le clavier
  oMusique.bgaudio1.audio.loop = oMusique.bgaudio1.loop; // met la source de la musique
  oMusique.bgaudio1.audio.play(); // joue la musique en boucle
}

// On dessine l'arrière-plan du canvas en mode static
function dessinerArrierePlan() {
  oImageArrierePlan.image.src = oImageArrierePlan.src; // charge la source de l'image

  // On dessine l'arrière-plan selon les éléments suivants
  oContexte.drawImage(
    oImageArrierePlan.image,
    oImageArrierePlan.xPos,
    oImageArrierePlan.yPos,
    oImageArrierePlan.largeur,
    oImageArrierePlan.hauteur
  );
}

// Dans la fonction diminuerTemps
function diminuerTemps() {
  // Tant que le temps est plus grand que 0
  if (iTemps > 0) {
    // On diminue le temps d'une seconde
    iTemps--;
    // Si ce n'est pas le cas
  } else {
    // L'interval s'arrête
    clearInterval(iInterval);
  }
}

// Dans la fonction afficherTemps
function afficherTemps() {
  oTempsHTML.textContent = "Temps restant " + iTemps; // on change le texte du temps dans le HTML par le temps actuel
}

// Dans la fonction afficherScore
function afficherScore() {
  oScoreHTML.textContent = `Score ${iScore}`; // on change le texte du score dans le HTML pour afficher le score progressif
}

// Quand on clique sur
function onToucheClavier(event) {
  switch (event.key) {
    // La touche d
    case "d":
      // On change pour true pour montrer que la touche est touché
      oKeys.d.on = true;
      // L'état du personnage quand on clique sur la touche devient courir droite
      sEtat = "courir_droite";
      // L'image du perso bouge vers la droite selon la vitesse assignée au début
      oImagePerso.xPos += oImagePerso.vitesseX;
      // Pour empêcher le personnage de sortir du canvas, on soustrait la largeur du personnage à la largeur canvas
      oImagePerso.xPos = Math.min(
        oCanvasHTML.width - oImagePerso.largeur,
        oImagePerso.xPos
      );
      break;
    // La touche de flèche droite
    case "ArrowRight":
      // On change pour true pour montrer que la touche est touché
      oKeys.ArrowRight.on = true;
      // L'état du personnage quand on clique sur la touche devient courir droite
      sEtat = "courir_droite";
      // L'image du perso bouge vers la droite selon la vitesse assignée au début
      oImagePerso.xPos += oImagePerso.vitesseX;
      // Pour empêcher le personnage de sortir du canvas, on soustrait la largeur du personnage à la largeur canvas
      oImagePerso.xPos = Math.min(
        oCanvasHTML.width - oImagePerso.largeur,
        oImagePerso.xPos
      );
      break;
    // La touche a
    case "a":
      // On change pour true pour montrer que la touche est touché
      oKeys.a.on = true;
      // L'état du personnage quand on clique sur la touche devient courir gauche
      sEtat = "courir_gauche";
      // L'image du perso bouge vers la gauche selon la vitesse assignée au début
      oImagePerso.xPos -= oImagePerso.vitesseX;
      // Pour empêcher le personnage de sortir du canvas, la limite x serait de 0
      oImagePerso.xPos = Math.max(0, oImagePerso.xPos);
      break;
    // La touche de flèche gauche
    case "ArrowLeft":
      // On change pour true pour montrer que la touche est touché
      oKeys.ArrowLeft.on = true;
      // L'état du personnage quand on clique sur la touche devient courir gauche
      sEtat = "courir_gauche";
      // L'image du perso bouge vers la gauche selon la vitesse assignée au début
      oImagePerso.xPos -= oImagePerso.vitesseX;
      // Pour empêcher le personnage de sortir du canvas, la limite x serait de 0
      oImagePerso.xPos = Math.max(0, oImagePerso.xPos);
      break;
    // La touche espace
    case " ":
      // Active la fonction arretjeu et recommencerjeu
      arretJeu();
      recommencerJeu();
      break;
  }
}

// Quand on relâche
function offToucheClavier(event) {
  switch (event.key) {
    // La touche d
    case "d":
      // On change pour false pour montrer que la touche n'est pas touché
      oKeys.d.on = false;
      // L'état du personnage quand on clique sur la touche devient standby droite
      sEtat = "standby_droite";
      break;
    // La touche de flèche droite
    case "ArrowRight":
      // On change pour false pour montrer que la touche n'est pas touché
      oKeys.ArrowRight.on = false;
      // L'état du personnage quand on clique sur la touche devient standby droite
      sEtat = "standby_droite";
      break;
    // La touche a
    case "a":
      // On change pour false pour montrer que la touche n'est pas touché
      oKeys.a.on = false;
      // L'état du personnage quand on clique sur la touche devient standby gauche
      sEtat = "standby_gauche";
      break;
    // La touche de flèche gauche
    case "ArrowLeft":
      // On change pour false pour montrer que la touche n'est pas touché
      oKeys.ArrowLeft.on = false;
      // L'état du personnage quand on clique sur la touche devient standby gauche
      sEtat = "standby_gauche";
      break;
  }
}

// Dans la fonction dessinerPersonnage
function dessinerPersonnage() {
  // Si l'état est standby droite
  if (sEtat == "standby_droite") {
    // On charge l'image, la largeur et la hauteur du personnage
    oImagePerso.image.src = oImagePerso.animStandby_Droite.src;
    oImagePerso.largeur = oImagePerso.animStandby_Droite.largeur;
    oImagePerso.hauteur = oImagePerso.animStandby_Droite.hauteur;

    // On dessine le personnage selon les éléments suivants
    oContexte.drawImage(
      oImagePerso.image,
      oImagePerso.animIndex * oImagePerso.animStandby_Droite.largeur,
      0,
      oImagePerso.animStandby_Droite.largeur,
      oImagePerso.animStandby_Droite.hauteur,
      oImagePerso.xPos,
      oImagePerso.yPos,
      oImagePerso.animStandby_Droite.largeur,
      oImagePerso.animStandby_Droite.hauteur
    );

    // Si 30 tics passent
    if (iTic % 30 == 0) {
      // On change au prochain frame
      oImagePerso.animIndex++;
    }

    // Si le début du sprite est plus grand ou égal de la fin du sprite
    if (oImagePerso.animIndex >= oImagePerso.animStandby_Droite.animMax) {
      // L'index retourne à 0
      oImagePerso.animIndex = 0;
    }
    // Si l'état est standby gauche
  } else if (sEtat == "standby_gauche") {
    // On charge l'image, la largeur et la hauteur du personnage
    oImagePerso.image.src = oImagePerso.animStandby_Gauche.src;
    oImagePerso.largeur = oImagePerso.animStandby_Gauche.largeur;
    oImagePerso.hauteur = oImagePerso.animStandby_Gauche.hauteur;

    // On dessine le personnage selon les éléments suivants
    oContexte.drawImage(
      oImagePerso.image,
      oImagePerso.animIndex * oImagePerso.animStandby_Gauche.largeur,
      0,
      oImagePerso.animStandby_Gauche.largeur,
      oImagePerso.animStandby_Gauche.hauteur,
      oImagePerso.xPos,
      oImagePerso.yPos,
      oImagePerso.animStandby_Gauche.largeur,
      oImagePerso.animStandby_Gauche.hauteur
    );

    // Si 30 tics passent
    if (iTic % 30 == 0) {
      // On change au prochain frame
      oImagePerso.animIndex++;
    }

    // Si le début du sprite est plus grand ou égal de la fin du sprite
    if (oImagePerso.animIndex >= oImagePerso.animStandby_Gauche.animMax) {
      // L'index retourne à 0
      oImagePerso.animIndex = 0;
    }
    // Si l'état est courir droite
  } else if (sEtat == "courir_droite") {
    // On charge l'image, la largeur et la hauteur du personnage
    oImagePerso.image.src = oImagePerso.animCourir_Droite.src;
    oImagePerso.largeur = oImagePerso.animCourir_Droite.largeur;
    oImagePerso.hauteur = oImagePerso.animCourir_Droite.hauteur;

    // On dessine le personnage selon les éléments suivants
    oContexte.drawImage(
      oImagePerso.image,
      oImagePerso.animIndex * oImagePerso.animCourir_Droite.largeur,
      0,
      oImagePerso.animCourir_Droite.largeur,
      oImagePerso.animCourir_Droite.hauteur,
      oImagePerso.xPos,
      oImagePerso.yPos,
      oImagePerso.animCourir_Droite.largeur,
      oImagePerso.animCourir_Droite.hauteur
    );

    // Si 7 tics passent
    if (iTic % 7 == 0) {
      // On change au prochain frame
      oImagePerso.animIndex++;
    }

    // Si le début du sprite est plus grand ou égal de la fin du sprite
    if (oImagePerso.animIndex >= oImagePerso.animCourir_Droite.animMax) {
      // L'index retourne à 0
      oImagePerso.animIndex = 0;
    }
    // Si l'état est courir gauche
  } else if (sEtat == "courir_gauche") {
    // On charge l'image, la largeur et la hauteur du personnage
    oImagePerso.image.src = oImagePerso.animCourir_Gauche.src;
    oImagePerso.largeur = oImagePerso.animCourir_Gauche.largeur;
    oImagePerso.hauteur = oImagePerso.animCourir_Gauche.hauteur;

    // On dessine le personnage selon les éléments suivants
    oContexte.drawImage(
      oImagePerso.image,
      oImagePerso.animIndex * oImagePerso.animCourir_Gauche.largeur,
      0,
      oImagePerso.animCourir_Gauche.largeur,
      oImagePerso.animCourir_Gauche.hauteur,
      oImagePerso.xPos,
      oImagePerso.yPos,
      oImagePerso.animCourir_Gauche.largeur,
      oImagePerso.animCourir_Gauche.hauteur
    );

    // Si 7 tics passent
    if (iTic % 7 == 0) {
      // On change au prochain frame
      oImagePerso.animIndex++;
    }

    // Si le début du sprite est plus grand ou égal de la fin du sprite
    if (oImagePerso.animIndex >= oImagePerso.animCourir_Gauche.animMax) {
      // L'index retourne à 0
      oImagePerso.animIndex = 0;
    }
  }
}
// Dans la function creerMontre
function creerMonstre() {
  // On donne les informations nécessaires pour créer un monstre
  let oImageMonstre = {
    image: new Image(),
    src: "assets/images/monstres.png",
    xPos: Math.floor(Math.random() * oCanvasHTML.width),
    yPos: 0,
    animMax: 10,
    largeur: 48,
    hauteur: 48,
    vitesseY: Math.floor(Math.random() * 2 + 1),
    animIndex1: 0,
  };
  // On charge l'image du monstre
  oImageMonstre.image.src = oImageMonstre.src;

  // On ajoute un monstre dans le tableau monstre
  aMonstres.push(oImageMonstre);
}

// Dans la fonction dessinerMonstre
function dessinerMonstre() {
  // On crée une boucle pour parcourir les monstres
  for (let index = 0; index < aMonstres.length; index++) {
    const oImageMonstre = aMonstres[index];

    // On charge l'image du monstre
    oImageMonstre.image.src = oImageMonstre.src;
    // La position Y de la copine descend par la vitesse Y attribuée
    oImageMonstre.yPos += oImageMonstre.vitesseY;

    // Si la position Y du monstre est plus grand que la hauteur du canvas + 20 pixels
    if (oImageMonstre.yPos > oCanvasHTML.height + 20) {
      // La position X du monstre est un nombre généré aléatoirement à l'intérieur du canvas
      oImageMonstre.xPos =
        Math.random() * oCanvasHTML.width - oImageMonstre.largeur;
        // La position Y du monstre est moins sa hauteur pour avoir l'air de glisser du haut de la page
      oImageMonstre.yPos = -oImageMonstre.hauteur;
    }

    // On dessine le personnage selon les éléments suivants
    oContexte.drawImage(
      oImageMonstre.image,
      oImageMonstre.animIndex1 * oImageMonstre.largeur,
      0,
      oImageMonstre.largeur,
      oImageMonstre.hauteur,
      oImageMonstre.xPos,
      oImageMonstre.yPos,
      oImageMonstre.largeur,
      oImageMonstre.hauteur
    );

    // Si 7 tics passent
    if (iTic2 % 7 == 0) {
      // On change au prochain frame
      oImageMonstre.animIndex1++;
    }

    // Si le début du sprite est plus grand ou égal de la fin du sprite
    if (oImageMonstre.animIndex1 >= oImageMonstre.animMax) {
      // L'index1 retourne à 0
      oImageMonstre.animIndex1 = 0;
    }
  }
}

// Dans la fonction creerCopine
function creerCopine() {
  // On donne les informations nécessaires pour créer une copine
  let oImageCopine = {
    image: new Image(),
    src: "assets/images/copine.png",
    xPos: Math.floor(Math.random() * oCanvasHTML.width),
    yPos: 0,
    animMax: 6,
    largeur: 32,
    hauteur: 23,
    vitesseY: Math.floor(Math.random() * 2 + 1),
    animIndex2: 0,
  };
  // On charge l'image de la copine
  oImageCopine.image.src = oImageCopine.src;
  // On ajoute une copine dans le tableau copine
  aCopines.push(oImageCopine);
}

// Dans la fonction dessinerCopine
function dessinerCopine() {
  // On crée une boucle pour parcourir les copines
  for (let index = 0; index < aCopines.length; index++) {
    const oImageCopine = aCopines[index];

    // On charge l'image de la copine
    oImageCopine.image.src = oImageCopine.src;
    // La position Y de la copine descend par la vitesse Y attribuée
    oImageCopine.yPos += oImageCopine.vitesseY;

    // Si la position Y de la copine est plus grand que la hauteur du canvas + 20 pixels
    if (oImageCopine.yPos > oCanvasHTML.height + 20) {
      // La position X de la copine est un nombre généré aléatoirement à l'intérieur du canvas
      oImageCopine.xPos =
        Math.random() * oCanvasHTML.width - oImageCopine.largeur;
        // La position Y de la copine est moins sa hauteur pour avoir l'air de glisser du haut de la page
      oImageCopine.yPos = -oImageCopine.hauteur;
    }

    // On dessine le personnage selon les éléments suivants
    oContexte.drawImage(
      oImageCopine.image,
      oImageCopine.animIndex2 * oImageCopine.largeur,
      0,
      oImageCopine.largeur,
      oImageCopine.hauteur,
      oImageCopine.xPos,
      oImageCopine.yPos,
      oImageCopine.largeur,
      oImageCopine.hauteur
    );

    // Si 7 tics passent
    if (iTic2 % 7 == 0) {
      // On change au prochain frame
      oImageCopine.animIndex2++;
    }

    // Si le début du sprite est plus grand ou égal de la fin du sprite
    if (oImageCopine.animIndex2 >= oImageCopine.animMax) {
      // L'index2 retourne à 0
      oImageCopine.animIndex2 = 0;
    }
  }
}

// On crée une fonction pour détecter les collisions entre le MC et les monstres
function detecterCollisionMonstresMC() {
  // On crée une boucle pour parcourir les monstres
  for (let i = 0; i < aMonstres.length; i++) {
    let oMonstre = aMonstres[i];

    // On remplace les objets de la fonction detecterCollision par le personnage et chaque monstre
    let oCollision = detecterCollision(oImagePerso, oMonstre);

    // Si la collision est vraie
    if (oCollision == true) {
      // On joue un pop audio une fois
      oMusique.popaudio3.audio.play();
      // Le monstre retourne en haut du canvas
      oMonstre.yPos = 0;
      // On soustrait 3 points au score actuel
      iScore -= 3;
      // On soustrait 10 secondes au temps actuel
      iTemps -= 10;
    }
  }
}

// On crée une fonction pour détecter les collisions entre le MC et les copines
function detecterCollisionCopinesMC() {
  // On crée une boucle pour parcourir les copines
  for (let i = 0; i < aCopines.length; i++) {
    let oCopine = aCopines[i];
    // On remplace les objets de la fonction detecterCollision par le personnage et chaque copine
    let oCollision = detecterCollision(oImagePerso, oCopine);
    // Si la collision est vraie
    if (oCollision == true) {
      // On joue un pop audio une fois
      oMusique.popaudio2.audio.play();
      // La copine retourne en haut du canvas
      oCopine.yPos = 0;
      // On ajoute 5 points au score actuel
      iScore += 5;
      // On ajoute 3 secondes au temps actuel
      iTemps += 3;
    }
  }
}

// On crée une fonction pour détecter les collisions entre deux objets (on choisit)
function detecterCollision(objet1, objet2) {
  if (
    // Si le côté droit de l'objet1 est plus grand que le côté gauche de l'objet2 et
    objet1.xPos + objet1.largeur > objet2.xPos &&
    // Si le côté gauche de l'objet1 est plus petit que le côté droit de l'objet2 et
    objet1.xPos < objet2.xPos + objet2.largeur &&
    // Si le côté haut de l'objet1 est plus petit que le côté bas de l'objet2 et
    objet1.yPos < objet2.yPos + objet2.hauteur &&
    // Si le côté bas de l'objet1 est plus grand que le côté haut de l'objet2
    objet1.yPos + objet1.hauteur > objet2.yPos
  ) {
    // On obtient une collision (true)
    return true;
  } else {
    // Si ce n'est pas le cas, on n'obtient pas de collision (false)
    return false;
  }
}

// Pour la fonction arretjeu
function arretJeu() {
  // Si le temps est plus petit ou égal 0
  if (iTemps <= 0) {
    // La fonction pageFin est activé
    pageFin();
  }
  // Si le score est plus grand ou égal à 100
  if (iScore >= 100) {
    // Toutes les intervals s'arrêtent et la fonction pageFin est activé
    clearInterval(iInterval);
    clearInterval(iInterval2);
    clearInterval(iInterval3);
    pageFin();
  }
}

// Pour la fonction de pagefin, on rend invisible la section de jeu, on enlève l'invisibilité de la section fin et on change le texte du score au score final obtenu
function pageFin() {
  oJeuHTML.classList.add("invisible");
  oFinHTML.classList.remove("invisible");
  oScoreFinHTML.textContent = `${iScore}`;

  // Si le score est plus grand ou égal à 0 et est plus petit que 45
  if (iScore < 0) {
    // Un message personnalisé est affiché
    oMessageHTML.textContent = "Votre partenaire s'est faite tuer";
  } else if (iScore >= 0 && iScore < 45) {
    // Un message personnalisé est affiché
    oMessageHTML.textContent = "Votre partenaire s'est faite empoisonnnee";
    // Si le score est plus grand ou égal à 45 et est plus petit que 90
  } else if (iScore >= 45 && iScore < 90) {
    // Un message personnalisé est affiché
    oMessageHTML.textContent = "Votre partenaire s'est faite emprisonner";
    // Si le score est plus grand ou égal à 90 et est plus petit que 100
  } else if (iScore >= 90 && iScore < 100) {
    // Un message personnalisé est affiché
    oMessageHTML.textContent = "Vous l'avez presque sauvee!";
    // Si le score est plus grand ou égal à 100
  } else if (iScore >= 100) {
    // Un message personnalisé est affiché
    oMessageHTML.textContent =
      "Elle est sauvee et vous vivez ensemble heureux pour toujours!";
  }
}

// Pour la fonction de recommencerjeu, les placements, des personnages, le temps, le score, l'état du personnage principal, les tableaux sont initialisés
function recommencerJeu() {
  // On efface toute les intervales
  clearInterval(iInterval);
  clearInterval(iInterval2);
  clearInterval(iInterval3);

  // La position du personnage est réinitialisée
  oImagePerso.xPos = 350;
  oImagePerso.yPos = 320;

  // Les variables nécessaire au jeu sont réinitialisé
  iTemps = 30;
  iScore = 0;
  sEtat = "standby_droite";
  aMonstres = [];
  aCopines = [];

  // On crée de nouveau une copine et un monstre
  creerCopine();
  creerMonstre();

  // Si la section de jeu est add invisible
  if (oJeuHTML.classList.contains("invisible")) {
    // La section Jeu se fait afficher de nouveau
    oJeuHTML.classList.remove("invisible");
  }
  // Si la section de fin n'est pas add invisible
  if (!oFinHTML.classList.contains("invisible")) {
    // La section se cache de nouveau
    oFinHTML.classList.add("invisible");
  }

  // On réactive les intervales nécessaires pour repartir le jeu
  iInterval = setInterval(boucleJeu, 1000 / 60);
  iInterval2 = setInterval(diminuerTemps, 1000);
  iInterval3 = setInterval(creerCopine, 5000);
}

// Dans la fonction bouclejeu, tous les fonctions qui doivent être redessinées/calculées/detectées en tout temps sont activés
function boucleJeu() {
  iTic++;
  iTic2++;
  oContexte.clearRect(0, 0, oCanvasHTML.width, oCanvasHTML.height);
  dessinerArrierePlan();
  dessinerPersonnage();
  dessinerMonstre();
  dessinerCopine();
  afficherTemps();
  afficherScore();
  detecterCollisionMonstresMC();
  detecterCollisionCopinesMC();
  arretJeu();
}

// On attend que les médias soient chargés avant d'activer la fonction initialisation
window.addEventListener("load", initialisation);
