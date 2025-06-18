
import { _decorator, Component, instantiate, Material, MeshRenderer, Node, Prefab } from 'cc';
const { ccclass, property } = _decorator;

/**
 * Predefined variables
 * Name = TileCreation
 * DateTime = Tue May 06 2025 22:22:11 GMT+0530 (India Standard Time)
 * Author = Sanjay_10
 * FileBasename = TileCreation.ts
 * FileBasenameNoExtension = TileCreation
 * URL = db://assets/Scripts/TileCreation.ts
 * ManualUrl = https://docs.cocos.com/creator/3.4/manual/en/
 *
 */

@ccclass('TileCreation')
export class TileCreation extends Component {
    // [1]
    @property(Material)
    colorMaterials: Material[] = [];

    color: number[] = [];
    originalColor: number[] = [0, 1, 2, 3];

    @property(Prefab)
    TilePrefab: Prefab = null;

    NUM_Col = 11;
    HEXAGON_TILES_PER_Col = 20;

    public colContainers: Node[] = [];
    public setArrayData: Array<Array<number>> = [];
    public setIdexArrayData: Array<Array<number>> = [];

    protected start(): void {
        this.tileGenerate();
    }


    tileGenerate() {


        let setIndexData = [];
        for (let j = 0; j < this.NUM_Col; j++) {
            let selectedColor = this.selectColor();
            const parentNode = this.node.children[j];
            let setdata = []
            setIndexData.push(j);

            if (j == 0 || j == 11 || j == 9 || j == 3) {
                this.HEXAGON_TILES_PER_Col = 15;
            } else if (j == 10 || j == 8) {
                this.HEXAGON_TILES_PER_Col = 10;
            } else {
                this.HEXAGON_TILES_PER_Col = 15;
            }

            for (let i = 0; i < this.HEXAGON_TILES_PER_Col; i++) {
                if (i % 5 == 0) {
                    selectedColor = this.selectColor();
                }
                if (i >= 10 && (j == 4 || j == 5)) {
                    selectedColor = 0;
                }
                // if(i>=15 && (j==3 || j==7)){
                //     selectedColor = 2;
                // }
                // if(i>=15 && (j==6)||((i>=10 && i<15))){
                //     selectedColor = 3;
                // }
                const hexagonTile = instantiate(this.TilePrefab);
                this.placeColor(hexagonTile.children[0], selectedColor);
                hexagonTile.parent = parentNode;
                hexagonTile.setPosition(0, i * 0.2, 0);
                hexagonTile.name = selectedColor.toString();
                setdata.push(selectedColor);
            }

            this.setArrayData.push(setdata);
            this.colContainers.push(this.node.children[j])
        }

        this.setIdexArrayData.push(setIndexData);
        // this.setArrayData.push(setdata);


        console.log("setArrayData", this.setArrayData);
    }

    placeColor(hexagonTile: Node, colorIndex: number) {
        let material = this.colorMaterials[colorIndex];

        hexagonTile.getComponent(MeshRenderer).setMaterial(material, 0);

    }

    selectColor(): number {
        if (this.color.length === 0) {
            this.color = [...this.originalColor];
        }
        const index = Math.floor(Math.random() * this.color.length);
        const selectedColor = this.color[index];
        this.color[index] = this.color[this.color.length - 1];
        this.color.pop();

        return selectedColor;
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
