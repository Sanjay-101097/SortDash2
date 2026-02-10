
import { _decorator, AudioClip, AudioSource, BlockInputEvents, BoxCollider, Camera, Component, easing, EventTouch, geometry, Input, input, Material, MeshRenderer, Node, ParticleSystem, PhysicsSystem, RigidBody, Sprite, SpriteFrame, sys, Tween, tween, TweenAction, TweenSystem, UIOpacity, v3, Vec2, Vec3, view } from 'cc';
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
    Hand: Node = null;

    @property(Node)
    levelHeader: Node = null;

    @property(Node)
    levelHeaderBG: Node = null;

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
    buscolor: string[] = ["55", "15", "11", "00", "52", "33", "77", "60", "33", "33", "22", "77", "65"];
    currentBusidx = 0;
    colliderinfo: Vec2[] = [new Vec2(2.7, 5.6), new Vec2(2, 4.2), , new Vec2(1.3, 2.7)]
    colliderpos: number[] = [4.7, 3.4, 2, 0.6]

    wrongCnt = 0;
    crtCnt = 0
    isAnimating: boolean = false;

    crntLevel = 2;
    Collectoridx = 0;

    public Downnload(): void {
        this.super.download();
    }

    protected start(): void {
        this.audioSource = this.node.getComponent(AudioSource);


        // this.Canvas.active = true;


        this.scheduleOnce(() => {
            let nodeToAnimate = this.CTA.parent.getChildByName("lable");
            nodeToAnimate.active = true;
            const zoomIn = tween(nodeToAnimate)
                .to(0.5, { scale: v3(0.9, 0.9, 0.9) });
            const zoomOut = tween(nodeToAnimate)
                .to(0.5, { scale: v3(1, 1, 1) });
            tween(nodeToAnimate)
                .sequence(zoomIn, zoomOut)
                .union()
                .repeatForever()
                .start();
            this.sethandpos();
        }, 1.4)
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



        let pos: Vec3 = this.Findmatchingpos()
        if (pos === null) { return; }
        let nodeToAnimate = this.Hand

        nodeToAnimate.active = true;
        let localPos = new Vec3();
        nodeToAnimate.parent!.inverseTransformPoint(localPos, pos);

        nodeToAnimate.setPosition(localPos.x, localPos.y + 0.5, localPos.z + 0.2);


        // nodeToAnimate.setPosition(pos.x, pos.y + 0.2, pos.z + 0.2)
        const changeIn = tween(nodeToAnimate)
            .delay(0.3)
            .call(() => {
                nodeToAnimate.children[1].active = false;
                nodeToAnimate.children[0].active = true;
            });

        const changeOut = tween(nodeToAnimate)
            .delay(0.3)
            .call(() => {
                nodeToAnimate.children[1].active = true;
                nodeToAnimate.children[0].active = false;
            });

        tween(nodeToAnimate)
            .sequence(changeOut, changeIn)
            .union()
            .repeatForever()
            .start();
    }

    Findmatchingpos(): Vec3 {
        let curbus = Number(this.BusArr[this.currentBusidx].name)
        let level = this.Levels[this.crntLevel - 1]
        let pos;
        let node

        for (let i = 0; i < level.children.length; i++) {
            node = level.children[i].children[level.children[i].children.length - 1];
            if (Number(node.name) === Math.floor(curbus / 10) && this.fsthalfidx < 5) {
                pos = node.worldPosition.clone();
                return pos;
            } else if (Number(node.name) === (curbus % 10) && this.Snthalfidx < 5) {
                pos = node.worldPosition.clone();
                return pos;
            }
        }

        for (let i = 0; i < level.children.length; i++) {

            for (let j = 0; j < level.children[i].children.length - 1; j++) {
                node = level.children[i].children[j];
                if (Number(node.name) === Math.floor(curbus / 10) && this.fsthalfidx < 5) {
                    pos = level.children[i].children[level.children[i].children.length - 1].worldPosition.clone();
                    return pos;
                } else if (Number(node.name) === (curbus % 10) && this.Snthalfidx < 5) {
                    pos = level.children[i].children[level.children[i].children.length - 1].worldPosition.clone();
                    return pos;
                }
            }

        }

        if (!pos) return null;


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
        Tween.stopAllByTarget(this.Hand);
        this.dt = 0
        this.Hand.active = false;
        this.CTA.parent.getChildByName("lable").active = false;
        if (PhysicsSystem.instance.raycastClosest(ray, mask, maxDistance, queryTrigger)) {

            const result = PhysicsSystem.instance.raycastClosestResult;
            const collider = result.collider;
            const node = collider.node.parent;


            if (node.children.length > 1) {
                this.audioSource.playOneShot(this.Audioclips[0], 1);
                this.Cardmovement(node)
                this.scheduleOnce(() => {
                    this.enableidle = true;
                }, 1.4)


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
        if (this.isAnimating) return;
        this.isAnimating = true;
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

                
                node.children[i].getComponent(Box).parent = this.Collector.children[this.Collectoridx]
                this.Collectoridx += 1
            }
            ar.push(node.children[i])
                        if (this.Collectoridx > 30) {
                    this.CTAcall()
                    return;
                }
            if (node.children[i].name != node.children[i - 1].name) {
                break;
            }
            // node.children[i].getComponent(Box).anim2()
        }
        this.resetCollector()
        let idx = 0

        this.scheduleOnce(() => { this.isAnimating = false; }, 0.06 * ar.length)

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
                            this.levelHeaderBG.active = true;
                            tween(this.levelHeaderBG.getChildByName("HLBG").getComponent(UIOpacity)).to(0.5, { opacity: 255 }).start()
                            tween(this.levelHeader).to(0.5, { scale: v3(1.4, 1.4, 1) }).to(0.3, { scale: v3(1, 1, 1) }).delay(1.5).call(() => { this.levelHeaderBG.active = false; }).start()
                            tween(this.Levels[0]).to(0.1, { x: -5000 }).call(() => {
                                tween(this.Levels[1]).delay(0.2).to(1, { x: -13.4 }).to(0.1, { x: -11.4 }).start()

                                this.idleTime = 4
                                this.setbusColor();
                                tween(this.BusArr[this.currentBusidx]).delay(1.3).to(0.2, { position: buspos }).call(() => {

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


        // console.log(ar)

    }

    CTAcall() {
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
            bus.children[i]?.children[0]?.destroy()
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
            if (Number(node?.children[0]?.name) === Math.floor(bus / 10) && this.fsthalfidx < 5) {

                node.children[0].getComponent(Box).parent = curntbus.children[this.fsthalfidx]
                this.fsthalfidx += 1;
                this.Bix += 1
                this.Collectoridx -= 1
                node.children[0].getComponent(Box).fromcollector = true;
                ar.push(node.children[0])
            } else if (Number(node?.children[0]?.name) === (bus % 10) && this.Snthalfidx < 5) {
                node.children[0].getComponent(Box).parent = curntbus.children[5 + this.Snthalfidx]
                this.Snthalfidx += 1;
                this.Bix += 1
                this.Collectoridx -= 1
                node.children[0].getComponent(Box).fromcollector = true;
                ar.push(node.children[0])
            }

        }

        this.scheduleOnce(() => {
            if (ar.length > 0)
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
                            this.levelHeaderBG.active = true;
                            tween(this.levelHeaderBG.getChildByName("HLBG").getComponent(UIOpacity)).to(0.5, { opacity: 255 }).start()
                            tween(this.levelHeader).to(0.5, { scale: v3(1.4, 1.4, 1) }).to(0.3, { scale: v3(1, 1, 1) }).delay(1.5).call(() => { this.levelHeaderBG.active = false; }).start()
                            tween(this.Levels[0]).to(0.1, { x: -5000 }).call(() => {
                                this.setbusColor();
                                tween(this.Levels[1]).delay(0.2).to(1, { x: -13.4 }).to(0.1, { x: -11.4 }).start()

                                this.idleTime = 4
                                tween(this.BusArr[this.currentBusidx]).delay(1.3).to(0.2, { position: buspos }).call(() => {
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
        }, 0.07, ar.length - 1)



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
        if (cards.length > 0)
            this.scheduleOnce(() => { this.checkCollector() }, 0.3)
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
            // this.super_html_playable.set_google_play_url("https://play.google.com/store/apps/details?id=com.Machina.SortDash");
        } else if (sys.os === sys.OS.IOS) {
            window.open("https://apps.apple.com/us/app/sort-dash-color-match/id6737854991", "SortDash");
        } else {
            window.open("https://play.google.com/store/apps/details?id=com.Machina.SortDash", "SortDash");
            // this.super_html_playable.set_google_play_url("https://play.google.com/store/apps/details?id=com.Machina.SortDash");
        }
        this.super_html_playable.download();

    }

    idleTime = 2;
    dt = 0;
    dt1 = 0;
    enableidle = false;

    update(deltaTime: number) {
        if (this.enableidle) {
            this.dt += deltaTime;
            if (this.dt >= this.idleTime) {
                this.enableidle = false;
                this.dt = 0;

                this.sethandpos();
            }
        }
        if (this.firsttouch) {
            this.dt1 += deltaTime;
            if (this.dt1 >= 50) {
                this.CTA.active = true;
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
