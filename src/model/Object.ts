import { Weekday } from './Enum';

const weekday: Weekday[] = [
  Weekday.MON,
  Weekday.TUE,
  Weekday.WED,
  Weekday.THU,
  Weekday.FRI,
  Weekday.SAT,
  Weekday.SUN,
];

export const platform_daytype = {
  naver: weekday,
  daum: weekday,
  kakao: weekday,
  lezhin: weekday.concat(Weekday.TEN),
  toomics: weekday.concat(Weekday.TEN),
  toptoon: weekday,
  misterblue: weekday,
};

export type daum_API_type = {
  nickname: string;
  title: string;
  webtoonWeeks: [{ weekDay: string }];
  thumbnailImage2: { url: string };
  cartoon: { artists: [{ penName: string }]; genres: [{ name: string }] };
  latestWebtoonEpisode: { dateCreated: string };
  restYn: string;
};

export type kakao_API_type = {
  series_id: string;
  title: string;
  thumb_img: string;
  author: string;
  last_slide_added_date: string;
  sub_category_title: string;
};

export const kakao_week: { [key: string]: string } = {
  mon: '1',
  tue: '2',
  wed: '3',
  thu: '4',
  fri: '5',
  sat: '6',
  sun: '7',
};

export type lezhin_API_type = {
  targetUrl: string;
  title: string;
  schedule: { periods: string[] };
  mediaList: [{ url: string }];
  authors: [{ name: string }];
  badges: string;
  genres: string[];
};

export type lezhin_GenreList = [{ id: string; name: string }];

export const lezhin_week: { [key: string]: string } = {
  sun: '0',
  mon: '1',
  tue: '2',
  wed: '3',
  thu: '4',
  fri: '5',
  sat: '6',
  ten: '7',
};

export const toomics_week: { [key: string]: string } = {
  mon: '1',
  tue: '2',
  wed: '3',
  thu: '4',
  fri: '5',
  sat: '6',
  sun: '7',
  ten: '10',
};
