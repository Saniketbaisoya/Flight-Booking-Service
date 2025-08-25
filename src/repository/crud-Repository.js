const {StatusCodes} = require('http-status-codes');

class CrudRepository{
    constructor(model){
        this.model = model;
    }
    async create(data){
        // console.log("repo called successfully")
        // console.log(data);
            const response = await this.model.create(data);
            // console.log("Repo response : ",response)
            return response;
    }
    async destroy(data){
        const response = await this.model.destroy({
            where : {
                id : data
            }
        });
        if(!response){
            throw new AppError("Not able to find the data",StatusCodes.NOT_FOUND);
        }
        console.log(response);
        return response;
    }
    async get(data){
        // console.log("Response : ",data);
        const response = await this.model.findByPk(data);
        // console.log("Response : ",response);
        if(!response){
            throw new AppError("Not able to find the data",StatusCodes.NOT_FOUND);
        }
        return response;
    }
    async getAll(){
        const response = await this.model.findAll();
        return response;
    }
    async update(id,data){
        const response = await this.model.update(data,{
            where : {
                id : id
            }
        });
        if(response==false){
            throw  new AppError("not able to find the statusCode",StatusCodes.NOT_FOUND);
        }
        return response;
    }
}

module.exports = CrudRepository;