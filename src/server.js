const Hapi = require("@hapi/hapi");
const Joi = require("@hapi/joi");

require("./database");
const Task = require("./models/Task");

const init = async () => {
  const server = Hapi.server({
    port: 3000,
    host: "localhost",
  });

  // Root
  server.route({
    method: "GET",
    path: "/",
    handler: (request, h) => {
      return "Hello World!";
    },
  });

  // Tasks
  // Add Task
  server.route({
    method: "POST",
    path: "/tasks",
    options: {
      validate: {
        payload: Joi.object({
          name: Joi.string().min(5).required(),
          description: Joi.string(),
        }),
        failAction: (request, h, error) => {
          return error.isJoi
            ? h.response(error.details[0]).takeover()
            : h.response(error).takeover();
        },
      },
    },
    handler: async (request, h) => {
      try {
        const task = new Task(request.payload);
        const taskSaved = await task.save();
        return h.response(taskSaved);
      } catch (error) {
        h.response(error).code(500);
      }
    },
  });

  // View All Task
  server.route({
    method: "GET",
    path: "/tasks",
    handler: async (request, h) => {
      try {
        const tasks = await Task.find();
        return h.response(tasks);
      } catch (error) {
        h.response(error).code(500);
      }
    },
  });

  // View Task By Id
  server.route({
    method: "GET",
    path: "/tasks/{id}",
    handler: async (request, h) => {
      try {
        const task = await Task.findById(request.params.id);
        return h.response(task);
      } catch (error) {
        h.response(error).code(500);
      }
    },
  });

  // Update Task
  server.route({
    method: "PUT",
    path: "/tasks/{id}",
    options: {
      validate: {
        payload: Joi.object({
          name: Joi.string().min(5).optional(),
          description: Joi.string().optional(),
        }),
        failAction: (request, h, error) => {
          return error.isJoi
            ? h.response(error.details[0]).takeover()
            : h.response(error).takeover();
        },
      },
    },
    handler: async (request, h) => {
      try {
        const updateTask = await Task.findByIdAndUpdate(
          request.params.id,
          request.payload,
          { new: true }
        );
        return h.response(updateTask);
      } catch (error) {
        h.response(error).code(500);
      }
    },
  });

  // Delete Task
  server.route({
    method: "DELETE",
    path: "/tasks/{id}",
    handler: async (request, h) => {
      try {
        const deleteTask = await Task.findByIdAndDelete(request.params.id);
        return h.response(deleteTask);
      } catch (error) {
        h.response(error).code(500);
      }
    },
  });

  await server.start();
  console.log("Server running on %s", server.info.uri);
};

process.on("unhandledRejection", (err) => {
  console.log(err);
  process.exit(1);
});

init();
