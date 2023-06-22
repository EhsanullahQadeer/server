import { StatusCodes } from "http-status-codes";

export default function notFound(res,data) {
  return res
    .status(StatusCodes.NOT_FOUND)
    .json(data);
}
export  function badRequest(res,data) {
  return res
    .status(StatusCodes.BAD_REQUEST)
    .json(data);
}


