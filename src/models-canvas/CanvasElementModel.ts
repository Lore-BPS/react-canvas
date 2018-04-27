import { CanvasLayerModel } from "./CanvasLayerModel";
import { BaseModel } from "../models/BaseModel";
import { Rectangle } from "../geometry/Rectangle";
import { BaseEvent, BaseListener } from "../models/BaseObject";
import { CanvasEngine } from "../CanvasEngine";

export interface CanvasElementModelListener extends BaseListener<CanvasElementModel> {
	selectionChanged(event: BaseEvent & { selected: boolean });

	lockChanged(event: BaseEvent & { locked: boolean });
}

export abstract class CanvasElementModel<
	T extends CanvasElementModelListener = CanvasElementModelListener
> extends BaseModel<CanvasLayerModel, CanvasElementModelListener> {
	protected selected: boolean;
	protected locked: boolean;

	constructor(type: string) {
		super(type);
		this.type = type;
		this.selected = false;
		this.locked = false;
	}

	serialize() {
		return {
			...super.serialize(),
			selected: this.selected,
			locked: this.locked
		};
	}

	deSerialize(data: { [p: string]: any }, engine: CanvasEngine, cache: { [id: string]: BaseModel }): void {
		super.deSerialize(data, engine, cache);
		this.selected = !!data["selected"];
		this.locked = !!data["locked"];
	}

	setSelected(selected: boolean) {
		this.selected = selected;
		this.iterateListeners((listener, event: any) => {
			if (listener.selectionChanged) {
				event.selected = selected;
				listener.selectionChanged(event);
			}
		});
	}

	setLocked(locked: boolean) {
		this.locked = locked;
		this.iterateListeners((listener, event: any) => {
			if (listener.lockChanged) {
				event.locked = locked;
				listener.lockChanged(event);
			}
		});
	}

	isSelected(): boolean {
		return this.selected;
	}

	isLocked(): boolean {
		return this.getParent().isLocked();
	}

	abstract getDimensions(): Rectangle;

	abstract setDimensions(dimensions: Rectangle);

	moveToLayer(layer: CanvasLayerModel) {
		if (this.parent) {
			this.parent.removeElement(this);
		}
		layer.addElement(this);
	}

	moveToFront() {
		this.parent.moveElementToFront(this);
	}

	moveToBack() {
		this.parent.moveElementToBack(this);
	}

	moveForward() {
		this.parent.moveElement(this, true);
	}

	moveBackward() {
		this.parent.moveElement(this, false);
	}
}
