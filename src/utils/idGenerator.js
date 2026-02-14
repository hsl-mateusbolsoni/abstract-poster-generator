const CHARSET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function generatePosterId() {
  let id = "";
  for (let i = 0; i < 4; i++) {
    id += CHARSET[Math.floor(Math.random() * CHARSET.length)];
  }
  id += "-";
  for (let i = 0; i < 2; i++) {
    id += CHARSET[Math.floor(Math.random() * CHARSET.length)];
  }
  return id;
}
