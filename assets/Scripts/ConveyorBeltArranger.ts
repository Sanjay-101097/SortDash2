import { _decorator, Component, Node, Vec3, Quat, math } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('ConveyorBeltArranger')
export class ConveyorBeltArranger extends Component {
    @property({ type: Node, tooltip: 'Assign the Cube node containing box-001, etc.' })
    public cardsParent: Node | null = null;

    @property({ tooltip: 'The distance of the straight segment of the belt' })
    public straightLength: number = 10; 

    @property({ tooltip: 'The radius of the curved ends of the belt' })
    public curveRadius: number = 5; 
    
    @property({ tooltip: 'Amount to curve the straight segments outward to match the mesh' })
    public sideBulge: number = 0.5;

    @property({ tooltip: 'Check to distribute cards evenly across the entire belt' })
    public fillEntireTrack: boolean = false;

    @property({ tooltip: 'Distance between each card (used if fillEntireTrack is false)' })
    public spacing: number = 1.5; 

    @property({ tooltip: 'Adjust this (e.g., 0, 90, 180, -90) if the cards are facing perpendicular to the belt.' })
    public yRotationOffset: number = 0;

    onLoad() {
        this.arrangeCards();
    }

    arrangeCards() {
        if (!this.cardsParent) {
            console.warn("Cards parent not assigned!");
            return;
        }

        const cards = this.cardsParent.children;
        const numCards = cards.length;
        if (numCards === 0) return;

        const L = this.straightLength;
        const R = this.curveRadius;
        
        // Note: The perimeter calculation remains the same to keep spacing consistent, 
        // as the slight bulge adds a negligible amount to the actual track length.
        const perimeter = 2 * L + 2 * Math.PI * R;

        for (let i = 0; i < numCards; i++) {
            const card = cards[i];
            // card.destroyAllChildren()
            card.children[0].destroy()
            card.children[1].destroy()
            
            const currentPos = card.getPosition();
            const initialEuler = card.eulerAngles.clone();

            let distance = 0;
            if (this.fillEntireTrack) {
                distance = (i / numCards) * perimeter;
            } else {
                distance = (i * this.spacing) % perimeter;
            }

            let pos = new Vec3();
            let tangent = new Vec3();

            if (distance < L) {
                // Top "straight" segment - now with a bulge
                const progress = distance / L;
                const bulgeAmount = this.sideBulge * Math.sin(progress * Math.PI);
                pos.set(-L / 2 + distance, currentPos.y, -R - bulgeAmount);
                
                // Calculate the derivative to ensure rotation matches the new curve
                const dz = -this.sideBulge * (Math.PI / L) * Math.cos(progress * Math.PI);
                tangent.set(1, 0, dz);
                
            } else if (distance < L + Math.PI * R) {
                // Right curve
                const dCurved = distance - L;
                const theta = dCurved / R;
                pos.set(L / 2 + R * Math.sin(theta), currentPos.y, -R * Math.cos(theta));
                tangent.set(Math.cos(theta), 0, Math.sin(theta));
                
            } else if (distance < 2 * L + Math.PI * R) {
                // Bottom "straight" segment - now with a bulge
                const dStraight = distance - (L + Math.PI * R);
                const progress = dStraight / L;
                const bulgeAmount = this.sideBulge * Math.sin(progress * Math.PI);
                pos.set(L / 2 - dStraight, currentPos.y, R + bulgeAmount);
                
                const dz = this.sideBulge * (Math.PI / L) * Math.cos(progress * Math.PI);
                tangent.set(-1, 0, dz);
                
            } else {
                // Left curve
                const dCurved = distance - (2 * L + Math.PI * R);
                const theta = dCurved / R;
                pos.set(-L / 2 - R * Math.sin(theta), currentPos.y, R * Math.cos(theta));
                tangent.set(-Math.cos(theta), 0, -Math.sin(theta));
            }

            // 1. Set position
            card.setPosition(pos);

            // 2. Set rotation (safely using Quaternions to prevent flipping)
            let tiltQuat = new Quat();
            Quat.fromEuler(tiltQuat, initialEuler.x, 0, initialEuler.z);

            const targetYaw = Math.atan2(tangent.x, tangent.z) * math.toDegree(1) + this.yRotationOffset;
            
            let yawQuat = new Quat();
            Quat.fromEuler(yawQuat, 0, targetYaw, 0);

            let finalQuat = new Quat();
            Quat.multiply(finalQuat, yawQuat, tiltQuat);

            card.setRotation(finalQuat);
        }
    }
}