const userModel = require('../models/user-model');
const bcrypt = require('bcrypt');
const uuid = require('uuid');
const mailService = require('../service/mail-service');
const tokenService = require('../service/token-service');
const UserDto = require('../dtos/user-dto');
const apiError = require('../exceptions/api-error')

class UserService{
    async registration(email, password){
        const candidate = await userModel.findOne({email});
        if(candidate){
            throw apiError.BadRequest('Некорректный запрос.')
        }

        const hashPassword = await bcrypt.hash(password, 5);
        const activationLink = uuid.v4();

        const user = await userModel.create({email, password: hashPassword, activationLink});
        await mailService.sendActivationMail(email, `${process.env.API_URL}/api/activate/${activationLink}`);

        const userDto = new UserDto(user);
        const tokens = tokenService.generateTokens({...userDto});
        await tokenService.saveToken(userDto.id, tokens.refreshToken);

        return{...tokens, user: userDto}
    }

    async activate(activationLink){
        const user = await userModel.findOne({activationLink});
        if(!user){
            throw apiError.BadRequest('Некорректная ссылка активации.')
        }
        user.isActivated = true;
        await user.save()
    }

    async login(email, password){
        const user = await userModel.findOne({email});

        if(!user){
            throw apiError.BadRequest('Пользователь не найден.')
        }

        const isPassEqual = await bcrypt.compare(password, user.password);

        if(!isPassEqual){
            throw apiError.BadRequest('Неверный пароль.')
        }

        const userDto = new UserDto(user);
        const tokens = tokenService.generateTokens({...userDto});
        await tokenService.saveToken(userDto.id, tokens.refreshToken);

        return {...tokens, user: userDto}
    }

    async logout(refreshToken){
        const token = await tokenService.removeToken(refreshToken);
        return token;
    }

    async refresh(refreshToken){
        if(!refreshToken){
            throw apiError.UnauthorizedError();
        }

        const userData = tokenService.validateRefreshToken(refreshToken);
        const tokenFromDb = await tokenService.findToken(refreshToken);

        if(!userData || !tokenFromDb){
            throw apiError.UnauthorizedError()
        }

        const user = await userModel.findById(userData.id);
        const userDto = new UserDto(user);
        const tokens = tokenService.generateTokens({...userDto});
        await tokenService.saveToken(userDto.id, tokens.refreshToken);

        return {...tokens, user: userDto}

    }

    async getAllUsers(){
        const users = await userModel.find();
        return users;
    }
}

module.exports = new UserService;