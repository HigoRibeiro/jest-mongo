const faker = require("faker");
const FactoryGirl = require("factory-girl");

const User = require("../src/app/models/User");

const factory = FactoryGirl.factory;
const adapter = new FactoryGirl.MongooseAdapter();

factory.setAdapter(adapter);

factory.define("User", User, {
  name: faker.name.findName(),
  email: faker.internet.email(),
  password: faker.internet.password()
});

module.exports = factory;
