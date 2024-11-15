using my.movielibrary as my from '../db/schema';

service AdminService {
    entity MovieSet as
        projection on my.Movie
        excluding {
            EMBEDDINGS
        };

    action generateStory(rank : Integer)     returns String;
    action generateEmbeddings()              returns Boolean;
    action similaritySearch(prompt : String) returns many MovieSet;
}
