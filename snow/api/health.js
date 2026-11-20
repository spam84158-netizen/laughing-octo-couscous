import { handle } from "./_lib.js";
export default (req, res) => handle(req, res, { method: "GET", path: "/health", map: r => ({ status: r.status === "OK" ? "OK" : "DOWN" }) });
