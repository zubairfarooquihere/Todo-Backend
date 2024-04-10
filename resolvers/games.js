let games = [
    {
      id: "1",
      name: "The Legend of Zelda: Breath of the Wild",
    },
    {
      id: "2",
      name: "Super Mario Odyssey",
    },
    {
      id: "3",
      name: "The Witcher 3: Wild Hunt",
    },
  ];
  
  const resolvers = {
    Query: {
      listGames: () => games,
      findGame: (_, { name }) => {
        return games.filter(game => game.name.toLowerCase().includes(name.toLowerCase()));
      }
    },
    Mutation: {
      addGame: (_, { name }) => {
        const newGame = {
          id: String(games.length + 1),
          name,
        };
        games.push(newGame);
        return newGame;
      },
    },
  };
  
  module.exports = resolvers;
  