import Item from "./Item";

type PlayerStance = "Attack" | "Defend" | "Act" | null;
// TODO this is bad design, should be a function that returns one of the enums instead of an interface property

export default interface Player {
  id: string;
  stance: PlayerStance;
  value: number;
  items: Item[];
}
