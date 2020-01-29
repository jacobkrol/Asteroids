window.onload = function() {
	canv = document.getElementById('gc');
	ctx = canv.getContext('2d');
	canv.width = Math.min(window.innerHeight,window.innerWidth)-30;
	canv.height = Math.min(window.innerHeight,window.innerWidth)-30;
	document.addEventListener('keydown', handle_key_down);
	document.addEventListener('keyup', handle_key_up);
	const fps = 50;
	setup();
	game = setInterval(main, 1000/fps);
}

function setup() {
	player = new Player();
	player.r = Math.max(player.width,player.height)/2;
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
		this.r = 0;
		this.angle = 0;
		this.vel = {
			x: 0,
			y: 0
		};
		this.copies = [];
		this.lastUpdate = performance.now();
		this.delay = 10;
		this.turning = 0;
		this.thrusting = false;
		this.shooting = false;
	}

	update() {
		//turn the ship
		const turnAngle = Math.PI/36;
		this.angle += this.turning*turnAngle;

		//thrust the ship
		if(this.thrusting) {
			const speedBoost = 0.1,
				  maxSpeed = 5;
			this.vel.x += speedBoost*Math.cos(this.angle);
			this.vel.y += speedBoost*Math.sin(this.angle);
			if(sq(this.vel.x)+sq(this.vel.y) > sq(maxSpeed)) {
				const scale = maxSpeed / Math.sqrt(sq(this.vel.x)+sq(this.vel.y));
				this.vel.x *= scale;
				this.vel.y *= scale;
			}
		}

		this.pos.x += this.vel.x;
		this.pos.y += this.vel.y;
		this.copies = [];
		if(this.pos.y >= space.height-this.r) {
			this.pos.y -= space.height;
			if(this.pos.y <= this.r) {
				this.copies.push(0);
			}
		}
		if(this.pos.x >= space.width-this.r) {
			this.pos.x -= space.width;
			if(this.pos.x <= this.r) {
				this.copies.push(1);
			}
		}
		if(this.pos.y <= this.r) {
			this.pos.y += space.height;
			if(this.pos.y >= space.height-this.r) {
				this.copies.push(2);
			}
		}
		if(this.pos.x <= this.r) {
			this.pos.x += space.width;
			if(this.pos.x >= space.width-this.r) {
				this.copies.push(3);
			}
		}
	}

	show() {
		ctx.strokeStyle = "white";
		ctx.lineWidth = "2";
		ctx.lineJoin = "bevel";
		show_player_at(this.pos.x,this.pos.y);
		for(let c of this.copies) {
			switch(c) {
				case 0:
					show_player_at(this.pos.x,this.pos.y-space.height);
					break;
				case 1:
					show_player_at(this.pos.x+space.width,this.pos.y);
					break;
				case 2:
					show_player_at(this.pos.x,this.pos.y+space.height);
					break;
				case 3:
					show_player_at(this.pos.x-space.width,this.pos.y);
					break;
				default:
					console.log("unrecognized copy side");
					break;
			}
		}
	}

	shoot() {
		console.log("pew");
	}
}

function show_player_at(x,y) {
	ctx.translate(x,y);
	ctx.rotate(player.angle+Math.PI/2);
	ctx.beginPath();
	ctx.moveTo(-player.width/2,player.height/2);
	ctx.lineTo(0,-player.height/2);
	ctx.lineTo(player.width/2,player.height/2);
	ctx.lineTo(0,player.height/4);
	ctx.lineTo(-player.width/2,player.height/2);
	ctx.stroke();
	ctx.closePath();
	ctx.translate(-x,-y);
	ctx.setTransform(1,0,0,1,0,0);
}

class Space {
	constructor() {
		this.width = canv.width;
		this.height = canv.height;
		this.asteroids = [];
		this.lasers = [];
		this.score = 0;
	}

	update() {
		this.lasers.forEach((l) => {
			l.update();
			this.asteroids.forEach((a) => {
				if(l.hit(a)) {
					if(a.r > 8) {
						for(let i=0; i<Math.random()*3+1; i++) {
							const r = a.r*(Math.random()*0.55+0.2);
							this.asteroids.push(new Asteroid(a.pos.x,a.pos.y,r));
						}
					}
					a.hit = true;
					l.used = true;
					console.log(this.asteroids.indexOf(a));
				}
			});
			this.lasers = this.lasers.slice().filter((l) => !l.used);
			this.asteroids = this.asteroids.slice().filter((a) => !a.hit);
		});
		if(this.lasers.length > 30) { this.lasers.unshift() }
		this.asteroids.forEach((a) => {
			a.update();
			if(a.hit) {

			}
		});
		this.asteroids = this.asteroids.filter((a) => !a.hit);
		if(Math.random() < 0.01) {
			this.asteroids.push(new Asteroid());
		}
	}

	show() {
		ctx.fillStyle = "black";
		ctx.fillRect(0,0,this.width,this.height);

		this.asteroids.forEach((a) => a.show());
		this.lasers.forEach((l) => l.show());
	}
}

class Laser {
	constructor(x,y,a) {
		this.pos = {
			x: x+player.r*Math.cos(a),
			y: y+player.r*Math.sin(a)
		};
		this.angle = a;
		this.size = 10;
		this.used = false;
	}

	update() {
		const speed = 3;
		this.pos.x += speed*Math.cos(this.angle);
		this.pos.y += speed*Math.sin(this.angle);
	}

	hit(a) { // asteroid object
		const d = Math.sqrt(sq(this.pos.x - a.pos.x) + sq(this.pos.y - a.pos.y));
		return d < this.size+a.r;
	}

	show() {
		ctx.translate(this.pos.x,this.pos.y);
		ctx.rotate(this.angle+Math.PI/2);
		ctx.beginPath();
		ctx.moveTo(0,this.size/2);
		ctx.lineTo(0,-this.size/2);
		ctx.stroke();
		ctx.closePath();
		ctx.translate(-this.pos.x,-this.pos.y);
		ctx.setTransform(1,0,0,1,0,0);
	}
}

class Asteroid {
	constructor(_x,_y,_r) {
		this.pos = {
			x: _x ||Math.random()*space.width,
			y: _y || Math.random()*space.height
		};
		this.r = _r || Math.random()*25+8;
		this.speed = Math.random()*1+0.1;
		this.angle = Math.random()*2*Math.PI;
		this.hit = false;
	}

	update() {
		this.pos.x += this.speed * Math.cos(this.angle);
		this.pos.y += this.speed * Math.sin(this.angle);
	}

	explode() {
		this.hit = true;
	}

	show() {
		ctx.strokeStyle = this.hit ? "red" : "white";
		ctx.translate(this.pos.x,this.pos.y);
		// ctx.rotate(this.angle+Math.PI/2);
		ctx.beginPath();
		ctx.arc(0,0,this.r,0,2*Math.PI);
		ctx.stroke();
		ctx.closePath();
		ctx.translate(-this.pos.x,-this.pos.y);
		ctx.setTransform(1,0,0,1,0,0);
	}
}

function sq(n) {
	return Math.pow(n,2);
}

function main() {
	space.show();
	space.update();
	player.show();
	player.update();

}

function handle_key_down(evt) {
	switch(evt.code) {
		case 'ArrowUp':
			player.thrusting = true;
			break;
		case 'ArrowRight':
			player.turning = 1;
			break;
		case 'ArrowLeft':
			player.turning = -1;
			break;
		case 'Space':
			if(!player.shooting) {
				space.lasers.push(new Laser(player.pos.x,player.pos.y,player.angle));
				player.shooting = true;
			};
			break;
		default:
			console.log("invalid key press");
			break;
	}
}

function handle_key_up(evt) {
	switch(evt.code) {
		case 'ArrowUp':
			player.thrusting = false;
			break;
		case 'ArrowRight':
			player.turning = 0;
			break;
		case 'ArrowLeft':
			player.turning = 0;
			break;
		case 'Space':
			player.shooting = false;
			break;
		default:
			console.log("other up key");
			break;
	}
}
