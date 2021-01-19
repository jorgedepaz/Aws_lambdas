'use strict';
const config = require('../config');
const _ = require('lodash');
const jwt = require('jsonwebtoken');

//arn:aws:lambda:us-east-1:375194658163:function:sales-orders-shop-dev-
//al final del arn se agrega el nombre del la funcionpo

const authorizeUser = (userScopes, methodArn) => {
    const hasValidScope = _.some(userScopes, scope => _.endsWith(methodArn, scope));
    //const hasValidScope = _.some(userScopes, scope => _.endsWith(methodArn, scope));

//Logica alternativa    
    /*for (let index = 0; index < userScopes.length; index++) {
        //const element = array[index];
        if (_.endsWith(methodArn, userScopes[index])) {
            return true;      
        }
        
    }
    return false;*/
//Fin logica alternativa

    return hasValidScope;
  };

module.exports.auth_token = async(event, context)=>{
    const authorizerToken = event.headers['Authorization'];
    const authorizerArr = authorizerToken.split(' ');
    const token = authorizerArr[1];
    
    

    if (authorizerArr.length != 2 || authorizerArr[0] != 'Bearer' || authorizerArr[1].length == 0) {
        console.log('Primer IF');
        return generatePolicy({ allow: false });
    }
    var decodeJwt;

    try {
        decodeJwt = jwt.verify(token,config.SECRET_TOKEN); 
        //console.log(decodeJwt);   
    } catch(error) {
        
        return generatePolicy({ allow: false });    
    }

    
    if (typeof decodeJwt.usuario != 'undefined' && decodeJwt.usuario.username.length > 0) {

               
        let permisos = _.map(decodeJwt.rol_permisos, 'nombre');
        
        console.log("Estos son los permisos");
        console.log(permisos);
        console.log("Este es el ARN");
        console.log(event.methodArn);

        const isAllowed = authorizeUser(permisos, event.methodArn);
      /*  for (let index = 0; index < permisos.length; index++) {
            //const element = array[index];
            if (_.endsWith(event.methodArn, permisos[index])) {
                console.log(_.endsWith(event.methodArn, permisos[index]));
                return generatePolicy({ allow: true });
            }
            
        }*/
        
        //const effect = isAllowed ? 'true' : 'false';
        //console.log("Is allowed?");
        //console.log(isAllowed);
        //console.log("Effect?");
        //console.log(effect);
        //console.log("Objeto");

        //la parte de abajo descomentarla si no esta el for
        console.log({ allow: isAllowed });
        return generatePolicy({ allow: isAllowed });
    }else{
        console.log('Por defecto');
        return generatePolicy({ allow: false });
    }

}
/*const generatePolicy = function(principalId, effect, resource) {
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
};*/

const generatePolicy = ({ allow }) => {
    return {
        principalId: 'token',
        policyDocument: {
            Version: '2012-10-17',
            Statement: {
                Action: 'execute-api:Invoke',
                Effect: allow ? 'Allow' : 'Deny',
                Resource: '*',
            },
        },
    };
};


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
/*
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
}*/
    
