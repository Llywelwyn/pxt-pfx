game.currentScene().physicsEngine = new ArcadePhysicsEngine(10000)

interface ParticleConfig {
    minSize?: number;
    maxSize?: number;
    speed?: number;
    speedRange?: boolean;
    lifespan?: number;
    lifespanRange?: boolean;
    bouncy?: boolean;
    direction?: number;
    angle?: number;
    delay?: number;
}

class ParticlePresets {
    static readonly circle: ParticleConfig = { lifespanRange: true, speedRange: true };
    static readonly ring: ParticleConfig = { lifespanRange: true, speedRange: false }
}

class ParticleEffect {
    numOfParticles: number;
    minSize: number;
    maxSize: number;
    speed: number;
    speedRange: boolean;
    lifespan: number;
    lifespanRange: boolean;
    bouncy: boolean;
    direction: number;
    angle: number;
    delay: number;

    static readonly RADIANS_IN_A_DEGREE: number = Math.PI / 180

    constructor(n: number, config:  ParticleConfig = {}) {
        this.numOfParticles = n;
        this.setConfig(config);
    }

    public setConfig(config: ParticleConfig) {
        this.minSize = config.minSize ? config.minSize : 1;
        this.maxSize = config.maxSize ? config.maxSize : 4;
        this.speed = config.speed ? config.speed : 100;
        this.speedRange = config.speedRange ? config.speedRange : false;
        this.lifespan = config.lifespan ? config.lifespan : 1000;
        this.lifespanRange = config.lifespanRange ? config.lifespanRange : false;
        this.bouncy = config.bouncy ? config.bouncy : true;
        this.direction = config.direction ? config.direction : 0;
        this.angle = config.angle ? config.angle : 2 * Math.PI;
        this.delay = config.delay ? config.delay : 0;
        return this;
    }

    public setDirection(n: number, usingRadians: boolean = false): ParticleEffect {
        this.direction = usingRadians? n : n * ParticleEffect.RADIANS_IN_A_DEGREE
        return this;
    }

    public setAngle(n: number, usingRadians: boolean = false): ParticleEffect {
        this.angle = usingRadians ? n : n * ParticleEffect.RADIANS_IN_A_DEGREE
        return this;
    }

    public setDelay(ms: number): ParticleEffect {
        this.delay = ms;
        return this;
    }

    public go() {
        setTimeout(() => {
            for (let i = 0; i < this.numOfParticles; i++) {
                let s = ParticleEffect.spriteOfSize(this.minSize, this.maxSize);
                s.lifespan = this.lifespanRange ? randint(1, this.lifespan) : this.lifespan
                this.moveAtRandAngle(s)
                ParticleEffect.moveAtSpeed(s, this.speed, this.speedRange)
                this.setFlags(s)
            }
        }, this.delay)
    }

    private static spriteOfSize(min: number, max: number): Sprite {
        let s = sprites.create(image.create(
            randint(min, max),
            randint(min, max)
        ))
        s.image.fill(randint(0, 16))
        return s
    }
    private setFlags(s: Sprite) {
        s.setFlag(SpriteFlag.BounceOnWall, this.bouncy)
        s.setFlag(SpriteFlag.AutoDestroy, true)
    }
    private static randAngle(dir: number = 0, max_angle: number = 2 * Math.PI): number {
        const lower = -Math.PI/2 - max_angle/2 + dir;
        const upper = -Math.PI/2 - max_angle/2 + max_angle + dir;
        return randint(lower, upper)
    }
    private moveAtRandAngle(s: Sprite) {
        let angle = ParticleEffect.randAngle(this.direction, this.angle)
        s.vx = Math.cos(angle)
        s.vy = Math.sin(angle)
    }
    private static moveAtSpeed(s: Sprite, speed: number, varies: boolean) {
        s.vx *= varies ? randint(0, speed) : speed
        s.vy *= varies ? randint(0, speed) : speed
    }
}

class ParticleFactory {
    fx: ParticleEffect[] = []

    constructor() {}

    public add(e: ParticleEffect): ParticleFactory { this.fx.push(e); return this }
    public go() { this.fx.forEach((e) => { e.go() }) }
}

let factory = new ParticleFactory;

for (let i = 0; i < 100; i++) {
    let preset = (i % 3 !== 0) ? ParticlePresets.ring : ParticlePresets.circle 
    let e = new ParticleEffect(100, preset)
            .setDelay(i * 500)
            .setAngle(Math.PI / 2, true)
            .setDirection(Math.PI * i, true)
    factory.add(e)
}

factory.go()