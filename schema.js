const Joi= require('Joi');

module.exports.listingSchema = Joi.object({
    listing: Joi.object({
        title:Joi.string().required(),
        description: Joi.string().required(),
        location:Joi.string().required(),
        country:Joi.string().required(),
        price:Joi.number().required().min(0),
        img:Joi.string().allow("", null)
    }).required()
})