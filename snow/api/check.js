import { handle, interpretBanStatus, normalizeNumber, upstream } from "./_lib.js";
export default (req, res) => handle(req, res, { method: "POST", path: "/check", map: interpretBanStatus });
export { interpretBanStatus, normalizeNumber };
