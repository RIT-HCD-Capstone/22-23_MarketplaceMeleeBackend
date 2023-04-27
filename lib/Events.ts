export let Events: Event[] = [
  {
    year: 2011,
    description: "Skylanders: Spyro's Adventure releases",
    direction: "positive",
    amount: 100,
    turn: 1
  },
  {
    year: 2012,
    description: "Skylanders: Giants releases",
    direction: "positive",
    amount: 75,
    turn: 2
  },
  {
    year: 2013,
    description: "Skylanders: Swap Force releases",
    direction: "positive",
    amount: 50,
    turn: 3
  },
  {
    year: 2014,
    description: "Skylanders: Trap Team releases",
    direction: "positive",
    amount: 25,
    turn: 4
  },
  {
    year: 2015,
    description: "Skylanders: SuperChargers releases",
    direction: "positive",
    amount: 20,
    turn: 5
  },
  {
    year: 2016,
    description: "Skylanders: Imaginators and Academy releases",
    direction: "positive",
    amount: 10,
    turn: 6
  },
  {
    year: 2017,
    description:
      "The first year since Skylanders' inception without a new game",
    direction: "positive",
    amount: 0,
    turn: 7
  },
  {
    year: 2018,
    description: "Skylanders: Ring of Heroes releases",
    direction: "positive",
    amount: 5,
    turn: 8
  },
  {
    year: 2019,
    description: "Skylanders: Academy is cancelled",
    direction: "negative",
    amount: 20,
    turn: 9
  },
  {
    year: 2020,
    description: "Skylanders: Ring of Heroes is revamped and rereleased",
    direction: "negative",
    amount: 5,
    turn: 10
  },
  {
    year: 2021,
    description:
      "Its the 10th anniversary of Skylanders, more community support comes through to try to revive the franchise",
    direction: "negative",
    amount: 25,
    turn: 11
  },
  {
    year: 2022,
    description: "Skylanders: Ring of Heroes, the last game, ends support",
    direction: "positive",
    amount: 100,
    turn: 12
  },
];

export interface Event {
  year: number;
  description: string;
  direction: "positive" | "negative";
  amount: number;
  turn: number;
}
