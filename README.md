#### emitting an explosion of 100 particles of SpriteKind.Projectile
```ts
// makes an effect with 100 particles in a preset circle pattern
let p = new pfx.ParticleEffect(100, pfx.ParticlePresets.circle);
p.setKind(SpriteKind.Projectile);
p.emit()
```

#### emitting 10 particles in a line
```ts
let p = new pfx.ParticleEffect(10, pfx.ParticlePresets.line);
p.emit()
```


#### using a factory to emit an effect 10 times with a delay of 100ms between each emission
```ts
// makes an effect with 100 particles aimed rightwards in a semicircle
let p = new pfx.ParticleEffect(100).setDirection(90).setAngle(180);
// makes a factory that can contain multiple effects
let factory = new pfx.ParticleFactory;
// adds the particle 10 times to the factory with a delay of 100ms between each effect
factory.add(p, 10).setDelay(100)
// plays all the effects inside the factory, then clears the queue
factory.emit().clear()
```

## Use as Extension

* click on **Extensions** under the gearwheel menu
* search for **https://github.com/llywelwyn/pxt-pfx** and import

