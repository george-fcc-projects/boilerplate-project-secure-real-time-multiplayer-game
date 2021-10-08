/*global io*/

import Player from './Player.mjs';
import Collectible from './Collectible.mjs';

const socket = io();
const canvas = document.getElementById('game-window');
const context = canvas.getContext('2d');

let currentUserPlayer = undefined;

context.save()

clearPlayers();

// context.save();

socket.on('new user', userId => {
    console.log(userId);
    let randY = Math.floor(Math.random() * 335) + 45;
    let randX = Math.floor(Math.random() * 535) + 5;
    let player = new Player({x: randX, y: randY, score: 0, id: userId})
    currentUserPlayer = player;
    socket.emit('user created', currentUserPlayer)
})

socket.on('player update', (players, collectible) => {
    for (let player of players) {
        console.log('update:', player)
        clearPlayers(players);
        drawPlayer(player);
    }
    drawCollectible(collectible);
})

socket.on('collectible update', collectible => {
    drawCollectible(collectible);
})

socket.on('collision', (item) => {
    currentUserPlayer.collision(item);
    socket.emit('player update', currentUserPlayer);
})


function clearPlayers(players) {
    context.restore();
    context.fillStyle = 'green';
    context.fillRect(0, 0, 640, 480);
    context.clearRect(10, 40, 620, 430);
    context.fillRect(15, 45, 610, 420);
    context.fillStyle = 'white';

    context.font = '20px sans-serif';
    context.fillText('George\'s game', 20, 25);
    if (currentUserPlayer !== undefined) {
        context.fillText(`Score: ${currentUserPlayer.score}`, 250, 25);
        context.fillText(currentUserPlayer.calculateRank(players), 500, 25);
    }
}

function drawCollectible(collectible) {
    let collectibleImg = new Image(10, 10)
    collectibleImg.addEventListener('load', () => {
        context.drawImage(collectibleImg, collectible.x, collectible.y)
    })
    collectibleImg.src = './public/coin.png';
}

function drawPlayer(player) {

    let playerImg = new Image(10, 10)
    playerImg.addEventListener('load', () => {
        context.drawImage(playerImg, player.x, player.y)
    })
    playerImg.src = './public/cat.png';

}


document.addEventListener('keypress', ev => {
    switch (ev.key) {
        case 'w':
            currentUserPlayer.movePlayer('up', 10);
            break;
        case 's':
            currentUserPlayer.movePlayer('down', 10);
            break;
        case 'a':
            currentUserPlayer.movePlayer('left', 10);
            break;
        case 'd':
            currentUserPlayer.movePlayer('right', 10);
            break;

    }
    console.log(currentUserPlayer);
    socket.emit('player update', currentUserPlayer);
})