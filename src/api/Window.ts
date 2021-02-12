export interface Slot {
  index: number;
  item: ItemType | null;
  amount: number;
  nbt: NBT;
  window: McWindow;
}
export type SlotOrEmpty = Slot | null;

export type ItemType = any; // TODO
export type NBT = any; // TODO

export interface McWindow {
  readonly windowId: number;
  readonly windowType: string;
  readonly windowTitle: string;
  readonly isStorage: boolean;

  /** All slots inside this Window (excluding the cursor slot) */
  readonly slots: SlotOrEmpty[];
  /** The player's inventory slots */
  readonly inventory: SlotOrEmpty[];
  /** The player's hotbar slots */
  readonly hotbar: SlotOrEmpty[];
  /** The "picked up" slot under the mouse cursor */
  readonly cursorSlot: SlotOrEmpty;

  getSlotRange(name: string): SlotOrEmpty[] | undefined;
  getSlot(name: string): SlotOrEmpty | undefined;

  readonly properties: Record<number, number>;
  getProperty(name: string): number | undefined;

  /** Drop items from the main hand slot. */
  dropMainHand(amount?: number | "all"): Promise<void>;

  /** Drop items from `slot`, or from the cursor slot if `slot` is negative. */
  dropSlot(slot: number | Slot, amount?: number | "all"): Promise<void>;

  /**
   * Swaps the slot `slot` with the hotbar slot `hotbar`.
   * This is a dedicated action in the protocol and happens quickly,
   * compared to the 2-3 `clickSlot` calls needed otherwise (for non-hotbar slots).
   */
  swapSlotWithHotbar(
    slot: number | Slot,
    hotbarSlot: number | Slot
  ): Promise<void>;

  clickSlot(
    slot: number | Slot,
    right?: boolean,
    shift?: boolean
  ): Promise<void>;
}

export const INVENTORY_LENGTH = 3 * 9;
export const HOTBAR_LENGTH = 3 * 9;
