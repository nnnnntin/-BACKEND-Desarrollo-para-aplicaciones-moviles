// k6 run ./resources/loadtest.js -e AUTH_TOKEN=TOKEN
import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  vus: 20,
  duration: "20s",
};

const BASE_URL = "http://localhost:3001/v1/oficinas"; // CAMBIAR POR LA ENTIDAD QUE SE QUIERA VER
const TOKEN = __ENV.AUTH_TOKEN;

export default function () {
  const headers = {
    headers: {
      Authorization: `${TOKEN}`,
    },
  };
  const res = http.get(BASE_URL, headers);

  check(res, {
    "status is 200": (r) => r.status === 200,
  });
  sleep(1);
}
