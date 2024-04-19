/*jslint browser this */
/*global _, player */

(function (global) {
    "use strict";

    var computer = _.assign({}, player, {
        grid: [],
        tries: [],
        fleet: [],
        game: null,
        play: function () {
            var self = this;
            setTimeout(function () {
                var x_play = Math.floor(Math.random() * 10);
                var y_play = Math.floor(Math.random() * 10);
                
                self.game.fire(this, x_play, y_play, function (hasSucced) {
                    let miniGrid = document.querySelector('.mini-grid')
                    var node = miniGrid.querySelector('.row:nth-child(' + x_play + ') .cell:nth-child(' + y_play + ')');

                    self.tries[x_play][y_play] = hasSucced;
                    console.log(hasSucced);
                    console.log(x_play, y_play);

                    console.log(miniGrid);
                    if (hasSucced){
                        node.innerHTML = 'X'
                    } else {
                        node.style.backgroundColor = 'grey'
                    }

                });
            }, 2000);
        },

        setGame: function (param) {
            this.game = param
        },

        areShipsOk: function (callback) {
            var i = 0;
            var j;
            var a;


            this.fleet.forEach(function (ship, i) {
                j = 0;

                while (j < ship.life) {
                    this.grid[i][j] = ship.getId();
                    j += 1;
                }
                a = Math.floor(Math.random() * 10);
                i = Math.floor(Math.random() * 10);
                while(ship.life == 5 && a > 5){
                    a = Math.floor(Math.random() * 10);
                }while(ship.life == 4 && a > 6){

                    a = Math.floor(Math.random() * 10);
                } while (ship.life == 3 && a > 7) {
                    a = Math.floor(Math.random() * 10);

                }while((this.grid[i][a] !== 0 && this.grid[i][a+ship.life] !== 0) || this.grid[i][a] !== 0 || this.grid[i][a+ship.life] !== 0){

                    a = Math.floor(Math.random() * 10);
                    i = Math.floor(Math.random() * 10);
                }


                while (j < ship.life) {
                    this.grid[i][a] = ship.getId();
                    j += 1;
                    a += 1;
                }
            }, this);


            setTimeout(function () {
                callback();
            }, 500);
        }
    });

    global.computer = computer;

}(this));