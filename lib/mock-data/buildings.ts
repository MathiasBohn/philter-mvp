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
];
