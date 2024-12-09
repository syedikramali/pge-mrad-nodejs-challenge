const Hapi = require("@hapi/hapi");
const { processBikeData } = require("./src/lamdaLogic");
const { API_TOKEN } = require("./src/config");

async function startServer() {
  const server = Hapi.server({
    port: 3000,
    host: "0.0.0.0",
  });

  server.route({
    method: "GET",
    path: "/process-data",
    handler: async (request, h) => {
      const token = request.query.token;
      if (!token || token !== API_TOKEN) {
        // Simple API token check
        return h.response({ error: "Unauthorized" }).code(401);
      }

      try {
        const result = await processBikeData();
        return h
          .response({
            message: `${result} You should also see the output.csv in project root directory`,
          })
          .code(200);
      } catch (error) {
        console.error(error);
        return h.response({ error: "Failed to process data." }).code(500);
      }
    },
  });

  await server.start();
  console.log(`Server running at: ${server.info.uri}`);
}

startServer();
