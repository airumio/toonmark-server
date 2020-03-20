export interface Car {
  name: string;
  age: number;
}

type BB = 'F' | 'M';

export type Person = {
  name: string;
  age: number | string;
  sex?: BB;
  car?: Car;
};

export const test: Person = {
  name: 'tester',
  age: '00',
  sex: 'M',
  car: { name: 'Car', age: 1 },
};
