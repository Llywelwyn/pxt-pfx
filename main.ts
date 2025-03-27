game.currentScene().physicsEngine = new ArcadePhysicsEngine(10000)

interface ParticleConfig {
    /** Minimum particle size in Pixels. */
    minSize?: number;
    /** Maximum particle size in Pixels. */
    maxSize?: number;
    /** Particle colour. */
    color?: number;
    /** Speed of particle. */
    speed?: number;
    /** If true, speed will be randomised between 0 and speed. */
    speedVaries?: boolean;
    /** Lifespan of particle in milliseconds. */
    lifespan?: number;
    /** If true, lifespan will be randomised between 0 and lifespan. */
    lifespanVaries?: boolean;
    /** If the particle should BounceOnWalls. */
    bouncy?: boolean;
    /** Direction of particle emission in Radians. */
    direction?: number;
    /** Maximum spread of the particle emission in Radians. */
    spreadAngle?: number;
    /** Downward acceleration on the particle. */
    gravity?: number;
}

class ParticlePresets {
    static readonly circle: ParticleConfig = {
        minSize: 1,
        maxSize: 4,
        color: -1,
        speed: 100,
        speedVaries: true,
        lifespan: 1000,
        lifespanVaries: true,
        bouncy: true,
        direction: 0,
        spreadAngle: 2 * Math.PI,
        gravity: 0,
    };
    static readonly line: ParticleConfig = {
        speedVaries: false,
        lifespanVaries: false,
        spreadAngle: 0,
    }
    static readonly ring: ParticleConfig = { 
        lifespanVaries: true, 
        speedVaries: false 
    };
    static readonly smoke: ParticleConfig = {
        minSize: 1,
        maxSize: 6,
        color: 1,
        speed: 20,
        speedVaries: true,
        lifespan: 3000,
        lifespanVaries: true,
        bouncy: false,
        direction: 0,
        spreadAngle: Math.PI / 2,
        gravity: -10,
    };

    static cloneConfig(config: ParticleConfig): ParticleConfig {
        return {
            minSize: config.minSize,
            maxSize: config.maxSize,
            speed: config.speed,
            speedVaries: config.speedVaries,
            lifespan: config.lifespan,
            lifespanVaries: config.lifespanVaries,
            bouncy: config.bouncy,
            direction: config.direction,
            spreadAngle: config.spreadAngle,
            gravity: config.gravity,
        };
    }
}

interface Point {
    x: number,
    y: number,
}

class ParticleEffect {
    /** Total number of particles to be emitted. */
    private numOfParticles: number;
    /** Delay before particles are emitted. */
    private delay: number = 0;
    private pos: Point = { x: 80, y: 60 }
    /** Particle configuration. */
    config: ParticleConfig = ParticlePresets.cloneConfig(ParticlePresets.circle);

    static readonly RADIANS_IN_A_DEGREE: number = Math.PI / 180

    constructor(n: number, config?: ParticleConfig) {
        this.numOfParticles = n;
        if (config) { this.setConfig(config); }
    }

    public rainbow(): ParticleEffect {
        this.config.color = -1;
        return this;
    }

    public setPosition(x: number, y: number): ParticleEffect {
        this.pos.x = x;
        this.pos.y = y;
        return this;
    }

    public setColor(color: number): ParticleEffect {
        this.config.color = color;
        return this;
    }

    public setConfig(config: ParticleConfig) {
        const setOrDefault = <T>(value: T | undefined, defaultValue: T): T => {
            return value !== undefined ? value : defaultValue;
        }

        this.config.minSize = setOrDefault(config.minSize, ParticlePresets.circle.minSize);
        this.config.maxSize = setOrDefault(config.maxSize, ParticlePresets.circle.maxSize);
        this.config.speed = setOrDefault(config.speed, ParticlePresets.circle.speed);
        this.config.speedVaries = setOrDefault(config.speedVaries, ParticlePresets.circle.speedVaries);
        this.config.lifespan = setOrDefault(config.lifespan, ParticlePresets.circle.lifespan);
        this.config.lifespanVaries = setOrDefault(config.lifespanVaries, ParticlePresets.circle.lifespanVaries);
        this.config.bouncy = setOrDefault(config.bouncy, ParticlePresets.circle.bouncy);
        this.config.direction = setOrDefault(config.direction, ParticlePresets.circle.direction);
        this.config.spreadAngle = setOrDefault(config.spreadAngle, ParticlePresets.circle.spreadAngle);
        this.config.gravity = setOrDefault(config.gravity, ParticlePresets.circle.gravity);
        this.config.color = setOrDefault(config.color, ParticlePresets.circle.color);
        return this;
    }

    public setDirection(n: number, usingRadians: boolean = false): ParticleEffect {
        this.config.direction = usingRadians ? n : n * ParticleEffect.RADIANS_IN_A_DEGREE
        return this;
    }

    public addDirection(n: number, usingRadians: boolean = false): ParticleEffect {
        let dn = usingRadians ? n : n * ParticleEffect.RADIANS_IN_A_DEGREE
        this.config.direction += dn;
        return this;
    }

    public aimTowards(otherSprite: Sprite): ParticleEffect {
        /** An offset of Math.PI/2 is removed from the direction when
         *  the emission is generated, so that 0-degrees is Upwards,
         *  which is more intuitive than 0-degrees being Rightwards.
         * 
         *  We need to remove the same offset here.
         */
        const MINUS_OFFSET = Math.PI/2
        let dx = otherSprite.x - this.pos.x;
        let dy = otherSprite.y - this.pos.y;
        this.setDirection(Math.atan2(dy, dx) + MINUS_OFFSET, true);
        return this;
    }

    public setSpreadAngle(n: number, usingRadians: boolean = false): ParticleEffect {
        this.config.spreadAngle = usingRadians ? n : n * ParticleEffect.RADIANS_IN_A_DEGREE
        return this;
    }

    public setDelay(ms: number): ParticleEffect {
        this.delay = ms;
        return this;
    }

    public setLifespan(ms: number, varies?: boolean): ParticleEffect {
        this.config.lifespan = ms;
        if (varies !== undefined) { this.config.lifespanVaries = varies; }
        return this;
    }

    public setSpeed(ms: number, varies?: boolean): ParticleEffect {
        this.config.speed = ms;
        if (varies !== undefined) { this.config.speedVaries = varies; }
        return this;
    }

    public setGravity(g: number): ParticleEffect {
        this.config.gravity = g;
        return this;
    }

    public emit() {
        setTimeout(() => {
            for (let i = 0; i < this.numOfParticles; i++) {
                let s = ParticleEffect.makeParticleOfSize(
                    this.config.minSize,
                    this.config.maxSize
                );
                this.setParticleColor(s);
                s.setPosition(this.pos.x, this.pos.y);
                s.lifespan = this.config.lifespan
                this.moveAtRandAngle(s)
                ParticleEffect.moveAtSpeed(s, this.config.speed, this.config.speedVaries)
                this.applyGravity(s)
                this.setFlags(s)
            }
        }, this.delay)
    }

    private static makeParticleOfSize(min: number, max: number): Sprite {
        let s = sprites.create(image.create(
            randint(min, max),
            randint(min, max)
        ))
        return s;
    }
    private setParticleColor(s: Sprite) {
        let c = (this.config.color === -1) ? randint(1, 16) : this.config.color;
        s.image.fill(c);
    }
    private setFlags(s: Sprite) {
        s.setFlag(SpriteFlag.BounceOnWall, this.config.bouncy)
        s.setFlag(SpriteFlag.AutoDestroy, true)
    }
    private static randAngle(dir: number = 0, max_angle: number = 2 * Math.PI): number {
        const ANGLE_OFFSET = -Math.PI/2 - max_angle/2;
        const lower = -Math.PI/2 - max_angle/2 + dir;
        const upper = -Math.PI/2 - max_angle/2 + max_angle + dir;
        return randint(lower, upper)
    }
    private moveAtRandAngle(s: Sprite) {
        let angle = ParticleEffect.randAngle(this.config.direction, this.config.spreadAngle)
        s.vx = Math.cos(angle)
        s.vy = Math.sin(angle)
    }
    private applyGravity(s: Sprite) { s.ay = this.config.gravity; }
    private static moveAtSpeed(s: Sprite, speed: number, varies: boolean) {
        s.vx *= varies ? randint(0, speed) : speed
        s.vy *= varies ? randint(0, speed) : speed
    }
}

class ParticleBuilder {
    private fx: ParticleEffect[] = []
    private delay_between: number = 0;

    constructor(fxs?: ParticleEffect[]) {
        if (fxs) { this.fx = fxs; }
     }

    public add(effect: ParticleEffect, times?: number): ParticleBuilder {
        let n = (times !== undefined) ? times : 1 
        for (let i = 0; i < n; i++) {
            this.fx.push(effect);
        }
        return this;
    }

    public clear(): ParticleBuilder { this.fx = []; return this; }

    public setDelay(ms?: number): ParticleBuilder {
        this.delay_between = (ms !== undefined) ? ms : 0;
        return this;
    }

    public emit() {
        this.fx.forEach(
            (e, i) => { setTimeout(() => e.emit(), this.delay_between * i) }
        ) 
        return this;
    }
}


let e = new ParticleEffect(10)
        .setSpreadAngle(Math.PI/8, true)

let r = new ParticleEffect(100, ParticlePresets.line)

let n = sprites.create(image.create(4, 4))
n.image.fill(4)

let f = new ParticleBuilder;
setInterval(() => {
    n.setPosition(randint(1, 160), randint(1, 120))
    r.setPosition(randint(1, 160), randint(1, 120))
    r.aimTowards(n)
    r.rainbow();
    r.setSpreadAngle(8)
    f.add(r, 5).setDelay(1000/10).emit().clear();
}, 1000)
