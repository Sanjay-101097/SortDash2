import {
  _decorator,
  Component,
  Node,
  Vec3,
  CCFloat,
  Prefab,
  instantiate,
  Material,
  MeshRenderer,
  Color,
  GradientRange,
  ParticleSystemComponent,
  AudioSource,
  game,
  v3,
  Label,
} from "cc";
// import { Cart } from "./Cart";
// import { SandSimulator } from "./SandSimulator";
// import { SandCubeController } from "./SandCubeController";
// import { UIScript } from "./UIScript";
const { ccclass, property } = _decorator;

@ccclass("BeltMovementHelper")
export class BeltMovementHelper extends Component {
  @property({ type: Node })
  public targetsNode: Node | null = null;

  @property({
    type: CCFloat,
    tooltip: "Time (seconds) to complete one full loop",
  })
  public duration: number = 5;

  @property({ type: Prefab })
  public heapPrefab: Prefab | null = null;

  @property({ type: Node })
  public sprayTargetNode: Node | null = null;

  @property({ type: Node })
  public sandSimulatorNode: Node = null;

  @property({ type: Node })
  public UINode: Node = null;

  @property(Label)
  CartLable: Label = null;

  private sandSimulator = null;

  private sprayNode: Node | null = null;

  private points: Vec3[] = [];

  private arrowProgresses: number[] = [];
  private arrows: Node[] = [];

  private targets: Node[] = [];
  private targetProgresses: number[] = [];

  public particleEmitter = null;

  private pour_helper = null;

  private pour_sound = null;

  private fail_sound = null;

  private currentPour = null;

  private sandHeapSpawnPoints: Vec3[] = [];

  public dissolvingSandCube = null;

  private previousTime = Date.now();

  private startAntiMerger = false;

  CartCnt = 0

  protected onLoad(): void {
    this.sprayNode = this.node.getChildByName("Sprayer");
    this.particleEmitter = this.sprayNode.getComponent(ParticleSystemComponent);
    this.pour_sound = this.node.getComponent(AudioSource);
    this.fail_sound = this.node.getComponents(AudioSource)[1];
  }

  start() {
    this.targetProgresses = [0];
    // this.ctaScript = this.UINode.getComponent(UIScript);
    setTimeout(() => {
      this.startAntiMerger = true;
    }, 2000);
    // this.sandSimulator = this.sandSimulatorNode.getComponent(SandSimulator);

    const controlPointsNode = this.node.getChildByName("ControlPoints");
    if (!controlPointsNode) {
      console.error("[BeltMovementHelper] Missing 'ControlPoints' node!");
      return;
    }

    const children = controlPointsNode.children;
    if (children.length < 4) {
      console.error("[BeltMovementHelper] Need at least 4 control points!");
      return;
    }

    // store world positions (cloned)
    this.points = children.map((c) => c.worldPosition.clone());
    if (this.points.length < 4) {
      console.error(
        "[BeltMovementHelper] Need at least 4 control points after reading positions!"
      );
      return;
    }

    if (this.duration <= 0) this.duration = 5;

    // Making ControlPoints invisible
    const control_points_container = this.node.getChildByName("ControlPoints");
    for (let child of control_points_container.children) {
      child.active = false;
    }

    // Creating Prequisites for arrow movements
    const arrows = this.node.getChildByName("Arrows");
    for (let child of arrows.children) {
      this.arrows.push(child);
      this.arrowProgresses.push(this.getClosestTToPoint(child.worldPosition));
    }

    // const targets = this.node.getChildByName("Targets");
    // for (let child of targets.children) {
    //   this.targets.push(child);
    //   this.targetProgresses.push(this.getClosestTToPoint(child.worldPosition));
    // }
  }

  targetpos;

  getpos(node) {
    if (this.CartCnt >= 5) return null;
    this.targetpos = this.getClosestTToPoint(node.worldPosition.clone())
    console.log(this.targetpos);
    let pos = this.getPointOnSpline(this.targetpos)
    for (let j = 0; j < this.targets.length; j++) {
      let dis = Math.abs(this.targetpos - this.targets[j].progress)
      if (Math.min(dis,6-dis) < 0.2) {

        

      }
    }
    return pos;
    // }

  }

  checkposcolliding(pos: Vec3, cnode) {
    this.targets.forEach(node => {
      if (cnode != node && Vec3.distance(node.position, pos) < 1) {
        return true;
      }
    });
    return false;
  }

  stopnode
  pushTarget(node) {

    node.progress = this.targetpos;

    this.targets.push(node);
    this.CartCnt += 1

    this.CartLable.string = this.CartCnt.toString() + "/5";

    this.scheduleOnce(() => {
      this.stopnode = null
    }, 0.4)

    //this.targetProgresses.push(this.targetpos);
  }

  removeFromTarget(node) {
    let idx = this.targets.indexOf(node)
    this.targets.splice(idx, 1);
    this.targetProgresses.splice(idx, 1);
    this.CartCnt -= 1
    this.CartLable.string = this.CartCnt.toString() + "/5";

  }

  update(deltaTime: number) {
    this.moveArrowsAround(deltaTime / 1.8);
    this.moveTargetsAround(deltaTime / 1.8);
  }

  private moveArrowsAround(deltaTime) {
    for (let i = 0; i < this.arrowProgresses.length; i++) {
      this.arrowProgresses[i] +=
        (deltaTime / this.duration) * this.points.length;
      this.arrowProgresses[i] %= this.points.length; // loop forever

      const pos = this.getPointOnSpline(this.arrowProgresses[i]);
      this.arrows[i].setWorldPosition(pos);

      const delta = 0.001;
      const aheadPos = this.getPointOnSpline(this.arrowProgresses[i] + delta);
      const dir = aheadPos.subtract(pos).normalize();
      if (!dir.equals(Vec3.ZERO)) {
        const yaw = Math.atan2(dir.x, dir.z);
        this.arrows[i].setWorldRotationFromEuler(0, (yaw * 180) / Math.PI, 0);
      }
    }
  }

  private noTargetsMoved = true;
  private ctaScript = null;
  private callMoveTargets = true;
  private targetsStoppedAt = Date.now();
  private targetTimeHelper = true;
  private callCTAonce = true;

  private moveTargetsAround(deltaTime) {
    for (let i = 0; i < this.targets.length; i++) {

      // if (!this.targets[i].getComponent(Cart).iscolliding) {
        this.targets[i].progress +=
          (deltaTime / this.duration) * this.points.length;
        this.targets[i].progress %= this.points.length; // loop forever
      // }



      const pos = this.getPointOnSpline(this.targets[i].progress);
      this.targets[i].setWorldPosition(pos);

      const delta = 0.001;
      const aheadPos = this.getPointOnSpline(this.targets[i].progress + delta);
      const dir = aheadPos.subtract(pos).normalize();
      if (!dir.equals(Vec3.ZERO)) {
        const yaw = Math.atan2(dir.x, dir.z);
        this.targets[i].setWorldRotationFromEuler(0, (yaw * 180) / Math.PI, 0);
      }
    }

  }

  public emitPartilces() {
    this.particleEmitter.play();
  }

  public stopEmittingParticles() {
    this.particleEmitter.stop();
  }

  private removeTargetAt(index: number) {
    const target = this.targets[index];
    if (target && target.isValid) target.destroy();
    this.targets.splice(index, 1);
    this.targetProgresses.splice(index, 1);
  }

  private getPointOnSpline(t: number): Vec3 {
    const n = this.points.length;
    if (n === 0) return new Vec3();

    const totalT = ((t % n) + n) % n;
    const segIdx = Math.floor(totalT);
    const localT = totalT - segIdx;

    // Wrap around indices for smooth looping
    const i0 = segIdx % n;
    const i1 = (segIdx + 1) % n;
    const i2 = (segIdx + 2) % n;
    const i3 = (segIdx + 3) % n;

    return this.catmullRom(
      this.points[i0],
      this.points[i1],
      this.points[i2],
      this.points[i3],
      localT
    );
  }

  private catmullRom(p0: Vec3, p1: Vec3, p2: Vec3, p3: Vec3, t: number): Vec3 {
    const t2 = t * t;
    const t3 = t2 * t;

    const out = new Vec3();
    out.x =
      0.5 *
      (2 * p1.x +
        (-p0.x + p2.x) * t +
        (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 +
        (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3);

    out.y =
      0.5 *
      (2 * p1.y +
        (-p0.y + p2.y) * t +
        (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 +
        (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3);

    out.z =
      0.5 *
      (2 * p1.z +
        (-p0.z + p2.z) * t +
        (2 * p0.z - 5 * p1.z + 4 * p2.z - p3.z) * t2 +
        (-p0.z + 3 * p1.z - 3 * p2.z + p3.z) * t3);

    return out;
  }

  public getClosestTToPoint(point: Vec3, step: number = 0.01): number {
    if (this.points.length < 4) return 0;

    let closestT = 0;
    let minDistSq = Number.MAX_VALUE;

    // Coarse search: sample over the spline
    for (let t = 0; t < this.points.length; t += step) {
      const curvePoint = this.getPointOnSpline(t);
      const distSq = Vec3.squaredDistance(curvePoint, point);

      if (distSq < minDistSq) {
        minDistSq = distSq;
        closestT = t;
      }
    }

    // Optional fine search around the closest region for better accuracy
    const fineStart = Math.max(closestT - step, 0);
    const fineEnd = Math.min(closestT + step, this.points.length);
    const fineStep = step * 0.1;

    for (let t = fineStart; t <= fineEnd; t += fineStep) {
      const curvePoint = this.getPointOnSpline(t);
      const distSq = Vec3.squaredDistance(curvePoint, point);

      if (distSq < minDistSq) {
        minDistSq = distSq;
        closestT = t;
      }
    }

    return closestT % this.points.length; // wrap around safely
  }

  public spawnDirtWRT(reference_object: Node, dust_material: Material) {
    let point_on_curve = this.getClosestTToPoint(
      reference_object.worldPosition
    );

    const spawn_point = this.getPointOnSpline(point_on_curve);
    // for (let i = 0; i < this.targetProgresses.length; i++) {
    //   if (Math.abs(point_on_curve - this.targetProgresses[i]) < 0.5) {
    //     console.log("Stopped !!!!!!!!!!!!!!!!");
    //     reference_object.getComponent(SandCubeController).pauseDissolve();
    //     return false;
    //   }
    // }

    for (let i = 0; i < this.targetProgresses.length; i++) {
      let testT = (this.targetProgresses[i] + 0.4) % this.points.length;
      let testPos = this.getPointOnSpline(testT);

      if (Vec3.distance(spawn_point, testPos) < 0.1) {
        //console.log("Stopped !!!!!!!!!!!!!!!!");
        // reference_object.getComponent(SandCubeController).pauseDissolve();
        return false;
      }
    }

    for (let spawnpoint of this.sandHeapSpawnPoints) {
      if (Vec3.distance(spawn_point, spawnpoint) < 0.1) {
        //console.log("Stopped !!!!!!!!!!!!!!!!");
        // reference_object.getComponent(SandCubeController).pauseDissolve();
        return false;
      }
    }
    this.sandHeapSpawnPoints.push(spawn_point);
    // const colorId = reference_object.getComponent(SandCubeController).color;

    const totalCalls = 5 + 1; // repeat + first call
    let count = 0;

    this.schedule(
      () => {
        // Spawn heap
        let new_heap = instantiate(this.heapPrefab);
        this.targetsNode.addChild(new_heap);
        // new_heap.colorId = colorId;
        new_heap.worldPosition = spawn_point.clone();

        // new_heap
        //   .getComponent(MeshRenderer)
        //   .setSharedMaterial(dust_material, 0, true);

        this.targets.push(new_heap);
        this.targetProgresses.push(point_on_curve);

        count++;

        // Remove spawn point when finished
        if (count === totalCalls) {
          // Remove this exact spawn_point
          const index = this.sandHeapSpawnPoints.indexOf(spawn_point);
          if (index !== -1) {
            this.sandHeapSpawnPoints.splice(index, 1);
          }
        }
      },
      0.05, // interval
      5 // repeat 5 -> 6 calls total
    );
    return true;
    console.log(this.sandHeapSpawnPoints);
  }
}
