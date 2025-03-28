```
let p = new pfx.ParticleEffect(10, pfx.ParticlePresets.line);
p.emit()
```
```
let p = new pfx.ParticleEffect(100).setDirection(90).setAngle(180);
let factory = new pfx.ParticleFactory;
factory.add(p, 10).setDelay(100)
factory.emit()
```

## Use as Extension

This repository can be added as an **extension** in MakeCode.

* open [/](/)
* click on **New Project**
* click on **Extensions** under the gearwheel menu
* search for **https://github.com/llywelwyn/pxt-pfx** and import

#### Metadata (used for search, rendering)

* for PXT/arcade

