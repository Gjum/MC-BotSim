import { inspect } from "util";
import { Bot } from "../api/Bot";
import {
  HOTBAR_LENGTH,
  INVENTORY_LENGTH,
  McWindow,
  Slot,
  SlotOrEmpty,
} from "../api/Window";
import { MutablePlayer } from "./World";

export class WindowSim implements McWindow {
  constructor(
    player: MutablePlayer,
    winProps: {
      windowId: number;
      windowType: string;
      windowTitle: string;
      isStorage: boolean;
      numSlots: number;
      inventoryStart: number;
    }
  ) {
    this.player = player;
    this.inventoryStart = winProps.inventoryStart;
    this.hotbarStart = this.inventoryStart + 3 * 9;
    this.windowId = winProps.windowId;
    this.windowType = winProps.windowType;
    this.windowTitle = winProps.windowTitle;
    this.isStorage = winProps.isStorage;
    this.slots = Array<null>(5 * 9 + 1).fill(null);
  }

  private readonly player: MutablePlayer;
  private readonly inventoryStart: number;
  private readonly hotbarStart: number;

  readonly windowId: number;
  readonly windowType: string;
  readonly windowTitle: string;
  readonly isStorage: boolean;

  slots: SlotOrEmpty[];

  get inventory() {
    return this.slots.slice(
      this.inventoryStart,
      this.inventoryStart + INVENTORY_LENGTH
    );
  }

  get hotbar() {
    return this.slots.slice(this.hotbarStart, this.hotbarStart + HOTBAR_LENGTH);
  }

  cursorSlot = null;

  getSlotRange(name: string): SlotOrEmpty[] | undefined {
    return undefined; // TODO use mc-data
  }

  getSlot(name: string): SlotOrEmpty | undefined {
    return undefined; // TODO use mc-data
  }

  properties: Record<number, number> = {};

  getProperty(name: string): number | undefined {
    return undefined; // TODO use mc-data
  }

  async dropMainHand(amount: number | "all" = "all"): Promise<void> {
    const slot = this.hotbar[this.player.hotbarSelection];
    if (slot) return await this.dropSlot(slot, amount);
  }

  async dropSlot(
    slot: number | Slot,
    amount: number | "all" = "all"
  ): Promise<void> {
    const slotNr = typeof slot === "number" ? slot : slot.index;
    const slotReal = this.slots[slotNr];
    if (!slotReal) return;
    const amountReal = amount === "all" ? 64 : amount;
    slotReal.amount -= amountReal;
    if (slotReal.amount < 1) {
      this.slots[slotNr] = null;
    }
  }

  async swapSlotWithHotbar(
    slot: number | Slot,
    hotbarSlot: number | Slot
  ): Promise<void> {
    const slotNr = typeof slot === "number" ? slot : slot.index;
    const hotbarNr =
      typeof hotbarSlot === "number"
        ? hotbarSlot + this.hotbarStart
        : hotbarSlot.index;
    if (
      hotbarNr < this.hotbarStart ||
      hotbarNr >= this.hotbarStart + HOTBAR_LENGTH
    ) {
      throw new Error(`Invalid hotbar slot ${inspect(hotbarSlot)}`);
    }
    const tmp = this.slots[slotNr];
    this.slots[slotNr] = this.hotbar[hotbarNr];
    this.hotbar[hotbarNr] = tmp;
  }

  async clickSlot(
    slot: number | Slot,
    right?: boolean,
    shift?: boolean
  ): Promise<void> {
    throw new Error("Clicking slots is not implemented yet.");
  }
}

export class PlayerInventory extends WindowSim {
  constructor(player: MutablePlayer) {
    super(player, {
      windowId: 0,
      windowType: "minecraft:inventory",
      windowTitle: "Inventory",
      isStorage: true,
      numSlots: 5 * 9 + 1,
      inventoryStart: 9,
    });
  }
}
