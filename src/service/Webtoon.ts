import { Weekday, Platform, Genre } from '../model/Enum';

export interface IwebtoonDTO {
  title: string;
  id: string | number;
  weekday: string;
  thumbnail: string;
  platform: Platform;
  link: string;
  isUp: boolean;
  isBreak: boolean;
  rank?: string;
  author?: string;
  genre?: string;
}
