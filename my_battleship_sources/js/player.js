/*jslint browser this */
/*global _, shipFactory, player, utils */

(function (global) {
    "use strict";

    var sheep = { dom: { parentNode: { removeChild: function () { } } } };

    var player = {

        grid: [],
        tries: [],
        fleet: [],
        game: null,
        activeShip: 0,
        init: function () {
            // créé la flotte
            this.fleet.push(shipFactory.build(shipFactory.TYPE_BATTLESHIP));
            this.fleet.push(shipFactory.build(shipFactory.TYPE_DESTROYER));
            this.fleet.push(shipFactory.build(shipFactory.TYPE_SUBMARINE));
            this.fleet.push(shipFactory.build(shipFactory.TYPE_SMALL_SHIP));

            // créé les grilles
            this.grid = utils.createGrid(10, 10);
            this.tries = utils.createGrid(10, 10);
        },
        setGame: function (param) {
            this.game = param;
        },

        play: function (col, line, case_play) {
            // appel la fonction fire du game, et lui passe une calback pour récupérer le résultat du tir
            this.game.fire(this, col, line, _.bind(function (hasSucced) {
                this.tries[line][col] = hasSucced;

                if (this.tries[line][col]) {          
                    case_play.animate([
                        { transform: "rotate(0) scale(1)" },
                        { transform: "rotate(180deg) scale(2)" },
                        { transform: "rotate(360deg) scale(1)" },
                    ], {
                        duration: 600,
                        iterations: 1
                    });
                    case_play.style.backgroundColor = "red";

                } else {
                    case_play.animate([
                        { transform: "scale(1)" },
                        { transform: "scale(0.5)" },
                        { transform: "scale(1)" },
                    ], {
                        duration: 1000,
                        iterations: 1
                    });
                    case_play.style.backgroundColor = "grey";
                }

            }, this));
        },
        // quand il est attaqué le joueur doit dire si il a un bateaux ou non à l'emplacement choisi par l'adversaire
        receiveAttack: function (col, line, callback) {
            var succeed = false;

            if (this.grid[line][col] !== 0) {
                if(this.game.currentPhase == "PHASE_PLAY_PLAYER"){
                   this.game.computer_life -= 1;
                }else{
                    this.game.player_life -= 1;
                }
                succeed = true;
                this.grid[line][col] = 0;
            }
            callback.call(undefined, succeed);
        },
        setActiveShipPosition: function (x, y) {

            var ship = this.fleet[this.activeShip];
            var i = 0;

            var f = 1;
            if (ship.dom.style.transform == "") {

                if (ship.getLife() == 5) {
                    if (x < 2 || x > 7) {
                        return false;
                    }
                } else if (ship.getLife() == 4) {
                    if (x < 2 || x > 8) {

                        return false;
                    }
                } else if (ship.getLife() == 3) {
                    if (x < 1 || x > 8) {
                        return false;
                    }
                }
            } else {
                if (ship.getLife() == 5) {
                    if (y < 2 || y > 7) {
                        return false;
                    }
                } else if (ship.getLife() == 4) {
                    if (y < 2 || y > 7) {
                        return false;
                    }
                } else if (ship.getLife() == 3) {
                    if (y < 1 || y >= 9) {

                        return false;
                    }
                }
            }

            if (ship.dom.style.transform == "") {

                while (i < ship.getLife()) {
                    if ((this.grid[y][x + i - 2] != 0 || this.grid[y][x + 2] != 0) && (ship.getLife() == 5)) {
                        return false
                    } else if ((this.grid[y][x + i - 2] != 0 || this.grid[y][x + 1] != 0) && (ship.getLife() == 4)) {
                        return false
                    } else if ((this.grid[y][x + i - 1] != 0 || this.grid[y][x + 1] != 0) && ship.getLife() == 3) {
                        return false
                    } else {
                        if (this.grid[y][x + i - 2] == 0 && (ship.getLife() == 5 || ship.getLife() == 4)) {
                            this.grid[y][x + i - 2] = ship.getId();
                            i += 1;
                        } else if (this.grid[y][x + i - 1] == 0 && ship.getLife() == 3) {
                            this.grid[y][x + i - 1] = ship.getId();
                            i += 1;
                        }
                    }
                }
            } else {
                while (i < ship.getLife()) {
                    if ((this.grid[y + i - 2][x] != 0 || this.grid[y + 2][x] != 0) && (ship.getLife() == 5)) {
                        return false;
                    } else if (this.grid[y + i - 2][x] == 0 && (ship.getLife() == 5)) {
                        this.grid[y + i - 2][x] = ship.getId();
                        i += 1;
                    } else if ((this.grid[y + i - 1][x] != 0 || this.grid[y + 2][x] != 0) && (ship.getLife() == 4)) {
                        return false;
                    } else if (this.grid[y + i - 1][x] == 0 && (ship.getLife() == 4)) {
                        this.grid[y + i - 1][x] = ship.getId();
                        i += 1;
                    } else if ((this.grid[y + i - 1][x] != 0 || this.grid[y + 1][x] != 0) && (ship.getLife() == 3)) {
                        return false;
                    } else if (this.grid[y + i - 1][x] == 0 && (ship.getLife() == 3)) {
                        this.grid[y + i - 1][x] = ship.getId();
                        i += 1;

                    }
                }
            }
            return [true, ship];
        },
        clearPreview: function () {
            this.fleet.forEach(function (ship) {
                if (ship.dom.parentNode) {
                    ship.dom.parentNode.removeChild(ship.dom);
                }
            });
        },
        resetShipPlacement: function () {
            this.clearPreview();

            this.activeShip = 0;
            this.grid = utils.createGrid(10, 10);
        },
        activateNextShip: function () {
            if (this.activeShip < this.fleet.length - 1) {
                this.activeShip += 1;
                return true;
            } else {
                return false;
            }
        },
        renderTries: function (grid) {
            this.tries.forEach(function (row, rid) {
                row.forEach(function (val, col) {

                    var node = grid.querySelector('.row:nth-child(' + (rid + 1) + ') .cell:nth-child(' + (col + 1) + ')');

                    if (val === true) {
                        node.style.backgroundColor = '#e60019';
                    } else if (val === false) {
                        node.style.backgroundColor = '#aeaeae';
                    }
                });
            });
        },

        renderShips: function (grid) {
        },

    };

    global.player = player;

}(this));