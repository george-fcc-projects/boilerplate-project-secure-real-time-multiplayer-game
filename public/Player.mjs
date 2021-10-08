class Player {
  constructor({x, y, score, id}) {
    this.x = x;
    this.y = y;
    this.score = score;
    this.id = id;
  }

  movePlayer(dir, speed) {
    switch (dir) {
      case 'up':
        if (this.y - speed <= 45) {
          this.y = 45;
        } else {
          this.y -= speed;
        }
        break;
      case 'down':
        if (this.y + speed >= 380) {
          this.y = 380;
        } else {
          this.y += speed;
        }
        break;
      case 'left':
        if (this.x - speed <= 5) {
          this.x = 5;
        } else {
          this.x -= speed;
        }
        break;
      case 'right':
        if (this.x + speed >= 540) {
          this.x = 540;
        } else {
          this.x += speed;
        }
        break;
      default:
        break;
    }

  }

  collision(item) {
    this.score += item.value;
    return true;
  }

  calculateRank(arr) {
    let overallPlayers = arr.length;
    let rank = overallPlayers
    for (let player of arr) {
      if (this.score > player.score) {
        rank --;
      }
    }

    return `Rank: ${rank}/${overallPlayers}`

  }
}

export default Player;
