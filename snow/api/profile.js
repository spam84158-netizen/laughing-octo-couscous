import { handle } from "./_lib.js";
export default (req, res) => handle(req, res, { method: "POST", path: "/profile", map: r => ({ name: r.name ?? null, about: r.about ?? null, photo: r.photo ?? null }) });
