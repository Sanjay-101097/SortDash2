
import { _decorator, AudioClip, AudioSource, BlockInputEvents, BoxCollider, Camera, Component, easing, EventTouch, geometry, Input, input, Material, Node, ParticleSystem, PhysicsSystem, RigidBody, Sprite, SpriteFrame, sys, Tween, tween, TweenAction, TweenSystem, v3, Vec2, Vec3, view } from 'cc';
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
    Canvas: Node = null;

    @property(Node)
    Canvas2: Node = null;


    @property(Node)
    BusArr: Node[] = []

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
    buscolor: string[] = ["0", "2", "3", "0", "2"];
    currentBusidx = 0;
    colliderinfo: Vec2[] = [new Vec2(2.7, 5.6), new Vec2(2, 4.2), , new Vec2(1.3, 2.7)]
    colliderpos: number[] = [4.7, 3.4, 2, 0.6]

    wrongCnt = 0;
    isAnimating: boolean;

    public Downnload(): void {
        this.super.download();
    }

    protected start(): void {
        this.audioSource = this.node.getComponent(AudioSource);


        this.Canvas.active = true;
        let nodeToAnimate = this.Canvas.getChildByName("Label");
        const zoomIn = tween(nodeToAnimate)
            .to(0.8, { scale: v3(0.7, 0.7, 0.7) });
        const zoomOut = tween(nodeToAnimate)
            .to(0.8, { scale: v3(0.6, 0.6, 0.6) });
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
        let xdiff = 40;
        let ydiff = 60;

        if (height >= 800) {
            xdiff = 0
            ydiff = 40
        }

        let nodeToAnimate = this.Canvas.getChildByName("BubbleIdle")
        nodeToAnimate.setPosition(-198 + xdiff, -192 + ydiff)
        const change = tween(nodeToAnimate).delay(0.3)
            .call(() => {
                nodeToAnimate.getComponent(Sprite).spriteFrame = this.HandSF[1];
            })
            .delay(0.3)
            .call(() => {
                nodeToAnimate.getComponent(Sprite).spriteFrame = this.HandSF[0];
            })
        const In = tween(nodeToAnimate)
            .to(0.8, { position: v3(-8, -192 + ydiff, 1.1) });
        const Out = tween(nodeToAnimate)
            .to(0.8, { position: v3(-198 + xdiff, -192 + ydiff, 0) });
        tween(nodeToAnimate)
            .sequence(change, In, change, Out)
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

    collectoranim: boolean = false;

    onTouchStart(event) {
        // this.anim();
        if (this.isAnimating) return; // Block touch during animations
        this.isAnimating = true;
        // this.Collector.getComponent(AudioSource).play();

        Tween.stopAll();
        const mousePos = event.getLocation();
        this.StartingPoint.x = mousePos.x;
        this.StartingPoint.y = mousePos.y;
        const ray = new geometry.Ray();
        this.camera.screenPointToRay(mousePos.x, mousePos.y, ray);
        const mask = 0xffffffff; // Detect all layers (default)
        const maxDistance = 1000; // Maximum ray distance
        const queryTrigger = true; // Include trigger colliders

        this.Canvas.active = false;
        if (PhysicsSystem.instance.raycastClosest(ray, mask, maxDistance, queryTrigger)) {

            const result = PhysicsSystem.instance.raycastClosestResult;
            const collider = result.collider;
            const node = collider.node;


            if (node.name === "Col" && node.children.length > 1) {
                // this.audioSource.playOneShot(this.Audioclips[0], 1);
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

    Cardmovement(node) {
        let sIdx = 0;
        this.schedule(() => {
            let box
            if (node.children?.length > 0) {
                box = node.children[node.children?.length - 1]?.addComponent(Box);
            } else {
                return;
            }



            // console.log("I'm here",this.SelectedNode.getWorldPosition());

            if (node.getWorldPosition().x >= 0) {
                box.dir = 1
            } else {
                box.dir = -1
                box.frequency = 0.5
            }

            const pos = node.getWorldPosition();

            pos.x = Math.round(pos.x * 10) / 10;
            pos.y = Math.round(pos.y * 10) / 10;
            pos.z = Math.round(pos.z * 10) / 10;

            if (box.node.parent.children.length <= 2) {
                this.particle.setPosition(box.node.parent.position);
                this.particle.active = true;
                this.particle.getComponent(ParticleSystem).play()
                let tray: Node = box.node.parent.children[0];
                tween(tray).to(0.6, { scale: v3(0, 0, 0) }, { easing: "quadOut" })
                    .delay(0.5)
                    .call(() => {
                        this.particle.active = false;
                    }).start()
            }


            if (box.node.name == this.buscolor[this.currentBusidx]) {
                // this.colliderPosCrt(node, node.children.length);
                box.isBus = true;
                box.anim(this.Bidx, this.BusArr[this.currentBusidx]);
                this.busArr.push(box.node)
                this.Bidx += 1;
                if (!this.playing) {
                    this.playing = true;
                    this.audioSource.playOneShot(this.Audioclips[4], 0.8);
                }

                // this.playAudio()
            } else if (this.Cidx <= 19) {
                // this.colliderPosCrt(node, node.children.length);
                box.isBus = false;
                box.anim(this.Cidx, this.Collector);
                this.collectorArr.push(box.node)
                this.Cidx += 1;
                 if (!this.playing) {
                    this.playing = true;
                    this.audioSource.playOneShot(this.Audioclips[4], 0.8);
                }
                // this.playAudio()
            } else {
                this.wrongCnt += 1
            }

            sIdx += 1;
            if (sIdx == 5 && box.node.name == node.children[node.children?.length - 1].name && this.Bidx <= 9){
                
                this.Cardmovement(node);
            }
                if(sIdx == 5)
                    this.playing = false;

            if (this.Bidx > 9) {
                this.Bidx = 0;
                let Fbus = this.BusArr[this.currentBusidx]
                let Lbus
                if (this.currentBusidx == 1) {
                    Lbus = 0
                } else if (this.currentBusidx == 2) {
                    Lbus = 1
                } else {
                    Lbus = this.currentBusidx + 2
                }
                this.isAnimating = true;
                this.collectoranim = true;
                this.playBeforeAnimation(Fbus, () => {
                    this.scheduleOnce(() => {
                        this.audioSource.playOneShot(this.Audioclips[1], 1);
                        tween(this.BusArr[this.currentBusidx])
                            .to(0.15, { position: new Vec3(-6.096, 4.751, -14.643) }, { easing: 'quadInOut' })
                            .call(() => {
                                this.currentBusidx += 1;
                                if (this.currentBusidx == 3) this.currentBusidx = 0;

                                tween(this.BusArr[this.currentBusidx])
                                    .to(0.15, { position: new Vec3(4.386, 4.751, -4.161) }, { easing: 'quadInOut' })
                                    .call(() => {
                                        this.Bidx = 0;
                                        this.CheckCollector();
                                        this.enable = true;
                                        Fbus.setPosition(10.021, 4.751, 1.474);
                                        Fbus.children?.forEach((child) => child.destroy());
                                    })
                                    .start();

                                tween(this.BusArr[Lbus])
                                    .to(0.15, { position: new Vec3(7.08, 4.751, -1.467) }, { easing: 'quadInOut' })
                                    .start();
                            })
                            .start();
                    }, 0.7);
                });
            }




        }, 0.015, 4)
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
                            .to(0.15, { position: new Vec3(-6.096, 4.751, -14.643) }, { easing: 'quadInOut' })
                            .call(() => {
                                this.currentBusidx = (this.currentBusidx + 1) % 3;
                                const newBus = this.BusArr[this.currentBusidx];

                                tween(newBus)
                                    .to(0.15, { position: new Vec3(4.386, 4.751, -4.161) }, { easing: 'quadInOut' })
                                    .call(() => {
                                        this.Bidx = 0;
                                        this.CheckCollector(() => {
                                            this.isAnimating = false;
                                            this.collectoranim = false;
                                            onComplete?.();
                                        });

                                        Fbus.setPosition(10.021, 4.751, 1.474);
                                        Fbus.children?.forEach(child => child.destroy());
                                    })
                                    .start();

                                tween(this.BusArr[Lbus])
                                    .to(0.15, { position: new Vec3(7.08, 4.751, -1.467) }, { easing: 'quadInOut' })
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
            window.open("https://play.google.com/store/apps/details?id=com.Machina.SortDash&hl=en_IN&pli=1", "SortDash");
        } else if (sys.os === sys.OS.IOS) {
            window.open("https://apps.apple.com/us/app/sort-dash-color-match/id6737854991", "SortDash");
        } else {
            window.open("https://play.google.com/store/apps/details?id=com.Machina.SortDash&hl=en_IN&pli=1", "SortDash");
        }
        this.super_html_playable.download();

    }

    private enable = false;
    private dt = 0;

    update(deltaTime: number) {
        if (this.enable) {
            this.dt += deltaTime;
            if (this.dt >= 30 || this.wrongCnt >= 15) {
                this.Canvas.active = true;
                this.Canvas2.active = false;
                this.Canvas.children[1].active = false;
                this.Canvas.children[2].active = true;
                this.Canvas.children[3].active = true;
                this.Canvas.children[4].active = true;
                this.Canvas.getChildByName("Label").active = false;

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
