const { processBikeData } = require("./src/lamdaLogic");

exports.handler = async (event) => {
  const result = await processBikeData(true);
  return {
    statusCode: 200,
    body: JSON.stringify(result),
  };
};
