'use strict';
const config = require('../config');

const jwt = require('jsonwebtoken');

module.exports.auth_token = async(event,context)=>{
    const authorizerToken = event.authorizationToken;
    const authorizerArr = authorizerToken.split(' ');
    const token = authorizerArr[1];
    console.log('Token entero');
    console.log(authorizerToken);
    console.log('Token array');
    console.log(authorizerArr);
    console.log('Token solo');
    console.log(token);
    
    
    if (authorizerArr.length != 2 || authorizerArr[0] != 'Bearer' || authorizerArr[1].length == 0) {
        console.log('Primer IF');
        return generatePolicy('undefined','Deny',event.methodArn);
    }

    var decodeJwt;

    try {
        decodeJwt = jwt.verify(token,config.SECRET_TOKEN);    
    } catch (error) {
        return generatePolicy('undefined','Deny',event.methodArn);    
    }
    /*console.log("Token decodificado");
    console.log(decodeJwt);

    console.log("Valores para validar las condicionales");
    console.log(typeof decodeJwt.usuario);
    console.log(decodeJwt.usuario.length);*/

    if (typeof decodeJwt.usuario != 'undefined' && decodeJwt.usuario.username.length > 0) {
        console.log('Segundo IF');
        return generatePolicy(decodeJwt.usuario.username,'Allow',event.methodArn);
    }
    console.log('Por defecto');
    return generatePolicy('undefined','Deny',event.methodArn);

  };
// Help function to generate an IAM policy
const generatePolicy = function(principalId, effect, resource) {
    let authResponse = {};
    
    authResponse.principalId = principalId;
    if (effect && resource) {
        let policyDocument = {};
        policyDocument.Version = '2012-10-17'; 
        policyDocument.Statement = [];
        let statementOne = {};
        statementOne.Action = 'execute-api:Invoke'; 
        statementOne.Effect = effect;
        statementOne.Resource = resource;
        policyDocument.Statement[0] = statementOne;
        authResponse.policyDocument = policyDocument;
    }
    
    
    return authResponse;
}
    
