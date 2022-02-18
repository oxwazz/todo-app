const request = require("supertest");
const app = require("./app");

describe('POST/user', function() {
  it('/user/register --> new user register', async () => {
    //jest.setTimeout(30000);
    const res = await request(app).post("/user/register").send({
      username: 'dono',
      email: 'maildono',
      password: 'passdono',
      profile_picture: 'picdono'
    })
    expect(res.status).toEqual(200)
  })

  //it('', async () => {})
});


