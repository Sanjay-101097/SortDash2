
import { _decorator, BlockInputEvents, Component, Node, Quat, tween, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

/**
 * Predefined variables
 * Name = Box
 * DateTime = Thu May 08 2025 10:16:32 GMT+0530 (India Standard Time)
 * Author = Sanjay_10
 * FileBasename = Box.ts
 * FileBasenameNoExtension = Box
 * URL = db://assets/Scripts/Box.ts
 * ManualUrl = https://docs.cocos.com/creator/3.4/manual/en/
 *
 */

@ccclass('Box')
export class Box extends Component {
    // [1]
    // dummy = '';
    // public Box: Box = new Box();

    startPosition: Vec3;

    endPosition: Vec3;


    public duration: number = 0.3;


    public amplitude: number = 4;

    public frequency: number = 0.5;
    busarray: Vec3[] = [new Vec3(4.838431, 5.352991, -3.361852), new Vec3(4.700545, 5.352991, -3.499738), new Vec3(4.562659, 5.352991, -3.637624), new Vec3(4.424774, 5.352991, -3.77551), new Vec3(4.286888, 5.352991, -3.913395), new Vec3(4.149002, 5.352991, -4.051281), new Vec3(4.014652, 5.352991, -4.185632), new Vec3(3.87323, 5.352991, -4.327053), new Vec3(3.73888, 5.352991, -4.461403), new Vec3(3.60453, 5.352991, -4.595753)]

    collector: Vec3[] = [new Vec3(7.233585, 6.305913, -5.053686), new Vec3(7.092164, 6.305913, -5.195108), new Vec3(6.950743, 6.305913, -5.336529), new Vec3(6.809321, 6.305913, -5.47795), new Vec3(6.6679, 6.305913, -5.619372), new Vec3(6.526392, 6.305913, -5.760781), new Vec3(6.384995, 6.305913, -5.902227), new Vec3(6.243599, 6.305913, -6.043673), new Vec3(6.102202, 6.305913, -6.185119), new Vec3(5.960805, 6.305913, -6.326565), new Vec3(5.819409, 6.305913, -6.468011), new Vec3(5.678012, 6.305913, -6.609457), new Vec3(5.536615, 6.305913, -6.750903), new Vec3(5.395219, 6.305913, -6.892349), new Vec3(5.273822, 6.305913, -7.033795), new Vec3(5.13, 6.306, -7.138), new Vec3(5.019, 6.306, -7.269), new Vec3(4.884, 6.306, -7.404), new Vec3(4.756, 6.306, -7.532), new Vec3(4.621, 6.306, -7.667), new Vec3(4.482, 6.306, -7.806)]//5.15

    collectorRotation: Vec3 = new Vec3(90, -135.01, 67.841);

    BusRotation: Vec3 = new Vec3(22.159, -45, 0);
    private timeElapsed: number = 0;

    private direction: Vec3 = new Vec3();
    private perpendicular: Vec3 = new Vec3();
    public dir = 1;
    idx;
    public isBus: boolean = false;
    Bus
    fromcollector: boolean = false;

    reset(idx) {
        tween(this.node)
            .to(0.05, { position: this.collector[idx] }, { easing: 'sineIn' })
            .start();
    }

    anim(idx, node) {

        this.Bus = node;


        this.idx = idx;
        // this.Bolock.children[0].children[0].setPosition(this.startPosition);
        this.timeElapsed = 0;
        let parentNode;
        if (this.node.parent.name == "Main") {
            parentNode = this.node.parent;
            this.endPosition = this.busarray[idx];
            this.amplitude = 2;
            this.frequency = 0.5
            this.dir = 1;
            this.duration = 0.5

        } else {
            parentNode = this.node.parent.parent.parent;
            if (!this.isBus) {

                this.endPosition = this.collector[idx];
            } else {
                this.endPosition = this.busarray[idx];

            }

        }

        const worldPos = this.node.getWorldPosition();
        const parentIdx = this.node.parent.getSiblingIndex()
        this.node.removeFromParent();
        parentNode.addChild(this.node);

        const localPos = new Vec3();
        this.node.parent.inverseTransformPoint(localPos, worldPos);


        this.node.setPosition(localPos);

        this.startPosition = new Vec3(this.node.getPosition().x, this.node.position.y, this.node.position.z);

        Vec3.subtract(this.direction, this.endPosition, this.startPosition);
        Vec3.normalize(this.direction, this.direction);
        const worldUp = new Vec3(1, 0, 0);
        this.perpendicular = new Vec3();

        const pos = this.startPosition;
        pos.x = Math.round(pos.x * 10) / 10;
        pos.y = Math.round(pos.y * 10) / 10;
        pos.z = Math.round(pos.z * 10) / 10;
        let a = Math.abs(Vec3.dot(this.direction, worldUp))
        if (pos.z < -1.6 && !this.fromcollector) {


        } if (parentIdx >= 0 && parentIdx <= 4) {
            Vec3.cross(this.perpendicular, this.direction, worldUp);
        } else {
            Vec3.cross(this.perpendicular, this.direction, new Vec3(-1, 0, 0));
        }
        Vec3.normalize(this.perpendicular, this.perpendicular);
        this.isanim = true;


    }

    isanim = false;
    private rotationElapsed: number = 0;
    private rotationDuration: number = 1;
    private readonly referenceDuration: number = 1;
    enabl = true;
    update(deltaTime: number) {
        if (!this.isanim) return;

        // this.timeElapsed += deltaTime;
        // let t = this.timeElapsed / this.duration;
        // if (t > 1) t = 1;

        this.timeElapsed += deltaTime;
        let t = this.timeElapsed / this.duration;
        if (t > 1) t = 1;

        const basePos = new Vec3();
        Vec3.lerp(basePos, this.startPosition, this.endPosition, t);

        const waveProgress = this.timeElapsed * this.frequency;
        const sineOffset = Math.sin(Math.PI * t) * this.amplitude * this.dir;

        const offset = new Vec3();
        Vec3.multiplyScalar(offset, this.perpendicular, sineOffset);

        const finalPos = new Vec3();
        Vec3.add(finalPos, basePos, offset);
        this.node.setPosition(finalPos);

        // Stop only when fully done
        if (t >= 1) {
            // this.node.setPosition(this.endPosition); // Optional: snap to final pos
            this.isanim = false;
        }


        // Scale animation
        const scale = 1 + (0.7 - 1) * t;
        this.node.setScale(scale, scale, scale);

        // Rotation interpolation
        this.rotationElapsed += deltaTime;
        let rt = this.rotationElapsed / this.rotationDuration;
        if (rt > 1) rt = 1;

        const lerpAngle = (start: number, end: number, alpha: number) => start + (end - start) * alpha;
        const currentEuler = this.node.eulerAngles;
        this.node.eulerAngles = new Vec3(
            lerpAngle(currentEuler.x, this.collectorRotation.x, rt),
            lerpAngle(currentEuler.y, this.collectorRotation.y, rt),
            lerpAngle(currentEuler.z, this.collectorRotation.z, rt)
        );

        // Reparenting logic
        if (this.timeElapsed >= this.duration) {
            this.isanim = false;

            if (this.isBus &&
                this.node.position.x <= this.busarray[this.idx].x + 0.01 &&
                this.node.position.x >= this.busarray[this.idx].x - 0.01) {

                const worldPos = this.node.getWorldPosition();
                const worldRot = this.node.getWorldRotation();

                const localPos = new Vec3();
                this.Bus.inverseTransformPoint(localPos, worldPos);

                const worldRotQuat = new Quat();
                this.node.getWorldRotation(worldRotQuat);

                const parentWorldRot = new Quat();
                this.Bus.getWorldRotation(parentWorldRot);

                const parentWorldRotInv = new Quat();
                Quat.invert(parentWorldRotInv, parentWorldRot);

                const localRot = new Quat();
                Quat.multiply(localRot, parentWorldRotInv, worldRotQuat);

                this.node.removeFromParent();
                this.Bus.addChild(this.node);

                this.node.setPosition(localPos);
                this.node.setRotationFromEuler(0, 0, 90);
            }
        }
    }


    // Optional: reset animation
    public resetAnimation() {
        this.timeElapsed = 0;
        this.node.setPosition(this.startPosition);
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
