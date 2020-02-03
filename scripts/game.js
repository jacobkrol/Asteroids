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

		//update the ship's position
		this.pos.x += this.vel.x;
		this.pos.y += this.vel.y;

		//update which sides need copies drawn
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

		//check for asteroid collisions
		space.asteroids.forEach((a) => {
			if(this.hit(a)) {
				destroy_player();
			}
		});
	}

	hit(a) {
		const d = Math.sqrt(sq(this.pos.x - a.pos.x) + sq(this.pos.y - a.pos.y));
		return d < Math.min(this.height,this.width)/2+a.r;
	}

	destroy() {
		ctx.fillStyle = "red";
		ctx.strokeStyle = "lime";
		ctx.translate(this.pos.x,this.pos.y);
		ctx.rotate(this.angle+Math.PI/2);
		ctx.beginPath();
		ctx.moveTo(-this.width/2,this.height/2);
		ctx.lineTo(0,-this.height/2);
		ctx.lineTo(this.width/2,this.height/2);
		ctx.lineTo(0,this.height/4);
		ctx.lineTo(-this.width/2,this.height/2);
		ctx.fill();
		ctx.closePath();
		ctx.translate(-this.pos.x,-this.pos.y);
		ctx.setTransform(1,0,0,1,0,0);
		// clearInterval(game);
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
		// console.log("pew");
	}
}

function destroy_player() {
	destroyPlayer = new Promise((resolve,reject) => {
		//clear old ship
		space.show();
		resolve(true);
	}).then((result) => {

		//translate canvas context
		ctx.translate(player.pos.x,player.pos.y);

		//fill ship
		ctx.fillStyle = "red";
		ctx.rotate(player.angle+Math.PI/2);
		ctx.beginPath();
		ctx.moveTo(-player.width/2,player.height/2);
		ctx.lineTo(0,-player.height/2);
		ctx.lineTo(player.width/2,player.height/2);
		ctx.lineTo(0,player.height/4);
		ctx.lineTo(-player.width/2,player.height/2);
		ctx.fill();
		ctx.closePath();

		//stroke ship
		ctx.strokeStyle = "darkred";
		ctx.lineWidth = "2";
		ctx.beginPath();
		ctx.moveTo(-player.width/2,player.height/2);
		ctx.lineTo(0,-player.height/2);
		ctx.lineTo(player.width/2,player.height/2);
		ctx.lineTo(0,player.height/4);
		ctx.lineTo(-player.width/2,player.height/2);
		ctx.stroke();
		ctx.closePath();

		//reset canvas context transformation
		ctx.translate(-player.pos.x,-player.pos.y);
		ctx.setTransform(1,0,0,1,0,0);
		return true;
	}).then((result) => {
		clearInterval(game);
	});
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
			//update laser positions
			l.update();

			//react to laser hitting an asteroid
			this.asteroids.forEach((a) => {
				if(l.hit(a)) {
					if(a.r > 10) {
						for(let i=0; i<Math.random()*3+1; i++) {
							const r = a.r*(rand(0.2,0.75));
							this.asteroids.push(new Asteroid(a.pos.x,a.pos.y,r));
						}
					}
					a.hit = true;
					l.used = true;
				}
			});

			//update dead lasers and asteroids between loops
			this.lasers = this.lasers.slice().filter((l) => !l.used);
			this.asteroids = this.asteroids.slice().filter((a) => !a.hit);
		});

		//remove objects that have left the map
		let playerNose = {
			x: player.pos.x+player.height/2*Math.cos(player.angle),
			y: player.pos.y+player.height/2*Math.sin(player.angle)
		};
		playerNose.x = playerNose.x < 0 ? playerNose.x+space.width : playerNose.x;
		playerNose.x = playerNose.x > space.width ? playerNose.x-space.width : playerNose.x;
		playerNose.y = playerNose.y < 0 ? playerNose.y+space.height : playerNose.y;
		playerNose.y = playerNose.y > space.height ? playerNose.y-space.height : playerNose.y;
		// console.log(playerNose.x,playerNose.y);
		this.lasers = this.lasers.slice().filter((l) => {
			// console.log(playerNose.x < l.size);
			return ((l.pos.x < space.width+l.size &&
					 l.pos.x > -l.size &&
					 l.pos.y < space.height+l.size &&
					 l.pos.y > -l.size) ||
				 	(playerNose.x < l.size ||
					 playerNose.x > space.width-l.size ||
				 	 playerNose.y < l.size ||
				 	 playerNose.y > space.width-l.size)
				 	);
		});
		this.asteroids = this.asteroids.slice().filter((a) => {
			return a.pos.x < 1.5*space.width && a.pos.x > -0.5*space.width && a.pos.y < 1.5*space.height && a.pos.y > -0.5*space.height;
		});

		//update asteroid positions
		this.asteroids.forEach((a) => a.update());

		//push new asteroids at a random rate
		if(Math.random() < 0.03) {
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

function getAsteroidVertices(a) {
	let vertices = Array.from(Array(Math.floor(rand(6,11))), () => [null,null]);
	const wedge = 2*Math.PI / vertices.length;
		  buffer = 0.2;
	for(let i=0; i<vertices.length; i++) {
		const angle = wedge * i,
			  shift = rand(-a.r*buffer,a.r*buffer);
		vertices[i][0] = (a.r+shift)*Math.cos(angle);
		vertices[i][1] = (a.r+shift)*Math.sin(angle);
	}
	return vertices;
}

function setBehindBorder(distance,margin) {
	return rand(1) < 0.5 ? -margin : distance+margin;
}

class Asteroid {

	//define object parameters
	constructor(_x,_y,_r) {
		this.pos = {
			x: _x || setBehindBorder(space.width,35),
			y: _y || setBehindBorder(space.height,35)
		};
		this.r = _r || rand(8,32);
		this.vertices = getAsteroidVertices(this);
		this.speed = rand(0.1,1.2);
		this.angle = rand(2*Math.PI);
		this.hit = false;
	}

	//update position from speed and angle
	update() {
		this.pos.x += this.speed * Math.cos(this.angle);
		this.pos.y += this.speed * Math.sin(this.angle);
	}

	//flag asteroid as hit for removal from Space array
	explode() {
		this.hit = true;
	}

	//display to the canvas
	show() {
		ctx.strokeStyle = this.hit ? "red" : "white";
		ctx.translate(this.pos.x,this.pos.y);
		// ctx.rotate(this.angle+Math.PI/2);
		ctx.beginPath();
		//ctx.arc(0,0,this.r,0,2*Math.PI);
		ctx.moveTo(this.vertices[0][0],this.vertices[0][1]);
		for(let i=1; i<this.vertices.length; i++) {
			ctx.lineTo(this.vertices[i][0],this.vertices[i][1]);
		}
		ctx.lineTo(this.vertices[0][0],this.vertices[0][1]);
		ctx.stroke();
		ctx.closePath();
		ctx.translate(-this.pos.x,-this.pos.y);
		ctx.setTransform(1,0,0,1,0,0);
	}
}

//input n
//output n^2
function sq(n) {
	return Math.pow(n,2);
}

//input a OR a,b
//output random float, 0 -> a OR a -> b
function rand(_a,_b) {
	let a = _a || undefined,
		b = _b || 0;
	return Math.random()*(Math.max(a,b)-Math.min(a,b)) + Math.min(a,b);
}

//main game loop
function main() {

	//update positions
	space.update();
	player.update();

	//display updates
	space.show();
	player.show();


}

function handle_key_down(evt) {
	switch(evt.code) {

		//flag player as thrusting
		case 'ArrowUp':
			player.thrusting = true;
			break;

		//flag player as turning clockwise
		case 'ArrowRight':
			player.turning = 1;
			break;

		//flag player as turning counterclockwise
		case 'ArrowLeft':
			player.turning = -1;
			break;

		//push laser to Laser array and flag to await key up
		case 'Space':
			if(!player.shooting) {
				space.lasers.push(new Laser(player.pos.x,player.pos.y,player.angle));
				player.shooting = true;
			};
			break;

		//catch default and print to console
		default:
			// console.log("invalid key press");
			break;
	}
}

function handle_key_up(evt) {
	switch(evt.code) {

		//in all cases ...
		//cancel respective player flag

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
			// console.log("other up key");
			break;
	}
}
