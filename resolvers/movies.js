let movies = [
  {
    id: "1",
    title: "Inception",
    genre: "Science Fiction",
    year: "2010"
  },
  {
    id: "2",
    title: "The Shawshank Redemption",
    genre: "Drama",
    year: "1994"
  },
  {
    id: "3",
    title: "The Godfather",
    genre: "Crime",
    year: "1972"
  }
];

const resolvers = {
  Query: {
    movies: () => movies,
    demo: () => "Demo text",
  },
  Mutation: {
    addMovie: (_, { title, genre, year }, context) => {
      //const req = context.req;
      const newMovie = {
        id: String(movies.length + 1),
        title,
        genre,
        year,
      };
      movies.push(newMovie);
      return newMovie;
    },
  },
};

module.exports = resolvers;
