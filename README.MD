# ToonMark API Server

ToonMark API Server는 웹툰 플랫폼들의 작품 데이터들을 통합하여 제공합니다.

## 목차

- [요청 URL](#요청-url)
- [지원 플랫폼 & 요일 목록](#지원-플랫폼-&-요일-목록)
- [데이터 구조](#데이터-구조)

## 요청 URL

```
GET http://[Address]/webtoon/[Platform] HTTP/1.1    -   해당 플랫폼의 전체 작품 목록
GET http://[Address]/webtoon/[Platform]/[Weekday] HTTP/1.1    -   해당 플랫폼의 특정 요일 작품 목록
GET http://[Address]/webtoon/search/[keyword] HTTP/1.1    - 작품 검색 URL

GET https://[Address]/webtoon/[Platform] HTTP/2
GET https://[Address]/webtoon/[Platform]/[Weekday] HTTP/2
GET https://[Address]/webtoon/search/[keyword] HTTP/2
```

## 지원 플랫폼 & 요일 목록

```typescript
enum Platform {
  NAVER = 'naver', //  네이버 웹툰
  DAUM = 'daum', //  다음 웹툰
  KAKAO = 'kakao', //  카카오 페이지 웹툰
  LEZHIN = 'lezhin', //  레진 코믹스
  TOOMICS = 'toomics', //  투믹스
  TOPTOON = 'toptoon', // 탑툰
  MISTERBLUE = 'misterblue', //  미스터블루
}

enum Weekday {
  MON = 'mon', //  월
  TUE = 'tue', //  화
  WED = 'wed', //  수
  THU = 'thu', //  목
  FRI = 'fri', //  금
  SAT = 'sat', //  토
  SUN = 'sun', //  일
  TEN = 'ten', //  열흘(일부 플랫폼만)
  월 = '월',
  화 = '화',
  수 = '수',
  목 = '목',
  금 = '금',
  토 = '토',
  일 = '일',
  열흘 = '열흘',
}
```

## 데이터 구조

```typescript
title: string; //  제목
id: string | number; //  ID
weekday: string; //  연재 요일
thumbnail: string; //  썸네일 이미지 주소
platform: Platform; //  연재처
link: string; //  웹툰 주소
isUp: boolean; //  업로드 상태
isBreak: boolean; //  휴재 상태
author: string; //  작가
genre: string; //  장르
```
