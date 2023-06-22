import { StatusCodes } from 'http-status-codes'

export default function InternalServerError(res){
    return (
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({msg:"Something Went Wrong."})
    )
    
}