namespace my.movielibrary;

entity Movie {
  key RANK        : Integer;
      TITLE       : String;
      DESCRIPTION : String;
      GENRE       : String;
      RATING      : Decimal;
      YEAR        : Integer;
      EMBEDDINGS  : Vector(1536);

}
