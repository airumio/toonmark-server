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

export const weekDayKorToEng: { [key: string]: string } = {
  월: 'mon',
  화: 'tue',
  수: 'wed',
  목: 'thu',
  금: 'fri',
  토: 'sat',
  일: 'sun',
  열흘: 'ten',
};

export const platformDaytype = {
  naver: weekday,
  daum: weekday,
  kakao: weekday,
  lezhin: weekday.concat(Weekday.TEN),
  toomics: weekday.concat(Weekday.TEN),
  toptoon: weekday,
  misterblue: weekday,
};

export type daumApiType = {
  nickname: string;
  title: string;
  webtoonWeeks: [{ weekDay: string }];
  thumbnailImage2: { url: string };
  cartoon: { artists: [{ penName: string }]; genres: [{ name: string }] };
  latestWebtoonEpisode: { dateCreated: string };
  restYn: string;
};

export type kakaoApiType = {
  series_id: string;
  title: string;
  thumb_img: string;
  author: string;
  last_slide_added_date: string;
  sub_category_title: string;
};

export const kakaoWeek: { [key: string]: string } = {
  mon: '1',
  tue: '2',
  wed: '3',
  thu: '4',
  fri: '5',
  sat: '6',
  sun: '7',
};

export type lezhinApiType = {
  targetUrl: string;
  title: string;
  schedule: { periods: string[] };
  mediaList: [{ url: string }];
  authors: [{ name: string }];
  badges: string;
  genres: string[];
};

export type lezhinGenreList = [{ id: string; name: string }];

export const lezhinWeek: { [key: string]: string } = {
  sun: '0',
  mon: '1',
  tue: '2',
  wed: '3',
  thu: '4',
  fri: '5',
  sat: '6',
  ten: '7',
};

export const toomicsWeek: { [key: string]: string } = {
  mon: '1',
  tue: '2',
  wed: '3',
  thu: '4',
  fri: '5',
  sat: '6',
  sun: '7',
  ten: '10',
};

export type toptoonApiType = {
  id: string;
  meta: {
    title: string;
    comicsListUrl: string;
    author: { authorData: [{ name: string }] };
    genre: [{ name: string }];
  };
  thumbnail: { portrait: string };
  thumbnailNonAdult: { portrait: string };
  ribbon: { up: boolean };
  comicWeekly: [{ comic_weekly: number }];
};

export const toptoonWeek: { [key: string]: string } = {
  mon: '1',
  tue: '2',
  wed: '3',
  thu: '4',
  fri: '5',
  sat: '6',
  sun: '7',
};

export const toptoonJsonWeek: { [key: string]: number } = {
  mon: 0,
  tue: 1,
  wed: 2,
  thu: 3,
  fri: 4,
  sat: 5,
  sun: 6,
};

export const misterblueWeek: { [key: string]: number } = {
  mon: 0,
  tue: 1,
  wed: 2,
  thu: 3,
  fri: 4,
  sat: 5,
  sun: 6,
};
