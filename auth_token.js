'use strict';
const config = require('../config');
const _ = require('lodash');

const jwt = require('jsonwebtoken');

//arn:aws:lambda:us-east-1:375194658163:function:sales-orders-shop-dev-
//al final del arn se agrega el nombre del la funcionpo/* */

/*const authorizeUser = (userScopes, methodArn) => {
    //const hasValidScope = _.some(userScopes, scope => _.endsWith(methodArn, scope));
    const hasValidScope = _.some(userScopes, scope => _.endsWith(methodArn, scope));
    return hasValidScope;
  };*/

module.exports.auuth_token = async(event, context)=>{
    const tokenID= (event.headers && (event.headers['X-Amz-Security-Token'] || event.headers['x-amz-security-Token'])) || event.authorizationToken;

    if (!tokenID) {
        console.log("No se encuentra el token en el evento");
    }

}

/*module.exports.auth_token = async(event,context)=>{
    const authorizerToken = event.authorizationToken;
    const authorizerArr = authorizerToken.split(' ');
    const token = authorizerArr[1];

    const tokenID= (event.headers && event.headers['X-Amz-Security-Token'] || event.headers['x-amz-security-Token'] || event.authorizationToken);
    
    console.log('Token entero');
    console.log(authorizerToken);
    console.log('Token array');
    console.log(authorizerArr);
    console.log('Token solo');
    console.log(token);
    console.log('ARN');
    console.log(event.methodArn);

   

    if (authorizerArr.length != 2 || authorizerArr[0] != 'Bearer' || authorizerArr[1].length == 0) {
        console.log('Primer IF');
        return generatePolicy('undefined','Deny',event.methodArn);
    }

    var decodeJwt;

    try {
        decodeJwt = jwt.verify(token,config.SECRET_TOKEN); 
//        console.log(decodeJwt);   
    } catch(error) {
        console.log(error);
        //return generatePolicy('undefined','Deny',event.methodArn);    
    }

    console.log("Token decodificado");
    console.log(decodeJwt);

    console.log("Valores para validar las condicionales");
    console.log(typeof decodeJwt.usuario);
    console.log(decodeJwt.usuario.username.length);

    if (typeof decodeJwt.usuario != 'undefined' && decodeJwt.usuario.username.length > 0) {

               
        let permisos = _.map(decodeJwt.rol_permisos, 'nombre');
        
        console.log("Estos son los permisos");
        console.log(permisos);

        const isAllowed = authorizeUser(permisos, event.methodArn);
        const effect = isAllowed ? 'Allow' : 'Deny';

        return generatePolicy(decodeJwt.usuario.username,effect,event.methodArn);
    }else{
        console.log('Por defecto');
        return generatePolicy('undefined','Deny',event.methodArn);
    }
   // if (typeof decodeJwt.usuario != 'undefined' && decodeJwt.usuario.username.length > 0) {

               
     //   let permisos = _.map(decodeJwt.rol_permisos, 'nombre');
        
      //  const isAllowed = authorizeUser(permisos, event.methodArn);
      //  const effect = isAllowed ? 'Allow' : 'Deny';
      //  return generatePolicy(decodeJwt.usuario.username,effect,event.methodArn);
    //  return generatePolicy(decodeJwt.usuario.username,"Allow",event.methodArn);
   // }
    

  };*///ginal de la funcion

const generatePolicy = function(principalId, effect, resource) {
    let authResponse = {};
    
 authResponse.principalId = principalId;
    if (effect && resource) {
        var policyDocument = {};
        policyDocument.Version = '2012-10-17'; 
        policyDocument.Statement = [];
        var statementOne = {};
        statementOne.Action = 'execute-api:Invoke'; 
        statementOne.Effect = effect;
        statementOne.Resource = resource;
        policyDocument.Statement[0] = statementOne;
        authResponse.policyDocument = policyDocument;
    }
    
    
    return authResponse;
}
    
