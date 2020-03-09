import { Weekday, Platform, Genre } from '../model/Enum';

export interface IwebtoonDTO {
  title: string;
  id: string | number;
  weekday: string;
  thumbnail: string;
  platform: Platform;
  link: string;
  is_up: boolean;
  is_rest: boolean;
  rank?: string;
  last_episode?: number;
  genre?: Array<Genre>;
  author?: string;
}