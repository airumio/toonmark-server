import { Weekday, Platform, Genre } from '../model/Enum';

interface Webtoon {
  id: string | number;
  title: string;
  weekday: Weekday;
  thumbnail: string;
  last_episode: number;
  platform: Platform;
  genre: Array<Genre>;
  author: string;
  rank: number;
  link: string;
  is_up: boolean;
  is_rest: boolean;
}
