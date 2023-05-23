import  path from 'path';
import DatauriParser from 'datauri/parser.js';
const parser = new DatauriParser();
export const getDataUri = (file)=>{
    // const parser =new DatauriParser();
    const extName=path.extname(file.originalname).toString()
    return  parser.format(extName, file.buffer); 
}