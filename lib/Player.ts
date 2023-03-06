import Item from "./Item";

// TODO this is bad design, should be a function that returns one of the enums instead of an interface property
type PlayerStance = "Attack" | "Defend" | "Act" | null;

export default interface Player {
  id: string;
  stance: PlayerStance;
  value: number;
  items: Item[];
  readyState: boolean;
}
