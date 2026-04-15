// TODO: creating users and admin on the top
// using global variables rather than functions
// conuning with other tests


import { describe, it, expect } from "bun:test";
import axios from "axios";

type role = "USER" | "ADMIN";

const HTTP_URL = "http://localhost:4000/api/v1";

let elementId = "";

async function createUser(role: role) {
  const data = {
    username: `test`,
    password: "test@123",
    role,
  };

  const res1 = await axios.post(`${HTTP_URL}/signup`, data);
  const res2 = await axios.post(`${HTTP_URL}/signin`, data);

  return { ...data, token: res2.data.token, id: res1.data.userId };
}

async function createAvatar(token: string) {
  const data = {
    imageUrl:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQm3RFDZM21teuCMFYx_AROjt-AzUwDBROFww&s",
    name: "Timmy",
  };
  const res = await axios.post(`${HTTP_URL}/admin/avatar`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return { id: res.data.id };
}

describe("POST /signup for ADMIN", () => {
  it("it should succeed", async () => {
    const res = await axios.post(
      `${HTTP_URL}/signup`,
      {
        username: "hello",
        password: "hello",
        role: "ADMIN",
      },
      {
        validateStatus: () => true,
      },
    );
    expect(res.data.userId).toBeDefined();
  });

  it("it should give invalid inputs", async () => {
    const res = await axios.post(
      `${HTTP_URL}/signup`,
      {
        username: "he",
        password: "he",
        role: "CHOCO",
      },
      {
        validateStatus: () => true,
      },
    );
    expect(res.status).toBe(400);
  });

  it("it should give admin already exists", async () => {
    const data = await createUser("ADMIN");

    const res = await axios.post(`${HTTP_URL}/signup`, data, {
      validateStatus: () => true,
    });

    expect(res.status).toBe(409);
  });
});

describe("POST /signup for USER", () => {
  it("it should succeed", async () => {
    const res = await axios.post(
      `${HTTP_URL}/signup`,
      {
        username: "hello",
        password: "hello",
        role: "USER",
      },
      {
        validateStatus: () => true,
      },
    );
    expect(res.data.userId).toBeDefined();
  });

  it("it should give invalid inputs", async () => {
    const res = await axios.post(
      `${HTTP_URL}/signup`,
      {
        username: "he",
        password: "he",
        role: "CHOCO",
      },
      {
        validateStatus: () => true,
      },
    );
    expect(res.status).toBe(400);
  });

  it("it should give user already exists", async () => {
    const data = await createUser("USER");

    const res = await axios.post(`${HTTP_URL}/signup`, data, {
      validateStatus: () => true,
    });

    expect(res.status).toBe(409);
  });
});

describe("POST /signin for ADMIN", () => {
  it("it should succeed", async () => {
    const data = await createUser("ADMIN");

    const res = await axios.post(`${HTTP_URL}/signin`, data, {
      validateStatus: () => true,
    });
    expect(res.data.token).toBeDefined();
  });

  it("it should give invalid inputs", async () => {
    const res = await axios.post(
      `${HTTP_URL}/signin`,
      {
        username: "he",
        password: "he",
        role: "CHOCO",
      },
      {
        validateStatus: () => true,
      },
    );
    expect(res.status).toBe(400);
  });

  it("it should give user not found", async () => {
    const res = await axios.post(
      `${HTTP_URL}/signin`,
      {
        username: "idk-man",
        password: "lettss gooo",
        role: "ADMIN",
      },
      {
        validateStatus: () => true,
      },
    );

    expect(res.status).toBe(404);
  });
});

describe("POST /signin for USER", () => {
  it("it should succeed", async () => {
    const data = await createUser("USER");

    const res = await axios.post(`${HTTP_URL}/signin`, data, {
      validateStatus: () => true,
    });
    expect(res.data.token).toBeDefined();
  });

  it("it should give invalid inputs", async () => {
    const res = await axios.post(
      `${HTTP_URL}/signin`,
      {
        username: "he",
        password: "he",
        role: "CHOCO",
      },
      {
        validateStatus: () => true,
      },
    );
    expect(res.status).toBe(400);
  });

  it("it should give user not found", async () => {
    const res = await axios.post(
      `${HTTP_URL}/signin`,
      {
        username: "idk-man",
        password: "lettss gooo",
        role: "USER",
      },
      {
        validateStatus: () => true,
      },
    );

    expect(res.status).toBe(404);
  });
});

describe("GET /me", () => {
  it("it should be successfull", async () => {
    const { token } = await createUser("ADMIN");

    const res = await axios.get(`${HTTP_URL}/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      validateStatus: () => true,
    });

    expect(res.data.username).toBeDefined();
    expect(res.data.password).toBeDefined();
    expect(res.data.role).toBeDefined();
    expect(res.data.avatarUrl).toBeDefined();
  });

  it("it will say un-authorized", async () => {
    const res = await axios.get(`${HTTP_URL}/me`, {
      headers: {
        Authorization: `Bearer choco`,
      },
      validateStatus: () => true,
    });

    expect(res.status).toBe(401);
  });
});

describe("PUT /user/metadata", () => {
  it("it should be successfull", async () => {
    const { token } = await createUser("ADMIN");
    const { id } = await createAvatar(token);
    const { token: t2 } = await createUser("USER");

    const res = await axios.put(
      `${HTTP_URL}/user/metadata`,
      {
        avatarId: id,
      },
      {
        headers: {
          Authorization: `Bearer ${t2}`,
        },
        validateStatus: () => true,
      },
    );

    expect(res.status).toBe(200);
  });

  it("it should say invalid inputs", async () => {
    const { token } = await createUser("ADMIN");

    const res = await axios.put(
      `${HTTP_URL}/user/metadata`,
      {
        avatarId: "id",
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        validateStatus: () => true,
      },
    );

    expect(res.status).toBe(400);
  });

  it("it should say un-authorized", async () => {
    const res = await axios.put(
      `${HTTP_URL}/user/metadata`,
      {
        avatarId: "id",
      },
      {
        headers: {
          Authorization: `Bearer choco`,
        },
        validateStatus: () => true,
      },
    );

    expect(res.status).toBe(401);
  });
});

describe("GET /avatars", () => {
  it("it should be successfull", async () => {
    const res = await axios.get(`${HTTP_URL}/avatars`, {
      validateStatus: () => true,
    });

    expect(res.data.avatars).toBeArray();
  });
});

// ids: string[]
describe("GET /user/metadata/bulk?ids", () => {
  it("it should be successfull", async () => {
    const { id: id1 } = await createUser("USER");
    const { id: id2 } = await createUser("USER");

    const res = await axios.get(
      `${HTTP_URL}/user/metadata/bulk?ids=[${id1}, ${id2}]`,
      {
        validateStatus: () => true,
      },
    );

    expect(res.data.avatars).toBeArray();
  });
});

describe("POST /admin/element", () => {
  it("it should succeed", async () => {
    const { token } = await createUser("ADMIN");

    const data = {
      imageUrl:
        "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
      width: 1,
      height: 1,
      static: true,
    };

    const res = await axios.post(`${HTTP_URL}/admin/element`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    expect(res.data.id).toBeDefined();
    elementId = res.data.id;
  });

  it("it should fail as the user is not admin", async () => {
    const { token } = await createUser("USER");

    const data = {
      imageUrl:
        "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
      width: 1,
      height: 1,
      static: true,
    };

    const res = await axios.post(`${HTTP_URL}/admin/element`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    expect(res.status).toBe(409);
  });

  it("it should fail as the inputs are invalid", async () => {
    const { token } = await createUser("ADMIN");

    const data = {
      imageUrl:
        "heloo",
      width: "1",
      height: "1",
      static: "choco",
    };

    const res = await axios.post(`${HTTP_URL}/admin/element`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    expect(res.status).toBe(400);
  });

  
  it("it should fail as the admin in un-authorized", async () => {
    const data = {
      imageUrl:
        "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
      width: 1,
      height: 1,
      static: true,
    };

    const res = await axios.post(`${HTTP_URL}/admin/element`, data, {
      headers: {
        Authorization: `Bearer choco`,
      },
    });

    expect(res.status).toBe(401);
  });
});


describe("POST /admin/element/:elementId", () => {
  it("it should succeed", async () => {
    const { token } = await createUser("ADMIN");

    const data = {
      imageUrl:
        "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
    };

    const res = await axios.post(`${HTTP_URL}/admin/element/:${elementId}`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    expect(res.data.id).toBeDefined();
  });

  it("it should succeed", async () => {
    const { token } = await createUser("USER");

    const data = {
      imageUrl:
        "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
    };

    const res = await axios.post(`${HTTP_URL}/admin/element/:${elementId}`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    expect(res.data.id).toBeDefined();
  });

  it("it should succeed", async () => {
    const { token } = await createUser("ADMIN");

    const data = {
      imageUrl:
        "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
    };

    const res = await axios.post(`${HTTP_URL}/admin/element/:${elementId}`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    expect(res.data.id).toBeDefined();
  });
});
