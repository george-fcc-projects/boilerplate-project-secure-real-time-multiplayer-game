require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const expect = require('chai');
const socket = require('socket.io');
const helmet = require('helmet');
const cors = require('cors');


const fccTestingRoutes = require('./routes/fcctesting.js');
const runner = require('./test-runner.js');
const Collectible = require("./public/Collectible.mjs");

const app = express();

const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.use('/public', express.static(process.cwd() + '/public'));
app.use('/assets', express.static(process.cwd() + '/assets'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors({origin: '*'}));


app.use(helmet());

app.use(helmet.noCache());

app.use((req, res, next) => {
  res.setHeader("X-Powered-By", "PHP 7.4.3");
  next();
});

// Index page (static HTML)
app.route('/')
  .get(function (req, res) {
    res.sendFile(process.cwd() + '/views/index.html');
  }); 

//For FCC testing purposes
fccTestingRoutes(app);
    
// 404 Not Found Middleware
app.use(function(req, res, next) {
  res.status(404)
    .type('text')
    .send('Not Found');
});

const portNum = process.env.PORT || 3000;

// Set up server and tests
const server = http.listen(portNum, () => {
  console.log(`Listening on port ${portNum}`);
  if (process.env.NODE_ENV==='test') {
    console.log('Running Tests...');
    setTimeout(function () {
      try {
        runner.run();
      } catch (error) {
        console.log('Tests are not valid:');
        console.error(error);
      }
    }, 1500);
  }
});

let players = [];
let collectible = createCollectible();

function createCollectible() {
  let randY = Math.floor(Math.random() * 335) + 45;
  let randX = Math.floor(Math.random() * 535) + 5;
  return new Collectible({x: randX, y: randY, value: 50, id: 'lool'});
}

io.on('connection', socket => {
  console.log('A user has connected', socket.id);
  socket.emit('new user', socket.id);
  socket.emit('collectible update', collectible);

  socket.on('disconnect', () => {
    console.log('A user has disconnected', socket.id);
    players.splice(players.findIndex(element => element.id === socket.id),1)

    io.emit('player update', players, collectible);
  })

  socket.on('user created', player => {
    players.push(player);
    io.emit('player update', players, collectible);
  })

  socket.on('player update', (player) => {
    for (let tryPlayer of players) {
      if (tryPlayer.id === player.id) {
        Object.assign(tryPlayer, player);
        if ((tryPlayer.x < collectible.x && tryPlayer.x > collectible.x - 60) && (tryPlayer.y < collectible.y && tryPlayer.y > collectible.y - 75)) {
          socket.emit('collision', collectible);
          collectible = createCollectible();
        }
        console.table(players);
        break;
      }
    }
    io.emit('player update', players, collectible);
  })
})




module.exports = app; // For testing
