import { StatusCodes } from 'http-status-codes'
export default function response(res,data){
    return (
        res.status(StatusCodes.OK).json(data)
    )
    
}