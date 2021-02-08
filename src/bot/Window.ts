/** actually a slot in an inventory window */
export interface Item {
  // XXX
}

export interface McWindow {
  windowId: number;
  items(): (Item | null)[];
  // XXX
}

export class PlayerInventory implements McWindow {
  // XXX

  windowId = 0;

  _items = Array<Item | null>(5 * 9 + 1).fill(null);

  items() {
    return this._items;
  }
}
