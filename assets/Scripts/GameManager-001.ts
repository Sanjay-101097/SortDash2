
import { _decorator, AudioClip, AudioSource, BlockInputEvents, BoxCollider, Camera, Component, easing, EventTouch, geometry, Input, input, Material, MeshRenderer, Node, ParticleSystem, PhysicsSystem, RigidBody, Sprite, SpriteFrame, sys, Tween, tween, TweenAction, TweenSystem, v3, Vec2, Vec3, view } from 'cc';
import { TileCreation } from './TileCreation';
import { Box } from './Box';
import { super_html_playable } from './super_html_playable';
const { ccclass, property } = _decorator;

/**
 * Predefined variables
 * Name = GameManager
 * DateTime = Tue May 06 2025 22:21:54 GMT+0530 (India Standard Time)
 * Author = Sanjay_10
 * FileBasename = GameManager.ts
 * FileBasenameNoExtension = GameManager
 * URL = db://assets/Scripts/GameManager.ts
 * ManualUrl = https://docs.cocos.com/creator/3.4/manual/en/
 *
 */


@ccclass('GameManager')
export class GameManager extends Component {
    // [1]
    // dummy = '';

    // [2]
    @property(Node)
    Bolock: Node = null;

    @property(Node)
    Plane: Node = null;

    @property(Node)
    particle: Node = null;

    @property(Node)
    CTA: Node = null;

    @property(Node)
    Canvas2: Node = null;


    @property(Node)
    BusArr: Node[] = []

    @property(Node)
    Levels: Node[] = []

    @property(Node)
    Collector: Node = null;

    @property(Camera)
    camera: Camera = null;

    @property(Material)
    colorMaterials: Material[] = [];

    @property(AudioClip)
    Audioclips: AudioClip[] = [];

    @property(SpriteFrame)
    HandSF: SpriteFrame[] = [];


    super_html_playable: super_html_playable = new super_html_playable();
    private _ray: geometry.Ray = new geometry.Ray();
    audioSource: AudioSource;
    public static score: number = 0;
    StartingPoint: Vec3 = new Vec3(0, 0, 0);
    SelectedNode: Node = null;
    InitialAngle;
    previousAngle = 0;
    enableTouchMove = true;

    collectorArr: Node[] = [];
    busArr: Node[] = [];
    buscolor: string[] = ["55", "33", "11", "00", "15", "33", "77", "60", "52", "33", "22", "77","65"];
    currentBusidx = 0;
    colliderinfo: Vec2[] = [new Vec2(2.7, 5.6), new Vec2(2, 4.2), , new Vec2(1.3, 2.7)]
    colliderpos: number[] = [4.7, 3.4, 2, 0.6]

    wrongCnt = 0;
    crtCnt = 0
    isAnimating: boolean;

    crntLevel = 1;
    Collectoridx = 0;

    public Downnload(): void {
        this.super.download();
    }

    protected start(): void {
        this.audioSource = this.node.getComponent(AudioSource);


        // this.Canvas.active = true;
        let nodeToAnimate = this.CTA.parent.getChildByName("lable");
        const zoomIn = tween(nodeToAnimate)
            .to(0.5, { scale: v3(0.9, 0.9, 0.9) });
        const zoomOut = tween(nodeToAnimate)
            .to(0.5, { scale: v3(1, 1, 1) });
        tween(nodeToAnimate)
            .sequence(zoomIn, zoomOut)
            .union()
            .repeatForever()
            .start();

        this.scheduleOnce(() => {
            this.sethandpos();
        }, 0.1)
    }

    sethandpos() {
        const visibleSize = view.getVisibleSizeInPixel();
        const height = window.innerHeight;
        let xdiff = 50;
        let ydiff = -20;

        if (height >= 800) {
            xdiff = 0
            ydiff = 40
        }

        let nodeToAnimate = this.CTA.parent.getChildByName("BubbleIdle")
        nodeToAnimate.setPosition(-228 + xdiff, -252 + ydiff)
        const change = tween(nodeToAnimate).delay(0.3)
            .call(() => {
                nodeToAnimate.getComponent(Sprite).spriteFrame = this.HandSF[1];
            })
            .delay(0.3)
            .call(() => {
                nodeToAnimate.getComponent(Sprite).spriteFrame = this.HandSF[0];
            })
        const In = tween(nodeToAnimate)
            .to(0.8, { position: v3(-28, -252 + ydiff, 1.1) });
        const Out = tween(nodeToAnimate)
            .to(0.8, { position: v3(-228 + xdiff, -252 + ydiff, 0) });
        tween(nodeToAnimate)
            .sequence(change, change)
            .union()
            .repeatForever()
            .start();
    }


    onEnable() {
        input.on(Input.EventType.TOUCH_START, this.onTouchStart, this);
        input.on(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
        input.on(Input.EventType.TOUCH_END, this.onTouchEnd, this);
    }



    onDisable() {
        input.off(Input.EventType.TOUCH_START, this.onTouchStart, this);
        input.off(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
        input.off(Input.EventType.TOUCH_END, this.onTouchEnd, this);

    }

    private Bidx = 0;
    private Cidx = 0;
    firsttouch = false;
    collectoranim: boolean = false;

    onTouchStart(event) {
        if (!this.firsttouch) {
            this.firsttouch = true;
            this.Collector.getComponent(AudioSource).play();
            // this.BG.play();
        }

        // Tween.stopAll();
        const mousePos = event.getLocation();
        this.StartingPoint.x = mousePos.x;
        this.StartingPoint.y = mousePos.y;
        const ray = new geometry.Ray();
        this.camera.screenPointToRay(mousePos.x, mousePos.y, ray);
        const mask = 0xffffffff; // Detect all layers (default)
        const maxDistance = 1000; // Maximum ray distance
        const queryTrigger = true; // Include trigger colliders

        this.CTA.parent.getChildByName("BubbleIdle").active = false;
        this.CTA.parent.getChildByName("lable").active = false;
        if (PhysicsSystem.instance.raycastClosest(ray, mask, maxDistance, queryTrigger)) {

            const result = PhysicsSystem.instance.raycastClosestResult;
            const collider = result.collider;
            const node = collider.node;


            if (node.children.length > 1) {
                this.audioSource.playOneShot(this.Audioclips[0], 1);
                this.Cardmovement(node)

                this.scheduleOnce(() => {
                    if (!this.collectoranim)
                        this.isAnimating = false;
                }, 0.4)


            }

            this.SelectedNode = null;


        } else {
            // No object was hit
            this.isAnimating = false;
            this.SelectedNode = this.Bolock;
            this.InitialAngle = this.Bolock.eulerAngles.y;


        }


    }

    playing: boolean = false
    Bix = 0
    fsthalfidx = 0
    Snthalfidx = 0


    Cardmovement(node) {
        let sIdx = 0;
        let curntbus = this.BusArr[this.currentBusidx]
        // if(curntbus){
        let bus = Number(curntbus.name)

        let ar = []
        for (let i = node.children.length - 1; i > 0; i--) {

            if (Number(node.children[i].name) === Math.floor(bus / 10) && this.fsthalfidx < 5) {

                node.children[i].getComponent(Box).parent = curntbus.children[this.fsthalfidx]
                this.fsthalfidx += 1;
                this.Bix += 1
            } else if (Number(node.children[i].name) === (bus % 10) && this.Snthalfidx < 5) {
                node.children[i].getComponent(Box).parent = curntbus.children[5 + this.Snthalfidx]
                this.Snthalfidx += 1;
                this.Bix += 1
            } else {
                if (this.Collectoridx > 30) {
                    this.CTAcall()
                    return;
                }
                node.children[i].getComponent(Box).parent = this.Collector.children[this.Collectoridx]
                this.Collectoridx += 1
            }
            ar.push(node.children[i])
            if (node.children[i].name != node.children[i - 1].name) {
                break;
            }
            // node.children[i].getComponent(Box).anim2()
        }

        let idx = 0

        this.schedule(() => {
            ar[idx].getComponent(Box).anim2()
            idx += 1
            this.audioSource.playOneShot(this.Audioclips[2], 1);
            if (this.Bix >= 10) {
                this.scheduleOnce(() => {
                    this.audioSource.playOneShot(this.Audioclips[1], 1);
                this.BusArr[this.currentBusidx].getChildByName("bus").children[0].active = true
                this.BusArr[this.currentBusidx].getChildByName("bus").children[0].getComponent(ParticleSystem).play()
                }, 0.3)
                this.Bix = 0
                this.crtCnt += 1
                this.scheduleOnce(() => {
                    let bus = this.BusArr[this.currentBusidx]
                    let buspos = bus.position.clone()

                    tween(bus.getChildByName("bus")).to(0.1, { scale: v3(1, 1.8, 1) }).start()
                    tween(bus).delay(0.3).to(0.2, { position: v3(13.457, 4.8, 4.857) }).call(() => {
                        this.resetbusslots(bus)
                        bus.setPosition(-0.359, 4.8, -8.959)
                        this.fsthalfidx = 0
                        this.Snthalfidx = 0
                        if (this.crntLevel === 1 && this.crtCnt === 2) {
                            this.crntLevel += 1
                            this.currentBusidx = 0
                            tween(this.Levels[0]).to(0.1, { x: -5000 }).call(() => {
                                tween(this.Levels[1]).to(0.3, { x: -11.4 }).start()
                                this.setbusColor();
                                tween(this.BusArr[this.currentBusidx]).delay(0.3).to(0.2, { position: buspos }).call(() => {
                                    this.checkCollector()
                                }).start()
                            }).start()
                        }
                    }).start()
                    this.currentBusidx += 1;
                    if (this.currentBusidx > 2) {
                        this.currentBusidx = 0
                    }
                    if (this.crntLevel === 2) {
                        this.setbusColor();
                    }
                    if ((this.crntLevel === 1 && this.currentBusidx < 2) || this.crntLevel === 2) {
                        tween(this.BusArr[this.currentBusidx]).delay(0.3).to(0.2, { position: buspos }).call(() => {
                            this.checkCollector()
                        }).start()
                    }


                }, 1)
            }
        }, 0.06, ar.length - 1)
        console.log(ar)

    }

    CTAcall(){
        this.CTA.active = true;
                    let icon = this.CTA.children[1];
                    
                    let playbutton = this.CTA.children[2];
                    tween(icon).delay(0.2).to(0.3, { scale: v3(1, 1.2, 1) }, { easing: "quadIn" }).to(0.3, { scale: v3(1.2, 1, 1) }, { easing: "quadIn" }).to(0.3, { scale: v3(1, 1, 1) }, { easing: "quadIn" }).start()
                    tween(playbutton)
                        .repeatForever(
                            tween()
                                .to(0.6, { scale: new Vec3(1.1, 1.1, 1) }, { easing: 'sineInOut' })
                                .to(0.6, { scale: new Vec3(1.0, 1.0, 1) }, { easing: 'sineInOut' })
                        )
                        .start();
                    this.Canvas2.active = false;
    }

    resetbusslots(bus: Node) {
        bus.getChildByName("bus").setScale(1, 1, 1);
        for (let i = 0; i < bus.children.length - 1; i++) {
            bus.children[i].children[0].destroy()
        }
    }

    setbusColor() {
        let bus = this.BusArr[this.currentBusidx]
        bus.name = this.buscolor[this.crtCnt - 2]
        let color = Number(this.buscolor[this.crtCnt - 2])
        let material1 = this.colorMaterials[Math.floor(color / 10)]
        let material2 = this.colorMaterials[color % 10]
        bus.getChildByName("bus").getComponent(MeshRenderer).setMaterial(material1, 1);
        bus.getChildByName("bus").getComponent(MeshRenderer).setMaterial(material2, 0);
    }

    checkCollector() {
        let curntbus = this.BusArr[this.currentBusidx]
        let ar = []
        // if(curntbus){
        let bus = Number(curntbus.name)
        let len = this.Collectoridx
        for (let i = 0; i < len; i++) {
            let node = this.Collector.children[i]
            if (!this.Collector.children[0].children[0]) return
            if (Number(node.children[0]?.name) === Math.floor(bus / 10) && this.fsthalfidx < 5) {

                node.children[0].getComponent(Box).parent = curntbus.children[this.fsthalfidx]
                this.fsthalfidx += 1;
                this.Bix += 1
                this.Collectoridx -= 1
                ar.push(node.children[0])
            } else if (Number(node.children[0]?.name) === (bus % 10) && this.Snthalfidx < 5) {
                node.children[0].getComponent(Box).parent = curntbus.children[5 + this.Snthalfidx]
                this.Snthalfidx += 1;
                this.Bix += 1
                this.Collectoridx -= 1
                ar.push(node.children[0])
            }

        }

        this.scheduleOnce(() => {
            this.resetCollector()
        }, 1)
        let idx = 0

        this.schedule(() => {
            this.audioSource.playOneShot(this.Audioclips[2], 1);
            ar[idx].getComponent(Box).anim2()
            idx += 1
            if (this.Bix >= 10) {
                this.scheduleOnce(() => {
                    this.audioSource.playOneShot(this.Audioclips[1], 1);
                this.BusArr[this.currentBusidx].getChildByName("bus").children[0].active = true
                this.BusArr[this.currentBusidx].getChildByName("bus").children[0].getComponent(ParticleSystem).play()
                }, 0.3)
                this.Bix = 0
                this.crtCnt += 1
                this.scheduleOnce(() => {
                    let buspos = this.BusArr[this.currentBusidx].position.clone()
                    let bus = this.BusArr[this.currentBusidx]
                    tween(bus.getChildByName("bus")).to(0.1, { scale: v3(1, 1.8, 1) }).start()
                    tween(bus).delay(0.3).to(0.2, { position: v3(13.457, 4.8, 4.857) }).call(() => {
                        this.resetbusslots(bus)
                        bus.setPosition(-0.359, 4.8, -8.959)
                        this.fsthalfidx = 0
                        this.Snthalfidx = 0
                        if (this.crntLevel === 1 && this.crtCnt === 2) {
                            this.crntLevel += 1
                            this.currentBusidx = 0
                            tween(this.Levels[0]).to(0.1, { x: -5000 }).call(() => {
                                this.setbusColor();
                                tween(this.Levels[1]).to(0.1, { x: -11.4 }).start()
                                tween(this.BusArr[this.currentBusidx]).delay(0.3).to(0.2, { position: buspos }).call(() => {
                                    this.checkCollector()
                                }).start()
                            }).start()
                        }
                    }).start()

                    this.currentBusidx += 1;
                    if (this.currentBusidx > 2) {
                        this.currentBusidx = 0
                    }
                    if (this.crntLevel === 2) {
                        this.setbusColor();
                    }
                    if ((this.crntLevel === 1 && this.currentBusidx < 2) || this.crntLevel === 2)
                        tween(this.BusArr[this.currentBusidx]).delay(0.3).to(0.2, { position: buspos }).call(() => {
                            this.checkCollector()
                        }).start()

                }, 1)
            }
        }, 0.06, ar.length - 1)


    }

    resetCollector() {
        const collector = this.Collector;

        // 1. Gather all cards from all boxes
        const cards: Node[] = [];

        for (let box of collector.children) {
            const card = box.children[0];
            if (card) cards.push(card);
        }

        // 2. Remove all cards from their boxes
        for (let box of collector.children) {
            const card = box.children[0];
            if (card) card.removeFromParent();
        }

        // 3. Reassign cards to boxes in order (one card per box)
        let i = 0;
        for (let box of collector.children) {
            if (i >= cards.length) break;

            const card = cards[i];
            box.addChild(card);
            tween(card).to(0.1, { position: v3(0, 0, 0) }).start()
            // card.setPosition(0, 0, 0);   // place card at center of box

            i++;
        }
    }

    playBeforeAnimation(node: Node, onComplete: () => void) {
        this.scheduleOnce(() => {
            const children = node.children;
            const total = children.length;

            children.forEach((animNode, index) => {
                const initPos = animNode.position.clone();

                // Staggered delay using index
                tween(animNode)
                    .delay(index * 0.05)
                    .to(0.3, { position: new Vec3(initPos.x, initPos.y + 0.4, initPos.z) }, { easing: 'quadIn' })
                    .to(0.3, { position: initPos }, { easing: 'quadOut' })
                    .call(() => {
                        if (index === total - 1) {
                            // Call only after the last animation
                        }
                    })
                    .start();
            });
            onComplete();
        }, 0.4)

    }

    // playAudio() {
    //     for(let idx =0;idx<5;idx++){
    //  this.scheduleOnce(() => {

    //        this.audioSource.playOneShot(this.Audioclips[4], 1);

    //     }, idx * 0.05);
    //     }

    // }



    CheckCollector(onComplete?: () => void) {
        if (this.collectorArr.length >= 5) {
            this.collectoranim = true;
            this.isAnimating = true;
            const matchColor = this.buscolor[this.currentBusidx];
            const matchedIndices = [];

            // Find all matching indices (groups of 5) where node name matches
            for (let i = 0; i <= this.collectorArr.length - 5; i += 5) {
                const node = this.collectorArr[i];
                if (node.name === matchColor) {
                    matchedIndices.push(i);
                }
            }

            // Limit total tiles to move to 10
            const maxTilesToMove = 10;
            let tilesMoved = 0;
            let globalDelay = 0;
            let totalRemoved = 0;

            if (matchedIndices.length > 0) {
                // Collect all tiles that will be animated now
                const tilesToAnimate = [];

                for (const startIdx of matchedIndices) {
                    // Skip groups if we have reached limit
                    if (tilesMoved >= maxTilesToMove) break;

                    const actualIdx = startIdx - totalRemoved;
                    const count = Math.min(5, maxTilesToMove - tilesMoved); // Only take needed tiles to reach max 10
                    const movingTiles = this.collectorArr.splice(actualIdx, count);

                    tilesToAnimate.push(...movingTiles);
                    totalRemoved += count;
                    tilesMoved += count;

                    globalDelay += count * 0.05;
                }

                // Schedule animation for tilesToAnimate
                tilesToAnimate.forEach((tileNode, idx) => {
                    this.scheduleOnce(() => {
                        const tile = tileNode.getComponent(Box);
                        tile.isBus = true;
                        tile.fromcollector = true;
                        tile.frequency = 0.5;
                        tile.anim(this.Bidx, this.BusArr[this.currentBusidx]);
                        this.Bidx += 1;
                        this.Cidx -= 1;
                        this.audioSource.playOneShot(this.Audioclips[4], 1);
                    }, idx * 0.05);
                });

                this.scheduleOnce(() => {
                    for (const remainingTileNode of this.collectorArr) {
                        const tile = remainingTileNode.getComponent(Box);
                        tile.reset(this.collectorArr.indexOf(remainingTileNode));
                    }
                }, 0.9)


                this.scheduleOnce(() => {
                    if (this.Bidx >= 10) {
                        this.Bidx = 0;
                        const Fbus = this.BusArr[this.currentBusidx];
                        let Lbus = this.currentBusidx === 1 ? 0 :
                            this.currentBusidx === 2 ? 1 :
                                this.currentBusidx + 2;

                        tween(Fbus)
                            .to(0.15, { position: new Vec3(11.561, 4.635, 3.416) }, { easing: 'quadInOut' })
                            .call(() => {
                                this.currentBusidx = (this.currentBusidx + 1) % 3;
                                const newBus = this.BusArr[this.currentBusidx];

                                tween(newBus)
                                    .to(0.15, { position: new Vec3(4.185, 4.635, -3.96) }, { easing: 'quadInOut' })
                                    .call(() => {
                                        this.Bidx = 0;
                                        this.CheckCollector(() => {
                                            this.isAnimating = false;
                                            this.collectoranim = false;
                                            onComplete?.();
                                        });

                                        Fbus.setPosition(-0.253, 4.635, -8.398);
                                        Fbus.children?.forEach(child => child.destroy());
                                    })
                                    .start();

                                tween(this.BusArr[Lbus])
                                    .to(0.15, { position: new Vec3(1.694, 4.635, -6.451) }, { easing: 'quadInOut' })
                                    .start();
                            })
                            .start();
                    } else {
                        this.CheckCollector(() => {
                            this.isAnimating = false;
                            this.collectoranim = false;
                            onComplete?.();
                        });
                    }
                }, globalDelay + 0.5);
            } else {
                // No matches found: reset all tiles
                for (let i = 0; i < this.collectorArr.length; i++) {
                    const tile = this.collectorArr[i].getComponent(Box);
                    tile.reset(i);
                }
                this.isAnimating = false;
                this.collectoranim = false;
                onComplete?.();
            }
        } else {
            this.isAnimating = false;
            this.collectoranim = false;
            onComplete?.();
        }
    }

    private worldPositions;
    sound: boolean = true;

    onTouchMove(event: EventTouch) {
        // if (this.isAnimating) return;
        // if (this.sound == true) {
        //     this.audioSource.clip = this.Audioclips[3];
        //     this.sound = false;
        //     this.playAudioMultipleTimes();

        // }
        // const mousePos = event.getLocation();
        // if (this.SelectedNode) {
        //     let angle = (mousePos.x - this.StartingPoint.x) / 2.5;
        //     this.SelectedNode.setRotationFromEuler(0, this.InitialAngle + angle, 0);
        // }

    }

    _playIndex: number = 0;
    repeatCount: number = 10;
    playDuration: number = 0.1;

    playAudioMultipleTimes() {
        if (!this.audioSource || !this.audioSource.clip) {
            return;
        }

        const playOnce = () => {
            if (this._playIndex >= this.repeatCount || this.sound) {
                this._playIndex = 0;
                return;
            }

            this.audioSource.play();

            this.scheduleOnce(() => {
                this.audioSource.stop();

                this._playIndex++;
                playOnce();
            }, this.playDuration);
        };

        playOnce();
    }

    onTouchEnd(event) {

    }


    FixRotPos(n) {
        return Math.round(n / 90) * 90;
    }
    calculateRotation(fromAngle: number, toAngle: number): number {
        let rotation = toAngle - fromAngle;
        return rotation;
    }

    OnStartButtonClick() {
        this.Collector.getComponent(AudioSource).stop();
        this.audioSource.stop();
        if (sys.os === sys.OS.ANDROID) {
            window.open("https://play.google.com/store/apps/details?id=com.Machina.SortDash", "SortDash");
        } else if (sys.os === sys.OS.IOS) {
            window.open("https://apps.apple.com/us/app/sort-dash-color-match/id6737854991", "SortDash");
        } else {
            window.open("https://play.google.com/store/apps/details?id=com.Machina.SortDash", "SortDash");
        }
        this.super_html_playable.download();

    }

    private enable = false;
    private dt = 0;

    update(deltaTime: number) {
        if (this.firsttouch) {
            this.dt += deltaTime;
            if (this.dt >= 50 ) {
                this.CTAcall()
                this.firsttouch = false

            }
        }


    }
}

/**
 * [1] Class member could be defined like this.
 * [2] Use `property` decorator if your want the member to be serializable.
 * [3] Your initialization goes here.
 * [4] Your update function goes here.
 *
 * Learn more about scripting: https://docs.cocos.com/creator/3.4/manual/en/scripting/
 * Learn more about CCClass: https://docs.cocos.com/creator/3.4/manual/en/scripting/decorator.html
 * Learn more about life-cycle callbacks: https://docs.cocos.com/creator/3.4/manual/en/scripting/life-cycle-callbacks.html
 */
