import { Building, BuildingType } from "@/lib/types";

export const mockBuildings: Building[] = [
  {
    id: "bldg-1",
    name: "The Manhattan",
    code: "MAN001",
    type: BuildingType.CONDO,
    address: {
      street: "123 Park Avenue",
      city: "New York",
      state: "NY",
      zip: "10016",
    },
  },
  {
    id: "bldg-2",
    name: "Brooklyn Heights Co-op",
    code: "BKH002",
    type: BuildingType.COOP,
    address: {
      street: "456 Montague Street",
      city: "Brooklyn",
      state: "NY",
      zip: "11201",
    },
  },
  {
    id: "bldg-3",
    name: "Chelsea Tower",
    code: "CHE003",
    type: BuildingType.RENTAL,
    address: {
      street: "789 West 23rd Street",
      city: "New York",
      state: "NY",
      zip: "10011",
    },
  },
  {
    id: "bldg-4",
    name: "Upper East Residences",
    code: "UER004",
    type: BuildingType.CONDO,
    address: {
      street: "200 East 72nd Street",
      city: "New York",
      state: "NY",
      zip: "10021",
    },
  },
  {
    id: "bldg-5",
    name: "Greenwich Village Lofts",
    code: "GVL005",
    type: BuildingType.CONDO,
    address: {
      street: "45 Washington Square South",
      city: "New York",
      state: "NY",
      zip: "10012",
    },
  },
  {
    id: "bldg-6",
    name: "Tribeca Heights",
    code: "TBH006",
    type: BuildingType.COOP,
    address: {
      street: "120 Chambers Street",
      city: "New York",
      state: "NY",
      zip: "10007",
    },
  },
  {
    id: "bldg-7",
    name: "Battery Park Towers",
    code: "BPT007",
    type: BuildingType.RENTAL,
    address: {
      street: "350 South End Avenue",
      city: "New York",
      state: "NY",
      zip: "10280",
    },
  },
];
