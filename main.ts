game.currentScene().physicsEngine = new ArcadePhysicsEngine(10000)

interface ParticleConfig {
    minSize?: number;
    maxSize?: number;
    speed?: number;
    speedVaries?: boolean;
    lifespan?: number;
    lifespanVaries?: boolean;
    bouncy?: boolean;
    direction?: number;
    angle?: number;
}

class ParticlePresets {
    static readonly circle: ParticleConfig = {
        minSize: 1,
        maxSize: 4,
        speed: 100,
        speedVaries: true,
        lifespan: 1000,
        lifespanVaries: true,
        bouncy: true,
        direction: 0,
        angle: 2 * Math.PI,
    };
    static readonly ring: ParticleConfig = { lifespanVaries: true, speedVaries: false }
}

class ParticleEffect {
    numOfParticles: number;
    delay: number = 0;
    config: ParticleConfig = ParticlePresets.circle;

    static readonly RADIANS_IN_A_DEGREE: number = Math.PI / 180

    constructor(n: number, delay?: number, config?: ParticleConfig) {
        this.numOfParticles = n;
        if (delay) { this.delay = delay; }
        if (config) { this.setConfig(config); }
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
        this.config.angle = setOrDefault(config.angle, ParticlePresets.circle.angle);
        return this;
    }

    public setDirection(n: number, usingRadians: boolean = false): ParticleEffect {
        this.config.direction = usingRadians? n : n * ParticleEffect.RADIANS_IN_A_DEGREE
        return this;
    }

    public setAngle(n: number, usingRadians: boolean = false): ParticleEffect {
        this.config.angle = usingRadians ? n : n * ParticleEffect.RADIANS_IN_A_DEGREE
        return this;
    }

    public setDelay(ms: number): ParticleEffect {
        this.delay = ms;
        return this;
    }

    public setLifespan(ms: number, varies?: boolean): ParticleEffect {
        this.config.lifespan = ms;
        if (varies) { this.config.lifespanVaries = varies; }
        return this;
    }

    public go() {
        setTimeout(() => {
            for (let i = 0; i < this.numOfParticles; i++) {
                let s = ParticleEffect.spriteOfSize(this.config.minSize, this.config.maxSize);
                s.lifespan = this.config.lifespan
                this.moveAtRandAngle(s)
                ParticleEffect.moveAtSpeed(s, this.config.speed, this.config.speedVaries)
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
        s.setFlag(SpriteFlag.BounceOnWall, this.config.bouncy)
        s.setFlag(SpriteFlag.AutoDestroy, true)
    }
    private static randAngle(dir: number = 0, max_angle: number = 2 * Math.PI): number {
        const lower = -Math.PI/2 - max_angle/2 + dir;
        const upper = -Math.PI/2 - max_angle/2 + max_angle + dir;
        return randint(lower, upper)
    }
    private moveAtRandAngle(s: Sprite) {
        let angle = ParticleEffect.randAngle(this.config.direction, this.config.angle)
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

    constructor(fxs?: ParticleEffect[]) {
        if (fxs) { this.fx = fxs; }
     }

    public add(e: ParticleEffect): ParticleFactory { this.fx.push(e); return this }
    public go() { this.fx.forEach((e) => { e.go() }) }
}

let factory = new ParticleFactory;

for (let i = 0; i < 5; i++) {
    let angle = (i % 2 === 0) ? Math.PI * 2 : Math.PI / 2 
    let e = new ParticleEffect(5)
        .setAngle(Math.PI)
        .setDelay(i * 300)
    factory.add(e)
}

factory.go()