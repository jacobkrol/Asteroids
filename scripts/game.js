window.onload = function() {
	canv = document.getElementById('gc');
	ctx = canv.getContext('2d');
	document.addEventListener('keydown', handle_key_down);
	document.addEventListener('keyup', handle_key_up);
	const fps = 50;
	setup();
	game = setInterval(main, 1000/fps);
}

function setup() {
	player = new Player();
	space = new Space();
}

class Player {
	constructor() {
		this.pos = {
			x: canv.width/2,
			y: canv.height/2
		};
		this.width = 20;
		this.height = 25;
		this.angle = 0;
		this.vel = {
			x: 0,
			y: 0
		};
	}

	show() {
		ctx.strokeStyle = "white";
		ctx.lineWidth = "2";
		ctx.lineJoin = "round";
		ctx.rotate(this.angle);
		ctx.beginPath();
		ctx.moveTo(this.pos.x-this.width/2,this.pos.y+this.height/2);
		ctx.lineTo(this.pos.x,this.pos.y-this.height/2);
		ctx.lineTo(this.pos.x+this.width/2,this.pos.y+this.height/2);
		ctx.lineTo(this.pos.x,this.pos.y+this.height/4);
		ctx.lineTo(this.pos.x-this.width/2,this.pos.y+this.height/2);
		ctx.stroke();
		ctx.closePath();
		ctx.resetTransform();
	}

	move(dir) {
		console.log("move in direction",dir);

	}

	shoot() {
		console.log("pew");
	}
}

class Space {
	constructor() {
		this.asteroids = [];
		this.score = 0;
		this.dampen = 0.95;
	}

	show() {
		ctx.fillStyle = "black";
		ctx.fillRect(0,0,canv.width,canv.height);

		this.asteroids.forEach((a) => a.show());
	}
}

function main() {
	space.show();
	player.show();
}

function handle_key_down(evt) {
	switch(evt.code) {
		case 'ArrowUp':
			player.move(0);
			break;
		case 'ArrowRight':
			player.move(1);
			break;
		case 'ArrowDown':
			player.move(2);
			break;
		case 'ArrowLeft':
			player.move(3);
			break;
		case 'Space':
			player.shoot();
			break;
		default:
			console.log("invalid key press");
			break;
	}
}

function handle_key_up(evt) {
	// console.log(evt,"key up");
}
