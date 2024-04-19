/*jslint browser this */
/*global _, player, computer, utils */

(function () {
    "use strict";

    var game = {
        PHASE_INIT_PLAYER: "PHASE_INIT_PLAYER",
        PHASE_INIT_OPPONENT: "PHASE_INIT_OPPONENT",
        PHASE_PLAY_PLAYER: "PHASE_PLAY_PLAYER",
        PHASE_PLAY_OPPONENT: "PHASE_PLAY_OPPONENT",
        PHASE_GAME_OVER: "PHASE_GAME_OVER",
        PHASE_WAITING: "waiting",

        player_life : 17,
        computer_life : 17,

        currentPhase: "",
        phaseOrder: [],
        // garde une référence vers l'indice du tableau phaseOrder qui correspond à la phase de jeu pour le joueur humain
        playerTurnPhaseIndex: 2,

        // l'interface utilisateur doit-elle être bloquée ?
        waiting: false,

        // garde une référence vers les noeuds correspondant du dom
        grid: null,
        miniGrid: null,

        // liste des joueurs
        players: [],

        ship_mini_map: [],
        // lancement du jeu
        init: function () {

            // initialisation
            this.grid = document.querySelector('.board .main-grid');
            this.miniGrid = document.querySelector('.mini-grid');

            // défini l'ordre des phase de jeu
            this.phaseOrder = [
                this.PHASE_INIT_PLAYER,
                this.PHASE_INIT_OPPONENT,
                this.PHASE_PLAY_PLAYER,
                this.PHASE_PLAY_OPPONENT,
                this.PHASE_GAME_OVER
            ];
            this.playerTurnPhaseIndex = 2;

            // initialise les joueurs
            this.setupPlayers();

            // ajoute les écouteur d'événement sur la grille
            this.addListeners();


            // c'est parti !
            this.goNextPhase();
        },
        setupPlayers: function () {
            // donne aux objets player et computer une réference vers l'objet game
            player.setGame(this);
            computer.setGame(this);

            // todo : implémenter le jeu en réseaux
            this.players = [player, computer];

            this.players[0].init();
            this.players[1].init();
        },
        goNextPhase: function () {
            // récupération du numéro d'index de la phase courante
            var ci = this.phaseOrder.indexOf(this.currentPhase);
            var self = this;

            if (ci !== this.phaseOrder.length - 1) {
                this.currentPhase = this.phaseOrder[ci + 1];
            } else {
                this.currentPhase = this.phaseOrder[0];
            }
            switch (this.currentPhase) {
                case this.PHASE_GAME_OVER:
                    // detection de la fin de partie
                    if (!this.gameIsOver()) {
                        // le jeu n'est pas terminé on recommence un tour de jeu
                        this.currentPhase = this.phaseOrder[this.playerTurnPhaseIndex];
                        if(this.currentPhase == "PHASE_PLAY_PLAYER"){
                            utils.info("A vous de jouer, choisissez une case !");
                        }else{
                            utils.info("A votre adversaire de jouer...");
                            this.players[1].play();
                        }          
                        break;
                    }
                case this.PHASE_INIT_PLAYER:
                    
                    utils.info("Placez vos bateaux");
                    break;
                case this.PHASE_INIT_OPPONENT:
                    this.wait();
                    utils.info("En attente de votre adversaire");

                    this.players[1].areShipsOk(function () {
                        self.stopWaiting();
                        self.goNextPhase();
                    });
                    break;
                case this.PHASE_PLAY_PLAYER:
                    utils.info("A vous de jouer, choisissez une case !");
                    break;
                case this.PHASE_PLAY_OPPONENT:
                    utils.info("A votre adversaire de jouer...");
                    this.players[1].play();
                    break;
            }

        },
        gameIsOver: function () {

           
            if(this.player_life == 0){
                alert("Computer win");
                player.resetShipPlacement();

                for(const child of this.grid.children){
                    for(const cell of child.children){
                        cell.style.backgroundColor = "";
                    }
                }
                this.currentPhase = this.phaseOrder[0];
                this.player_life = 17;
                this.computer_life = 17;
                return true;
            }else if(this.computer_life == 0){
               alert("Player win");
               player.resetShipPlacement();
               for(const child of this.grid.children){
                for(const cell of child.children){
                    cell.style.backgroundColor = "";
                }
            }
                this.player_life = 17;
                this.computer_life = 17;
                this.currentPhase = this.phaseOrder[0];

                return true;
            }else{
                return false;
            }

        },
        getPhase: function () {
            if (this.waiting) {
                return this.PHASE_WAITING;
            }
            return this.currentPhase;
        },
        // met le jeu en mode "attente" (les actions joueurs ne doivent pas être pris en compte si le jeu est dans ce mode)
        wait: function () {
            this.waiting = true;
        },
        // met fin au mode mode "attente"
        stopWaiting: function () {
            this.waiting = false;
        },
        addListeners: function () {
            // on ajoute des acouteur uniquement sur la grid (délégation d'événement)
            this.grid.addEventListener('mousemove', _.bind(this.handleMouseMove, this));
            this.grid.addEventListener('click', _.bind(this.handleClick, this));
            this.grid.addEventListener('click', (e) => {
            })
        },
        handleMouseMove: function (e) {
            
            // on est dans la phase de placement des bateau
            if (this.getPhase() === this.PHASE_INIT_PLAYER && e.target.classList.contains('cell')) {
                var ship = this.players[0].fleet[this.players[0].activeShip];
                // si on a pas encore affiché (ajouté aux DOM) ce bateau

                if (!ship.dom.parentNode) {
                    this.ship_mini_map.push(ship.dom);
                    this.grid.appendChild(ship.dom);
                    // passage en arrière plan pour ne pas empêcher la capture des événements sur les cellules de la grille
                    ship.dom.style.zIndex = -1;
                }

                // décalage visuelle, le point d'ancrage du curseur est au milieu du bateau
                ship.dom.style.top = "" + (utils.eq(e.target.parentNode)) * utils.CELL_SIZE - (600 + this.players[0].activeShip * 60) + "px";
                ship.dom.style.left = "" + utils.eq(e.target) * utils.CELL_SIZE - Math.floor(ship.getLife() / 2) * utils.CELL_SIZE + "px";
                if (ship.dom.style.transform == "rotate(90deg)" && ship.getLife() == 4) {
                    var test = Number(ship.dom.style.left.replace("px", "")) + 30;
                    var new_value = test.toString() + "px";
                    ship.dom.style.left = new_value;

                    var test2 = Number(ship.dom.style.top.replace("px", "")) + 30;
                    var new_value2 = test2.toString() + "px";
                    ship.dom.style.top = new_value2;
                }


                window.oncontextmenu = function (e) {
                    var phase_actual =  game.getPhase();
                    e.preventDefault();
                    
                   if(phase_actual === "PHASE_INIT_PLAYER"){
                       if(ship.dom.style.transform !=""){
                           ship.dom.style.transform  = "";
                           if(ship.getLife() == 4){
                               var test =  Number(ship.dom.style.left.replace("px","")) - 30;
                               var new_value = test.toString() + "px";
                               ship.dom.style.left = new_value;
      
                               var test2 =  Number(ship.dom.style.top.replace("px","")) - 30;
                               var new_value2 = test2.toString() + "px";
                               ship.dom.style.top = new_value2;
                              }
                       }else{
                           ship.dom.style.transform = "rotate(90deg)";
                           if(ship.getLife() == 4){
                            var test =  Number(ship.dom.style.left.replace("px","")) + 30;
                            var new_value = test.toString() + "px";
                            ship.dom.style.left = new_value;
   
                            var test2 =  Number(ship.dom.style.top.replace("px","")) + 30;
                            var new_value2 = test2.toString() + "px";
                            ship.dom.style.top = new_value2;
                           }
                       }       
                   } 

                }
            }
        },
        handleClick: function (e) {
            // self garde une référence vers "this" en cas de changement de scope
            var self = this;
            // si on a cliqué sur une cellule (délégation d'événement)
            if (e.target.classList.contains('cell')) {
                // si on est dans la phase de placement des bateau
                if (this.getPhase() === this.PHASE_INIT_PLAYER) {
                    // on enregistre la position du bateau, si cela se passe bien (la fonction renvoie true) on continue
                    if (this.players[0].setActiveShipPosition(utils.eq(e.target), utils.eq(e.target.parentNode))) {
                        // et on passe au bateau suivant (si il n'y en plus la fonction retournera false)
                        if (!this.players[0].activateNextShip()) {
                            this.wait();
                            utils.confirm("Confirmez le placement ?", function () {
                                // si le placement est confirmé
                                self.stopWaiting();
                                self.renderMiniMap();
                                // self.players[0].clearPreview();

                                self.wait();

                                var main_board = document.getElementsByClassName("board right");
                                var main_grid = document.getElementsByClassName("main-grid");
                               var p_who_start = document.createElement("p");
                               var button_player = document.createElement("button");
                               var button_computer = document.createElement("button");
                               var button_random = document.createElement("button");
                               
                               var button_suggestion = document.createElement("button");
                                
                               main_board[0].insertBefore(p_who_start,main_grid[0]);
                               main_board[0].insertBefore(button_player,main_grid[0]);
                               main_board[0].insertBefore(button_computer,main_grid[0]);
                               main_board[0].insertBefore(button_random,main_grid[0]);
                               p_who_start.innerHTML = "Who start ?"
                               button_player.innerHTML = "Player";
                               button_computer.innerHTML = "Computer";
                               button_random.innerHTML = "Random";


                               button_player.addEventListener("click", function (){

                                game.phaseOrder = [
                                    game.PHASE_INIT_PLAYER,
                                    game.PHASE_INIT_OPPONENT,
                                    game.PHASE_PLAY_PLAYER,
                                    game.PHASE_PLAY_OPPONENT,
                                    game.PHASE_GAME_OVER
                                ];

                                //main_board[0].insertBefore(button_suggestion,main_grid[0]);
                                //button_suggestion.innerHTML = "Play suggestion";
                                p_who_start.remove();
                                button_computer.remove();
                                button_player.remove();
                                button_random.remove();
                                self.goNextPhase();
                               })

                               button_computer.addEventListener("click", function (){
                                game.phaseOrder = [
                                    game.PHASE_INIT_PLAYER,
                                    game.PHASE_INIT_OPPONENT,
                                    game.PHASE_PLAY_OPPONENT,
                                    game.PHASE_PLAY_PLAYER,
                                    game.PHASE_GAME_OVER
                                ];


                               // main_board[0].insertBefore(button_suggestion,main_grid[0]);
                               // button_suggestion.innerHTML = "Play suggestion";
                                p_who_start.remove();
                                button_computer.remove();
                                button_player.remove();
                                button_random.remove();
                                self.goNextPhase();
                               })


                               button_random.addEventListener("click", function(){
                                var random_number = Math.floor(Math.random() * 2);
                                if(random_number == 0){
                                    game.phaseOrder = [
                                        game.PHASE_INIT_PLAYER,
                                        game.PHASE_INIT_OPPONENT,
                                        game.PHASE_PLAY_PLAYER,
                                        game.PHASE_PLAY_OPPONENT,
                                        game.PHASE_GAME_OVER
                                    ];
                                }else{
                                    game.phaseOrder = [
                                        game.PHASE_INIT_PLAYER,
                                        game.PHASE_INIT_OPPONENT,
                                        game.PHASE_PLAY_OPPONENT,
                                        game.PHASE_PLAY_PLAYER,
                                        game.PHASE_GAME_OVER
                                    ];
                                }

                               // main_board[0].insertBefore(button_suggestion,main_grid[0]);
                                //button_suggestion.innerHTML = "Play suggestion";

                                p_who_start.remove();
                                button_computer.remove();
                                button_player.remove();
                                button_random.remove();
                                self.goNextPhase(); 
                            })


                            button_suggestion.addEventListener("click", function () {
                                var random_x = Math.floor(Math.random() * 10);
                                var random_y = Math.floor(Math.random() * 9); 

                                utils.info("You can play x : " + random_x + " y : " + random_y );
                            })

                            }, function () {
                                self.stopWaiting();
                                // sinon, on efface les bateaux (les positions enregistrées), et on recommence
                                self.players[0].resetShipPlacement();
                            });
                        }
                    }
                    // si on est dans la phase de jeu (du joueur humain)
                } else if (this.getPhase() === this.PHASE_PLAY_PLAYER) {
                    this.players[0].play(utils.eq(e.target), utils.eq(e.target.parentNode),e.target);
                }
            }
        },
        // fonction utlisée par les objets représentant les joueurs (ordinateur ou non)
        // pour placer un tir et obtenir de l'adversaire l'information de réusssite ou non du tir
        fire: function (from, col, line, callback) {
            this.wait();
            var self = this;
            var msg = "";

            // determine qui est l'attaquant et qui est attaqué
            var target = this.players.indexOf(from) === 0
                ? this.players[1]
                : this.players[0];

            if (this.currentPhase === this.PHASE_PLAY_OPPONENT) {
                msg += "Votre adversaire vous a... ";
            }

            // on demande à l'attaqué si il a un bateaux à la position visée
            // le résultat devra être passé en paramètre à la fonction de callback (3e paramètre)
            target.receiveAttack(col, line, function (hasSucceed) {
                if (hasSucceed) {
                    msg += "Touché !";
    
                } else {
                    msg += "Manqué...";
                }

                utils.info(msg);

                // on invoque la fonction callback (4e paramètre passé à la méthode fire)
                // pour transmettre à l'attaquant le résultat de l'attaque
                callback(hasSucceed);

                if(hasSucceed){
                    let sound = document.createElement('audio')
                    sound.src = 'js/soundEffect/mixkit-bomb-drop-cold-water-explosion-2806.wav'
                    sound.currentTime = 1.5
                    sound.play()
                    setTimeout(() => {
                        sound.pause()
                    }, 3 * 1000)
                } else {
                    let sound = document.createElement('audio')
                    sound.src = 'js/soundEffect/mixkit-jump-into-the-water-1180.wav'
                    // sound.currentTime = 1.5
                    sound.play()
                    setTimeout(() => {
                        sound.pause()
                    }, 3 * 1000)
                }

                // on fait une petite pause avant de continuer...
                // histoire de laisser le temps au joueur de lire les message affiché
                setTimeout(function () {
                    self.stopWaiting();
                    self.goNextPhase();
                }, 1000);
            });

        },
        renderMap: function () {
            this.players[0].renderTries(this.grid);
        },
        renderMiniMap: function () {
            this.ship_mini_map.map((element) => this.miniGrid.appendChild(element));
            this.miniGrid.style.height = "600px";

        },

    };

    // point d'entrée
    document.addEventListener('DOMContentLoaded', function () {
        game.init();
    });

}());